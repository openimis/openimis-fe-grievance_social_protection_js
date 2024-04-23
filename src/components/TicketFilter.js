/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';
import _debounce from 'lodash/debounce';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import {
  withModulesManager,
  Contributions,
  ControlledField,
  TextInput,
  PublishedComponent,
  decodeId,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';

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

const TICKET_FILTER_CONTRIBUTION_KEY = 'ticket.Filter';

class TicketFilter extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf('fe-grievance_social_protection', 'debounceTime', 800),
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _onChangeReporter = (k, v) => {
    this.props.onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}: "${decodeId(v?.id)}"`,
      },
    ]);
  };

  render() {
    const {
      classes, filters, onChangeFilters,
    } = this.props;
    return (
      <Grid container className={classes.form}>
        <ControlledField
          module={MODULE_NAME}
          id="ticketFilter.ticketCode"
          field={(
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="ticket.ticketCode"
                name="code"
                value={this._filterValue('code')}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'code',
                    value: v,
                    filter: `code_Istartswith: "${v}"`,
                  },
                ])}
              />
            </Grid>
                      )}
        />
        <ControlledField
          module={MODULE_NAME}
          id="ticketFilter.ticketTitle"
          field={(
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="ticket.ticketTitle"
                name="title"
                value={this._filterValue('title')}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'title',
                    value: v,
                    filter: `title_Istartswith: "${v}"`,
                  },
                ])}
              />
            </Grid>
                      )}
        />
        <ControlledField
          module={MODULE_NAME}
          id="ticket.reporter"
          field={(
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="individual.IndividualPicker"
                withNull
                label="Individual"
                value={this._filterValue('reporterId')}
                onChange={(v) => this._onChangeReporter(
                  'reporterId',
                  v || null,
                )}
              />
            </Grid>
                      )}
        />
        <ControlledField
          module={MODULE_NAME}
          id="ticketFilter.priority"
          field={(
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="grievanceSocialProtection.TicketPriorityPicker"
                withNull
                label="ticket.ticketPriority"
                value={this._filterValue('priority')}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'priority',
                    value: v,
                    filter: `priority_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
                      )}
        />
        <ControlledField
          module={MODULE_NAME}
          id="ticket.status"
          field={(
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef="grievanceSocialProtection.TicketStatusPicker"
                withNull
                label="ticket.ticketStatus"
                value={this._filterValue('status')}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'status',
                    value: v,
                    filter: `status_Icontains: ${v}`,
                  },
                ])}
              />
            </Grid>
                      )}
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
