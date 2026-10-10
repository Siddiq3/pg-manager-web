// Compare display prices and limits with the actual server catalog.
const assert = require('node:assert/strict');
(async () => {
  const { PLANS } = await import('../src/data/plans.js');
  const { plans } = require('../../pg-manager-backend/src/config/subscriptionPlans.js');
  for (const actual of plans) {
    const display = PLANS.find(plan => plan.id === actual.id);
    assert.ok(display);
    for (const field of ['name', 'properties', 'beds', 'coOwners', 'support']) assert.equal(display[field], actual[field]);
    assert.equal(display.price, actual.amount);
  }
  assert.equal(PLANS.length, plans.length);
  console.log('All three website plans match the backend prices and limits.');
})();
