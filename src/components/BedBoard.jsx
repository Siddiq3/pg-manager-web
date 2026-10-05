import React from 'react';

/**
 * The bed board: each room is a card, each bed a chip. Occupied beds carry the tenant's
 * initials, vacant beds are dashed, and beds whose tenant has given notice turn marigold.
 * Used as the landing hero, inside the scroll story and on the sign-in panel.
 */

export const SAMPLE_ROOMS = [
  { room: '101', beds: [['A', 'RK'], ['B', 'SM'], ['C', 'PV']] },
  { room: '102', beds: [['A', 'AJ'], ['B', null]] },
  { room: '103', beds: [['A', 'MN'], ['B', null], ['C', 'TS']] },
  { room: '201', beds: [['A', 'NS'], ['B', 'KR']] },
  { room: '202', beds: [['A', 'VG'], ['B', 'HD'], ['C', null]] },
  { room: '203', beds: [['A', 'YP'], ['B', 'LB'], ['C', 'DS']] },
  { room: '204', beds: [['A', 'GR'], ['B', null]] },
  { room: '205', beds: [['A', 'IK'], ['B', 'OM'], ['C', 'FZ']] },
];

/** `overrides` maps "103-B" to { initials, state } so the story can change single beds. */
export function BedBoard({ rooms = SAMPLE_ROOMS, overrides = {}, highlight, animate = false, compact = false }) {
  let order = 0;
  return (
    <div className={`bedboard${compact ? ' bedboard--compact' : ''}${animate ? ' bedboard--animate' : ''}`}>
      {rooms.map(({ room, beds }) => (
        <div className="bb-room" key={room}>
          <span className="bb-room-no">{room}</span>
          <div className="bb-beds">
            {beds.map(([label, initials]) => {
              const id = `${room}-${label}`;
              const o = overrides[id] || {};
              const who = o.initials !== undefined ? o.initials : initials;
              const state = o.state || (who ? 'occupied' : 'vacant');
              const i = state === 'occupied' ? order++ : 0;
              return (
                <span
                  key={id}
                  className={`bb-bed bb-${state}${highlight === id ? ' bb-highlight' : ''}`}
                  style={{ '--i': i }}
                  aria-label={`Bed ${id}: ${state}`}
                >
                  <span className="bb-label">{label}</span>
                  {who && <span className="bb-initials">{who}</span>}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export const countBeds = (rooms = SAMPLE_ROOMS) => {
  const all = rooms.flatMap((r) => r.beds);
  return { total: all.length, filled: all.filter(([, who]) => who).length };
};
