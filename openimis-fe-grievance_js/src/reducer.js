import {
    parseData, formatGraphQLError, formatServerError, pageInfo
} from '@openimis/fe-core';

function reducer(
    state = {
        fetchingGrievance: false,
        errorGrievance: null,
        fetchedGrievance: false,
        Grievance: [],
        grievancePageInfo: { totalCount: 0 },

        fetchingClaimAttachments: false,
        fetchedClaimAttachments: false,
        errorClaimAttachments: null,
        claimAttachments: null,
        claimAttachmentsPageInfo: { totalCount: 0 },
    },
    action,
) {
    switch (action.type) {
        case "GRIEVANCE_MY_GRIEVANCES_REQ":
            return {
                ...state,
                fetchingGrievance: true,
                fetchedGrievance: false,
                Grievance: null,
                grievancePageInfo: { totalCount: 0 },
                errorGrievance: null,
            };
            case 'GRIEVANCE_MY_GRIEVANCES_RESP':
                return {
                    ...state,
                    fetchingGrievance: false,
                    fetchedGrievance: true,
                    Grievance: parseData(action.payload.data.grievance),
                    grievancePageInfo: pageInfo(action.payload.data.grievance),
                    errorGrievance: formatGraphQLError(action.payload)
                };
            case 'GRIEVANCE_MY_GRIEVANCES_ERR':
                return {
                    ...state,
                    fetching: false,
                    error: formatServerError(action.payload)
                };
            
                case "CLAIM_CLAIM_ATTACHMENTS_REQ":
                    return {
                      ...state,
                      fetchingClaimAttachments: true,
                      fetchedClaimAttachments: false,
                      claimAttachments: null,
                      errorClaimAttachments: null,
                    };
                  case "CLAIM_CLAIM_ATTACHMENTS_RESP":
                    return {
                      ...state,
                      fetchingClaimAttachments: false,
                      fetchedClaimAttachments: true,
                      claimAttachments: parseData(action.payload.data.claimAttachmentsDetails),
                      errorClaimAttachments: formatGraphQLError(action.payload),
                    };
                  case "CLAIM_CLAIM_ATTACHMENTS_ERR":
                    return {
                      ...state,
                      fetchingClaimAttachments: false,
                      errorClaimAttachments: formatServerError(action.payload),
                    };
        default:
            return state;
    }
}

export default reducer;