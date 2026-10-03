import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BedDouble, Building2, IndianRupee, LogOut, Pencil, Phone, Plus, RefreshCcw, Users, X } from 'lucide-react';
import { errorMessage } from '../lib/api';
import { dueLabel, initials, money, shortDate } from '../lib/format';
import { Badge, Banner, Button, Card, EmptyState, Field, Skeleton, Stat, Table } from '../components/ui';
import RoomsManager from './RoomsManager';

const EMPTY = { rooms: [], beds: [], tenants: [], rentCycles: [] };

export default function Dashboard({ client, user, onSignOut }) {
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState('');
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [newPropertyName, setNewPropertyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [payingId, setPayingId] = useState('');
  const [editingProperty, setEditingProperty] = useState(null);

  // Only the newest load may write to state: switching properties quickly
  // otherwise lets a slow earlier response overwrite the current one.
  const loadId = useRef(0);

  const fetchPropertyData = useCallback(
    async (activeId) => {
      const [rooms, bedList, tenants, rentCycles] = await Promise.all([
        client.get('/rooms', { params: { propertyId: activeId } }),
        client.get('/beds', { params: { propertyId: activeId } }),
        client.get('/tenants', { params: { propertyId: activeId } }),
        client.get('/rent-cycles', { params: { propertyId: activeId } }),
      ]);
      return {
        rooms: rooms.data.data,
        beds: bedList.data.data,
        tenants: tenants.data.data,
        rentCycles: rentCycles.data.data,
      };
    },
    [client]
  );

  const loadPropertyData = useCallback(
    async (activeId) => {
      const requestId = (loadId.current += 1);
      setPropertyId(activeId);
      setLoading(true);
      setError('');

      if (!activeId) {
        setData(EMPTY);
        setLoading(false);
        return;
      }

      try {
        const next = await fetchPropertyData(activeId);
        if (requestId !== loadId.current) return;
        setData(next);
      } catch (err) {
        if (requestId !== loadId.current) return;
        if (err.response?.status !== 401) setError(errorMessage(err, 'Could not load your data.'));
      } finally {
        if (requestId === loadId.current) setLoading(false);
      }
    },
    [fetchPropertyData]
  );

  const loadInitial = useCallback(async () => {
    const requestId = (loadId.current += 1);
    setLoading(true);
    setError('');

    try {
      const propertyList = (await client.get('/properties')).data.data;
      const activeId = propertyList[0]?._id || '';

      if (requestId !== loadId.current) return;
      setProperties(propertyList);
      setPropertyId(activeId);

      if (!activeId) {
        setData(EMPTY);
        return;
      }

      const next = await fetchPropertyData(activeId);
      if (requestId !== loadId.current) return;
      setData(next);
    } catch (err) {
      if (requestId !== loadId.current) return;
      if (err.response?.status !== 401) setError(errorMessage(err, 'Could not load your data.'));
    } finally {
      if (requestId === loadId.current) setLoading(false);
    }
  }, [client, fetchPropertyData]);

  const refreshRoomsAndBeds = useCallback(
    async (activeId) => {
      const [rooms, bedList] = await Promise.all([
        client.get('/rooms', { params: { propertyId: activeId } }),
        client.get('/beds', { params: { propertyId: activeId } }),
      ]);
      setData((current) => ({
        ...current,
        rooms: rooms.data.data,
        beds: bedList.data.data,
      }));
    },
    [client]
  );

  const initialLoadStarted = useRef(false);
  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    loadInitial();
  }, [loadInitial]);

  // Success messages are transient; leaving them up makes a stale one look
  // like confirmation of the action you just took.
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function addProperty(event) {
    event.preventDefault();
    const name = newPropertyName.trim();
    if (!name || creating) return;

    setCreating(true);
    setError('');
    try {
      const { data: created } = await client.post('/properties', { name });
      setNewPropertyName('');
      setProperties((current) => [
        created.data,
        ...current.filter((property) => property._id !== created.data._id),
      ]);
      setNotice(`${name} added.`);
      await loadPropertyData(created.data._id);
    } catch (err) {
      setError(errorMessage(err, 'Could not add the property.'));
    } finally {
      setCreating(false);
    }
  }

  async function saveProperty(event) {
    event.preventDefault();
    const { _id, name, address, city } = editingProperty;
    if (!name.trim()) return;

    setError('');
    try {
      const { data: response } = await client.patch(`/properties/${_id}`, { name: name.trim(), address: address.trim(), city: city.trim() });
      setProperties((current) => current.map((property) => property._id === _id ? response.data : property));
      setEditingProperty(null);
      setNotice('Property updated.');
    } catch (err) {
      setError(errorMessage(err, 'Could not update the property.'));
    }
  }

  async function markPaid(cycle) {
    const outstanding = cycle.amountDue - cycle.amountPaid;
    if (outstanding <= 0 || payingId) return;

    setPayingId(cycle._id);
    setError('');
    try {
      const { data: response } = await client.post(`/rent-cycles/${cycle._id}/payments`, {
        amount: outstanding,
        method: 'UPI',
        date: new Date().toISOString(),
      });
      setData((current) => ({
        ...current,
        rentCycles: current.rentCycles.map((item) => item._id === response.data._id
          ? { ...response.data, tenantId: item.tenantId, propertyId: item.propertyId }
          : item),
      }));
      setNotice(`Recorded ${money(outstanding)} from ${cycle.tenantId?.name || 'tenant'}.`);
    } catch (err) {
      setError(errorMessage(err, 'Could not record the payment.'));
    } finally {
      setPayingId('');
    }
  }

  const totalBeds = data.beds.length;
  const occupiedBeds = data.beds.filter((bed) => bed.status === 'OCCUPIED').length;
  const occupancy = {
    totalBeds,
    occupiedBeds,
    vacantBeds: totalBeds - occupiedBeds,
    occupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
  };
  const pending = data.rentCycles.filter((cycle) => cycle.status !== 'PAID');
  const pendingAmount = pending.reduce((sum, cycle) => sum + (cycle.amountDue - cycle.amountPaid), 0);
  const now = new Date().toISOString();
  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const vacatingSoon = data.tenants.filter(
    (tenant) => tenant.status === 'ACTIVE' && tenant.expectedVacateDate >= now && tenant.expectedVacateDate <= soon
  );
  const vacantBeds = data.beds.filter((bed) => bed.status === 'VACANT');
  const activeProperty = properties.find((property) => property._id === propertyId);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Building2 size={20} />
          </span>
          <span className="brand-name">PG Manager</span>
        </div>

        {properties.length > 0 && (
          <label className="property-picker">
            <span className="sr-only">Property</span>
            <select value={propertyId} onChange={(event) => loadPropertyData(event.target.value)}>
              {properties.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="topbar-actions">
          <Button variant="ghost" onClick={() => loadPropertyData(propertyId)} loading={loading} aria-label="Refresh">
            <RefreshCcw size={16} />
            <span className="hide-sm">Refresh</span>
          </Button>
          <span className="avatar" title={user?.email}>
            {initials(user?.name)}
          </span>
          <Button variant="ghost" onClick={onSignOut}>
            <LogOut size={16} />
            <span className="hide-sm">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="content">
        <div className="page-head">
          {editingProperty ? (
            <form className="property-form" onSubmit={saveProperty}>
              <Field
                label="Property name"
                name="propertyName"
                value={editingProperty.name}
                onChange={(event) => setEditingProperty({ ...editingProperty, name: event.target.value })}
              />
              <Field
                label="City"
                name="propertyCity"
                value={editingProperty.city}
                onChange={(event) => setEditingProperty({ ...editingProperty, city: event.target.value })}
              />
              <Field
                label="Address"
                name="propertyAddress"
                value={editingProperty.address}
                onChange={(event) => setEditingProperty({ ...editingProperty, address: event.target.value })}
              />
              <div className="row-actions">
                <Button type="submit">Save</Button>
                <Button type="button" variant="ghost" onClick={() => setEditingProperty(null)} aria-label="Cancel">
                  <X size={15} />
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <h1>
                {activeProperty?.name || 'Your properties'}
                {activeProperty && (
                  <button
                    type="button"
                    className="icon-btn inline-edit"
                    onClick={() =>
                      setEditingProperty({
                        _id: activeProperty._id,
                        name: activeProperty.name || '',
                        city: activeProperty.city || '',
                        address: activeProperty.address || '',
                      })
                    }
                    aria-label="Edit property"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </h1>
              <p className="muted">
                {activeProperty
                  ? [activeProperty.city, activeProperty.address].filter(Boolean).join(' - ') || 'Owner dashboard'
                  : 'Add your first PG to get started.'}
              </p>
            </div>
          )}
          <form className="inline-form" onSubmit={addProperty}>
            <input
              value={newPropertyName}
              onChange={(event) => setNewPropertyName(event.target.value)}
              placeholder="New property name"
              aria-label="New property name"
            />
            <Button type="submit" loading={creating} aria-label="Add property">
              <Plus size={16} />
            </Button>
          </form>
        </div>

        <Banner tone="success" onDismiss={() => setNotice('')}>
          {notice}
        </Banner>
        <Banner tone="error" onDismiss={() => setError('')}>
          {error}
        </Banner>

        {!propertyId ? (
          loading ? (
            <Card>
              <Skeleton rows={4} />
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={<Building2 size={22} />}
                title="Create your first property"
                hint="Add a PG or hostel above to start tracking rooms, beds, tenants and rent."
              />
            </Card>
          )
        ) : (
          <>
            <section className="stats-grid">
              <Stat
                icon={<BedDouble size={18} />}
                label="Beds occupied"
                value={`${occupancy.occupiedBeds || 0}/${occupancy.totalBeds || 0}`}
                hint={`${occupancy.occupancyRate || 0}% occupancy`}
              />
              <Stat icon={<Building2 size={18} />} label="Vacant beds" value={occupancy.vacantBeds || 0} hint="Ready to fill" />
              <Stat
                icon={<Users size={18} />}
                label="Vacating soon"
                value={vacatingSoon.length}
                hint="Next 30 days"
                tone={vacatingSoon.length ? 'warn' : 'default'}
              />
              <Stat
                icon={<IndianRupee size={18} />}
                label="Rent pending"
                value={money(pendingAmount)}
                hint={`${pending.length} ${pending.length === 1 ? 'cycle' : 'cycles'}`}
                tone={pendingAmount > 0 ? 'danger' : 'ok'}
              />
            </section>

            <RoomsManager
              client={client}
              propertyId={propertyId}
              rooms={data.rooms}
              beds={data.beds}
              loading={loading}
              onChanged={() => refreshRoomsAndBeds(propertyId)}
              onError={setError}
            />

            <Card title="Rent" className="span-2">
              {loading && !data.rentCycles.length ? (
                <Skeleton rows={3} />
              ) : (
                <Table
                  className="rent-table"
                  columns={[
                    { key: 'tenant', label: 'Tenant' },
                    { key: 'month', label: 'Month', className: 'month-col' },
                    { key: 'status', label: 'Status' },
                    { key: 'amount', label: 'Collected', align: 'right' },
                    { key: 'actions', label: '', align: 'right' },
                  ]}
                  rows={data.rentCycles}
                  empty="No rent cycles yet. They are created when you add a tenant."
                  renderRow={(cycle) => (
                    <tr key={cycle._id}>
                      <td className="c-tenant">
                        <span className="cell-title">{cycle.tenantId?.name || 'Tenant'}</span>
                        <span className="cell-sub">
                          {cycle.month} - {dueLabel(cycle.dueDate) || shortDate(cycle.dueDate)}
                        </span>
                      </td>
                      <td className="month-col">{cycle.month}</td>
                      <td className="c-status">
                        <Badge>{cycle.status}</Badge>
                      </td>
                      <td className="right c-amount">
                        <span className="cell-title">{money(cycle.amountPaid)}</span>
                        <span className="cell-sub">of {money(cycle.amountDue)}</span>
                      </td>
                      <td className="right c-actions">
                        <div className="row-actions">
                          {cycle.tenantId?.phone && (
                            <a className="icon-btn" href={`tel:${cycle.tenantId.phone}`} title={`Call ${cycle.tenantId.name}`}>
                              <Phone size={15} />
                            </a>
                          )}
                          {cycle.status !== 'PAID' && (
                            <Button variant="secondary" loading={payingId === cycle._id} onClick={() => markPaid(cycle)}>
                              Mark paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                />
              )}
            </Card>

            <div className="two-col">
              <Card title="Tenants">
                {loading && !data.tenants.length ? (
                  <Skeleton />
                ) : (
                  <Table
                    columns={[
                      { key: 'name', label: 'Tenant' },
                      { key: 'status', label: 'Status' },
                      { key: 'rent', label: 'Rent', align: 'right' },
                    ]}
                    rows={data.tenants}
                    empty="No tenants yet."
                    renderRow={(tenant) => (
                      <tr key={tenant._id}>
                        <td>
                          <span className="cell-title">{tenant.name}</span>
                          <span className="cell-sub">
                            {tenant.roomId?.roomNumber ? `Room ${tenant.roomId.roomNumber}` : ''}
                            {tenant.bedId?.bedLabel ? ` - Bed ${tenant.bedId.bedLabel}` : ''}
                          </span>
                        </td>
                        <td>
                          <Badge>{tenant.status}</Badge>
                        </td>
                        <td className="right">{money(tenant.rentAmount)}</td>
                      </tr>
                    )}
                  />
                )}
              </Card>

            <Card title="Vacant beds">
              {vacantBeds.length ? (
                <ul className="chip-list">
                  {[...vacantBeds]
                    .sort((a, b) =>
                      String(a.roomId?.roomNumber || '').localeCompare(String(b.roomId?.roomNumber || ''), undefined, { numeric: true }) ||
                      a.bedLabel.localeCompare(b.bedLabel, undefined, { numeric: true })
                    )
                    .map((bed) => (
                    <li className="chip" key={bed._id}>
                      Room {bed.roomId?.roomNumber || '-'} - Bed {bed.bedLabel}
                    </li>
                    ))}
                </ul>
              ) : (
                <EmptyState icon={<BedDouble size={22} />} title="Every bed is occupied" hint="Nice - full house." />
              )}
            </Card>
            </div>
          </>
        )}

        <footer className="page-foot muted">Signed in as {user?.email}</footer>
      </main>
    </div>
  );
}
