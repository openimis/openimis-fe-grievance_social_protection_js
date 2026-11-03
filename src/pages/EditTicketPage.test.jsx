/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, makeStore, screen } from '@openimis/fe-core/testing';
import EditTicketPage from './EditTicketPage';

// The fe-core barrel cannot be loaded from a test, so stub the exports this page and
// its print template reach. Messages resolve through the module's en.json, so a
// missing key shows up as the raw key. PublishedComponent renders the label and
// placeholder it is given, as admin.UserPicker does.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  const { mockModulesManager } = await import('@openimis/fe-core/testing');
  const messages = (await import('../translations/en.json')).default;
  const h = ReactActual.createElement;
  const translate = (id) => messages[id] ?? id;

  return {
    formatMessage: (intl, module, id) => translate(id),
    FormattedMessage: ({ id }) => translate(id),
    GetIconComponent: (name) => function Icon() {
      return h('span', { 'data-icon': name });
    },
    journalize: () => ({ type: 'TEST_JOURNALIZE' }),
    PublishedComponent: ({ pubRef, label, placeholder }) => h(
      'div',
      { 'data-pubref': pubRef },
      h('label', null, label),
      h('span', null, placeholder),
    ),
    TextInput: () => null,
    useModulesManager: () => mockModulesManager(),
    useTranslations: () => ({ formatMessage: translate }),
  };
});

vi.mock('../actions', () => ({
  updateTicket: () => ({ type: 'TEST_UPDATE_TICKET' }),
  fetchTicket: () => ({ type: 'TEST_FETCH_TICKET' }),
  createTicketComment: () => ({ type: 'TEST_CREATE_COMMENT' }),
}));

const renderPage = (ticket) => {
  const store = makeStore({
    reducers: {
      grievanceSocialProtection: (state = { ticket, ticketComments: [], grievanceConfig: {} }) => state,
    },
  });
  return renderWithProviders(<EditTicketPage edited_id={ticket.id} />, { store });
};

describe('EditTicketPage', () => {
  // OCM-1194: the user reporter picker showed the raw key "ticket.searchPerson.label"
  // and a French placeholder.
  it('labels a user reporter with translated text', () => {
    const { container } = renderPage({
      id: 'T1',
      reporterTypeName: 'user',
      // The backend returns reporter as a JSON string of a JSON string.
      reporter: JSON.stringify(JSON.stringify({ id: 1, username: 'Admin' })),
    });

    expect(container.querySelector('[data-pubref="admin.UserPicker"]')).not.toBeNull();
    expect(screen.queryByText(/ticket\.searchPerson\.label/)).toBeNull();
    expect(screen.queryByText(/Commencez/)).toBeNull();
    expect(container.querySelector('[data-pubref="admin.UserPicker"] label'))
      .toHaveTextContent('Attending Staff');
  });
});
