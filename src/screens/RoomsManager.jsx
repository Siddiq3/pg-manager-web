import React, { useState } from 'react';
import { BedDouble, ChevronDown, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react';
import { errorMessage } from '../lib/api';
import { money } from '../lib/format';
import { Badge, Button, Card, EmptyState, Field, Skeleton } from '../components/ui';

const emptyRoom = { roomNumber: '', floor: '', type: '', monthlyRent: '' };

/** Room + bed setup: the step between creating a property and adding tenants. */
export default function RoomsManager({ client, propertyId, rooms, beds, loading, onChanged, onError }) {
  const [form, setForm] = useState(emptyRoom);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(emptyRoom);
  const [openRoomId, setOpenRoomId] = useState('');
  const [busyId, setBusyId] = useState('');
  const [bedLabel, setBedLabel] = useState('');

  const bedsOf = (roomId) => beds.filter((bed) => (bed.roomId?._id || bed.roomId) === roomId);
  const update = (setter) => (field) => (event) => setter((current) => ({ ...current, [field]: event.target.value }));

  const numberOrUndefined = (value) => (String(value).trim() === '' ? undefined : Number(value));

  async function run(id, action) {
    if (busyId) return;
    setBusyId(id);
    onError('');
    try {
      await action();
      await onChanged();
    } catch (error) {
      onError(errorMessage(error));
    } finally {
      setBusyId('');
    }
  }

  async function addRoom(event) {
    event.preventDefault();
    if (!form.roomNumber.trim() || adding) return;
    setAdding(true);
    onError('');
    try {
      await client.post('/rooms', {
        propertyId,
        roomNumber: form.roomNumber.trim(),
        floor: form.floor.trim() || undefined,
        type: form.type.trim() || undefined,
        monthlyRent: numberOrUndefined(form.monthlyRent),
      });
      setForm(emptyRoom);
      await onChanged();
    } catch (error) {
      onError(errorMessage(error));
    } finally {
      setAdding(false);
    }
  }

  function startEdit(room) {
    setEditingId(room._id);
    setEditForm({
      roomNumber: room.roomNumber,
      floor: room.floor || '',
      type: room.type || '',
      monthlyRent: room.monthlyRent ?? '',
    });
  }

  const saveRoom = (room) =>
    run(room._id, async () => {
      await client.patch(`/rooms/${room._id}`, {
        roomNumber: editForm.roomNumber.trim(),
        floor: editForm.floor.trim(),
        type: editForm.type.trim(),
        monthlyRent: numberOrUndefined(editForm.monthlyRent) ?? 0,
      });
      setEditingId('');
    });

  const deleteRoom = (room) => {
    const occupied = bedsOf(room._id).filter((bed) => bed.status === 'OCCUPIED').length;
    if (occupied) {
      onError(`Room ${room.roomNumber} has ${occupied} occupied bed(s). Check those tenants out first.`);
      return;
    }
    if (!window.confirm(`Delete room ${room.roomNumber} and its beds?`)) return;
    run(room._id, () => client.delete(`/rooms/${room._id}`));
  };

  const addBed = (room) => {
    const label = bedLabel.trim();
    if (!label) return;
    run(`bed-${room._id}`, async () => {
      await client.post('/beds', { roomId: room._id, bedLabel: label });
      setBedLabel('');
    });
  };

  const deleteBed = (bed) => run(bed._id, () => client.delete(`/beds/${bed._id}`));

  return (
    <Card
      title="Rooms and beds"
      action={<span className="muted">{rooms.length} rooms · {beds.length} beds</span>}
    >
      <form className="room-form" onSubmit={addRoom}>
        <Field label="Room number" placeholder="Enter room number" name="roomNumber" value={form.roomNumber} onChange={update(setForm)('roomNumber')} />
        <Field label="Floor" placeholder="Enter floor" name="floor" value={form.floor} onChange={update(setForm)('floor')} />
        <Field label="Type" placeholder="Enter room type" name="type" value={form.type} onChange={update(setForm)('type')} />
        <Field label="Monthly rent" placeholder="Enter monthly rent" name="monthlyRent" value={form.monthlyRent} onChange={update(setForm)('monthlyRent')} inputMode="numeric" />
        <Button type="submit" loading={adding}>
          <Plus size={16} /> Add room
        </Button>
      </form>

      {loading && !rooms.length ? (
        <Skeleton rows={3} />
      ) : !rooms.length ? (
        <EmptyState icon={<BedDouble size={22} />} title="No rooms yet" hint="Add your first room above, then give it beds." />
      ) : (
        <ul className="room-list">
          {rooms.map((room) => {
            const roomBeds = bedsOf(room._id);
            const occupied = roomBeds.filter((bed) => bed.status === 'OCCUPIED').length;
            const open = openRoomId === room._id;

            return (
              <li className="room-item" key={room._id}>
                {editingId === room._id ? (
                  <form
                    className="room-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveRoom(room);
                    }}
                  >
                    <Field label="Room number" placeholder="Enter room number" name="editRoomNumber" value={editForm.roomNumber} onChange={update(setEditForm)('roomNumber')} />
                    <Field label="Floor" placeholder="Enter floor" name="editFloor" value={editForm.floor} onChange={update(setEditForm)('floor')} />
                    <Field label="Type" placeholder="Enter room type" name="editType" value={editForm.type} onChange={update(setEditForm)('type')} />
                    <Field label="Monthly rent" placeholder="Enter monthly rent" name="editRent" value={editForm.monthlyRent} onChange={update(setEditForm)('monthlyRent')} inputMode="numeric" />
                    <div className="row-actions">
                      <Button type="submit" loading={busyId === room._id}>Save</Button>
                      <Button type="button" variant="ghost" onClick={() => setEditingId('')}>
                        <X size={15} />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="room-head">
                    <button type="button" className="room-toggle" onClick={() => setOpenRoomId(open ? '' : room._id)} aria-expanded={open}>
                      {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="cell-title">Room {room.roomNumber}</span>
                      <span className="cell-sub">
                        {[room.floor && `Floor ${room.floor}`, room.type].filter(Boolean).join(' · ') || 'No details'}
                      </span>
                    </button>
                    <span className="muted">{money(room.monthlyRent)}</span>
                    <Badge tone={occupied === roomBeds.length && roomBeds.length ? 'muted' : 'ok'}>
                      {roomBeds.length ? `${occupied}/${roomBeds.length} filled` : 'No beds'}
                    </Badge>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => startEdit(room)} aria-label={`Edit room ${room.roomNumber}`}>
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => deleteRoom(room)}
                        disabled={busyId === room._id}
                        aria-label={`Delete room ${room.roomNumber}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {open && editingId !== room._id && (
                  <div className="bed-panel">
                    {roomBeds.length ? (
                      <ul className="chip-list">
                        {roomBeds.map((bed) => (
                          <li className={`chip bed-chip ${bed.status === 'OCCUPIED' ? 'occupied' : ''}`} key={bed._id}>
                            <span>Bed {bed.bedLabel}</span>
                            <Badge>{bed.status}</Badge>
                            {bed.status === 'VACANT' && (
                              <button
                                type="button"
                                className="chip-remove"
                                onClick={() => deleteBed(bed)}
                                disabled={busyId === bed._id}
                                aria-label={`Delete bed ${bed.bedLabel}`}
                              >
                                <X size={13} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">No beds in this room yet.</p>
                    )}

                    <div className="bed-add">
                      <input
                        value={openRoomId === room._id ? bedLabel : ''}
                        onChange={(event) => setBedLabel(event.target.value)}
                        placeholder="Enter bed label"
                        aria-label={`New bed label for room ${room.roomNumber}`}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addBed(room);
                          }
                        }}
                      />
                      <Button variant="secondary" loading={busyId === `bed-${room._id}`} onClick={() => addBed(room)}>
                        <Plus size={15} /> Add bed
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
