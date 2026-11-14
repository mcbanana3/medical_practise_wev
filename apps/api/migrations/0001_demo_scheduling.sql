PRAGMA foreign_keys = ON;

CREATE TABLE demo_slots (
  id TEXT PRIMARY KEY,
  start_at INTEGER NOT NULL UNIQUE,
  end_at INTEGER NOT NULL,
  local_date TEXT NOT NULL,
  is_open INTEGER NOT NULL DEFAULT 1 CHECK (is_open IN (0, 1)),
  CHECK (end_at - start_at = 1800000)
);

CREATE INDEX demo_slots_local_date
ON demo_slots(local_date, start_at);

CREATE TABLE demo_bookings (
  id TEXT PRIMARY KEY,
  slot_id TEXT NOT NULL REFERENCES demo_slots(id),
  original_slot_id TEXT NOT NULL REFERENCES demo_slots(id),
  demo_identity TEXT NOT NULL
    CHECK (demo_identity IN ('synthetic-a', 'synthetic-b', 'synthetic-c')),
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX one_confirmed_demo_booking_per_slot
ON demo_bookings(slot_id)
WHERE status = 'confirmed';