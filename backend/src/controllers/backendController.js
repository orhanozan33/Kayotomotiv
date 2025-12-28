import pool from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  verifyBackendPassword, 
  generateBackendToken,
  sanitizeSQLQuery,
  sanitizeFilePath
} from '../utils/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend şifresi hash'lenmiş olarak saklanmalı (.env'de)
const BACKEND_PASSWORD_HASH = process.env.BACKEND_PASSWORD_HASH;

// Şifre doğrulama - bcrypt ile güvenli
export const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Şifre gerekli' });
    }

    if (!BACKEND_PASSWORD_HASH) {
      console.error('BACKEND_PASSWORD_HASH environment variable ayarlanmamış');
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası' });
    }

    // bcrypt ile şifre doğrulama
    const isValid = await verifyBackendPassword(password, BACKEND_PASSWORD_HASH);
    
    if (isValid) {
      // Güvenli JWT token oluştur
      const token = generateBackendToken();
      return res.json({ success: true, token });
    }
    
    return res.status(401).json({ error: 'Geçersiz şifre' });
  } catch (error) {
    next(error);
  }
};

// SQL çalıştırma - Güvenli hale getirildi
export const executeSQL = async (req, res, next) => {
  try {
    // Validation middleware'den gelen validate edilmiş veri
    const { sql } = req.body;
    
    // SQL sorgusunu sanitize et
    const sanitizedSQL = sanitizeSQLQuery(sql);
    
    // Güvenli SQL sorgusunu çalıştır (pool.query parametreli sorgu kullanır, injection'a karşı korumalı)
    // Ancak dinamik SQL için prepared statement pattern'i kullanamıyoruz
    // Bu yüzden whitelist ve sanitization ile koruma sağlıyoruz
    const result = await pool.query({
      text: sanitizedSQL,
      rowMode: 'array' // Güvenlik için array modu
    });
    
    res.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      command: result.command
    });
  } catch (error) {
    // Güvenlik: Hata mesajlarını sanitize et
    const isSecurityError = error.message.includes('Yetkisiz') || 
                           error.message.includes('İzin verilmeyen') ||
                           error.message.includes('Güvenlik');
    
    res.status(isSecurityError ? 403 : 500).json({
      error: isSecurityError ? 'Güvenlik hatası' : 'SQL hatası',
      message: process.env.NODE_ENV === 'production' && !isSecurityError
        ? 'SQL sorgusu çalıştırılamadı'
        : error.message,
      ...(process.env.NODE_ENV !== 'production' && { detail: error.detail })
    });
  }
};

// Dosya listesi alma - Path traversal korumalı
export const getFiles = async (req, res, next) => {
  try {
    const { directory = 'src' } = req.query;
    const basePath = path.resolve(__dirname, '../../');
    
    // Path traversal koruması
    const targetPath = sanitizeFilePath(basePath, directory);

    // Symlink kontrolü
    const realPath = await fs.realpath(targetPath);
    if (!realPath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Yetkisiz dizin erişimi' });
    }

    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: path.relative(basePath, path.join(targetPath, entry.name)).replace(/\\/g, '/')
    }));

    res.json({ files });
  } catch (error) {
    if (error.message.includes('Yetkisiz')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

// Dosya okuma - Path traversal korumalı
export const readFile = async (req, res, next) => {
  try {
    const { filePath } = req.query;
    if (!filePath) {
      return res.status(400).json({ error: 'Dosya yolu gerekli' });
    }

    const basePath = path.resolve(__dirname, '../../');
    
    // Path traversal koruması
    const targetPath = sanitizeFilePath(basePath, filePath);

    // Symlink kontrolü
    const realPath = await fs.realpath(targetPath);
    if (!realPath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Yetkisiz dosya erişimi' });
    }

    // Kritik dosyaları koru
    const restrictedFiles = ['.env', 'package.json', 'package-lock.json', 'yarn.lock'];
    const fileName = path.basename(targetPath);
    if (restrictedFiles.includes(fileName)) {
      return res.status(403).json({ error: 'Bu dosya okunamaz' });
    }

    const content = await fs.readFile(targetPath, 'utf-8');
    res.json({ content, path: filePath });
  } catch (error) {
    if (error.message.includes('Yetkisiz')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }
    next(error);
  }
};

// Dosya yazma - Path traversal korumalı
export const writeFile = async (req, res, next) => {
  try {
    const { filePath, content } = req.body;
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'Dosya yolu ve içerik gerekli' });
    }

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'İçerik string olmalıdır' });
    }

    const basePath = path.resolve(__dirname, '../../');
    
    // Path traversal koruması
    const targetPath = sanitizeFilePath(basePath, filePath);

    // Symlink kontrolü
    const realPath = await fs.realpath(path.dirname(targetPath));
    if (!realPath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Yetkisiz dosya erişimi' });
    }

    // Kritik dosyaları koru
    const restrictedFiles = [
      '.env', 
      'package.json', 
      'package-lock.json', 
      'yarn.lock',
      'server.js',
      'src/server.js',
      'migrate.js'
    ];
    const fileName = path.basename(targetPath);
    const relativePath = path.relative(basePath, targetPath).replace(/\\/g, '/');
    
    if (restrictedFiles.includes(fileName) || restrictedFiles.includes(relativePath)) {
      return res.status(403).json({ error: 'Bu dosya düzenlenemez' });
    }

    await fs.writeFile(targetPath, content, 'utf-8');
    res.json({ success: true, message: 'Dosya kaydedildi' });
  } catch (error) {
    if (error.message.includes('Yetkisiz')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

