/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import {
  formatMessageWithValues, withModulesManager, withHistory, Table, ProgressOrError,
} from '@openimis/fe-core';
import { Paper, Link, IconButton } from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import { fetchTicketAttachments, downloadAttachment } from '../actions';
import { MODULE_NAME, EMPTY_STRING } from '../constants';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.table.item,
  fullHeight: {
    height: '100%',
  },
});

class TicketAttachmentPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageSize: 5,
    };
    this.rowsPerPageOptions = props.modulesManager.getConf(
      'fe-grievance_social_protection',
      'ticketFilter.rowsPerPageOptions',
      [10, 20, 50, 100],
    );
    this.defaultPageSize = props.modulesManager.getConf(
      'fe-grievance_social_protection',
      'ticketFilter.defaultPageSize',
      10,
    );
  }

  query = () => {
    if (this.props.edited) {
      this.props.fetchTicketAttachments(this.props.edited);
    }
  };

  onChangeRowsPerPage = (cnt) => {
    this.setState(
      {
        pageSize: cnt,
        page: 0,
      },
      () => this.query(),
    );
  };

  componentDidMount() {
    this.setState({ }, () => this.onChangeRowsPerPage(this.defaultPageSize));
  }

  ticketChanged = (prevProps) => (!prevProps.ticket && !!this.props.ticket)
        || (
          !!prevProps.ticket
            && !!this.props.ticket
            && (prevProps.ticket.uuid == null || prevProps.ticket.uuid !== this.props.ticket.uuid)
        );

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.ticketChanged(prevProps)) {
      this.query();
    }
  }

  onChangePage = (page, nbr) => {
    this.setState((prevState) => {
      if (nbr > prevState.page) {
        return { page: prevState.page + 1 };
      } if (nbr < prevState.page) {
        return { page: prevState.page - 1 };
      }
      // If nbr === prevState.page, return null to indicate no state update
      return null;
    }, () => {
      this.query();
    });
  };

  download = (a) => {
    this.props.downloadAttachment(a);
  };

  reload = () => {
    this.props.fetchTicketAttachments(this.props.edited);
  };

  fileSelected = (f, i) => {
    if (f.target.files) {
      const file = f.target.files[0];
      const ticketAttachments = [...this.state.ticketAttachments];
      ticketAttachments[i].filename = file.name;
      ticketAttachments[i].mime = file.type;
    }
  };

  formatFileName(a, i) {
    if (a.id) {
      return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <Link onClick={() => this.download(a)} reset={this.state.reset}>
          {a.filename || EMPTY_STRING}
        </Link>
      );
    }
    if (a.filename) return <i>{a.filename}</i>;
    return (
      <IconButton variant="contained" component="label">
        <FileIcon />
        <input type="file" style={{ display: 'none' }} onChange={(f) => this.fileSelected(f, i)} />
      </IconButton>
    );
  }

  render() {
    const {
      intl, classes, fetchingTicketAttachments, errorTicketAttachments, ticketAttachments,
    } = this.props;

    const headers = [
      'ticket.attachments.table.filename',
      'ticket.attachments.table.date',
      'ticket.attachments.table.file',
    ];

    const itemFormatters = [
      (e) => e.filename,
      (e) => e.date,
      (a, i) => this.formatFileName(a, i),

    ];

    return (
      <div className={classes.page}>

        <ProgressOrError progress={fetchingTicketAttachments} error={errorTicketAttachments} />

        <Paper className={classes.paper}>
          <div style={{ textAlign: 'end', background: '#b7d4d8', height: '2.5em' }}>
            <IconButton variant="contained" component="label" onClick={this.reload}>
              <ReplayIcon />
            </IconButton>
          </div>
          <Table
            module="programs"
                        // fetch={this.props.fetchTicketAttachments}
            header={formatMessageWithValues(intl, MODULE_NAME, 'ticket.attachments.table')}
            headers={headers}
            itemFormatters={itemFormatters}
            items={ticketAttachments}
            withPagination
            page={this.state.page}
            pageSize={this.state.pageSize}
            onChangePage={this.onChangePage}
            onChangeRowsPerPage={this.onChangeRowsPerPage}
            rowsPerPageOptions={this.rowsPerPageOptions}
            defaultPageSize={this.defaultPageSize}
            rights={this.rights}
          />
        </Paper>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  fetchingTicketAttachments: state.grievanceSocialProtection.fetchingTicketAttachments,
  errorTicketAttachments: state.grievanceSocialProtection.errorTicketAttachments,
  fetchedTicketAttachments: state.grievanceSocialProtection.fetchedTicketAttachments,
  ticketAttachments: state.grievanceSocialProtection.ticketAttachments,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchTicketAttachments, downloadAttachment }, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(withTheme(withStyles(styles)(TicketAttachmentPanel))),
)));
