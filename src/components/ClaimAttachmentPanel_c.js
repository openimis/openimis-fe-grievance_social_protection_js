import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import { FormattedMessage, withModulesManager, withHistory } from "@openimis/fe-core";
import { ProgressOrError, Table } from "@openimis/fe-core";
import { fetchClaimAttachments } from "../actions";

const styles = theme => ({
    page: theme.page,
    fab: theme.fab

});


class ClaimAttachmentPanel_c extends Component {

    state = {
        edited: null,
        claimUuid: "9218B44B-3ACD-46C1-A772-B8442F978DD9"
    }
    componentDidMount() {
        this.props.fetchClaimAttachments(this.state.claimUuid);        
    }
    
    render() {
        const { classes, fetchingClaimAttachments, errorClaimAttachments, claimAttachments } = this.props;

        return (
            <div className={classes.page} >
                < ProgressOrError progress={fetchingClaimAttachments} error={errorClaimAttachments} />
                <FormattedMessage module="claim" id="ClaimAttachments.Header" />
                <table>
                    {!!claimAttachments && claimAttachments.map(e => (
                        <tr><td>{e.type}</td><td>{e.title}</td><td>{e.filename}</td></tr>
                    ))}
                </table>
            </div>
        )
    }
}


const mapStateToProps = state => ({
    fetchingClaimAttachments: state.grievance.fetchingClaimAttachments,
    errorClaimAttachments: state.grievance.errorClaimAttachments,
    fetchedClaimAttachments: state.grievance.fetchedClaimAttachments,
    claimAttachments: state.grievance.claimAttachments,
    claimAttachmentsPageInfo: state.grievance.claimAttachmentsPageInfo,
});

const mapDispatchToProps = dispatch => {    
    return bindActionCreators({ fetchClaimAttachments }, dispatch);
};


export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(ClaimAttachmentPanel_c))
    ))));