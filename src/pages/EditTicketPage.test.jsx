/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React, { useEffect, useState } from 'react';
import {
  describe, expect, it, vi,
} from 'vitest';
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
    injectIntl: (await import("@openimis/fe-core/testing")).injectIntl,
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
    // A plain input that reports its value from the event.
    TextInput: ({ label, value, onChange }) => h('input', {
      'aria-label': label,
      value: value ?? '',
      onChange: (e) => onChange(e.target.value),
    }),
    useModulesManager: () => mockModulesManager(),
    useTranslations: () => ({ formatMessage: translate }),
  };
});

vi.mock('../actions', () => ({
  updateTicket: () => ({ type: 'TEST_UPDATE_TICKET' }),
  fetchTicket: () => ({ type: 'TEST_FETCH_TICKET' }),
  createTicketComment: () => ({ type: 'TEST_CREATE_COMMENT' }),
}));

const makeTicketStore = (ticket) => makeStore({
  reducers: {
    grievanceSocialProtection: (state = { ticket, ticketComments: [], grievanceConfig: {} }) => state,
  },
});

const renderPage = (ticket) => renderWithProviders(
  <EditTicketPage edited_id={ticket.id} />,
  { store: makeTicketStore(ticket) },
);

const titleInput = () => document.querySelector('input[aria-label="ticket.title"]');

// Sends every keystroke of `text` in one task, as a barcode scanner (or Cypress typing
// with no delay) does, and returns the errors React threw meanwhile.
const typeInOneTask = (input, text) => {
  const errors = [];
  const onError = (event) => {
    errors.push(event.error?.message ?? event.message);
    event.preventDefault();
  };
  window.addEventListener('error', onError);
  const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const actEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    for (let i = 1; i <= text.length; i += 1) {
      setNativeValue.call(input(), text.slice(0, i));
      input().dispatchEvent(new Event('input', { bubbles: true }));
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    window.removeEventListener('error', onError);
  }
  return errors;
};

// The ticket page keeps the edited ticket and schedules low-priority work from its effects.
function Page({ ticket }) {
  const [edited, setEdited] = useState(ticket);
  const [length, setLength] = useState(0);
  useEffect(() => setLength(edited.title?.length ?? 0), [edited]);
  return (
    <>
      <EditTicketPage edited_id={ticket.id} onEditedChanged={setEdited} />
      <span>{length}</span>
    </>
  );
}

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

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a change must cost a single commit.
  it('takes a burst of keystrokes typed in one task', () => {
    const ticket = { id: 'T1', title: '', reporterTypeName: 'user' };
    renderWithProviders(<Page ticket={ticket} />, { store: makeTicketStore(ticket) });
    const text = 'Payment not received for March 2026';

    const errors = typeInOneTask(titleInput, text);

    expect(errors).toEqual([]);
    expect(titleInput().value).toBe(text);
  });
});
