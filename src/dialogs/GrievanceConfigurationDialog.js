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
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const dispatch = useDispatch();
  const grievanceConfiguration = useSelector((state) => state?.grievanceSocialProtection?.grievanceConfig);
  const fetchedGrievanceConfig = useSelector((state) => state?.grievanceSocialProtection?.fetchedGrievanceConfig);

  const isConfigMissing = (config) => Object.values(config).some((field) => !field);

  useEffect(() => {
    if (grievanceConfiguration && isConfigMissing(grievanceConfiguration)) {
      const configString = JSON.stringify(grievanceConfiguration);
      dispatch(coreAlert(
        formatMessage('grievanceSocialProtection.dialogs.GrievanceConfigurationDialog.dialogHeader'),
        formatMessageWithValues(
          'grievanceSocialProtection.dialogs.GrievanceConfigurationDialog.dialogBody',
          { configString },
        ),
      ));
    }
  }, [grievanceConfiguration]);

  useEffect(() => {
    if (!fetchedGrievanceConfig) {
      dispatch(fetchGrievanceConfiguration());
    }
  }, [fetchedGrievanceConfig]);

  return null;
}

export default GrievanceConfigurationDialog;
