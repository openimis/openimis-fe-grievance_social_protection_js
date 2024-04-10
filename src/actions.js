import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString, formatPageQuery,
  baseApiUrl, decodeId, openBlob, formatQuery,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';
import { FETCH_INDIVIDUAL_REF } from './constants';

const GRIEVANCE_CONFIGURATION_PROJECTION = () => [
  'grievanceTypes',
  'grievanceFlags',
  'grievanceChannels',
];

const CATEGORY_FULL_PROJECTION = () => [
  'id',
  'uuid',
  'categoryTitle',
  'slug',
  'validityFrom',
  'validityTo',
];

export function fetchCategoryForPicker(mm, filters) {
  const payload = formatPageQueryWithCount('category', filters, CATEGORY_FULL_PROJECTION(mm));
  return graphql(payload, 'CATEGORY_CATEGORY');
}

export function fetchTicketSummaries(mm, filters) {
  const projections = [
    'id', 'uuid', 'ticketTitle', 'ticketCode', 'ticketDescription', 'ticketStatus', 'ticketPriority',
    'ticketDueDate', 'category{id, uuid, categoryTitle, slug}',
    'insuree{id, uuid, otherNames, lastName, dob, chfId}'];
  const payload = formatPageQueryWithCount(
    'tickets',
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKETS');
}

export function fetchTicket(mm, uuid) {
  const filters = [
    `ticketUuid: "${uuid}"`,
  ];
  const projections = [
    'id', 'uuid', 'ticketTitle', 'ticketCode', 'ticketDescription',
    'name', 'phone', 'email', 'dateOfIncident', 'nameOfComplainant', 'witness',
    'resolution', 'ticketStatus', 'ticketPriority', 'dateSubmitted', 'dateSubmitted',
    'category{id, uuid, categoryTitle, slug}',
    'insuree{id, uuid, otherNames, lastName, dob, chfId, phone, email}',
    'attachment{edges{node{id, uuid, filename, mimeType, url, document, date}}}',
  ];
  const payload = formatPageQueryWithCount(
    'ticketDetails',
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKET');
}

export function formatTicketGQL(ticket) {
  return `
    ${ticket.uuid !== undefined && ticket.uuid !== null ? `uuid: "${ticket.uuid}"` : ''}
    ${ticket.ticketCode ? `ticketCode: "${formatGQLString(ticket.ticketCode)}"` : ''}
    ${ticket.ticketDescription ? `ticketDescription: "${formatGQLString(ticket.ticketDescription)}"` : ''}
    ${!!ticket.insuree && !!ticket.insuree.id ? `insureeUuid: "${ticket.insuree.uuid}"` : ''}
    ${!!ticket.category && !!ticket.category.id ? `categoryUuid: "${ticket.category.uuid}"` : ''}
    ${ticket.name ? `name: "${formatGQLString(ticket.name)}"` : ''}
    ${ticket.phone ? `phone: "${formatGQLString(ticket.phone)}"` : ''}
    ${ticket.email ? `email: "${formatGQLString(ticket.email)}"` : ''}
    ${ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ''}
    ${ticket.witness ? `witness: "${formatGQLString(ticket.witness)}"` : ''}
    ${ticket.nameOfComplainant ? `nameOfComplainant: "${formatGQLString(ticket.nameOfComplainant)}"` : ''}
    ${ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ''}
    ${ticket.ticketStatus ? `ticketStatus: "${formatGQLString(ticket.ticketStatus)}"` : ''}
    ${ticket.ticketPriority ? `ticketPriority: "${formatGQLString(ticket.ticketPriority)}"` : ''}
    ${ticket.ticketDueDate ? `ticketDueDate: "${formatGQLString(ticket.ticketDueDate)}"` : ''}
    ${ticket.dateSubmitted ? `dateSubmitted: "${formatGQLString(ticket.dateSubmitted)}"` : ''}
  `;
}

export function resolveTicketGQL(ticket) {
  return `
    ${ticket.uuid !== undefined && ticket.uuid !== null ? `uuid: "${ticket.uuid}"` : ''}
    ${ticket.ticketStatus ? 'ticketStatus: "Close"' : ''}
    ${!!ticket.insuree && !!ticket.insuree.id ? `insureeUuid: "${ticket.insuree.uuid}"` : ''}
    ${!!ticket.category && !!ticket.category.id ? `categoryUuid: "${ticket.category.uuid}"` : ''}
  `;
}

export function createTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('createTicket', formatTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_CREATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,

  });
}

export function updateTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('updateTicket', formatTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    ticketUuid: ticket.uuid,
  });
}

export function resolveTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('updateTicket', resolveTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    ticketUuid: ticket.uuid,
  });
}

export function fetchTicketAttachments(ticket) {
  if (ticket && ticket.uuid) {
    const payload = formatPageQuery(
      'ticketAttachments',
      [`ticket_Uuid: "${ticket.uuid}"`],
      ['id', 'uuid', 'date', 'filename', 'mimeType',
        'ticket{id, uuid, ticketCode}'],
    );
    return graphql(payload, 'TICKET_TICKET_ATTACHMENTS');
  }
  return { type: 'TICKET_TICKET_ATTACHMENTS', payload: { data: [] } };
}

export function downloadAttachment(attach) {
  const url = new URL(`${window.location.origin}${baseApiUrl}/ticket/attach`);
  url.search = new URLSearchParams({ id: decodeId(attach.id) });
  return () => fetch(url)
    .then((response) => response.blob())
    .then((blob) => openBlob(blob, attach.filename, attach.mime));
}

export function formatTicketAttachmentGQL(ticketattachment) {
  return `
    ${ticketattachment.uuid !== undefined && ticketattachment.uuid !== null ? `uuid: "${ticketattachment.uuid}"` : ''}
    ${!!ticketattachment.ticket && !!ticketattachment.ticket.id ? `ticketUuid: "${ticketattachment.ticket.uuid}"` : ''}
    ${ticketattachment.filename ? `filename: "${formatGQLString(ticketattachment.filename)}"` : ''}
    ${ticketattachment.mimeType ? `mimeType: "${formatGQLString(ticketattachment.mimeType)}"` : ''}
    ${ticketattachment.url ? `url: "${formatGQLString(ticketattachment.url)}"` : ''}
    ${ticketattachment.date ? `date: "${formatGQLString(ticketattachment.date)}"` : ''}
    ${ticketattachment.document ? `document: "${formatGQLString(ticketattachment.document)}"` : ''}
  `;
}

export function createTicketAttachment(ticketattachment, clientMutationLabel) {
  const mutation = formatMutation(
    'createTicketAttachment',
    formatTicketAttachmentGQL(ticketattachment),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['TICKET_ATTACHMENT_MUTATION_REQ', 'TICKET_CREATE_TICKET_ATTACHMENT_RESP', 'TICKET_ATTACHMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function fetchIndividual(mm, id) {
  const fetchIndividualCallable = mm.getRef(FETCH_INDIVIDUAL_REF);
  return fetchIndividualCallable([`id: ${id}`]);
}

const GRIEVANCRE_BY_INSUREE_PROJECTION = [
  'ticketUuid',
  'ticketCode',
  'ticketPriority',
  'ticketStatus',
];

export function fetchInsureeTicket(mm, chfId) {
  const filters = [
    `chfId: "${chfId}"`,
  ];
  const projections = [
    'id', 'uuid', 'ticketTitle', 'ticketCode', 'ticketDescription',
    'name', 'phone', 'email', 'dateOfIncident', 'nameOfComplainant', 'witness',
    'resolution', 'ticketStatus', 'ticketPriority', 'dateSubmitted', 'dateSubmitted',
    'category{id, uuid, categoryTitle, slug}',
    'insuree{id, uuid, otherNames, lastName, dob, chfId, phone, email}',
    'attachment{edges{node{id, uuid, filename, mimeType, url, document, date}}}',
  ];
  const payload = formatPageQueryWithCount(
    `ticketsByInsuree(chfId: "${chfId}", orderBy: "ticketCode", ticketCode: false, first: 5)`,
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKET');
}

export function fetchGrievanceConfiguration(params) {
  const payload = formatQuery('grievanceConfig', params, GRIEVANCE_CONFIGURATION_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION);
}
