// Real Android app captures at Sai Residency PG, using isolated fictional data.
const clip = (key, label, title, body, alt) => ({ key, label, title, body, video: `/media/${key}.mp4`, poster: `/media/${key}.webp`, alt });
const rooms = clip('rooms', 'Rooms & beds', 'Know which beds are free', 'Open a room to see its beds, monthly rent and occupancy. Find a vacant bed when a new tenant calls.', 'Rooms list and room details with occupied and vacant beds');
const tenants = clip('tenants', 'Tenant details', 'Keep tenant details together', 'Find a tenant and open their record. Their room, bed, rent and deposit are all in one place.', 'A fictional tenant record with room, bed, rent and deposit');
const rent = clip('rent', 'Rent payments', 'Record rent as it comes in', 'Check pending rent, choose UPI, cash or bank transfer, and record a payment. The rent entry updates straight away.', 'Recording a fictional rent payment and viewing the updated entry');
const notice = clip('notice', 'Notice & move-out', 'Plan for the next vacancy', 'Save a tenant’s notice and planned move-out dates. Know which bed will become free next.', 'Saving notice and planned move-out dates on a fictional tenant record');
export const heroSteps = [rooms, tenants, rent, notice];
export const demoGroups = [
  { key: 'property', title: 'Your property, rooms and occupancy', body: 'See available beds and keep your property details in order.', color: '#d9d1f2', steps: [rooms,
    clip('occupancy', 'Occupancy reports', 'See every occupied and vacant bed', 'Open the occupancy cards for a full bed report. Search by room, bed or tenant when you need to find someone quickly.', 'Occupied and vacant bed reports for Sai Residency PG'),
    clip('properties', 'Property settings', 'Keep property details up to date', 'Save your property name, address and city. Check who has access; additional co-owner logins are available on Pro and Growth.', 'Sai Residency PG details and ownership settings') ] },
  { key: 'tenants', title: 'Tenants and bed assignments', body: 'Add monthly or daily stays, find tenant details and change beds.', color: '#cfe8e3', steps: [
    clip('add-tenant', 'Add a tenant', 'Start with a vacant bed', 'Choose a bed and enter the tenant’s details. Monthly stays use monthly rent; daily stays use a per-day rate and planned check-out date.', 'Real add-tenant form with monthly and daily stay options'), tenants,
    clip('bed-move', 'Move between beds', 'Find another vacant bed', 'Open the tenant’s bed picker to see available room and bed labels. Use Move here when you need to change their assignment.', 'Inspecting the available-bed picker on a fictional tenant record') ] },
  { key: 'payments', title: 'Rent, deposits and move-outs', body: 'Keep payment records and upcoming vacancies together.', color: '#e3d7ee', steps: [rent,
    clip('deposit', 'Deposit records', 'Track deposits paid and refunded', 'Check the deposit amount and its paid or refunded status in the tenant’s record. Keep these details together for each tenant.', 'Updating the deposit-paid status on a fictional tenant record'), notice ] },
  { key: 'staff', title: 'Staff salaries and daily wages', body: 'Keep cooks, cleaners and helpers’ payment records in one place.', color: '#f1dfcc', steps: [
    clip('staff', 'Staff records', 'See who works at your PG', 'Open a staff record to see their role, phone number and salary or daily rate. Keep the details and payment history together.', 'Fictional cook and cleaner records in PG Manager'),
    clip('salary', 'Salary & advances', 'Record a salary payment', 'Record the monthly salary period, then save a salary payment or advance. See what is earned, paid and still pending.', 'Recording a fictional staff salary period and payment'),
    clip('daily-wages', 'Daily wages', 'Pay for the days worked', 'Enter days worked for daily staff. The app calculates earned wages and shows the remaining amount to pay.', 'Entering days worked for a fictional daily-wage cleaner') ] },
  { key: 'reports', title: 'Expenses and monthly reports', body: 'See operating costs, rent still due and the monthly balance.', color: '#d4e3f1', steps: [
    clip('expenses', 'Operating expenses', 'Keep everyday costs in order', 'View food, groceries, electricity and other costs. Filter paid and unpaid expenses so bills are easy to find.', 'Real expense list with category and paid/unpaid filters using fictional costs'),
    clip('finance-report', 'Monthly report', 'See collections and spending together', 'Review rent collected, staff payments and operating costs for a month. Check remaining money and pending amounts from your actual records.', 'Monthly finance report calculated from fictional PG records'),
    clip('pending', 'Pending rent report', 'Find rent that still needs collecting', 'Open the pending-rent report from Home. See outstanding bills and go to rent payments to follow up.', 'Sai Residency PG pending rent report and rent filters') ] },
];
export const demoSteps = demoGroups.flatMap(group => group.steps);
