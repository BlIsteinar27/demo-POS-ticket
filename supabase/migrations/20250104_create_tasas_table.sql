-- Crear tabla de tasas del día
-- Esta tabla almacena el historial de tasas de cambio USD->VES
CREATE TABLE IF NOT EXISTS tasas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasa NUMERIC(10, 2) NOT NULL CHECK (tasa > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para optimizar consultas de la tasa más reciente
CREATE INDEX IF NOT EXISTS idx_tasas_created_at ON tasas(created_at DESC);

-- Comentario para documentación
COMMENT ON TABLE tasas IS 'Historial de tasas de cambio USD->VES';
COMMENT ON COLUMN tasas.tasa IS 'Tasa de cambio (ejemplo: 280.20 representa 1 USD = 280.20 VES)';
COMMENT ON COLUMN tasas.created_at IS 'Fecha y hora de registro de la tasa';
