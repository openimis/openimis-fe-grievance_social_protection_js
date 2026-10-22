/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders, makeStore, screen, within,
} from '@openimis/fe-core/testing';
import TicketCommentsPanel from './TicketCommentsPanel';

// The fe-core barrel cannot be loaded from a test, so stub the exports this panel
// and its dialog reach. Table keeps the real title-bar contract
// (fe-core Table.jsx, `.tableTitle`): the header, then whatever extendHeader returns.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  const { mockModulesManager } = await import('@openimis/fe-core/testing');
  const h = ReactActual.createElement;

  return {
    formatDateTimeFromISO: (mm, intl, iso) => iso,
    formatMessage: (intl, module, id) => id,
    GetIconComponent: (name) => function Icon() {
      return h('span', { 'data-icon': name });
    },
    ProgressOrError: () => null,
    PublishedComponent: () => null,
    ConstantBasedPicker: () => null,
    TextInput: () => null,
    Table: ({ header, extendHeader }) => h(
      'div',
      null,
      header && h('div', { className: 'tableTitle' }, h('h6', null, header), extendHeader && extendHeader()),
      h('table', null),
    ),
    useModulesManager: () => mockModulesManager(),
    useTranslations: () => ({ formatMessage: (id) => id }),
    withHistory: (Component) => Component,
    withModulesManager: (Component) => function WithModulesManager(props) {
      return h(Component, { ...props, modulesManager: mockModulesManager() });
    },
  };
});

vi.mock('../actions', () => ({
  fetchComments: () => ({ type: 'TEST_FETCH_COMMENTS' }),
  createTicketComment: () => ({ type: 'TEST_CREATE_COMMENT' }),
  resolveGrievanceByComment: () => ({ type: 'TEST_RESOLVE' }),
}));

const renderPanel = (ticket) => {
  const store = makeStore({
    reducers: {
      grievanceSocialProtection: (state = { ticket, ticketComments: [], errorTicketComments: null }) => state,
    },
  });
  return renderWithProviders(<TicketCommentsPanel edited={ticket} />, { store });
};

describe('TicketCommentsPanel', () => {
  // OP-3244: the actions sat in a fixed-height banner above the table, so "Add
  // Comment" overflowed under the table title and Print onto the column headers.
  it('puts reload, add comment and print on the table title bar', () => {
    const { container } = renderPanel({ id: 'T1', uuid: 'u-1', status: 'OPEN' });

    const titleBar = container.querySelector('.tableTitle');
    expect(titleBar).not.toBeNull();
    expect(within(titleBar).getByText('TicketCommentsPanel.table.header')).toBeInTheDocument();
    expect(within(titleBar).getByRole('button', { name: /add comment to a grievance/i })).toBeEnabled();
    expect(within(titleBar).getAllByRole('button')).toHaveLength(3);
    // No action of the panel is left outside the title bar.
    const outside = screen.getAllByRole('button').filter((b) => !titleBar.contains(b));
    expect(outside).toEqual([]);
  });
});
