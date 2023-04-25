import React from "react";
import messages_en from "./translations/en.json";
import TicketMainMenu from "./menu/TicketMainMenu";
import { AccountBalanceOutlined } from "@material-ui/icons";
import reducer from "./reducer";
import { FormattedMessage } from "@openimis/fe-core";
import TicketsPage from "./pages/TicketsPage";
import TicketPage from "./pages/TicketPage";

import TicketPriorityPicker from "./pickers/TicketPriorityPicker";
import TicketStatusPicker from "./pickers/TicketStatusPicker";
import DropDownCategoryPicker from "./pickers/DropDownCategoryPicker";

const ROUTE_TICKET_TICKETS = "ticket/tickets";
const ROUTE_TICKET_TICKET = "ticket/ticket";


const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  'reducers': [{ key:'ticket', reducer }],

  "refs":[
    
    { key: "ticket.route.tickets", ref: ROUTE_TICKET_TICKETS },
    { key: "ticket.route.ticket", ref: ROUTE_TICKET_TICKET },
    

    { key: "ticket.TicketStatusPicker", ref: TicketStatusPicker },
    { key: "ticket.TicketPriorityPicker", ref: TicketPriorityPicker },
    { key: "payroll.DropDownCategoryPicker", ref: DropDownCategoryPicker },

 ],

  'core.MainMenu': [TicketMainMenu],
  "core.Router": [ 
     
    {path: ROUTE_TICKET_TICKETS, component: TicketsPage},
    { path: ROUTE_TICKET_TICKET + "/:ticket_uuid?", component: TicketPage },
    
  ],

  "admin.MainMenu": [
    {
      text: <FormattedMessage module="ticket" id="menu.ticket" />,
      icon: <AccountBalanceOutlined />,
      route: "/" + ROUTE_TICKET_TICKETS,
    },
  ],
}

export const TicketsModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}