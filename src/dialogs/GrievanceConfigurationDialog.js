import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  coreAlert,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { fetchGrievanceConfiguration } from '../actions';
import { MODULE_NAME } from '../constants';

function GrievanceConfigurationDialog() {
  console.log('ccccccc');
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const dispatch = useDispatch();
  const grievanceConfiguration = useSelector((state) => state.grievance.grievanceConfig);
  dispatch(fetchGrievanceConfiguration());
  useEffect(() => {
    coreAlert(
      formatMessage('grievanceSocialProtection.dialogs.GrievanceConfigurationDialog.dialogHeader'),
      formatMessage('grievanceSocialProtection.dialogs.GrievanceConfigurationDialog.dialogBody'),
    );
  }, [grievanceConfiguration]);
  return null;
}

export default GrievanceConfigurationDialog;
