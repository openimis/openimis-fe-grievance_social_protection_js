/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { ListAlt, AddCircleOutline } from '@material-ui/icons';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import {
  GRIEVANCE_MAIN_MENU_CONTRIBUTION_KEY,
  MODULE_NAME,
  RIGHT_TICKET_ADD,
  RIGHT_TICKET_SEARCH,
} from '../constants';

function GrievanceMainMenu(props) {
  const ROUTE_TICKET_TICKETS = 'ticket/tickets';
  const ROUTE_TICKET_NEW_TICKET = 'ticket/newTicket';
  const entries = [
    {
      text: formatMessage(props.intl, MODULE_NAME, 'menu.grievance.grievances'),
      icon: <ListAlt />,
      route: `/${ROUTE_TICKET_TICKETS}`,
      filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: formatMessage(props.intl, MODULE_NAME, 'menu.grievance.add'),
      icon: <AddCircleOutline />,
      route: `/${ROUTE_TICKET_NEW_TICKET}`,
      filter: (rights) => rights.includes(RIGHT_TICKET_ADD),
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(GRIEVANCE_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(props.rights)),
  );

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, MODULE_NAME, 'mainMenuGrievance')}
      entries={entries}
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(GrievanceMainMenu)));
