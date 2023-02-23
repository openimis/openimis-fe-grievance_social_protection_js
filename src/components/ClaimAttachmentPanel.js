import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import { formatMessageWithValues, withModulesManager, withHistory, Table, ProgressOrError } from "@openimis/fe-core";
import { fetchClaimAttachments, downloadAttachment } from "../actions";
import { Paper, Link } from "@material-ui/core";


const styles = theme => ({
    paper: theme.paper.paper,
    tableTitle: theme.table.title,
    item: theme.table.item,
    fullHeight: {
        height: "100%"
    },
});


class ClaimAttachmentPanel extends Component {

    state = {
        edited: null,
        claimUuid: "9218B44B-3ACD-46C1-A772-B8442F978DD9"
    }

    componentDidMount() {
        this.props.fetchClaimAttachments(this.state.claimUuid);        
    }

    download = (a) => {
        this.props.downloadAttachment(a);
    };

    formatFileName(a, i) {
        if (!!a.id)
          return (
            <Link onClick={(e) => this.download(a)} reset={this.state.reset}>
              {a.filename || ""}
            </Link>
          );
        if (!!a.filename) return <i>{a.filename}</i>;
        return (
          <IconButton variant="contained" component="label">
            <FileIcon />
            <input type="file" style={{ display: "none" }} onChange={(f) => this.fileSelected(f, i)} />
          </IconButton>
        );
    }
    
    render() {
        const { intl, classes, fetchingClaimAttachments, errorClaimAttachments, claimAttachments, claimAttachmentsPageInfo } = this.props;

        let headers = [
            "claimAttachments.type",
            "claimAttachments.title",
            "claimAttachments.filename",

        ]

        let itemFormatters = [
            e => e.type,
            e => e.title,
            // e => e.filename,
            (a, i) => this.formatFileName(a, i),

        ]

        return (
            <div className={classes.page} >
                < ProgressOrError progress={fetchingClaimAttachments} error={errorClaimAttachments} />
                <Paper className={classes.paper}>
                <Table
                    module="claim"
                    fetch={this.props.fetchClaimAttachments}
                    header={formatMessageWithValues(intl, "claim", "claim.table", { count: claimAttachmentsPageInfo.totalCount })}
                    headers={headers}
                    itemFormatters={itemFormatters}
                    items={claimAttachments}
                    page={this.state.page}
                    count={claimAttachmentsPageInfo.totalCount}
                />
                </Paper>

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
    
    return bindActionCreators({ fetchClaimAttachments, downloadAttachment }, dispatch);
};


export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(ClaimAttachmentPanel))
    ))));