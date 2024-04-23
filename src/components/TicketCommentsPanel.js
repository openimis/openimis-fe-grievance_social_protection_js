/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import {
  withModulesManager, withHistory, Table, ProgressOrError,
} from '@openimis/fe-core';
import {
  Paper, IconButton,
} from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import { fetchComments, createTicketComment } from '../actions';
import GrievanceCommentDialog from '../dialogs/GrievanceCommentDialog';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.table.item,
  fullHeight: {
    height: '100%',
  },
});

class TicketCommentPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageSize: 5,
      comment: {},
      commenterType: null,
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
      this.props.fetchComments(this.props.edited);
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

  reload = () => {
    this.props.fetchComments(this.props.edited);
  };

  updateCommenterType = (field, value) => {
    this.updateCommentAttribute('commenter', null);
    this.setState((state) => ({
      commenterType: value,
    }));
  };

  updateCommentAttribute = (k, v) => {
    this.setState((state) => ({
      comment: { ...state.comment, [k]: v },
    }));
  };

  handleOpenModal = () => {
    this.setState((prevState) => ({
      ...prevState,
      openCommentModal: !prevState.openCommentModal,
    }));
  };

  handleComment = (e) => {
    e.preventDefault();
    if (this.state.comment) {
      this.props.createTicketComment(
        this.state.comment,
        this.props.edited,
        this.state.commenterType,
        'Added Ticket Comment',
      );
    }
    this.setState((prev) => ({
      ...prev,
      openCommentModal: false,
      comment: {},
      commenterType: null,
    }));
  };

  render() {
    const {
      intl, classes, fetchingTicketComments,
      errorTicketComments, ticketComments,
    } = this.props;

    const headers = [
      'ticket.commenter',
      'ticket.comment',
      'ticket.dateCreated',
    ];

    const itemFormatters = [
      (e) => e?.commenter ?? 'Anonymous User',
      (e) => e.comment,
      (e) => e.dateCreated,

    ];

    const { comment, commenterType } = this.state;

    return (
      <div className={classes.page}>

        <ProgressOrError progress={fetchingTicketComments} error={errorTicketComments} />

        <Paper className={classes.paper}>
          <div style={{ textAlign: 'end', background: '#b7d4d8', height: '2.5em' }}>
            <IconButton variant="contained" component="label" onClick={this.reload}>
              <ReplayIcon />
            </IconButton>
            <GrievanceCommentDialog
              handleComment={this.handleComment}
              openCommentModal={this.state.openCommentModal}
              handleOpenModal={this.handleOpenModal}
              updateCommentAttribute={this.updateCommentAttribute}
              comment={comment}
              updateCommenterType={this.updateCommenterType}
              commenterType={commenterType}
            />
          </div>
          <Table
            module="programs"
            fetch={this.props.fetchComments}
            header="Comments"
            headers={headers}
            itemFormatters={itemFormatters}
            items={ticketComments}
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
  fetchingTicketComments: state.grievanceSocialProtection.fetchingTicketComments,
  errorTicketComments: state.grievanceSocialProtection.errorTicketComments,
  fetchedTicketComments: state.grievanceSocialProtection.fetchedTicketComments,
  ticketComments: state.grievanceSocialProtection.ticketComments,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchComments, createTicketComment,
}, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(withTheme(withStyles(styles)(TicketCommentPanel))),
)));
