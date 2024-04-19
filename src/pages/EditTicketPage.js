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
  Modal,
  Box,
} from '@material-ui/core';
import {
  journalize,
  TextInput,
  PublishedComponent,
  FormattedMessage,
} from '@openimis/fe-core';
import { Save } from '@material-ui/icons';
import AttachIcon from '@material-ui/icons/AttachFile';
import { updateTicket, createTicketAttachment, fetchTicket } from '../actions';
import { EMPTY_STRING, MODULE_NAME } from '../constants';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

const style = {
  background: 'white',
  width: '40%',
  margin: '0 auto',
  position: 'relative',
  top: '40%',
  padding: '2em',
  borderRadius: '10px',
};

const mstyles = {
  title: {
    fontSize: '1.3em',
    fontWeight: '900',
  },

  button: {
    fontSize: '3em',
    color: '#006273',
    // width: "40%",
    marginTop: '-20px',
    width: '10%',
    cursor: 'pointer',
  },
  labels: {
    display: 'flex',
    width: '100%',
  },

  label: {
    width: '45%',
  },

  inputs: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    width: '40%',
  },
};

class EditTicketPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.ticket,
      reporter: {},
      openFileModal: false,
      file: null,
      fileName: EMPTY_STRING,
    };
  }

  componentDidMount() {
    if (this.props.edited_id) {
      this.setState({ stateEdited: this.props.ticket });
      this.setState({ reporter: JSON.parse(JSON.parse(this.props.ticket.reporter || '{}'), '{}') });
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

  handleOpenModal = () => {
    this.setState((prevState) => ({
      ...prevState,
      openFileModal: !prevState.openFileModal,
    }));
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState((prevState) => ({
      ...prevState,
      file,
    }));
  };

  handleFileRead = (e) => {
    const content = btoa(e.target.result);
    const filename = this.state.file.name;
    const mimeType = this.state.file.type;
    const docFile = {
      filename,
      mimeType,
      date: this.state.state_edited.dateOfIncident,
      document: content,
      ticket: this.state.state_edited,
    };
    this.props.createTicketAttachment(docFile, 'Uploaded Ticket Attachment');
  };

  handleFileUpload = (e) => {
    e.preventDefault();
    if (this.state.file) {
      const reader = new FileReader();
      reader.onloadend = this.handleFileRead;
      reader.readAsBinaryString(this.state.file);
    }

    this.setState((prev) => ({
      ...prev,
      openFileModal: false,
    }));
  };

  render() {
    const {
      classes,
      titleone = ' Ticket.ComplainantInformation',
      titletwo = ' Ticket.DescriptionOfEvents',
      titlethree = ' Ticket.Resolution',
      titleParams = { label: EMPTY_STRING },
    } = this.props;

    const { stateEdited, reporter, grievanceConfig } = this.state;
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
                <Grid item xs={4} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                  >
                    <AttachIcon onClick={this.handleOpenModal} />
                  </IconButton>

                  <Modal
                    open={this.state.openFileModal}
                    onClose={this.handleOpenModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      <main>
                        <div className="title">
                          <h2 style={mstyles.title}>Attachments of Ticket</h2>
                        </div>
                        <hr />
                        <div style={mstyles.labels}>
                          <p style={mstyles.label}>Type</p>
                          <p style={mstyles.label}>Title</p>
                        </div>
                        <div style={mstyles.inputs}>
                          <div style={mstyles.input}>
                            <input
                              type="text"
                              value={
                                this.state.file
                                  ? this.state.file.type.split('/')[1]
                                  : EMPTY_STRING
                              }
                              style={{
                                width: '100%',
                                border: 'none',
                                borderBottom: '1px solid #006273',
                                outline: 'none',
                                color: ' #006273',
                                fontSize: '1.5em',
                              }}
                            />
                          </div>
                          <div style={mstyles.input}>
                            <input
                              type="text"
                              value={
                                this.state.file ? this.state.file.name : EMPTY_STRING
                              }
                              style={{
                                width: '100%',
                                border: 'none',
                                borderBottom: '1px solid #006273',
                                outline: 'none',
                                color: ' #006273',
                                fontSize: '1.5em',
                              }}
                            />
                          </div>
                          <div style={mstyles.button}>
                            <IconButton variant="contained" component="label">
                              <AttachIcon />
                              <form>
                                <input
                                  type="file"
                                  name="uploadedFile"
                                  style={{ display: 'none' }}
                                  onChange={this.handleFileChange}
                                />
                              </form>
                            </IconButton>
                          </div>
                        </div>

                        <hr />

                        <div style={{ textAlign: 'end' }}>
                          <IconButton>
                            <Save onClick={this.handleFileUpload} />
                          </IconButton>
                        </div>
                      </main>
                    </Box>
                  </Modal>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.name"
                    value={
                      reporter
                        // eslint-disable-next-line max-len
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
                    required={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.dateOfIncident"
                    value={stateEdited.dateOfIncident}
                    required={false}
                    onChange={(v) => this.updateAttribute('dateOfIncident', v)}
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
                    pubRef="grievanceSocialProtection.FlagPicker"
                    value={stateEdited.flags}
                    onChange={(v) => this.updateAttribute('flags', v)}
                    required
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.ChannelPicker"
                    value={stateEdited.channel}
                    onChange={(v) => this.updateAttribute('channel', v)}
                    required
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketPriorityPicker"
                    value={stateEdited.priority}
                    onChange={(v) => this.updateAttribute('priority', v)}
                    required={false}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.description"
                    value={stateEdited.description}
                    onChange={(v) => this.updateAttribute('description', v)}
                    required={false}
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
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.resolution"
                    value={stateEdited.resolution}
                    onChange={(v) => this.updateAttribute('resolution', v)}
                    required={false}
                  />
                </Grid>
                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={this.save}
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
    fetchTicket, updateTicket, createTicketAttachment, journalize,
  },
  dispatch,
);

export default withTheme(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(EditTicketPage),
  ),
);
