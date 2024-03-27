import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { IconButton } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Search as SearchIcon,
} from '@material-ui/icons';
import {
  withModulesManager, formatMessageWithValues, formatMessage,
  withHistory, historyPush, coreConfirm, journalize,
  Searcher,
} from '@openimis/fe-core';
import AddIcon from '@material-ui/icons/Add';
import { RIGHT_TICKET_ADD } from '../constants';
import { fetchTicketSummaries, resolveTicket } from '../actions';

import TicketFilter from './TicketFilter';
import EnquiryDialog from './EnquiryDialog';

// import {CheckCircle as CloseIcon} from '@material-ui/icons';

const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    margin: 0,
  },
  paperHeader: {
    ...theme.paper.header,
    padding: 10,
  },
  tableTitle: theme.table.title,
  fab: theme.fab,
  button: {
    margin: theme.spacing(1),
  },
  item: {
    padding: theme.spacing(1),
  },
});

class TicketSearcher extends Component {
  state = {
    enquiryOpen: false,
    open: false,
    chfid: null,
    confirmedAction: null,
    reset: 0,
  };

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf('fe-grievance', 'ticketFilter.rowsPerPageOptions', [10, 20, 50, 100]);
    this.defaultPageSize = props.modulesManager.getConf('fe-grievance', 'ticketFilter.defaultPageSize', 10);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    } else if (!prevProps.confirmed && this.props.confirmed) {
      this.state.confirmedAction();
    }
  }

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, 'grievance.route.addticket');
  };

  fetch = (prms) => {
    this.props.fetchTicketSummaries(
      this.props.modulesManager,
      prms,
    );
  };

  rowIdentifier = (r) => r.uuid;

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((f) => !!state.filters[f].filter)
      .map((f) => state.filters[f].filter);
    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  _onClick = (i, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, 'insuree.route.insuree', [i.uuid], newTab);
  };

  resolveTicket = (e) => {
    this.props.resolveTicket(this.props.edited_id);
  };

  headers = (filters) => {
    const h = [
      'tickets.ticketCode',
      'tickets.beneficaryCode',
      'tickets.beneficary',
      'tickets.priority',
      'tickets.status',
    ];
    return h;
  };

  sorts = (filters) => {
    const results = [
      ['ticketCode', true],
      ['insuree_id', true],
      ['insuree', true],
      ['ticket_priority', true],
      ['ticket_status', true],
    ];
    return results;
  };

  adornedChfId = (ticket) => (
    <>
      <IconButton
        size="small"
        onClick={(e) => !ticket.clientMutationId && this.setState({ enquiryOpen: true, chfid: ticket.insuree.chfId })}
      >
        <SearchIcon />
      </IconButton>
      {ticket.insuree.chfId}
    </>
  );

  itemFormatters = (filters) => {
    const formatters = [
      (ticket) => ticket.ticketCode,
      // ticket => ticket.insuree.chfId,
      (ticket) => this.adornedChfId(ticket),
      // ticket => <Button onClick={this._onClick} color="primary">{ticket.insuree.chfId}</Button>,
      (ticket) => `${ticket.insuree.otherNames} ${ticket.insuree.lastName}`,
      (ticket) => ticket.ticketPriority,
      (ticket) => ticket.ticketStatus,

    ];
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      tickets, ticketsPageInfo, fetchingTickets, fetchedTickets, errorTickets,
      filterPaneContributionsKey, cacheFiltersKey, onDoubleClick, rights, readOnly, classes,
    } = this.props;

    const count = ticketsPageInfo.totalCount;

    const actions = !!readOnly || !rights.includes(RIGHT_TICKET_ADD)
      ? []
      : [
        {
          button: (
            <IconButton onClick={this.onAdd}>
              <AddIcon />
            </IconButton>
          ),
          tooltip: formatMessage(intl, 'grievance', 'action.AddTicket.tooltip'),
        },
      ];

    return (
      <>
        <EnquiryDialog
          open={this.state.enquiryOpen}
          chfid={this.state.chfid}
          onClose={() => {
            this.setState({ enquiryOpen: false, chfid: null });
          }}
        />
        <Searcher
          module="grievance"
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={TicketFilter}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={tickets}
          itemsPageInfo={ticketsPageInfo}
          fetchingItems={fetchingTickets}
          fetchedItems={fetchedTickets}
          errorItems={errorTickets}
          tableTitle={formatMessageWithValues(intl, 'grievance', 'ticketSummaries', { count })}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="ticketCode"
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(i) => !i.clientMutationId && onDoubleClick(i)}
          reset={this.state.reset}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  tickets: state.grievance.tickets,
  ticketsPageInfo: state.grievance.ticketsPageInfo,
  fetchingTickets: state.grievance.fetchingTickets,
  fetchedTickets: state.grievance.fetchedTickets,
  errorTickets: state.grievance.errorTickets,
  submittingMutation: state.grievance.submittingMutation,
  mutation: state.grievance.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTicketSummaries, resolveTicket, journalize, coreConfirm,
  },
  dispatch,
);

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(TicketSearcher))))));
