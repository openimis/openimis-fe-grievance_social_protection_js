/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { makeStore, renderWithProviders } from '@openimis/fe-core/testing';
import { createTicket } from '../actions';
import { RIGHT_TICKET_ADD, RIGHT_TICKET_EDIT } from '../constants';
import TicketPage from './TicketPage';

// The props the page last gave its TicketForm, to call its save from a test.
const form = vi.hoisted(() => ({ props: null }));

// The fe-core barrel cannot be loaded from a test: stub only the exports this page reaches.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  const { mockModulesManager } = await import('@openimis/fe-core/testing');
  return {
    formatMessageWithValues: (intl, module, id, values) => `${id} ${JSON.stringify(values ?? {})}`,
    historyPush: () => {},
    withHistory: (Component) => Component,
    withModulesManager: (Component) => function WithModulesManager(props) {
      return ReactActual.createElement(Component, { ...props, modulesManager: mockModulesManager() });
    },
  };
});
vi.mock('../components/TicketForm', () => ({
  default: (props) => {
    form.props = props;
    return null;
  },
}));
vi.mock('../actions', () => ({
  createTicket: vi.fn(() => ({ type: 'TEST_CREATE_TICKET' })),
  updateTicket: vi.fn(() => ({ type: 'TEST_UPDATE_TICKET' })),
}));

function renderPage() {
  const store = makeStore({
    reducers: { grievanceSocialProtection: (state = {}) => state },
    preloadedState: {
      core: { user: { i_user: { rights: [RIGHT_TICKET_ADD, RIGHT_TICKET_EDIT] } } },
      grievanceSocialProtection: {},
    },
  });
  renderWithProviders(<TicketPage match={{ params: {} }} />, { store });
}

describe('TicketPage', () => {
  // OP-3278: a new ticket has no code yet (the server generates it), so a label built from
  // the code named nothing ("Create Ticket "). The journal entry must name the ticket.
  it('names the ticket being created in the mutation label', () => {
    renderPage();

    form.props.save({ title: 'UAT Grievance X' });

    expect(createTicket).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'UAT Grievance X' }),
      expect.anything(),
      expect.stringContaining('UAT Grievance X'),
    );
  });
});
