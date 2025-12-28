-- Add tax rate setting
INSERT INTO settings (key, value) VALUES
    ('tax_rate', '0')
ON CONFLICT (key) DO NOTHING;

