// Mirrors pg-manager-backend/src/config/subscriptionPlans.js and the mobile catalog.
// Prices and limits here are display-only; checkout and enforcement stay on the API.
export const PLANS = Object.freeze([
  { id: 'STARTER', name: 'Starter', price: 299, properties: 1, beds: 150, coOwners: 0, staff: 1, support: 'Standard' },
  { id: 'PRO', name: 'Pro', price: 699, properties: 3, beds: 450, coOwners: 2, staff: 2, support: 'Standard', featured: true },
  { id: 'GROWTH', name: 'Growth', price: 999, properties: 10, beds: 1000, coOwners: 4, staff: 5, support: 'Priority' },
]);
export function planFeatures(plan) {
  return [
    { label: 'Properties', value: `Up to ${plan.properties}`, included: true },
    { label: 'Beds', value: `Up to ${plan.beds.toLocaleString('en-IN')}`, included: true },
    { label: 'Rooms & occupancy', value: 'Included', included: true },
    { label: 'Tenant management', value: 'Included', included: true },
    { label: 'Rent & payment records', value: 'Included', included: true },
    { label: 'Deposit records', value: 'Included', included: true },
    { label: 'Co-owner logins', value: plan.coOwners ? `Up to ${plan.coOwners}` : 'Not included', included: plan.coOwners > 0 },
    { label: 'Staff logins', value: plan.staff === 1 ? '1' : `Up to ${plan.staff}`, included: true },
    { label: 'Support', value: plan.support, included: true },
    { label: 'Priority support', value: plan.support === 'Priority' ? 'Included' : 'Not included', included: plan.support === 'Priority' },
  ];
}

// Rows every plan shares are summarised once in a note instead of repeated per card.
const SHARED_ROWS = ['Rooms & occupancy', 'Tenant management', 'Rent & payment records', 'Deposit records', 'Priority support'];
export const planHighlights = (plan) => planFeatures(plan).filter(({ label }) => !SHARED_ROWS.includes(label));
export const PLAN_NOTE = 'Every plan includes rooms, tenants, rent and deposit records. Co-owners are in addition to the primary owner.';
