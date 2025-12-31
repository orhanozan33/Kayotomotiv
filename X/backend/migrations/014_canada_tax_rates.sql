-- Add Canada tax rates (federal and provincial)
INSERT INTO settings (key, value) VALUES
    ('federal_tax_rate', '0'),
    ('provincial_tax_rate', '0')
ON CONFLICT (key) DO NOTHING;

