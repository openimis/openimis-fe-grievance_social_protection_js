/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React, { useEffect, useState } from 'react';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { renderWithProviders, makeStore } from '@openimis/fe-core/testing';
import AddTicketPage from './AddTicketPage';

// The fe-core barrel cannot be loaded from a test, so stub the exports this page
// reaches. TextInput is a plain input that reports its value from the event.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  const h = ReactActual.createElement;

  return {
    ConstantBasedPicker: () => null,
    formatMessage: (intl, module, id) => id,
    FormattedMessage: ({ id }) => id,
    GetIconComponent: (name) => function Icon() {
      return h('span', { 'data-icon': name });
    },
    journalize: () => ({ type: 'TEST_JOURNALIZE' }),
    PublishedComponent: () => null,
    TextInput: ({ label, value, onChange }) => h('input', {
      'aria-label': label,
      value: value ?? '',
      onChange: (e) => onChange(e.target.value),
    }),
  };
});

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
function Page({ onEdited }) {
  const [edited, setEdited] = useState({});
  const [length, setLength] = useState(0);
  useEffect(() => {
    setLength(edited.title?.length ?? 0);
    onEdited(edited);
  }, [edited]);
  return (
    <>
      <AddTicketPage onEditedChanged={setEdited} />
      <span>{length}</span>
    </>
  );
}

const renderPage = (onEdited = () => {}) => {
  const store = makeStore({
    reducers: {
      grievanceSocialProtection: (state = { grievanceConfig: {} }) => state,
    },
  });
  return renderWithProviders(<Page onEdited={onEdited} />, { store });
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('AddTicketPage', () => {
  it('passes the edited ticket to the page', () => {
    const onEdited = vi.fn();
    renderPage(onEdited);

    typeInOneTask(titleInput, 'Late');

    expect(titleInput().value).toBe('Late');
    expect(onEdited).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Late' }));
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: a change must cost a single commit.
  it('takes a burst of keystrokes typed in one task', () => {
    renderPage();
    const text = 'Payment not received for March 2026';

    const errors = typeInOneTask(titleInput, text);

    expect(errors).toEqual([]);
    expect(titleInput().value).toBe(text);
  });
});
