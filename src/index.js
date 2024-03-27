import React from "react";
import messages_en from "./translations/en.json";
import reducer from "./reducer";
import { ListAlt } from "@material-ui/icons";
import { FormattedMessage } from "@openimis/fe-core";
import TicketMainMenu from "./menu/TicketMainMenu";
import TicketsPage from "./pages/TicketsPage";
import TicketPage from "./pages/TicketPage";
import TicketSearcher from "./components/TicketSearcher";
import TicketPriorityPicker from "./pickers/TicketPriorityPicker";
import TicketStatusPicker from "./pickers/TicketStatusPicker";
import DropDownCategoryPicker from "./pickers/DropDownCategoryPicker";
import CategoryPicker from "./pickers/CategoryPicker";

const ROUTE_TICKET_TICKETS = "ticket/tickets";
const ROUTE_TICKET_TICKET = "ticket/ticket";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'grievance', reducer }],

  "refs": [
    { key: "grievance.route.tickets", ref: ROUTE_TICKET_TICKETS },
    { key: "grievance.route.ticket", ref: ROUTE_TICKET_TICKET },

    { key: "grievance.route.ticketSearcher", ref: TicketSearcher },

    { key: "grievance.TicketStatusPicker", ref: TicketStatusPicker },
    { key: "grievance.TicketPriorityPicker", ref: TicketPriorityPicker },
    { key: "grievance.DropDownCategoryPicker", ref: DropDownCategoryPicker },
    { key: "grievance.CategoryPicker", ref: CategoryPicker },

  ],
  "core.Router": [
    { path: ROUTE_TICKET_TICKETS, component: TicketsPage },
    { path: ROUTE_TICKET_TICKET+ "/:ticket_uuid?", component: TicketPage },
  ],

  "admin.MainMenu": [
    {
      text: <FormattedMessage module="grievance" id="menu.ticket" />,
      icon: <ListAlt />,
      route: "/" + ROUTE_TICKET_TICKETS,
    },
  ],
  "core.MainMenu": [TicketMainMenu],
  
  
}

export const GrievanceSocialProtectionModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}

