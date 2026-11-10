import {
  describe, expect, it, vi,
} from 'vitest';

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock('@openimis/fe-core', async () => vi.importActual('@openimis/fe-core/helpers/api'));

const { default: reducer, ACTION_TYPE } = await import('./reducer');
const {
  CLEAR, ERROR, REQUEST, SUCCESS,
} = await import('./utils/action-type');
const {
  globalId, graphqlErrors, relayPage, serverError,
} = await import('@openimis/fe-core/testing');

const initial = () => reducer(undefined, { type: '@@INIT' });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, type, data) => dispatch(state, type, { payload: { data } });
const fail = (state, type, payload = serverError(500, 'Internal Server Error', 'boom')) => dispatch(
  state,
  type,
  { payload },
);

const SERVER_ERROR = { code: 500, message: 'Internal Server Error', detail: 'boom' };

describe('grievance social protection reducer', () => {
  describe('initialisation', () => {
    it('starts with nothing loaded and nothing in flight', () => {
      const state = initial();

      expect(state.submittingMutation).toBe(false);
      expect(state.tickets).toEqual([]);
      expect(state.ticketsPageInfo).toEqual({ totalCount: 0 });
      expect(state.ticket).toBeNull();
      expect(state.ticketComments).toBeNull();
      expect(state.grievanceConfig).toBeNull();
    });

    it('returns the same state object for an unrelated action', () => {
      const state = initial();

      expect(reducer(state, { type: 'SOMETHING_ELSE' })).toBe(state);
    });
  });

  describe('ticket search', () => {
    it('empties the list and clears the error when a search starts', () => {
      const stale = {
        ...initial(), tickets: [{ id: 't-1' }], ticketsPageInfo: { totalCount: 1 }, errorTickets: SERVER_ERROR,
      };

      expect(dispatch(stale, 'TICKET_TICKETS_REQ')).toMatchObject({
        fetchingTickets: true,
        fetchedTickets: false,
        tickets: [],
        ticketsPageInfo: { totalCount: 0 },
        errorTickets: null,
      });
    });

    it('stores the page as returned, with its count and cursors', () => {
      const node = { id: globalId('TicketGQLType', 't-1'), code: 'GRV-1' };
      const state = respond(initial(), 'TICKET_TICKETS_RESP', {
        tickets: relayPage([node], { totalCount: 7, pageInfo: { hasNextPage: true } }),
      });

      expect(state.tickets).toEqual([node]);
      expect(state.ticketsPageInfo).toMatchObject({ totalCount: 7, hasNextPage: true });
      expect(state.fetchingTickets).toBe(false);
      expect(state.fetchedTickets).toBe(true);
    });

    it('surfaces a data error from the search', () => {
      const state = dispatch(initial(), 'TICKET_TICKETS_RESP', {
        payload: { data: { tickets: relayPage([]) }, ...graphqlErrors('bad filter') },
      });

      expect(state.errorTickets).toMatchObject({ detail: 'bad filter' });
    });

    // Currently fails: the failure is written to fetching and error, keys this module does
    // not have, so the ticket searcher keeps spinning and never shows what went wrong.
    it.fails('stops fetching and reports a transport failure', () => {
      const state = fail(dispatch(initial(), 'TICKET_TICKETS_REQ'), 'TICKET_TICKETS_ERR');

      expect(state.fetchingTickets).toBe(false);
      expect(state.errorTickets).toEqual(SERVER_ERROR);
    });
  });

  describe('single ticket', () => {
    it('forgets the previous ticket while the next one loads', () => {
      const loaded = { ...initial(), ticket: { id: 't-1' }, fetchedTicket: true };

      expect(dispatch(loaded, 'TICKET_TICKET_REQ')).toMatchObject({
        fetchingTicket: true,
        fetchedTicket: false,
        ticket: null,
        errorTicket: null,
      });
    });

    it('decodes the id of the first ticket returned', () => {
      const state = respond(initial(), 'TICKET_TICKET_RESP', {
        tickets: relayPage([
          { id: globalId('TicketGQLType', 't-1'), code: 'GRV-1' },
          { id: globalId('TicketGQLType', 't-2'), code: 'GRV-1' },
        ]),
      });

      expect(state.ticket).toEqual({ id: 't-1', code: 'GRV-1' });
      expect(state.fetchingTicket).toBe(false);
      expect(state.fetchedTicket).toBe(true);
    });

    it('reports no ticket when nothing matched', () => {
      expect(respond(initial(), 'TICKET_TICKET_RESP', { tickets: relayPage([]) }).ticket).toBeFalsy();
    });

    // Currently fails: fetchTicket dispatches TICKET_TICKET_ERR on a transport failure but
    // no case handles it, so the ticket form's progress indicator never stops.
    it.fails('stops fetching and reports a transport failure', () => {
      const state = fail(dispatch(initial(), 'TICKET_TICKET_REQ'), 'TICKET_TICKET_ERR');

      expect(state.fetchingTicket).toBe(false);
      expect(state.errorTicket).toEqual(SERVER_ERROR);
    });

    it('forgets the ticket and its comments on clear', () => {
      const loaded = {
        ...initial(),
        ticket: { id: 't-1' },
        fetchedTicket: true,
        ticketComments: [{ id: 'c-1' }],
        fetchedTicketComments: true,
        errorTicketComments: SERVER_ERROR,
      };

      expect(dispatch(loaded, CLEAR(ACTION_TYPE.CLEAR_TICKET))).toMatchObject({
        ticket: null,
        fetchedTicket: false,
        ticketComments: [],
        ticketCommentsPageInfo: { totalCount: 0 },
        fetchedTicketComments: false,
        errorTicketComments: null,
      });
    });
  });

  describe('ticket comments', () => {
    it('keeps the comments already shown while the next page loads', () => {
      const loaded = { ...initial(), ticketComments: [{ id: 'c-1' }], errorTicketComments: SERVER_ERROR };
      const state = dispatch(loaded, 'COMMENT_COMMENTS_REQ');

      expect(state.ticketComments).toEqual([{ id: 'c-1' }]);
      expect(state.errorTicketComments).toBeNull();
    });

    it('starts from an empty list the first time', () => {
      expect(dispatch(initial(), 'COMMENT_COMMENTS_REQ').ticketComments).toEqual([]);
    });

    it('decodes the comment ids and records the count', () => {
      const state = respond(initial(), 'COMMENT_COMMENTS_RESP', {
        comments: relayPage([{ id: globalId('CommentGQLType', 'c-1'), comment: 'Called back' }], { totalCount: 3 }),
      });

      expect(state.ticketComments).toEqual([{ id: 'c-1', comment: 'Called back' }]);
      expect(state.ticketCommentsPageInfo).toMatchObject({ totalCount: 3 });
      expect(state.fetchedTicketComments).toBe(true);
    });

    it('surfaces a data error from the comment search', () => {
      const state = dispatch(initial(), 'COMMENT_COMMENTS_RESP', {
        payload: { data: { comments: relayPage([]) }, ...graphqlErrors('no access') },
      });

      expect(state.errorTicketComments).toMatchObject({ detail: 'no access' });
    });

    // Currently fails: the failure is written to a bare error key, while the comments panel
    // shows errorTicketComments — a failed load just looks like a ticket with no comments.
    it.fails('reports a transport failure', () => {
      const state = fail(initial(), 'COMMENT_COMMENTS_ERR');

      expect(state.ticketComments).toEqual([]);
      expect(state.errorTicketComments).toEqual(SERVER_ERROR);
    });
  });

  describe('grievance configuration', () => {
    const config = {
      grievanceTypes: ['Complaint'],
      grievanceDefaultResolutionsByCategory: [{ category: 'Complaint', resolutionTime: '5,0' }],
    };

    it('drops the previous configuration while it reloads', () => {
      const loaded = { ...initial(), grievanceConfig: config, fetchedGrievanceConfig: true };

      expect(dispatch(loaded, REQUEST(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION))).toMatchObject({
        fetchingGrievanceConfig: true,
        fetchedGrievanceConfig: false,
        grievanceConfig: null,
      });
    });

    it('stores the configuration as returned', () => {
      const state = respond(initial(), SUCCESS(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION), { grievanceConfig: config });

      expect(state.grievanceConfig).toEqual(config);
      expect(state.fetchedGrievanceConfig).toBe(true);
      expect(state.fetchingGrievanceConfig).toBe(false);
    });

    it('stops fetching and holds no configuration after a failure', () => {
      const requested = dispatch(initial(), REQUEST(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION));
      const state = fail(requested, ERROR(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION));

      expect(state.fetchingGrievanceConfig).toBe(false);
      expect(state.grievanceConfig).toBeNull();
    });
  });

  describe('mutations', () => {
    const MUTATION_CHANNELS = [
      ['a grievance', REQUEST(ACTION_TYPE.MUTATION), ERROR(ACTION_TYPE.MUTATION)],
      ['a ticket', 'TICKET_MUTATION_REQ', 'TICKET_MUTATION_ERR'],
      ['an attachment', 'TICKET_ATTACHMENT_MUTATION_REQ', 'TICKET_ATTACHMENT_MUTATION_ERR'],
      ['a comment', 'TICKET_COMMENT_MUTATION_REQ', 'TICKET_COMMENT_MUTATION_ERR'],
    ];

    const MUTATION_RESULTS = [
      [SUCCESS(ACTION_TYPE.RESOLVE_BY_COMMENT), 'resolveGrievanceByComment'],
      [SUCCESS(ACTION_TYPE.REOPEN_TICKET), 'reopenTicket'],
      ['TICKET_CREATE_TICKET_RESP', 'createTicket'],
      ['TICKET_UPDATE_TICKET_RESP', 'updateTicket'],
      ['TICKET_DELETE_TICKET_RESP', 'deleteTicket'],
      ['TICKET_CREATE_TICKET_ATTACHMENT_RESP', 'createTicketAttachment'],
      ['TICKET_CREATE_COMMENT_RESP', 'createComment'],
    ];

    const submitting = (type = REQUEST(ACTION_TYPE.MUTATION)) => dispatch(initial(), type, {
      meta: { clientMutationId: 'cmid-1', clientMutationLabel: 'Update ticket' },
    });

    it.each(MUTATION_CHANNELS)('records the request metadata of %s mutation', (_label, requestType) => {
      expect(submitting(requestType)).toMatchObject({
        submittingMutation: true,
        mutation: { id: 'cmid-1', clientMutationLabel: 'Update ticket' },
      });
    });

    it.each(MUTATION_RESULTS)('clears the in-flight flag and keeps the internal id of %s', (type, service) => {
      const state = respond(submitting(), type, { [service]: { internalId: 'internal-1' } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation.id).toBe('internal-1');
    });

    it.each(MUTATION_CHANNELS)('raises an alert when %s mutation fails', (_label, requestType, errorType) => {
      const state = fail(submitting(requestType), errorType, { status: 500, statusText: 'Internal Server Error' });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: 'Internal Server Error' });
    });

    // Currently fails: dispatchMutationErr in fe-core only stores the alert, so every
    // module is left believing the mutation is still being submitted.
    it.fails.each(MUTATION_CHANNELS)('stops submitting once %s mutation has failed', (
      _label,
      requestType,
      errorType,
    ) => {
      expect(fail(submitting(requestType), errorType, { status: 500 }).submittingMutation).toBe(false);
    });
  });

  describe('immutability', () => {
    it('does not mutate the state it was given', () => {
      const state = initial();
      const snapshot = JSON.stringify(state);

      respond(state, 'TICKET_TICKETS_RESP', { tickets: relayPage([{ id: 't-1' }]) });
      dispatch(state, CLEAR(ACTION_TYPE.CLEAR_TICKET));

      expect(JSON.stringify(state)).toBe(snapshot);
    });
  });
});
