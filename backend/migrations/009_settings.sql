CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);

-- Insert default social media settings (empty strings)
INSERT INTO settings (key, value) VALUES 
    ('social_facebook', ''),
    ('social_instagram', ''),
    ('social_x', ''),
    ('contact_phone', '')
ON CONFLICT (key) DO NOTHING;

