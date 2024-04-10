/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Grid, Paper, Typography, Divider, IconButton,
} from '@material-ui/core';
import { Save } from '@material-ui/icons';
import {
  TextInput, journalize, PublishedComponent, FormattedMessage,
} from '@openimis/fe-core';
import { createTicket } from '../actions';
import { EMPTY_STRING, MODULE_NAME } from '../constants';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class AddTicketPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
    };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevPops, prevState, snapshort) {
    if (prevPops.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
  }

  save = () => {
    this.props.createTicket(
      this.state.stateEdited,
      `Created Ticket ${this.state.stateEdited.individual.firstName} ${this.state.stateEdited.individual.lastName}`,
    );
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
    }));
  };

  render() {
    const {
      classes,
      titleone = ' Ticket.ComplainantInformation',
      titletwo = ' Ticket.DescriptionOfEvents',
      titleParams = { label: EMPTY_STRING },
    } = this.props;

    const {
      stateEdited,
    } = this.state;
    return (
      <div className={classes.page}>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={8} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titleone} values={titleParams} />
                  </Typography>
                </Grid>
                <Grid item xs={4} className={classes.tableTitle}>
                  <PublishedComponent
                    pubRef="individual.IndividualPicker"
                    value={stateEdited.individual}
                    label="Complainant"
                    onChange={(v) => this.updateAttribute('individual', v)}
                    required
                  />
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.name"
                    value={
                      !!stateEdited
                      && !!stateEdited.individual
                        ? `${stateEdited.individual.firstName} ${stateEdited.individual.lastName}`
                        : EMPTY_STRING
                    }
                    onChange={(v) => this.updateAttribute('name', v)}
                    required={false}
                    readOnly
                  />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.phone"
                    value={!!stateEdited && !!stateEdited.individual
                      ? stateEdited.individual?.jsonExt?.phone
                      : EMPTY_STRING}
                    onChange={(v) => this.updateAttribute('phone', v)}
                    required={false}
                    readOnly
                  />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.email"
                    value={!!stateEdited && !!stateEdited.individual
                      ? stateEdited.individual?.jsonExt?.email
                      : EMPTY_STRING}
                    onChange={(v) => this.updateAttribute('email', v)}
                    required={false}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titletwo} values={titleParams} />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.eventDate"
                    value={stateEdited.dateOfIncident}
                    required={false}
                    onChange={(v) => this.updateAttribute('dateOfIncident', v)}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.witness"
                    value={stateEdited.witness}
                    onChange={(v) => this.updateAttribute('witness', v)}
                    required={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.DropDownCategoryPicker"
                    value={stateEdited.category}
                    onChange={(v) => this.updateAttribute('category', v)}
                    required
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketPriorityPicker"
                    value={stateEdited.ticketPriority}
                    onChange={(v) => this.updateAttribute('ticketPriority', v)}
                    required={false}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.ticketDescription"
                    value={stateEdited.ticketDescription}
                    onChange={(v) => this.updateAttribute('ticketDescription', v)}
                    required={false}
                  />
                </Grid>
                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton variant="contained" component="label" color="primary" onClick={this.save}>
                    <Save />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createTicket, journalize }, dispatch);

export default withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AddTicketPage)));
