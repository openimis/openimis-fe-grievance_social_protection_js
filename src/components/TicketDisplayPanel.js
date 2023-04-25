import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withModulesManager, ProgressOrError } from "@openimis/fe-core";
import TicketMasterPanel from "./TicketMasterPanel";
import { fetchTicket } from "../actions";

class TicketDisplayPanel extends Component {
  state = {
    ticket: null,
  };

  componentDidMount() {
    if (!!this.props.ticket_uuid) {
      this.props.fetchTicket(this.props.modulesManager, this.props.ticket_uuid);
    } else {
      this.setState({ ticket: this.props.ticket });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.ticket_uuid !== this.props.ticket_uuid) {
      this.setState({ ticket: null }, (e) => this.props.fetchTicket(this.props.modulesManager, this.props.ticket_uuid));
    } else if (!prevProps.fetchedTickets && !!this.props.fetchedTickets) {
      this.setState({ ticket: this.props.ticket });
    }
  }

  render() {
    const { fetchingTickets, errorTickets } = this.props;
    return (
      <Fragment>
        <ProgressOrError progress={fetchingTickets} error={errorTickets} />
        {!!this.state.ticket && (
          <TicketMasterPanel
            {...this.props}
            readOnly={true}
            edited={this.state.ticket}
            overview={true}
            // openFamilyButton={true}
          />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state, props) => ({
    fetchingTickets: state.ticket.fetchingTickets,
    errorTickets: state.ticket.errorTickets,
    fetchedTickets: state.ticket.fetchedTickets,
    Ticket: state.ticket.Ticket,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchTicket }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(TicketDisplayPanel));
