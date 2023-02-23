import {
    graphql, formatPageQueryWithCount, formatMutation, formatPageQuery, decodeId, openBlob, baseApiUrl
    } from "@openimis/fe-core";

export function fetchGrievance(prms){
    const payload = formatPageQueryWithCount( 
        "grievance",
        prms,
        ["grievanceCode", "typeOfGrievance", "status", "comments", "createdBy", "description", "insuree{otherNames, lastName}"]
    );
    return graphql(payload, 'GRIEVANCE_MY_GRIEVANCES');
}

export function saveGrievance(grievance, clientMutationLabel) {
    let grievanceGQL = ` 
    grievanceCode: "${grievance.grievanceCode}"
    insureeUuid: "${grievance["insuree"]["uuid"]}"
    typeOfGrievance: "${grievance.typeOfGrievance}"
    description: "${grievance.description}"
    createdBy: "${grievance.createdBy}"
    comments: "${grievance.comments}"
    status: "${grievance.status}"
    `
    let mutation = formatMutation("createGrievance", grievanceGQL, clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        "GRIEVANCES_CREATE_GRIEVANCE",
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    )
}

export function fetchClaimAttachments(claim_uuid) {
    let filters = []
    if (!!claim_uuid) {
      filters.push(`claimUuid: "${claim_uuid}"`)
    }
    console.log("This is the Claim Uuid from the query", claim_uuid);
    let projections = [
      "id", "claim{code, id, uuid}", "type", "title", "filename"
    ]
    const payload = formatPageQuery("claimAttachmentsDetails",
    filters,
    projections
    );
    return graphql(payload, 'CLAIM_CLAIM_ATTACHMENTS');
}

export function downloadAttachment(attach) {
    var url = new URL(`${window.location.origin}${baseApiUrl}/claim/attach`);
    url.search = new URLSearchParams({ id: decodeId(attach.id) });
    return (dispatch) => {
      return fetch(url)
        .then((response) => response.blob())
        .then((blob) => openBlob(blob, attach.filename, attach.mime));
    };
  }