import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay";
import {
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  journalize,
  Form,
  ProgressOrError,
  Helmet,
} from "@openimis/fe-core";
import { RIGHT_TICKET } from "../constants";
import TicketDisplayPanel from "./TicketDisplayPanel";
import TicketMasterPanel from "../components/TicketMasterPanel";
import { fetchTicket } from "../actions";
import { ticketLabel } from "../utils/utils";

const styles = (theme) => ({
  page: theme.page,
});

class TicketForm extends Component {
  state = {
    lockNew: false,
    reset: 0,
    ticket: this._newTicket(),
    newTicket: true,
  };

  _newTicket() {
    let ticket = {};
    ticket.jsonExt = {};
    return ticket;
  }

  componentDidMount() {
    if (this.props.ticket_uuid) {
        this.setState((state, props) => ({ ticket_uuid: props.ticket_uuid }))
    }
    // if (!!this.props.ticket_uuid) {
    //   this.setState(
    //     (state, props) => ({ ticket_uuid: props.ticket_uuid }),
    //     (e) => this.props.fetchTicket(this.props.modulesManager, this.props.ticket_uuid),
    //   );
    // } else if (!!this.props.family_uuid && (!this.props.family || this.props.family.uuid !== this.props.family_uuid)) {
    //   this.props.fetchFamily(this.props.modulesManager, this.props.family_uuid);
    // } else if (!!this.props.family_uuid) {
    //   let insuree = { ...this.state.insuree };
    //   insuree.family = { ...this.props.family };
    //   this.setState({ insuree });
    // }
  }

  back = (e) => {
    const { modulesManager, history, ticket_uuid } = this.props;
    if (ticket_uuid) {
      historyPush(modulesManager, history, "ticket.route.tickets");
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedTickets !== this.props.fetchedTickets && !!this.props.fetchedTickets) {
      var ticket = this.props.ticket || {};
      ticket.ext = !!ticket.jsonExt ? JSON.parse(ticket.jsonExt) : {};
      this.setState({ ticket, ticket_uuid: ticket.uuid, lockNew: false, newTicket: false });
    } else if (prevProps.ticket_uuid && !this.props.ticket_uuid) {
      this.setState({ ticket: this._newTicket(), newTicket: true, lockNew: false, ticket_uuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    }
  }

  _add = () => {
    this.setState(
      (state) => ({
        ticket: this._newTicket(),
        newTicket: true,
        lockNew: false,
        reset: state.reset + 1,
      }),
      (e) => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  reload = () => {
    this.props.fetchTicket(this.props.modulesManager, this.state.ticket_uuid);
  };

  canSave = () => {
    if (!this.state.ticket.name) return false;
    return true;
  };

  _save = (ticket) => {
    this.setState(
      { lockNew: !ticket.uuid }, // avoid duplicates
      (e) => this.props.save(ticket),
    );
  };

  onEditedChanged = (ticket) => {
    this.setState({ ticket, newTicket: false });
  };

  render() {
    const {
      rights,
      ticket_uuid,
      fetchingTickets,
      fetchedTickets,
      errorTickets,
      readOnly = false,
      add,
      save,
    } = this.props;
    const { ticket } = this.state;
    if (!rights.includes(RIGHT_TICKET)) return null;
    let actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly,
      },
    ];
    return (
      <Fragment>
        <Helmet
          title={formatMessageWithValues(this.props.intl, "ticket", "Ticket.title", {
            label: ticketLabel(this.state.ticket),
          })}
        />
        <ProgressOrError progress={fetchingTickets} error={errorTickets} />
        {((!!fetchedTickets && !!ticket && ticket.uuid === ticket_uuid) || !ticket_uuid) &&
            <Form
              module="ticket"
              title="Ticket.title"
              titleParams={{ label: ticketLabel(this.state.ticket) }}
              edited_id={ticket_uuid}
              edited={this.state.ticket}
              reset={this.state.reset}
              back={this.back}
              add={!!add && !this.state.newTicket ? this._add : null}
              readOnly={readOnly || !!ticket.validityTo}
              actions={actions}
              HeadPanel={TicketDisplayPanel}
              Panels={[TicketMasterPanel]}
              ticket={this.state.ticket}
              onEditedChanged={this.onEditedChanged}
              canSave={this.canSave}
              save={!!save ? this._save : null}
            />
          }
      </Fragment>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingTickets: state.ticket.fetchingTickets,
  errorTickets: state.ticket.errorTickets,
  fetchedTickets: state.ticket.fetchedTickets,
  Ticket: state.ticket.Ticket,
  submittingMutation: state.ticket.submittingMutation,
  mutation: state.ticket.mutation,
});

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, { fetchTicket, journalize })(
      injectIntl(withTheme(withStyles(styles)(TicketForm))),
    ),
  ),
);