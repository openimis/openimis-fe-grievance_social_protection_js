import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import ReplayIcon from "@material-ui/icons/Replay";
import {
    formatMessageWithValues, withModulesManager, journalize,
    Form, ProgressOrError
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { fetchTicket } from "../actions";
import { ticketLabel } from "../utils/utils";
import TicketMasterPanel from "./TicketMasterPanel";

const styles = theme => ({
    page: theme.page,
});

class TicketForm extends Component {

    state = {
        lockNew: false,
        reset: 0,
        ticket_uuid: null,
        ticket: this._newticket(),
        newticket: true,
    }

    _newTicket() {
        let ticket = {};
        return ticket;
    }

    componentDidMount() {
        if (this.props.ticket_uuid) {
            this.setState((state, props) => ({ ticket_uuid: props.ticket_uuid }))
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.ticket.ticketCode !== this.state.ticket.ticketCode) {
            document.title = formatMessageWithValues(this.props.intl, "programs", "ticket.title.bar", { label: ticketLabel(this.state.ticket) })
} 
        if (prevProps.fetchedTickets !== this.props.fetchedTickets
            && !!this.props.fetchedTickets
            && !!this.props.ticket) {
            this.setState((state, props) => ({
                ticket: { ...props.ticket },
                ticket_uuid: props.ticket.uuid,
                lockNew: false,
                newTicket: false,
            }));
        } else if (prevState.ticket_uuid !== this.state.ticket_uuid) {
            this.props.fetchTicket(
                this.props.modulesManager,
                this.state.ticket_uuid,
                null
            )
        } else if (prevProps.ticket_uuid && !this.props.ticket_uuid) {
            this.setState({ ticket: this._newticket(), lockNew: false, ticket_uuid: null });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState((state) => ({ reset: state.reset + 1 }));
        }
    }


    _add = () => {
        this.setState((state) => ({
            ticket: this._newTicket(),
            newTicket: true,
            lockNew: false,
            reset: state.reset + 1,
        }),
            e => {
                this.props.add();
                this.forceUpdate();
            }
        )
    }

    reload = () => {
        this.props.fetchTicket(
            this.props.modulesManager,
            this.state.ticket_uuid,
            this.state.ticket.ticketCode,

        );
    }

    canSave = () => {
        // if (!this.state.ticket.tic) return false;
        if (!this.state.ticket.name) return false;
        // if (!this.state.ticket.ticketType) return false;
        // if (!this.state.ticket.amount) return false;
        // if (!this.state.ticket.status) return false;
        // if (!this.state.ticket.startDate) return false;
        // if (!this.state.ticket.endDate) return false;
        return true;
    }

    _save = (ticket) => {
        this.setState(
            { lockNew: !ticket.uuid }, // avoid duplicates
            e => this.props.save(ticket))
    }

    onEditedChanged = ticket => {
        this.setState({ ticket, newTicket: false })
    }

    render() {
        const {
            fetchingTickets, 
            fetchedTickets, 
            errorTickets,
            add, save, back
        } = this.props;

        const { 
            lockNew,
            newTicket,
            reset,
            update, 
            overview,
            ticket_uuid, 
            ticket 
        } = this.state;

        console.log('Sicket St', ticket.name);

        let readOnly = lockNew || !!ticket.validityTo;
        let actions = [];

        if (ticket_uuid) {
            actions.push({
                doIt: e => this.reload(ticket_uuid),
                icon: <ReplayIcon />,
                onlyIfDirty: !readOnly
            });
        }


        return (
            <Fragment>
                <ProgressOrError progress={fetchingTickets} error={errorTickets} />
                {(!!fetchedTickets || !ticket_uuid) && (
            <Fragment>
            <Form
              module="ticket"
              title="ticket.title"
              titleParams={{ label: ticketLabel(this.state.ticket) }}
              edited_id={ticket_uuid}
              edited={this.state.ticket}
              reset={this.state.reset}
              back={this.back}
              add={!!add && !this.state.newticket ? this._add : null}
              readOnly={readOnly || !!ticket.validityTo}
              actions={actions}
            //   HeadPanel={FamilyDisplayPanel}
              Panels={[TicketMasterPanel]}
              ticket={this.state.ticket}
              onEditedChanged={this.onEditedChanged}
              canSave={this.canSave}
              save={!!save ? this._save : null}
            />
            </Fragment>
            )}
            </Fragment>
        )
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
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchTicket, journalize }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(TicketForm)
    
));