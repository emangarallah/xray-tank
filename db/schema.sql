CREATE TABLE IF NOT EXISTS tanks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Home Tank',
  capacity_liters NUMERIC(12,2) NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
