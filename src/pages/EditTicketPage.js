/* eslint-disable no-nested-ternary */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
} from '@material-ui/core';
import {
  journalize,
  TextInput,
  PublishedComponent,
  FormattedMessage,
} from '@openimis/fe-core';
import { Save } from '@material-ui/icons';
import { updateTicket, fetchTicket, createTicketComment } from '../actions';
import { EMPTY_STRING, MODULE_NAME } from '../constants';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class EditTicketPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.ticket,
      reporter: {},
      grievanceConfig: {},
    };
  }

  componentDidMount() {
    if (this.props.edited_id) {
      this.setState({ grievanceConfig: this.props.grievanceConfig });
      this.setState({ stateEdited: this.props.ticket });
      console.log('this.props.ticket.reporter', this.props.ticket);
      if (this.props.ticket.reporter) {
        this.setState({ reporter: JSON.parse(JSON.parse(this.props.ticket.reporter || '{}'), '{}') });
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevPops, prevState, snapshort) {
    if (prevPops.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
  }

  save = () => {
    this.props.updateTicket(
      this.state.stateEdited,
      `updated ticket ${this.state.stateEdited.code}`,
    );
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
    }));
  };

  extractFieldFromJsonExt = (reporter, field) => {
    if (reporter) {
      if (reporter.jsonExt) {
        return reporter.jsonExt[field] || '';
      }
      return '';
    }
    return '';
  };

  render() {
    const {
      classes,
      titleone = ' Ticket.ComplainantInformation',
      titletwo = ' Ticket.DescriptionOfEvents',
      titlethree = ' Ticket.Resolution',
      titleParams = { label: EMPTY_STRING },
      grievanceConfig,
    } = this.props;

    const propsReadOnly = this.props.readOnly;

    const {
      stateEdited, reporter,
    } = this.state;

    console.log('reporter', reporter);

    return (
      <div className={classes.page}>
        <Grid container>
          <Grid item xs={12}>
            {stateEdited.reporter && (
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={8} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titleone} values={titleParams} />
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.item}>
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="individual.IndividualPicker"
                    value={reporter}
                    label="Complainant"
                    onChange={(v) => this.updateAttribute('reporter', v)}
                    required
                    readOnly
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
                      reporter && reporter.individual
                        ? `${reporter.individual.firstName} ${reporter.individual.lastName} ${reporter.individual.dob}`
                        : reporter
                          ? `${reporter.firstName} ${reporter.lastName} ${reporter.dob}`
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
                    value={!!stateEdited && !!stateEdited.reporter
                      ? this.extractFieldFromJsonExt(reporter, 'phone')
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
                    value={!!stateEdited && !!stateEdited.reporter
                      ? this.extractFieldFromJsonExt(reporter, 'email')
                      : EMPTY_STRING}
                    onChange={(v) => this.updateAttribute('email', v)}
                    required={false}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Paper>
            )}
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage
                      module={MODULE_NAME}
                      id={titletwo}
                      values={titleParams}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="ticket.title"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute('title', v)}
                    required
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.dateOfIncident"
                    value={stateEdited.dateOfIncident}
                    required={false}
                    onChange={(v) => this.updateAttribute('dateOfIncident', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.DropDownCategoryPicker"
                    value={stateEdited.category}
                    onChange={(v) => this.updateAttribute('category', v)}
                    required
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.FlagPicker"
                    value={stateEdited.flags}
                    onChange={(v) => this.updateAttribute('flags', v)}
                    required
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.ChannelPicker"
                    value={stateEdited.channel}
                    onChange={(v) => this.updateAttribute('channel', v)}
                    required
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketPriorityPicker"
                    value={stateEdited.priority}
                    onChange={(v) => this.updateAttribute('priority', v)}
                    required={false}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="admin.UserPicker"
                    value={stateEdited.attendingStaff}
                    module="core"
                    onChange={(v) => this.updateAttribute('attendingStaff', v)}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketStatusPicker"
                    value={stateEdited.status}
                    onChange={(v) => this.updateAttribute('status', v)}
                    required={false}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.description"
                    value={stateEdited.description}
                    onChange={(v) => this.updateAttribute('description', v)}
                    required={false}
                    readOnly={propsReadOnly}
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
                    <FormattedMessage
                      module={MODULE_NAME}
                      id={titlethree}
                      values={titleParams}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    label="ticket.resolution"
                    value={stateEdited.resolution}
                    onChange={(v) => this.updateAttribute('resolution', v)}
                    required={false}
                    readOnly={propsReadOnly}
                  />
                </Grid>
                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={this.save}
                    disabled={propsReadOnly}
                  >
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
  fetchingTicket: state.grievanceSocialProtection.fetchingTicket,
  errorTicket: state.grievanceSocialProtection.errorTicket,
  fetchedTicket: state.grievanceSocialProtection.fetchedTicket,
  ticket: state.grievanceSocialProtection.ticket,
  grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTicket, updateTicket, createTicketComment, journalize,
  },
  dispatch,
);

export default withTheme(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(EditTicketPage),
  ),
);
