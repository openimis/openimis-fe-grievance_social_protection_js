import { test } from 'node:test';
import assert from 'node:assert/strict';
// eslint-disable-next-line import/extensions
import { formatCommenterName } from '../src/utils/commenter.js';

const encode = (value) => JSON.stringify(JSON.stringify(value));

test('user commenter from the double-encoded GraphQL value', () => {
  assert.equal(formatCommenterName('user', encode({ username: 'uat_ot' })), 'User: uat_ot');
});

test('individual commenter from the double-encoded GraphQL value', () => {
  assert.equal(
    formatCommenterName('individual', encode({ firstName: 'Jean', lastName: 'Ndayishimiye' })),
    'Individual: Jean Ndayishimiye',
  );
});

test('commenter already parsed into an object', () => {
  assert.equal(formatCommenterName('user', { username: 'uat_ot' }), 'User: uat_ot');
  assert.equal(
    formatCommenterName('individual', { firstName: 'Jean', lastName: 'Ndayishimiye' }),
    'Individual: Jean Ndayishimiye',
  );
});

test('user commenter that resolves to null', () => {
  assert.equal(formatCommenterName('user', null), 'User');
  assert.equal(formatCommenterName('user', undefined), 'User');
  assert.equal(formatCommenterName('user', 'null'), 'User');
});

test('individual commenter that resolves to null', () => {
  assert.equal(formatCommenterName('individual', null), 'Individual');
  assert.equal(formatCommenterName('individual', undefined), 'Individual');
});

test('commenter object without a name', () => {
  assert.equal(formatCommenterName('user', encode({})), 'User');
  assert.equal(formatCommenterName('individual', encode({})), 'Individual');
});

test('no commenter type', () => {
  assert.equal(formatCommenterName(null, null), 'Anonymous User');
});

test('other commenter types keep their type name', () => {
  assert.equal(formatCommenterName('beneficiary', null), 'beneficiary');
});
