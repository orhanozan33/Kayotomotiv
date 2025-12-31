-- Add company information settings for receipts/invoices
INSERT INTO settings (key, value) VALUES
    ('company_name', ''),
    ('company_tax_number', ''),
    ('company_address', ''),
    ('company_phone', ''),
    ('company_email', '')
ON CONFLICT (key) DO NOTHING;

