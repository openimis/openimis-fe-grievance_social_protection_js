/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, within } from '@openimis/fe-core/testing';
import en from '../translations/en.json';
import TicketPrintTemplate from './TicketPrintTemplate';

// The fe-core barrel cannot be loaded from a test, so stub what the template uses.
// Messages resolve through the module's en.json, so a missing key shows up as the raw key.
vi.mock('@openimis/fe-core', async () => {
  const { mockModulesManager } = await import('@openimis/fe-core/testing');
  const messages = (await import('../translations/en.json')).default;
  return {
    useModulesManager: () => mockModulesManager(),
    useTranslations: () => ({ formatMessage: (id) => messages[id] ?? id }),
  };
});

const reporterRow = () => screen.getByText(en['ticket.template.reporter']).closest('.detailRow');

const renderTemplate = (ticket, reporter) => renderWithProviders(
  <TicketPrintTemplate ticket={ticket} reporter={reporter} />,
);

describe('TicketPrintTemplate', () => {
  // OCM-1194: a ticket reported by a user (attending staff) printed no Reporter row.
  // The user reporter JSON is a serialised core.User: it has a username, no names.
  it('prints the username of a user reporter', () => {
    renderTemplate({ reporterTypeName: 'user' }, { username: 'Admin' });

    expect(within(reporterRow()).getByText('Admin')).toBeInTheDocument();
  });

  it('prints the name and birth date of an individual reporter', () => {
    renderTemplate(
      { reporterTypeName: 'individual' },
      { firstName: 'Jane', lastName: 'Doe', dob: '1990-01-01' },
    );

    expect(within(reporterRow()).getByText('Jane Doe 1990-01-01')).toBeInTheDocument();
  });

  it('prints the national id of a beneficiary reporter', () => {
    renderTemplate({ reporterTypeName: 'beneficiary' }, { jsonExt: { national_id: 'N-123' } });

    expect(within(reporterRow()).getByText('N-123')).toBeInTheDocument();
  });

  it('prints an anonymous reporter', () => {
    renderTemplate({ reporterTypeName: null }, {});

    expect(within(reporterRow()).getByText(en['ticket.anonymousUser'])).toBeInTheDocument();
  });
});
