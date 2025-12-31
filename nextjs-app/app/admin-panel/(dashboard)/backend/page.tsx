'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { backendAPI } from '@/lib/services/adminApi';
import styles from './backend.module.css';

interface FileItem {
  name: string;
  type: 'directory' | 'file';
  path: string;
}


export default function BackendPage() {
  const { t } = useTranslation('common');
  const { showError, showSuccess } = useError();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // SQL Editor states
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);

  // File Editor states
  const [currentDirectory, setCurrentDirectory] = useState('src');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan authentication durumunu kontrol et
    const backendAuth = localStorage.getItem('backendAuth');
    if (backendAuth === 'true') {
      setIsAuthenticated(true);
      loadFiles();
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await backendAPI.verifyPassword(password);
      if (response.data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('backendAuth', 'true');
        showSuccess(t('backend.loginSuccess') || 'Başarıyla giriş yapıldı');
        loadFiles();
      }
    } catch (error: any) {
      showError(error.response?.data?.error || (t('backend.invalidPassword') || 'Geçersiz şifre'));
    } finally {
      setLoading(false);
    }
  };

  const handleSQLExecute = async () => {
    if (!sqlQuery.trim()) {
      showError('SQL sorgusu boş olamaz');
      return;
    }

    setSqlLoading(true);
    setSqlResult(null);
    try {
      const response = await backendAPI.executeSQL(sqlQuery);
      setSqlResult(response.data);
      showSuccess('SQL sorgusu başarıyla çalıştırıldı');
    } catch (error: any) {
      setSqlResult({
        error: true,
        message: error.response?.data?.message || error.response?.data?.error || 'SQL hatası oluştu',
        detail: error.response?.data?.detail,
      });
      showError('SQL sorgusu çalıştırılamadı');
    } finally {
      setSqlLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await backendAPI.getFiles(currentDirectory);
      setFiles(response.data.files);
    } catch (error: any) {
      showError(error.response?.data?.error || (t('backend.errors.loadingFiles') || 'Dosyalar yüklenemedi'));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [currentDirectory, isAuthenticated]);

  const handleFileSelect = async (file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentDirectory(file.path);
      setSelectedFile(null);
      setFileContent('');
      return;
    }

    setSelectedFile(file);
    setFileLoading(true);
    try {
      const response = await backendAPI.readFile(file.path);
      setFileContent(response.data.content);
    } catch (error: any) {
      showError(error.response?.data?.error || (t('backend.errors.readingFile') || 'Dosya okunamadı'));
      setFileContent('');
    } finally {
      setFileLoading(false);
    }
  };

  const handleFileSave = async () => {
    if (!selectedFile) {
      showError(t('backend.errors.noFileSelected') || 'Kaydedilecek dosya seçilmedi');
      return;
    }

    setSaving(true);
    try {
      await backendAPI.writeFile(selectedFile.path, fileContent);
      showSuccess(t('backend.fileSaved') || 'Dosya başarıyla kaydedildi');
    } catch (error: any) {
      showError(error.response?.data?.error || (t('backend.errors.savingFile') || 'Dosya kaydedilemedi'));
    } finally {
      setSaving(false);
    }
  };

  const navigateUp = () => {
    const parts = currentDirectory.split('/').filter(p => p);
    if (parts.length > 0) {
      parts.pop();
      setCurrentDirectory(parts.length > 0 ? parts.join('/') : 'src');
    }
  };


  if (!isAuthenticated) {
    return (
      <div className={styles.backendPage}>
        <div className={styles.backendAuthModal}>
          <h2>{t('backend.access') || 'Backend Erişimi'}</h2>
          <p>{t('backend.passwordRequired') || 'Bu sayfaya erişmek için şifre gerekli'}</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('backend.password') || 'Şifre'}
              required
              autoFocus
            />
            <button type="submit" disabled={loading}>
              {loading ? (t('backend.loggingIn') || 'Giriş yapılıyor...') : (t('backend.login') || 'Giriş Yap')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.backendPage}>
      <div className={styles.backendHeader}>
        <h1>{t('backend.management') || 'Backend Yönetimi'}</h1>
        <button
          className={styles.logoutBtn}
          onClick={() => {
            setIsAuthenticated(false);
            localStorage.removeItem('backendAuth');
          }}
        >
          {t('backend.logout') || 'Çıkış'}
        </button>
      </div>

      <div className={styles.backendContent}>
        {/* SQL Editor */}
        <div className={styles.backendSection}>
          <h2>{t('backend.sqlEditor') || 'SQL Editörü'}</h2>
          <div className={styles.sqlEditor}>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder={t('backend.sqlPlaceholder') || 'SQL sorgunuzu buraya yazın...'}
              rows={10}
            />
            <button onClick={handleSQLExecute} disabled={sqlLoading}>
              {sqlLoading ? (t('backend.executing') || 'Çalıştırılıyor...') : (t('backend.executeSQL') || 'SQL Çalıştır')}
            </button>
          </div>

          {sqlResult && (
            <div className={`${styles.sqlResult} ${sqlResult.error ? styles.error : ''}`}>
              {sqlResult.error ? (
                <div>
                  <h3>{t('backend.error') || 'Hata'}:</h3>
                  <p>{sqlResult.message}</p>
                  {sqlResult.detail && <p className={styles.detail}>{sqlResult.detail}</p>}
                </div>
              ) : (
                <div>
                  <h3>{t('backend.result') || 'Sonuç'}:</h3>
                  <p>{t('backend.rowCount') || 'Satır sayısı'}: {sqlResult.rowCount}</p>
                  <p>{t('backend.command') || 'Komut'}: {sqlResult.command}</p>
                  {sqlResult.rows && sqlResult.rows.length > 0 && (
                    <div className={styles.sqlTable}>
                      <table>
                        <thead>
                          <tr>
                            {Array.isArray(sqlResult.rows[0]) ? (
                              sqlResult.rows[0].map((_: any, idx: number) => (
                                <th key={idx}>Column {idx + 1}</th>
                              ))
                            ) : (
                              Object.keys(sqlResult.rows[0]).map((key) => (
                                <th key={key}>{key}</th>
                              ))
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {sqlResult.rows.map((row: any, idx: number) => (
                            <tr key={idx}>
                              {Array.isArray(row) ? (
                                row.map((value: any, valIdx: number) => (
                                  <td key={valIdx}>{String(value ?? 'NULL')}</td>
                                ))
                              ) : (
                                Object.values(row).map((value: any, valIdx: number) => (
                                  <td key={valIdx}>{String(value ?? 'NULL')}</td>
                                ))
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Editor */}
        <div className={styles.backendSection}>
          <h2>{t('backend.fileEditor') || 'Dosya Editörü'}</h2>
          <div className={styles.fileEditor}>
            <div className={styles.fileBrowser}>
              <div className={styles.filePath}>
                <button onClick={navigateUp} disabled={currentDirectory === 'src'}>
                  ↑ {t('backend.upDirectory') || 'Üst Dizin'}
                </button>
                <span>/{currentDirectory}</span>
              </div>
              <div className={styles.fileList}>
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className={`${styles.fileItem} ${styles[file.type]} ${selectedFile?.path === file.path ? styles.selected : ''}`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {file.type === 'directory' ? '📁' : '📄'} {file.name}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.fileContent}>
              {selectedFile ? (
                <>
                  <div className={styles.fileHeader}>
                    <span>{selectedFile.name}</span>
                    <button onClick={handleFileSave} disabled={saving}>
                      {saving ? (t('backend.saving') || 'Kaydediliyor...') : (t('backend.save') || '💾 Kaydet')}
                    </button>
                  </div>
                  {fileLoading ? (
                    <div className={styles.loading}>Dosya yükleniyor...</div>
                  ) : (
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      rows={25}
                      spellCheck={false}
                    />
                  )}
                </>
              ) : (
                <div className={styles.noFile}>{t('backend.selectFile') || 'Dosya seçin'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
