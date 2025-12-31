-- User Permissions Management Schema
-- Adds permission system for users

-- ============================================
-- USER PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page VARCHAR(100) NOT NULL, -- 'vehicles', 'customers', 'repair-services', etc.
    can_view BOOLEAN DEFAULT false,
    can_add BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    permission_password VARCHAR(255), -- Optional password for sensitive operations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, page)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_page ON user_permissions(page);

-- Available pages
-- vehicles, customers, repair-services, repair-quotes, car-wash, reservations, pages

