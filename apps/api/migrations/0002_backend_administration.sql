ALTER TABLE demo_slots
ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE TABLE website_content (
  content_key TEXT PRIMARY KEY
    CHECK (content_key IN ('hero', 'doctor', 'contact')),
  fixture_id TEXT NOT NULL
    CHECK (
      fixture_id IN (
        'hero-placeholder',
        'doctor-placeholder',
        'contact-placeholder'
      )
    ),
  published INTEGER NOT NULL DEFAULT 0
    CHECK (published IN (0, 1)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at INTEGER NOT NULL
);

INSERT INTO website_content
  (content_key, fixture_id, published, version, updated_at)
VALUES
  ('hero', 'hero-placeholder', 1, 1, 0),
  ('doctor', 'doctor-placeholder', 1, 1, 0),
  ('contact', 'contact-placeholder', 1, 1, 0);

CREATE TABLE demo_reviews (
  id TEXT PRIMARY KEY,
  fixture_id TEXT NOT NULL
    CHECK (fixture_id IN ('review-layout-a', 'review-layout-b')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      status IN ('pending', 'approved', 'rejected', 'unpublished')
    ),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  moderated_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX demo_reviews_status_created
ON demo_reviews(status, created_at);

CREATE TABLE admin_principals (
  subject TEXT PRIMARY KEY,
  role TEXT NOT NULL
    CHECK (role IN ('owner', 'scheduler', 'moderator')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

INSERT INTO admin_principals (subject, role, active)
VALUES ('local-development-owner', 'owner', 1);

CREATE TABLE admin_audit_events (
  id TEXT PRIMARY KEY,
  actor_subject TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_reference TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX admin_audit_created
ON admin_audit_events(created_at);