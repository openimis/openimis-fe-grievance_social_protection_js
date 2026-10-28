/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
import React, {
  forwardRef,
} from 'react';

import { Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  useTranslations, useModulesManager,
} from '@openimis/fe-core';
import { MODULE_NAME, EMPTY_STRING } from '../constants';

const StyledTicketPrintTemplate = styled('div')(() => ({
  '& .topHeader': {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    width: '100%',

    '& img': {
      minWidth: '250px',
      maxWidth: '300px',
      width: 'auto',
      height: 'auto',
    },
  },
  '& .printContainer': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontWeight: '500',
  },
  '& .date': {
    fontSize: '16px',
  },
  '& .detailsContainer': {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    width: '100%',
  },
  '& .detailRow': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px',
  },
  '& .detailName': {
    fontWeight: '600',
    fontSize: '16px',
    textTransform: 'uppercase',
  },
  '& .detailValue': {
    fontWeight: '500',
    backgroundColor: '#f5f5f5',
    padding: '6px',
    borderRadius: '8px',
    fontSize: '15px',
  },
  '& .containerPadding': {
    padding: '32px',
  },
  '& .dividerMargin': {
    margin: '12px 0',
  },
}));

const TicketPrintTemplate = forwardRef(({ ticket, reporter }, ref) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(modulesManager, MODULE_NAME);

  const reporterValue = () => {
    switch (ticket.reporterTypeName) {
      case 'individual':
        if (reporter?.individual) {
          return `${reporter.individual.firstName} ${reporter.individual.lastName} ${reporter.individual.dob}`;
        }
        return reporter ? `${reporter.firstName} ${reporter.lastName} ${reporter.dob}` : EMPTY_STRING;
      case 'beneficiary':
        return reporter?.jsonExt?.national_id ?? EMPTY_STRING;
      case 'user':
        // The user reporter is a serialised core.User: it has a username, no names.
        return reporter?.username ?? EMPTY_STRING;
      case null:
        return formatMessage('ticket.anonymousUser');
      default:
        return EMPTY_STRING;
    }
  };

  return (
    <StyledTicketPrintTemplate>
      <div ref={ref} className="containerPadding">
        <div className="topHeader" />
        <Divider className="dividerMargin" />
        <div className="detailsContainer">
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.title')}</p>
            <p className="detailValue">{ticket.title}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.ticketCode')}</p>
            <p className="detailValue">{ticket.code}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.status')}</p>
            <p className="detailValue">{ticket.status}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.dateOfIncident')}</p>
            <p className="detailValue">{ticket.dateOfIncident}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.channel')}</p>
            <p className="detailValue">{ticket.channel}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.category')}</p>
            <p className="detailValue">{ticket.category}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.flags')}</p>
            <p className="detailValue">{ticket.flags}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.priority')}</p>
            <p className="detailValue">{ticket.priority}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.description')}</p>
            <p className="detailValue">{ticket.description}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.reporter')}</p>
            <p className="detailValue">{reporterValue()}</p>
          </div>
          <div className="detailRow">
            <p className="detailName">{formatMessage('ticket.template.attendingStaff')}</p>
            <p className="detailValue">{ticket?.attendingStaff?.username}</p>
          </div>
        </div>
      </div>
    </StyledTicketPrintTemplate>
  );
});

export default TicketPrintTemplate;
