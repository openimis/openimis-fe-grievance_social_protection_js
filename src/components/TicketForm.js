/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ReplayIcon from '@material-ui/icons/Replay';
import {
  Form, formatMessageWithValues, journalize, ProgressOrError, withModulesManager,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { fetchTicket, fetchTicketAttachments } from '../actions';
import { ticketLabel } from '../utils/utils';
import EditTicketPage from '../pages/EditTicketPage';
import AddTicketPage from '../pages/AddTicketPage';
import TicketAttachmentPanel from './TicketAttachmentPanel';
import { MODULE_NAME } from '../constants';

class TicketForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      ticketUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.ticketUuid) {
      this.setState((state, props) => ({ ticketUuid: props.ticketUuid }));
    }
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.ticket.ticketCode !== this.state.ticket.ticketCode) {
      document.title = formatMessageWithValues(
        this.props.intl,
        MODULE_NAME,
        'ticket.title.bar',
        { label: ticketLabel(this.state.ticket) },
      );
    }
    if (prevProps.fetchedTicket !== this.props.fetchedTicket
            && !!this.props.fetchedTicket
            && !!this.props.ticket) {
      this.setState((state, props) => ({
        ticket: { ...props.ticket },
        ticketUuid: props.ticket.uuid,
        lockNew: false,
      }));
    } else if (prevState.ticketUuid !== this.state.ticketUuid) {
      this.props.fetchTicket(
        this.props.modulesManager,
        this.state.ticketUuid,
        null,
      );
    } else if (prevProps.ticketUuid && !this.props.ticketUuid) {
      this.setState({ ticket: this._newTicket(), lockNew: false, ticketUuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
    }
  }

  // eslint-disable-next-line react/sort-comp
  _newTicket() {
    return {};
  }

  reload = () => {
    this.props.fetchTicketAttachments(
      this.props.modulesManager,
      this.state.ticketUuid,
      this.state.ticket.code,

    );
  };

  canSave = () => {
    if (!this.state.ticket.name) return false;
    if (!this.state.ticket.insuree) return false;
    if (!this.state.ticket.category) return false;
    return true;
  };

  _save = (ticket) => {
    this.setState(
      { lockNew: !ticket.uuid },
      () => this.props.save(ticket),
    );
  };

  onEditedChanged = (ticket) => {
    this.setState({ ticket });
  };

  render() {
    const {
      fetchingTicket,
      fetchedTicket,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      ticketUuid,
      ticket,
    } = this.state;

    const readOnly = lockNew || !!ticket.validityTo;
    const actions = [];

    if (ticketUuid) {
      actions.push({
        doIt: () => this.reload(ticketUuid),
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly,
      });
    }

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedTicket || !ticketUuid) && (
        <Form
          module={MODULE_NAME}
          edited_id={ticketUuid}
          edited={ticket}
          reset={reset}
          update={update}
          title="ticket.title.bar"
          titleParams={{ label: ticketLabel(this.state.ticket) }}
          back={back}
          save={save ? this._save : null}
          canSave={this.canSave}
          reload={(ticketUuid || readOnly) && this.reload}
          readOnly={readOnly}
          overview={overview}
          Panels={ticketUuid ? [EditTicketPage, TicketAttachmentPanel] : [AddTicketPage]}
          onEditedChanged={this.onEditedChanged}
          actions={actions}
        />
        )}
      </>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingTicket: state.grievanceSocialProtection.fetchingTicket,
  errorTicket: state.grievanceSocialProtection.errorTicket,
  fetchedTicket: state.grievanceSocialProtection.fetchedTicket,
  ticket: state.grievanceSocialProtection.ticket,
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTicket,
  fetchTicketAttachments,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(TicketForm),

));
