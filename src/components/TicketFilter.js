import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid } from "@material-ui/core";
import {
    withModulesManager,
    Contributions,
    ControlledField,
    TextInput,
} from "@openimis/fe-core";

const styles = (theme) => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
    form: {
        padding: 0,
    },
    item: {
        padding: theme.spacing(1),
    },
    paperDivider: theme.paper.divider,
});

const TICKET_FILTER_CONTRIBUTION_KEY = "ticket.Filter";

class TicketFilter extends Component {
    state = {
        showHistory: false,
    };

    debouncedOnChangeFilter = _debounce(
        this.props.onChangeFilters,
        this.props.modulesManager.getConf("fe-grievance", "debounceTime", 800),
    );

    _filterValue = (k) => {
        const { filters } = this.props;
        return !!filters && !!filters[k] ? filters[k].value : null;
    };

    render() {
        const { intl, classes, filters, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <ControlledField
                    module="grievance"
                    id="ticketFilter.ticketCode"
                    field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="grievance"
                                label="ticket.ticketCode"
                                name="ticketCode"
                                value={this._filterValue("ticketCode")}
                                onChange={(v) =>
                                    this.debouncedOnChangeFilter([
                                        {
                                            id: "ticketCode",
                                            value: v,
                                            filter: `ticketCode_Istartswith: "${v}"`,
                                        },
                                    ])
                                }
                            />
                        </Grid>
                    }
                />
                <ControlledField
                    module="grievance"
                    id="ticket.ticketGrievanct"
                    field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="grievance"
                                label="ticket.ticketGrievanct"
                                name="name"
                                value={this._filterValue("name")}
                                onChange={(v) =>
                                    this.debouncedOnChangeFilter([
                                        {
                                            id: "name",
                                            value: v,
                                            filter: `name_Istartswith: "${v}"`,
                                        },
                                    ])
                                }
                            />
                        </Grid>
                    }
                />
                <ControlledField
                    module="grievance"
                    id="ticketFilter.ticketPriority"
                    field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="grievance"
                                label="ticket.ticketPriority"
                                name="ticketPriority"
                                value={this._filterValue("ticketPriority")}
                                onChange={(v) =>
                                    this.debouncedOnChangeFilter([
                                        {
                                            id: "ticketPriority",
                                            value: v,
                                            filter: `ticketPriority_Icontains: "${v}"`,
                                        },
                                    ])
                                }
                            />
                        </Grid>
                    }
                />
                <ControlledField
                    module="grievance"
                    id="ticketFilter.ticketStatus"
                    field={
                        <Grid item xs={3} className={classes.item}>
                            <TextInput
                                module="grievance"
                                label="ticket.ticketStatus"
                                name="ticketStatus"
                                value={this._filterValue("ticketStatus")}
                                onChange={(v) =>
                                    this.debouncedOnChangeFilter([
                                        {
                                            id: "ticketStatus",
                                            value: v,
                                            filter: `ticketStatus_Icontains: "${v}"`,
                                        },
                                    ])
                                }
                            />
                        </Grid>
                    }
                />
                <Contributions
                    filters={filters}
                    onChangeFilters={onChangeFilters}
                    contributionKey={TICKET_FILTER_CONTRIBUTION_KEY}
                />
            </Grid>
        );
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(TicketFilter))));
