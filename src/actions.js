import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString, formatPageQuery,
  baseApiUrl, decodeId, openBlob
} from "@openimis/fe-core";

const CATEGORY_FULL_PROJECTION = (mm) => [
  "id",
  "uuid",
  "categoryTitle",
  "slug",
  "validityFrom",
  "validityTo",
];

export function fetchCategoryForPicker(mm, filters) {
  let payload = formatPageQueryWithCount("category", filters, CATEGORY_FULL_PROJECTION(mm));
  return graphql(payload, "CATEGORY_CATEGORY");
}

export function fetchTicketSummaries(mm, filters) {
  var projections = [
    "id", "uuid", "ticketTitle", "ticketCode", "ticketDescription", "ticketStatus", "ticketPriority",
    "ticketDuedate", "category{id, uuid, categoryTitle, slug}",
    "insuree{id, uuid, otherNames, lastName, dob, chfId}"]
  const payload = formatPageQueryWithCount("tickets",
    filters,
    projections
  );
  return graphql(payload, 'TICKET_TICKETS');
}

export function fetchTicket(mm, uuid) {
  let filters = [
    `ticketUuid: "${uuid}"`
  ]
  let projections = [
    "id", "uuid", "ticketTitle", "ticketCode", "ticketDescription",
    "name", "phone", "email", "dateOfIncident", "nameOfComplainant", "witness",
    "resolution", "ticketStatus", "ticketPriority", "dateSubmitted", "dateSubmitted",
    "category{id, uuid, categoryTitle, slug}",
    "insuree{id, uuid, otherNames, lastName, dob, chfId, phone, email}",
    "attachment{edges{node{id, uuid, filename, mimeType, url, document, date}}}",
  ]
  const payload = formatPageQueryWithCount(`ticketDetails`,
    filters,
    projections
  );
  return graphql(payload, 'TICKET_TICKET');
}

export function formatTicketGQL(ticket) {
  return `
    ${ticket.uuid !== undefined && ticket.uuid !== null ? `uuid: "${ticket.uuid}"` : ""}
    ${!!ticket.ticketCode ? `ticketCode: "${formatGQLString(ticket.ticketCode)}"` : ""}
    ${!!ticket.ticketDescription ? `ticketDescription: "${formatGQLString(ticket.ticketDescription)}"` : ""}
    ${!!ticket.insuree && !!ticket.insuree.id ? `insureeUuid: "${ticket.insuree.uuid}"` : ""}
    ${!!ticket.category && !!ticket.category.id ? `categoryUuid: "${ticket.category.uuid}"` : ""}
    ${!!ticket.name ? `name: "${formatGQLString(ticket.name)}"` : ""}
    ${!!ticket.phone ? `phone: "${formatGQLString(ticket.phone)}"` : ""}
    ${!!ticket.email ? `email: "${formatGQLString(ticket.email)}"` : ""}
    ${!!ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ""}
    ${!!ticket.witness ? `witness: "${formatGQLString(ticket.witness)}"` : ""}
    ${!!ticket.nameOfComplainant ? `nameOfComplainant: "${formatGQLString(ticket.nameOfComplainant)}"` : ""}
    ${!!ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ""}
    ${!!ticket.ticketStatus ? `ticketStatus: "${formatGQLString(ticket.ticketStatus)}"` : ""}
    ${!!ticket.ticketPriority ? `ticketPriority: "${formatGQLString(ticket.ticketPriority)}"` : ""}
    ${!!ticket.ticketDuedate ? `ticketDuedate: "${formatGQLString(ticket.ticketDuedate)}"` : ""}
    ${!!ticket.dateSubmitted ? `dateSubmitted: "${formatGQLString(ticket.dateSubmitted)}"` : ""}
  `;
}

export function resolveTicketGQL(ticket) {
  return `
    ${ticket.uuid !== undefined && ticket.uuid !== null ? `uuid: "${ticket.uuid}"` : ""}
    ${!!ticket.ticketStatus ? `ticketStatus: "Close"` : ""}
    ${!!ticket.insuree && !!ticket.insuree.id ? `insureeUuid: "${ticket.insuree.uuid}"` : ""}
    ${!!ticket.category && !!ticket.category.id ? `categoryUuid: "${ticket.category.uuid}"` : ""}
  `;
}

export function createTicket(ticket, clientMutationLabel) {
  let mutation = formatMutation("createTicket", formatTicketGQL(ticket), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_MUTATION_REQ", "TICKET_CREATE_TICKET_RESP", "TICKET_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,

  });

}

export function updateTicket(ticket, clientMutationLabel) {
  let mutation = formatMutation("updateTicket", formatTicketGQL(ticket), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_MUTATION_REQ", "TICKET_UPDATE_TICKET_RESP", "TICKET_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    ticketUuid: ticket.uuid,
  });
}

export function resolveTicket(ticket, clientMutationLabel) {
  let mutation = formatMutation("updateTicket", resolveTicketGQL(ticket), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_MUTATION_REQ", "TICKET_UPDATE_TICKET_RESP", "TICKET_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    ticketUuid: ticket.uuid,
  });
}

export function fetchTicketAttachments(ticket) {
  if (ticket && ticket.uuid) {
    const payload = formatPageQuery(
      "ticketAttachments",
      [`ticket_Uuid: "${ticket.uuid}"`],
      ["id", "uuid", "date", "filename", "mimeType",
        "ticket{id, uuid, ticketCode}"],
    );
    return graphql(payload, "TICKET_TICKET_ATTACHMENTS");
  } else {
    return { type: "TICKET_TICKET_ATTACHMENTS", payload: { data: [] } };
  }
}

export function downloadAttachment(attach) {
  var url = new URL(`${window.location.origin}${baseApiUrl}/ticket/attach`);
  url.search = new URLSearchParams({ id: decodeId(attach.id) });
  return (dispatch) => {
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => openBlob(blob, attach.filename, attach.mime));
  };
}

export function formatTicketAttachmentGQL(ticketattachment) {
  return `
    ${ticketattachment.uuid !== undefined && ticketattachment.uuid !== null ? `uuid: "${ticketattachment.uuid}"` : ""}
    ${!!ticketattachment.ticket && !!ticketattachment.ticket.id ? `ticketUuid: "${ticketattachment.ticket.uuid}"` : ""}
    ${!!ticketattachment.filename ? `filename: "${formatGQLString(ticketattachment.filename)}"` : ""}
    ${!!ticketattachment.mimeType ? `mimeType: "${formatGQLString(ticketattachment.mimeType)}"` : ""}
    ${!!ticketattachment.url ? `url: "${formatGQLString(ticketattachment.url)}"` : ""}
    ${!!ticketattachment.date ? `date: "${formatGQLString(ticketattachment.date)}"` : ""}
    ${!!ticketattachment.document ? `document: "${formatGQLString(ticketattachment.document)}"` : ""}
  `;
}

export function createTicketAttachment(ticketattachment, clientMutationLabel) {
  console.log("_ _ _ _ _ _ _ _ _ _", ticketattachment);
  let mutation = formatMutation("createTicketAttachment", formatTicketAttachmentGQL(ticketattachment), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_ATTACHMENT_MUTATION_REQ", "TICKET_CREATE_TICKET_ATTACHMENT_RESP", "TICKET_ATTACHMENT_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,

  });

}

export function fetchInsuree(mm, chfid) {
  let payload = formatPageQuery(
    "insurees",
    [`chfId:"${chfid}"`],
    [
      "id",
      "uuid",
      "chfId",
      "lastName",
      "otherNames",
      "dob",
      "age",
      "validityFrom",
      "validityTo",
      "gender{code}",
      `family{id}`,
      "photo{folder,filename,photo}",
      "gender{code, gender, altLanguage}",
      "healthFacility" + mm.getProjection("location.HealthFacilityPicker.projection"),
    ],
  );
  return graphql(payload, "INSUREE_INSUREE");
}

const GRIEVANCRE_BY_INSUREE_PROJECTION = [
  "ticketUuid",
  "ticketCode",
  "ticketPriority",
  "ticketStatus",
];

export function fetchInsureeTicket(mm, chfId) {
  let filters = [
    `chfId: "${chfId}"`
  ];
  let projections = [
    "id", "uuid", "ticketTitle", "ticketCode", "ticketDescription",
    "name", "phone", "email", "dateOfIncident", "nameOfComplainant", "witness",
    "resolution", "ticketStatus", "ticketPriority", "dateSubmitted", "dateSubmitted",
    "category{id, uuid, categoryTitle, slug}",
    "insuree{id, uuid, otherNames, lastName, dob, chfId, phone, email}",
    "attachment{edges{node{id, uuid, filename, mimeType, url, document, date}}}",
  ];
  const payload = formatPageQueryWithCount(
    `ticketsByInsuree(chfId: "${chfId}", orderBy: "ticketCode", ticketCode: false, first: 5)`,
    filters,
    projections
  );
  return graphql(payload, 'TICKET_TICKET');
}


export function fetchInsureeTickets(mm, filters) {
  if (filters.filter((f) => f.startsWith("chfId")).length !== 0) {
    qry = "ticketsByInsuree";
    RDX = "TICKET_INSUREE_TICKETS";
  }
  let payload = formatPageQueryWithCount(
    qry,
    filters,
    GRIEVANCRE_BY_INSUREE_PROJECTION
  );
  return graphql(payload, RDX);
}
