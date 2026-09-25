import { test } from 'node:test';
import assert from 'node:assert/strict';
// eslint-disable-next-line import/extensions
import { buildCategoryOptions, isSelectableOption } from '../src/utils/categoryOptions.js';

// Shape of grievanceConfig.grievanceCategoriesJson: a restricted category the user may view
// but not create in, a parent that is not creatable with one creatable child, and an open category.
const hierarchy = [
  {
    name: 'violence_vbg',
    full_name: 'violence_vbg',
    can_create: false,
    children: [
      {
        name: 'viol', full_name: 'violence_vbg > viol', can_create: false, children: [],
      },
      {
        name: 'autre', full_name: 'violence_vbg > autre', can_create: false, children: [],
      },
    ],
  },
  {
    name: 'mixed',
    full_name: 'mixed',
    can_create: false,
    children: [{
      name: 'open_child', full_name: 'mixed > open_child', can_create: true, children: [],
    }],
  },
  {
    name: 'paiement', full_name: 'paiement', can_create: true, children: [],
  },
];

const values = (options) => options.flatMap((o) => [o.value, ...values(o.children ?? [])]);

test('without creatableOnly every viewable category is offered and selectable', () => {
  const options = buildCategoryOptions(hierarchy);
  assert.deepEqual(values(options), [
    'violence_vbg', 'violence_vbg > viol', 'violence_vbg > autre', 'mixed', 'mixed > open_child', 'paiement',
  ]);
  assert.ok(options.every((o) => o.selectable));
});

test('creatableOnly drops a category whose subtree has no creatable node', () => {
  const options = buildCategoryOptions(hierarchy, { creatableOnly: true });
  assert.deepEqual(values(options), ['mixed', 'mixed > open_child', 'paiement']);
});

test('creatableOnly keeps a non-creatable parent of a creatable child, unselectable', () => {
  const [mixed] = buildCategoryOptions(hierarchy, { creatableOnly: true });
  assert.equal(mixed.value, 'mixed');
  assert.equal(mixed.selectable, false);
  assert.equal(isSelectableOption(mixed), false);
  assert.equal(mixed.children[0].selectable, true);
  assert.equal(isSelectableOption(mixed.children[0]), true);
});

test('a node without can_create stays selectable (server without the flag)', () => {
  const legacy = { name: 'legacy', full_name: 'legacy', children: [] };
  const options = buildCategoryOptions([legacy], { creatableOnly: true });
  assert.deepEqual(values(options), ['legacy']);
  assert.equal(options[0].selectable, true);
});

test('labels come from translateName; clearing the picker stays allowed', () => {
  const [option] = buildCategoryOptions([hierarchy[2]], { translateName: (n) => `T:${n}` });
  assert.equal(option.label, 'T:paiement');
  assert.equal(isSelectableOption(null), true);
});
