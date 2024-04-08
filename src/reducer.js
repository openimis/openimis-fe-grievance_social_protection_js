// Disabled due to consistency with other modules
/* eslint-disable default-param-last */

import {
  parseData, pageInfo, formatServerError, formatGraphQLError,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
} from '@openimis/fe-core';
import { ERROR, REQUEST, SUCCESS } from './utils/action-type';

export const ACTION_TYPE = {
  GET_GRIEVANCE_CONFIGURATION: 'GET_GRIEVANCE_CONFIGURATION',
};

function reducer(
  state = {
    fetchingTickets: false,
    errorTickets: null,
    fetchedTickets: false,
    tickets: [],
    ticketsPageInfo: { totalCount: 0 },

    fetchingTicket: false,
    errorTicket: null,
    fetchedTicket: false,
    ticket: null,
    ticketPageInfo: { totalCount: 0 },

    fetchingCategory: false,
    fetchedCategory: false,
    errorCategory: null,
    category: [],
    categoryPageInfo: { totalCount: 0 },

    fetchingTicketAttachments: false,
    fetchedTicketAttachments: false,
    errorTicketAttachments: null,
    ticketAttachments: null,

    fetchingGrievanceConfig: false,
    fetchedGrievanceConfig: false,
    errorGrievanceConfig: null,
    grievanceConfig: null,

    submittingMutation: false,
    mutation: {},
  },
  action,
) {
  switch (action.type) {
    case 'TICKET_TICKETS_REQ':
      return {
        ...state,
        fetchingTickets: true,
        fetchedTickets: false,
        tickets: [],
        ticketsPageInfo: { totalCount: 0 },
        errorTickets: null,
      };
    case 'TICKET_TICKETS_RESP':
      return {
        ...state,
        fetchingTickets: false,
        fetchedTickets: true,
        tickets: parseData(action.payload.data.tickets),
        ticketsPageInfo: pageInfo(action.payload.data.tickets),
        errorTickets: formatGraphQLError(action.payload),
      };
    case 'TICKET_TICKETS_ERR':
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case 'TICKET_TICKET_REQ':
      return {
        ...state,
        fetchingTicket: true,
        fetchedTicket: false,
        ticket: null,
        errorTicket: null,
      };
    case 'TICKET_TICKET_RESP':
      var tickt = parseData(action.payload.data.ticketDetails);
      return {

        ...state,
        fetchingTicket: false,
        fetchedTicket: true,
        ticket: (!!tickt && tickt.length > 0) ? tickt[0] : null,
        errorTicket: formatGraphQLError(action.payload),
      };
    case 'CATEGORY_CATEGORY_REQ':
      return {
        ...state,
        fetchingCategory: true,
        fetchedCategory: false,
        category: [],
        errorCategory: null,
      };
    case 'CATEGORY_CATEGORY_RESP':
      return {
        ...state,
        fetchingCategory: false,
        fetchedCategory: true,
        category: parseData(action.payload.data.category),
        categoryPageInfo: pageInfo(action.payload.data.category),
        errorCategory: formatGraphQLError(action.payload),
      };
    case 'CATEGORY_CATEGORY_ERR':
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case 'TICKET_TICKET_ATTACHMENTS_REQ':
      return {
        ...state,
        fetchingTicketAttachments: true,
        fetchedTicketAttachments: false,
        ticketAttachments: null,
        errorTicketAttachments: null,
      };
    case 'TICKET_TICKET_ATTACHMENTS_RESP':
      return {
        ...state,
        fetchingTicketAttachments: false,
        fetchedTicketAttachments: true,
        ticketAttachments: parseData(action.payload.data.ticketAttachments),
        errorTicketAttachments: formatGraphQLError(action.payload),
      };
    case 'TICKET_TICKET_ATTACHMENTS_ERR':
      return {
        ...state,
        fetchingTicketAttachments: false,
        errorTicketAttachments: formatServerError(action.payload),
      };
    case 'TICKET_INSUREE_TICKETS_REQ':
      return {
        ...state,
        fetchingTickets: true,
        fetchedTickets: false,
        tickets: null,
        policy: null,
        errorTickets: null,
      };
    case 'TICKET_INSUREE_TICKETS_RESP':
      return {
        ...state,
        fetchingTickets: false,
        fetchedTickets: true,
        tickets: parseData(action.payload.data.ticketsByInsuree),
        ticketsPageInfo: pageInfo(action.payload.data.ticketsByInsuree),
        errorTickets: formatGraphQLError(action.payload),
      };
    case 'TICKET_INSUREE_TICKETS_ERR':
      return {
        ...state,
        fetchingTickets: false,
        errorTickets: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: true,
        fetchedGrievanceConfig: false,
        errorGrievanceConfig: null,
        grievanceConfig: null,
      };
    case SUCCESS(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: false,
        fetchedGrievanceConfig: true,
        errorGrievanceConfig: null,
        grievanceConfig: parseData(action.payload.data.grievanceConfiguration),
      };
    case ERROR(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: false,
        fetchedGrievanceConfig: false,
        errorGrievanceConfig: formatGraphQLError(action.payload),
        grievanceConfig: null,
      };
    case 'TICKET_MUTATION_REQ':
      return dispatchMutationReq(state, action);
    case 'TICKET_MUTATION_ERR':
      return dispatchMutationErr(state, action);
    case 'TICKET_CREATE_TICKET_RESP':
      return dispatchMutationResp(state, 'createTicket', action);
    case 'TICKET_UPDATE_TICKET_RESP':
      return dispatchMutationResp(state, 'updateTicket', action);
    case 'TICKET_DELETE_TICKET_RESP':
      return dispatchMutationResp(state, 'deleteTicket', action);
    case 'TICKET_ATTACHMENT_MUTATION_REQ':
      return dispatchMutationReq(state, action);
    case 'TICKET_ATTACHMENT_MUTATION_ERR':
      return dispatchMutationErr(state, action);
    case 'TICKET_CREATE_TICKET_ATTACHMENT_RESP':
      return dispatchMutationResp(state, 'createTicketAttachment', action);
    default:
      return state;
  }
}

export default reducer;
