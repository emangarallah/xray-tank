CREATE TABLE IF NOT EXISTS tanks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Home Tank',
  capacity_liters NUMERIC(12,2) NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owner_id TEXT
);

CREATE TABLE IF NOT EXISTS telemetry (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  level_percent NUMERIC(5,2) NOT NULL CHECK (level_percent >= 0 AND level_percent <= 100),
  distance_cm NUMERIC(8,2),
  temperature_c NUMERIC(5,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS telemetry_device_time_idx ON telemetry(device_id, recorded_at DESC);

-- Register a device/tank before sending readings:
-- INSERT INTO tanks (id, name, capacity_liters) VALUES ('tank-001', 'Main Tank', 2000);

ALTER TABLE tanks ADD COLUMN IF NOT EXISTS owner_id TEXT;
CREATE INDEX IF NOT EXISTS tanks_owner_created_idx ON tanks(owner_id, created_at DESC);

ALTER TABLE tanks ADD COLUMN IF NOT EXISTS device_key_hash TEXT;
CREATE INDEX IF NOT EXISTS tanks_device_key_hash_idx ON tanks(device_key_hash) WHERE device_key_hash IS NOT NULL;
