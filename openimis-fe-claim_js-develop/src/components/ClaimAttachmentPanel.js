import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { bindActionCreators } from "redux";
import { formatMessageWithValues, withModulesManager, withHistory, Table, ProgressOrError } from "@openimis/fe-core";
import { fetchClaimAttachment, downloadAttachment } from "../actions";
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
        page: 0,
        pageSize: 5,
        afterCursor: null,
        beforeCursor: null,
    }

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-claim", "claimFilter.rowsPerPageOptions", [10, 20, 50, 100]);
        this.defaultPageSize = props.modulesManager.getConf("fe-claim", "claimFilter.defaultPageSize", 10);
    }
    
    query = () =>{
        console.log(this.props)
        this.props.fetchClaimAttachment(this.props.edited_id);
    }

    onChangeRowsPerPage = (cnt) =>{
        this.setState(
            {pageSize: cnt,
            page: 0,
            afterCursor: null,
            beforeCursor: null,
            },
            e => this.query()
        )
    }

    componentDidMount() {
        this.setState({ orderBy: null }, e => this.onChangeRowsPerPage(this.defaultPageSize))
    }

    claimChanged = (prevProps) => (!prevProps.claim && !!this.props.claim) ||
        (
            !!prevProps.claim &&
            !!this.props.claim &&
            (prevProps.claim.uuid == null || prevProps.claim.uuid !== this.props.claim.uuid)
        )

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.claimChanged(prevProps)) {
            this.query();
            this.setState({ reload: false })
        }
    }

    queryPrms = () => {
        let prms = [];
        if (!!this.state.orderBy) {
            prms.push(`orderBy: "${this.state.orderBy}"`)
        }
        if (!!this.props.claim && !!this.props.claim.uuid) {
            prms.push(`uuid:"${this.props.claim.uuid}"`);
            return prms;
        }
        return null;
    }

    onChangePage = (page, nbr) => {
       
        if (nbr > this.state.page) {
            this.setState((state, props) => ({
                page: this.state.page + 1,
                beforeCursor: null,
                afterCursor: this.props.programsPageInfo.endCursor,
            }),
                e => this.query(uuid)
            )

        } else if (nbr < this.state.page) {
            this.setState((state, props) => ({
                page: this.state.page - 1,
                beforeCursor: this.props.programsPageInfo.startCursor,
                afterCursor: null,
            }),
                e => this.query(uuid)
            )

        }
    }

    download = (a) => {
        this.props.downloadAttachment(a);
    };
    
    fileSelected = (f, i) => {
        if (!!f.target.files) {
          const file = f.target.files[0];
          let claimAttachments = [...this.state.claimAttachments];
          claimAttachments[i].filename = file.name;
          claimAttachments[i].mime = file.type;
        }
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
        const { intl, classes, edited_id, fetchingClaimAttachments, errorClaimAttachments, claimAttachments, rights } = this.props;

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

                <Paper className={classes.paper}><Table
                    module="programs"
                    fetch={this.props.fetchClaimAttachment}
                    header={formatMessageWithValues(intl, "claim", "claim.table")}
                    headers={headers}
                    itemFormatters={itemFormatters}
                    items={claimAttachments}
                    withPagination={true}
                    page={this.state.page}
                    pageSize={this.state.pageSize}
                    onChangePage={this.onChangePage}
                    onChangeRowsPerPage={this.onChangeRowsPerPage}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    rights={this.rights}
                /></Paper>

            </div>
        )
    }
}


const mapStateToProps = state => ({
    fetchingClaimAttachments: state.claim.fetchingClaimAttachments,
    errorClaimAttachments: state.claim.errorClaimAttachments,
    fetchedClaimAttachments: state.claim.fetchedClaimAttachments,
    claimAttachments: state.claim.claimAttachments,
});

const mapDispatchToProps = dispatch => {
    
    return bindActionCreators({ fetchClaimAttachment, downloadAttachment, }, dispatch);
};


export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(ClaimAttachmentPanel))
    ))));