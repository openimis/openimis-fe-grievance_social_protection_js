import {
    graphql, formatPageQueryWithCount, formatMutation
    } from "@openimis/fe-core";


export function fetchTicket(prms){
    const payload = formatPageQueryWithCount( 
        "tickets",
        prms,
        ["id", "uuid", "ticketTitle", "ticketCode","ticketDescription", "ticketStatus", "ticketPriority", "ticketDuedate",
        "category{id, uuid, categoryTitle, slug}", 
        "insuree{id, uuid, otherNames, lastName, dob, chfId}" ]
    );
    return graphql(payload, 'TICKET_MY_TICKETS');
}

export function  fetchMyCategory(prms,) {

    const payload  = formatPageQueryWithCount(
        "category",
        prms,
        [ "categoryTitle", "slug"]
    )

    return graphql (payload, "CATEGORY_MY_ENTITIES") 

}

export function saveTicket( tickets,  clientMutationLabel){

    let TicketGQL = `
    insureeUuid: "${tickets["insuree"]["uuid"]}"
    name: "${tickets.name}"
    phone: ${tickets.phone}
    email: "${tickets.email}"
    insureeLocation: "${tickets.insureeLocation}"
    dateOfIncident: "${tickets.dateOfIncident}"
    eventLocationUuid: "${tickets["location"]["uuid"]}"
    witness: "${tickets.witness}"
    categoryUuid: "${tickets["category"]["uuid"]}"
    ticketPriority: "${tickets.ticketPriority}"  
    ticketDescription: "${tickets.ticketDescription}"
    resolution: "${tickets.resolution}"
    `

    let mutation = formatMutation ("createTicket", TicketGQL, clientMutationLabel);
    var requestedDateTime = new Date ();

    return graphql(

        mutation.payload,
        "TICKET_CREATE_TICKET",
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
        
    )
}

export function updateTicket( tickets,  clientMutationLabel){

    let TicketGQL = `
    insureeUuid: "${tickets["insuree"]["uuid"]}"
    name: "${tickets.name}"
    phone: ${tickets.phone}
    email: "${tickets.email}"
    insureeLocation: "${tickets.insureeLocation}"
    dateOfIncident: "${tickets.dateOfIncident}"
    eventLocationUuid: "${tickets["location"]["uuid"]}"
    witness: "${tickets.witness}"
    categoryUuid: "${tickets["category"]["uuid"]}"
    ticketPriority: "${tickets.ticketPriority}"  
    ticketDescription: "${tickets.ticketDescription}"
    resolution: "${tickets.resolution}"
    `

    let mutation = formatMutation ("createTicket", TicketGQL, clientMutationLabel);
    var requestedDateTime = new Date ();

    return graphql(

        mutation.payload,
        "TICKET_CREATE_TICKET",
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
        
    )
}


export function saveCategory( category,  clientMutationLabel){

    let CategoryTicketGQL = `
    categoryTitle: "${category.categoryTitle}"
    slug: "${category.slug}"
    `
    let mutation = formatMuatation ("createCategory", CategoryTicketGQL , clientMutationLabel);
    var requestedDateTime = new Date ();
    return graphql(
        mutation.payload,
        "CATEGORY_CREATE_CATEGORY",
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
        
    )
}