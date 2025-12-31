import pool from '../config/database.js';

export const getPages = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, slug, title, meta_description, is_active, created_at, updated_at FROM pages WHERE is_active = true ORDER BY title'
    );
    res.json({ pages: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getAllPages = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM pages ORDER BY title');
    res.json({ pages: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getPageBySlug = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pages WHERE slug = $1 AND is_active = true',
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createPage = async (req, res, next) => {
  try {
    const { slug, title, content, meta_description, is_active } = req.body;
    const result = await pool.query(
      `INSERT INTO pages (slug, title, content, meta_description, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [slug, title, content, meta_description, is_active !== false, req.user.id]
    );
    res.status(201).json({ page: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (req, res, next) => {
  try {
    const { slug, title, content, meta_description, is_active } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (slug !== undefined) { updates.push(`slug = $${paramCount++}`); values.push(slug); }
    if (title !== undefined) { updates.push(`title = $${paramCount++}`); values.push(title); }
    if (content !== undefined) { updates.push(`content = $${paramCount++}`); values.push(content); }
    if (meta_description !== undefined) { updates.push(`meta_description = $${paramCount++}`); values.push(meta_description); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramCount++}`); values.push(is_active); }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE pages SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deletePage = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM pages WHERE id = $1', [req.params.id]);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};


