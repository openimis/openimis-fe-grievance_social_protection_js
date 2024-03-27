import React, { useEffect, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import {
  Dialog, Button, DialogActions, DialogContent,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  formatMessage,
  formatMessageWithValues,
  Contributions,
  Error,
  ProgressOrError,
  withModulesManager,
  withHistory,
} from '@openimis/fe-core';
import { fetchInsuree } from '../actions';
import InsureeSummary from './InsureeSummary';

const useStyles = makeStyles(() => ({
  summary: {
    marginBottom: 32,
  },
}));

function EnquiryDialog(props) {
  const {
    intl, modulesManager, fetchInsuree, fetching, fetched, insuree, error, onClose, open, chfid,
  } = props;
  const classes = useStyles();

  useEffect(() => {
    if (open && insuree?.id !== chfid) {
      fetchInsuree(modulesManager, chfid);
    }
  }, [open, chfid]);

  return (
    <Dialog maxWidth="xl" fullWidth open={open} onClose={onClose}>
      <DialogContent>
        <ProgressOrError progress={fetching} error={error} />
        {!!fetched && !insuree && (
          <Error
            error={{
              code: formatMessage(intl, 'insuree', 'notFound'),
              detail: formatMessageWithValues(intl, 'insuree', 'chfidNotFound', { chfid }),
            }}
          />
        )}
        {!fetching && insuree && (
          <>
            <InsureeSummary modulesManager={modulesManager} insuree={insuree} className={classes.summary} />
            <Contributions contributionKey="insuree.EnquiryDialog" insuree={insuree} />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {formatMessage(intl, 'insuree', 'close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  fetching: state.insuree.fetchingInsuree,
  fetched: state.insuree.fetchedInsuree,
  insuree: state.insuree.insuree,
  error: state.insuree.errorInsuree,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchInsuree }, dispatch);
export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(injectIntl(EnquiryDialog))));
