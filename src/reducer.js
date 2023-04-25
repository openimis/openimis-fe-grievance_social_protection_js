import {
    parseData, formatGraphQLError, formatServerError, pageInfo
} from '@openimis/fe-core';

function reducer(
    state = {
        fetchingTicket: false,
        errorTicket: null,
        fetchedTicket: false,
        Tickets: [],
        ticketsPageInfo: { totalCount: 0 },

        fetchingTickets: false,
        errorTickets: null,
        fetchedTickets: false,
        Ticket: [],
        ticketPageInfo: { totalCount: 0 },

        fetchingCategory: false,
        errorCategory: null,
        fetchedCategory: false,
        category: [],
        categoryPageInfo: { totalCount: 0 },

        submittingMutation: false,
        mutation: {},
    },
    action,
) {
    switch (action.type) {
        case "TICKET_MY_TICKETS_REQ":
            return {
                ...state,
                fetchingTickets: true,
                fetchedTickets: false,
                Ticket: null,
                TicketPageInfo: { totalCount: 0 },
                errorTickets: null,
            };
            case 'TICKET_MY_TICKETS_RESP':
                return {
                    ...state,
                    fetchingTickets: false,
                    fetchedTickets: true,
                    Ticket: parseData(action.payload.data.tickets),
                    TicketPageInfo: pageInfo(action.payload.data.tickets),
                    errorTickets: formatGraphQLError(action.payload)
                };
            case 'TICKET_MY_TICKETS_ERR':
                return {
                    ...state,
                    fetching: false,
                    error: formatServerError(action.payload)
                };
        case "TICKET_TICKET_REQ":
            return {
                ...state,
                fetchingTicket: true,
                fetchedTicket: false,
                Ticket: null,
                ticketsPageInfo: { totalCount: 0 },
                errorTicket: null,
            };
            case 'TICKET_TICKET_RESP':
                return {
                    ...state,
                    fetchingTicket: false,
                    fetchedTicket: true,
                    Ticket: parseData(action.payload.data.tickets),
                    ticketsPageInfo: pageInfo(action.payload.data.tickets),
                    errorTicket: formatGraphQLError(action.payload)
                };
            case 'TICKET_TICKET_ERR':
                return {
                    ...state,
                    fetchingTicket: false,
                    errorTicket: formatServerError(action.payload)
                };
            case "CATEGORY_CATEGORY_REQ":
                    return {
                        ...state,
                        fetchingCategory: true,
                        fetchedCategory: false,
                        Category: null,
                        categoryPageInfo: { totalCount: 0 },
                        errorCategory: null,
                    };
                    case 'CATEGORY_CATEGORY_RESP':
                        return {
                            ...state,
                            fetchingCategory: false,
                            fetchedCategory: true,
                            Category: parseData(action.payload.data.category),
                            categoryPageInfo: pageInfo(action.payload.data.category),
                            errorCategory: formatGraphQLError(action.payload)
                        };
                    case 'CATEGORY_CATEGORY_ERR':
                        return {
                            ...state,
                            fetchingCategory: false,
                            errorCategory: formatServerError(action.payload)
                        };
        default:
            return state;
    }
}

export default reducer;