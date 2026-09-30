import {
  describe, expect, it, vi,
} from 'vitest';

// Only fe-core's dispatcher is stubbed; the formatters are real, imported from their
// defining modules because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
}));

vi.mock('@openimis/fe-core', async () => ({
  ...(await vi.importActual('@openimis/fe-core/helpers/api')),
  ...core,
}));

const actions = await import('./actions');
const { ACTION_TYPE } = await import('./reducer');
const {
  CLEAR, ERROR, REQUEST, SUCCESS,
} = await import('./utils/action-type');
const { globalId } = await import('@openimis/fe-core/testing');
const { formatGQLString } = await import('@openimis/fe-core/helpers/api');

const mm = {};
const query = (result) => result.payload.replace(/\s+/g, ' ');

const TICKET_TYPES = ['TICKET_MUTATION_REQ', 'TICKET_CREATE_TICKET_RESP', 'TICKET_MUTATION_ERR'];
const UPDATE_TYPES = ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'];

describe('grievance social protection actions', () => {
  describe('queries', () => {
    it('asks for a counted page of ticket summaries with the reporter details', () => {
      const result = actions.fetchTicketSummaries(mm, ['first: 10', 'orderBy: ["-dateCreated"]']);

      expect(result.type).toBe('TICKET_TICKETS');
      expect(query(result)).toContain('tickets(first: 10,orderBy: ["-dateCreated"]) { totalCount');
      expect(query(result)).toContain('reporterFirstName,reporterLastName,reporterDob');
    });

    it('asks for one ticket with the staff member and the extension data', () => {
      const result = actions.fetchTicket(mm, ['id: "t-1"']);

      expect(result.type).toBe('TICKET_TICKET');
      expect(query(result)).toContain('tickets(id: "t-1")');
      expect(query(result)).toContain('attendingStaff {id, username}');
      expect(query(result)).toContain('jsonExt');
    });

    it('asks for the comments of a ticket, newest first', () => {
      const result = actions.fetchComments({ id: 't-1' });

      expect(result.type).toBe('COMMENT_COMMENTS');
      expect(query(result)).toContain('comments(ticket_Id: "t-1",orderBy: ["-dateCreated"]) { totalCount');
      expect(query(result)).toContain('commenterTypeName');
    });

    it('does not query comments for a ticket that has not been saved', () => {
      core.graphql.mockClear();

      expect(actions.fetchComments({})).toEqual({ type: 'COMMENT_COMMENTS', payload: { data: [] } });
      expect(actions.fetchComments(null)).toEqual({ type: 'COMMENT_COMMENTS', payload: { data: [] } });
      expect(core.graphql).not.toHaveBeenCalled();
    });

    it('asks for the grievance configuration including the resolution times', () => {
      const result = actions.fetchGrievanceConfiguration();

      expect(result.type).toBe(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION);
      expect(query(result)).toContain(
        'grievanceConfig { grievanceTypes,grievanceFlags,grievanceChannels,'
        + 'grievanceDefaultResolutionsByCategory{category, resolutionTime} }',
      );
    });

    // Currently fails: the modules manager is not passed on, so the individual search
    // receives the filter list as its modules manager; the id is also left unquoted.
    it.fails('passes the modules manager and a quoted id on to the individual search', () => {
      const fetchIndividuals = vi.fn();
      const modulesManager = { getRef: vi.fn(() => fetchIndividuals) };

      actions.fetchIndividual(modulesManager, 'ind-1');

      expect(modulesManager.getRef).toHaveBeenCalledWith('individual.actions.fetchIndividuals');
      expect(fetchIndividuals).toHaveBeenCalledWith(modulesManager, ['id: "ind-1"']);
    });
  });

  describe('creating a ticket', () => {
    const ticket = (fields = {}) => ({
      title: 'Late payment',
      description: 'Not paid in May',
      category: 'Payment',
      channel: 'Phone',
      flags: 'Urgent',
      priority: 'High',
      dateOfIncident: '2026-05-01',
      reporterType: 'individual',
      reporter: { id: 'a1b2c3d4-0000-4000-8000-000000000001' },
      ...fields,
    });

    it('dispatches the ticket mutation with its label', () => {
      const result = actions.createTicket(ticket(), null, 'Create ticket');

      expect(result.type).toEqual(TICKET_TYPES);
      expect(result.meta).toMatchObject({ clientMutationLabel: 'Create ticket' });
      expect(result.meta.clientMutationId).toBeTruthy();
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(query(result)).toContain('createTicket( input: {');
    });

    it('sends the fields that were filled in', () => {
      const text = query(actions.createTicket(ticket(), null, 'Create ticket'));

      expect(text).toContain('title: "Late payment"');
      expect(text).toContain('category: "Payment"');
      expect(text).toContain('channel: "Phone"');
      expect(text).toContain('flags: "Urgent"');
      expect(text).toContain('priority: "High"');
      expect(text).toContain('dateOfIncident: "2026-05-01"');
      expect(text).toContain('reporterType: "individual"');
      expect(text).not.toContain('id: "');
      expect(text).not.toContain('dueDate');
    });

    it('sends a reporter uuid as it is and decodes a global id', () => {
      const raw = query(actions.createTicket(ticket(), null, 'Create ticket'));
      const encoded = query(actions.createTicket(
        ticket({ reporter: { id: globalId('UserGQLType', 'user-1') } }),
        null,
        'Create ticket',
      ));

      expect(raw).toContain('reporterId: "a1b2c3d4-0000-4000-8000-000000000001"');
      expect(encoded).toContain('reporterId: "user-1"');
    });

    it('decodes the attending staff id', () => {
      const text = query(actions.createTicket(
        ticket({ attendingStaff: { id: globalId('UserGQLType', 'staff-1') } }),
        null,
        'Create ticket',
      ));

      expect(text).toContain('attendingStaffId: "staff-1"');
    });

    it('takes the resolution time from the configured default for the category', () => {
      const config = {
        grievanceDefaultResolutionsByCategory: [
          { category: 'Payment', resolutionTime: '5,0' },
          { category: 'Other', resolutionTime: '1,0' },
        ],
      };

      expect(query(actions.createTicket(ticket(), config, 'Create ticket'))).toContain('resolution: "5,0"');
    });

    it('leaves the resolution to the caller when there is no configuration', () => {
      const text = query(actions.createTicket(ticket({ resolution: '2,4' }), {}, 'Create ticket'));

      expect(text).toContain('resolution: "2,4"');
    });

    // Currently fails: title, description, category, channel and flags are interpolated
    // without formatGQLString, so a quote or line break in them breaks the mutation.
    it.fails.each([
      ['title', 'The "late" payment'],
      ['description', 'Waited since May.\nStill nothing.'],
    ])('escapes the %s like the other free-text fields', (field, value) => {
      const result = actions.createTicket(ticket({ [field]: value }), null, 'Create ticket');

      expect(result.payload).toContain(`${field}: "${formatGQLString(value)}"`);
    });

    // Currently fails: the resolution time is written onto the caller's ticket object.
    it.fails('leaves the ticket it was given untouched', () => {
      const given = ticket();
      const config = { grievanceDefaultResolutionsByCategory: [{ category: 'Payment', resolutionTime: '5,0' }] };

      actions.createTicket(given, config, 'Create ticket');

      expect(given).not.toHaveProperty('resolution');
    });
  });

  describe('updating a ticket', () => {
    const reporter = JSON.stringify(JSON.stringify({ id: globalId('IndividualGQLType', 'ind-1'), firstName: 'Ada' }));
    const ticket = (fields = {}) => ({
      id: 't-1',
      title: 'Late payment',
      status: 'IN_PROGRESS',
      reporter,
      reporterType: '42',
      reporterTypeName: 'individual',
      ...fields,
    });

    it('dispatches the update with the ticket id in the metadata', () => {
      const result = actions.updateTicket(ticket(), 'Update ticket');

      expect(result.type).toEqual(UPDATE_TYPES);
      expect(result.meta).toMatchObject({ clientMutationLabel: 'Update ticket', id: 't-1' });
      expect(query(result)).toContain('updateTicket( input: {');
      expect(query(result)).toContain('id: "t-1"');
    });

    it('sends the status as an enum value', () => {
      expect(query(actions.updateTicket(ticket(), 'Update ticket'))).toContain('status: IN_PROGRESS');
    });

    it('unpacks the stored reporter and names its type rather than its content type id', () => {
      const text = query(actions.updateTicket(ticket(), 'Update ticket'));

      expect(text).toContain('reporterId: "ind-1"');
      expect(text).toContain('reporterType: "individual"');
      expect(text).not.toContain('reporterType: "42"');
    });

    it('sends no reporter when the ticket has none', () => {
      const text = query(actions.updateTicket(ticket({ reporter: null }), 'Update ticket'));

      expect(text).not.toContain('reporterId');
      expect(text).not.toContain('reporterType');
    });

    // Currently fails: the double-encoded reporter string is replaced on the caller's
    // object by the parsed reporter, so a second save of the same object throws.
    it.fails('can save the same ticket twice', () => {
      const given = ticket();

      actions.updateTicket(given, 'Update ticket');

      expect(() => actions.updateTicket(given, 'Update ticket')).not.toThrow();
      expect(given.reporter).toBe(reporter);
    });

    // Currently fails: the update formatter interpolates the title and description without
    // formatGQLString, exactly like the create formatter.
    it.fails.each([
      ['title', 'The "late" payment'],
      ['description', 'Waited since May.\nStill nothing.'],
    ])('escapes the %s like the other free-text fields', (field, value) => {
      const result = actions.updateTicket(ticket({ [field]: value }), 'Update ticket');

      expect(result.payload).toContain(`${field}: "${formatGQLString(value)}"`);
    });
  });

  describe('comments', () => {
    it('adds a comment with its commenter and escaped text', () => {
      const text = 'Called "back"';
      const result = actions.createTicketComment(
        { commenter: { id: globalId('UserGQLType', 'user-1') }, comment: text },
        { id: 't-1' },
        'user',
        'Add comment',
      );

      expect(result.type).toEqual([
        'TICKET_COMMENT_MUTATION_REQ',
        'TICKET_CREATE_COMMENT_RESP',
        'TICKET_COMMENT_MUTATION_ERR',
      ]);
      expect(result.meta).toMatchObject({ clientMutationLabel: 'Add comment' });
      expect(result.payload).toContain('createComment(');
      expect(result.payload).toContain('ticketId: "t-1"');
      expect(result.payload).toContain('commenterId: "user-1"');
      expect(result.payload).toContain('commenterType: "user"');
      expect(result.payload).toContain(`comment: "${formatGQLString(text)}"`);
    });

    it.each([
      ['resolveGrievanceByComment', 'resolveGrievanceByComment', ACTION_TYPE.RESOLVE_BY_COMMENT],
      ['reopenTicket', 'reopenTicket', ACTION_TYPE.REOPEN_TICKET],
    ])('%s sends the id through the shared mutation channel', (creator, service, successType) => {
      const result = actions[creator]('t-1', 'Label');

      expect(result.type).toEqual([REQUEST(ACTION_TYPE.MUTATION), SUCCESS(successType), ERROR(ACTION_TYPE.MUTATION)]);
      expect(result.meta).toMatchObject({ clientMutationLabel: 'Label' });
      expect(query(result)).toContain(`${service}( input: {`);
      expect(query(result)).toContain('id: "t-1"');
    });
  });

  it('clears the loaded ticket', () => {
    const dispatch = vi.fn();

    actions.clearTicket()(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: CLEAR(ACTION_TYPE.CLEAR_TICKET) });
  });
});
