import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Paper, Grid, Typography, Divider } from "@material-ui/core";
import {
  FormattedMessage,
  PublishedComponent,
  FormPanel,
  TextInput,
  withModulesManager,
} from "@openimis/fe-core";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class TicketMasterPanel extends FormPanel {
  render() {
    const {
      intl,
      classes,
      edited,
      title = "Ticket.title",
      titleParams = { label: "" },
      readOnly = true,
      actions,
    } = this.props;
    return (
      <div className={classes.page}>
                <Grid container>
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Grid container className={classes.tableTitle}>
                                    <Grid item xs={8} className={classes.tableTitle}>
                                        <Typography>
                                            <IconButton variant="contained" component="label" onClick={this.back}>
                                                <ArrowBackIos />
                                            </IconButton>
                                            <FormattedMessage module="ticket" id={titleone} values={titleParams} />
                                        </Typography>
                                    </Grid>
                                    {/* <Grid item xs={4} className={classes.tableTitle}>
                                        <PublishedComponent
                                            pubRef="insuree.InsureePicker"
                                            value={edited.insuree}
                                            label="Complainant"
                                            onChange={(v) => this.updateAttribute("insuree", v)}
                                            required={false} 
                                        />
                                    </Grid> */}
                                </Grid>
                                <Divider />
                                <Grid container className={classes.item}>
                                    <Grid item xs={6} className={classes.item}>
                                        <TextInput
                                            module="ticket" label="ticket.name"
                                            // value={!!edited && !!edited.insuree ? edited.insuree.otherNames : ""}
                                            value={edited.ticket.name}
                                            onChange={v => this.updateAttribute("name", v)}
                                            required={false} />
                                    </Grid>
                                    <Grid item xs={6} className={classes.item}>
                                        <TextInput
                                            module="ticket" label="ticket.phone"
                                            value={!!edited && !!edited.insuree ? edited.insuree.phone : ""}
                                            //value={edited.phone}
                                            onChange={v => this.updateAttribute("phone", v)}
                                            required={false} />
                                    </Grid>
                                    <Grid item xs={6} className={classes.item}>
                                        <TextInput
                                            module="ticket" label="ticket.email"
                                            value={!!edited && !!edited.insuree ? edited.insuree.email : ""}
                                            onChange={v => this.updateAttribute("email", v)}
                                            required={false} />
                                    </Grid>
                                    <Grid item xs={6} className={classes.item}>
                                        <TextInput
                                            module="ticket" label="ticket.currentVillage"
                                            value={!!edited && !!edited.insuree && !!edited.insuree.currentVillage ? edited.insuree.currentVillage.name : ""}
                                            onChange={v => this.updateAttribute("insureeLocation", v)}
                                            required={false} />
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
                                            <FormattedMessage module="ticket" id={titletwo} values={titleParams} />
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Divider />
                                <Grid container className={classes.item}>
                                    <Grid item xs={4} className={classes.item}>
                                        <PublishedComponent
                                            pubRef="core.DatePicker"
                                            label="ticket.eventDate"
                                            value={!edited ? null : edited.dateOfIncident}
                                            // value={edited.dateOfIncident}
                                            required={false}
                                            onChange={v => this.updateAttribute("dateOfIncident", v)} />
                                    </Grid>
                                    <Grid item xs={6} className={classes.item}>
                                        <PublishedComponent
                                            pubRef="location.DetailedLocation"
                                            withNull={true}
                                            // readOnly={readOnly}
                                            required
                                            value={!edited ? null : edited.location}
                                            onChange={(v) => this.updateAttribute("location", v)}
                                            filterLabels={false}
                                        />
                                    </Grid>
                                    <Grid item xs={4} className={classes.item}>
                                        <TextInput
                                            module="ticket" label="ticket.witness"
                                            value={!edited ? null : edited.witness}
                                            onChange={v => this.updateAttribute("witness", v)}
                                            required={false} />
                                    </Grid>
                                    <Grid item xs={6} className={classes.item}>
                                        <PublishedComponent
                                            pubRef="payroll.DropDownCategoryPicker"
                                            value={!edited ? null : edited.witness}
                                            onChange={(v) => this.updateAttribute("category", v)}
                                            required={false} />
                                    </Grid>
                                    <Grid item xs={6} className={classes.item}>
                                        <PublishedComponent
                                            pubRef="ticket.TicketPriorityPicker"
                                            value={!edited ? null : edited.witness}
                                            onChange={(v) => this.updateAttribute("ticketPriority", v)}
                                            required={false} />
                                    </Grid>
                                    <Grid item xs={12} className={classes.item}>
                                        <textarea rows="10" cols="115"
                                            module="grievance" label="Grievance.descriptionOfEvents"
                                            // value={edited.description}
                                            required={false}
                                            onChange={v => this.updateAttribute("ticketDescription", v)} />
                                    </Grid>
                                </Grid>
                                <IconButton variant="contained" component="label" color="primary" onClick={this.save}>
                                    <Save />
                                </IconButton>
                            </Paper>
                        </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs = {12}>
                        <Paper className = {classes.paper}>
                        <Grid container className={classes.tableTitle}>
                            <Grid item xs= {12} className = {classes.tableTitle}>
                                <Typography>
                                    <FormattedMessage module ="ticket" id= {titlethree} values = {titleParams}/>
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider/>
                        <Grid container className={classes.item}>
                            <Grid item xs={12} className={classes.item}>
                                <textarea rows="10" cols="115"
                                    module="ticket" 
                                    // value={edited.description}
                                    required={false}
                                    onChange={v => this.updateAttribute("resolution", v)}
                                />
                            </Grid>
                        </Grid>
                        <IconButton variant="contained" component="label" color="primary" onClick={this.save}>
						    <Save />
                        </IconButton>
                        </Paper>
                    </Grid>
                </Grid>
                <br/>
            </div>
    );
  }
}

export default withModulesManager(withTheme(withStyles(styles)(TicketMasterPanel)));
