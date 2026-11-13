/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React, { useState } from 'react';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { renderWithProviders, screen, userEvent } from '@openimis/fe-core/testing';
import CategoryPicker from './CategoryPicker';

// The fe-core barrel cannot be loaded from a test, so stub the exports this picker
// reaches. The categories come from the grievance configuration query.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  const h = ReactActual.createElement;
  const categories = [
    { name: 'category_a', full_name: 'Category A' },
    { name: 'category_b', full_name: 'Category B' },
  ];

  return {
    GetIconComponent: (name) => function Icon() {
      return h('span', { 'data-icon': name });
    },
    useGraphqlQuery: () => ({
      isLoading: false,
      error: null,
      data: { grievanceConfig: { grievanceCategoriesJson: JSON.stringify(categories) } },
    }),
    useTranslations: () => ({ formatMessage: (id) => id }),
  };
});

// In development builds MUI's FormControl re-publishes its context on every render, so
// each MUI field re-rendered by a keystroke schedules low-priority work of its own; the
// production build does not. A plain labelled input keeps that out of the count, so the
// burst below only measures the picker.
vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal();
  const ReactActual = (await import('react')).default;
  const h = ReactActual.createElement;
  return {
    ...actual,
    // eslint-disable-next-line object-curly-newline
    TextField: ReactActual.forwardRef(({ label, value, InputProps, fullWidth, error, required, placeholder, ...trigger }, ref) => h(
      'label',
      { ref, ...trigger },
      label,
      h('input', { value: value ?? '', readOnly: InputProps?.readOnly, onChange: () => {} }),
    )),
  };
});

const titleInput = () => document.querySelector('input[name="title"]');

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

// A ticket form: the picker re-renders with the whole form on every keystroke typed in
// another field.
function TicketForm() {
  const [ticket, setTicket] = useState({});
  return (
    <>
      <input name="title" value={ticket.title ?? ''} onChange={(e) => setTicket({ ...ticket, title: e.target.value })} />
      <CategoryPicker
        label="Category"
        value={ticket.category ?? null}
        onChange={(category) => setTicket({ ...ticket, category })}
      />
    </>
  );
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('CategoryPicker', () => {
  it('selects a category from the list', async () => {
    renderWithProviders(<TicketForm />);

    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.click(await screen.findByText('Category B'));

    expect(screen.getByLabelText('Category')).toHaveValue('Category B');
  });

  // React 19 counts each commit made while low-priority work waits as a nested update and
  // throws "Maximum update depth exceeded" past 50: re-rendering the picker with the same
  // value must not schedule work of its own, or every keystroke in the form costs one.
  it('takes a burst of keystrokes typed in another field once a category is chosen', async () => {
    renderWithProviders(<TicketForm />);
    await userEvent.click(screen.getByLabelText('Category'));
    await userEvent.click(await screen.findByText('Category B'));
    const text = 'This grievance is reported by an attending staff member.';

    const errors = typeInOneTask(titleInput, text);

    expect(errors).toEqual([]);
    expect(titleInput().value).toBe(text);
  });
});
