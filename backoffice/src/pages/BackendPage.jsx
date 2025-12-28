import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { backendAPI } from '../services/api'
import './BackendPage.css'

function BackendPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // SQL Editor states
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;')
  const [sqlResult, setSqlResult] = useState(null)
  const [sqlLoading, setSqlLoading] = useState(false)
  
  // File Editor states
  const [currentDirectory, setCurrentDirectory] = useState('src')
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan authentication durumunu kontrol et
    const backendAuth = localStorage.getItem('backendAuth')
    if (backendAuth === 'true') {
      setIsAuthenticated(true)
      loadFiles()
    }
  }, [])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await backendAPI.verifyPassword(password)
      if (response.data.success) {
        setIsAuthenticated(true)
        localStorage.setItem('backendAuth', 'true')
        showSuccess(t('backend.loginSuccess') || 'Başarıyla giriş yapıldı')
        loadFiles()
      }
    } catch (error) {
      showError(error.response?.data?.error || (t('backend.invalidPassword') || 'Geçersiz şifre'))
    } finally {
      setLoading(false)
    }
  }

  const handleSQLExecute = async () => {
    if (!sqlQuery.trim()) {
      showError('SQL sorgusu boş olamaz')
      return
    }
    
    setSqlLoading(true)
    setSqlResult(null)
    try {
      const response = await backendAPI.executeSQL(sqlQuery)
      setSqlResult(response.data)
      showSuccess('SQL sorgusu başarıyla çalıştırıldı')
    } catch (error) {
      setSqlResult({
        error: true,
        message: error.response?.data?.message || error.response?.data?.error || 'SQL hatası oluştu',
        detail: error.response?.data?.detail
      })
      showError('SQL sorgusu çalıştırılamadı')
    } finally {
      setSqlLoading(false)
    }
  }

  const loadFiles = async () => {
    try {
      const response = await backendAPI.getFiles(currentDirectory)
      setFiles(response.data.files)
    } catch (error) {
      showError(error.response?.data?.error || (t('backend.errors.loadingFiles') || 'Dosyalar yüklenemedi'))
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles()
    }
  }, [currentDirectory, isAuthenticated])

  const handleFileSelect = async (file) => {
    if (file.type === 'directory') {
      setCurrentDirectory(file.path)
      setSelectedFile(null)
      setFileContent('')
      return
    }

    setSelectedFile(file)
    setFileLoading(true)
    try {
      const response = await backendAPI.readFile(file.path)
      setFileContent(response.data.content)
    } catch (error) {
      showError(error.response?.data?.error || (t('backend.errors.readingFile') || 'Dosya okunamadı'))
      setFileContent('')
    } finally {
      setFileLoading(false)
    }
  }

  const handleFileSave = async () => {
    if (!selectedFile) {
      showError(t('backend.errors.noFileSelected') || 'Kaydedilecek dosya seçilmedi')
      return
    }

    setSaving(true)
    try {
      await backendAPI.writeFile(selectedFile.path, fileContent)
      showSuccess(t('backend.fileSaved') || 'Dosya başarıyla kaydedildi')
    } catch (error) {
      showError(error.response?.data?.error || (t('backend.errors.savingFile') || 'Dosya kaydedilemedi'))
    } finally {
      setSaving(false)
    }
  }

  const navigateUp = () => {
    const parts = currentDirectory.split('/').filter(p => p)
    if (parts.length > 0) {
      parts.pop()
      setCurrentDirectory(parts.length > 0 ? parts.join('/') : 'src')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="backend-page">
        <div className="backend-auth-modal">
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
    )
  }

  return (
    <div className="backend-page">
      <div className="backend-header">
        <h1>{t('backend.management') || 'Backend Yönetimi'}</h1>
        <button 
          className="logout-btn"
          onClick={() => {
            setIsAuthenticated(false)
            localStorage.removeItem('backendAuth')
          }}
        >
          {t('backend.logout') || 'Çıkış'}
        </button>
      </div>

      <div className="backend-content">
        {/* SQL Editor */}
        <div className="backend-section">
          <h2>{t('backend.sqlEditor') || 'SQL Editörü'}</h2>
          <div className="sql-editor">
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
            <div className={`sql-result ${sqlResult.error ? 'error' : ''}`}>
              {sqlResult.error ? (
                <div>
                  <h3>{t('backend.error') || 'Hata'}:</h3>
                  <p>{sqlResult.message}</p>
                  {sqlResult.detail && <p className="detail">{sqlResult.detail}</p>}
                </div>
              ) : (
                <div>
                  <h3>{t('backend.result') || 'Sonuç'}:</h3>
                  <p>{t('backend.rowCount') || 'Satır sayısı'}: {sqlResult.rowCount}</p>
                  <p>{t('backend.command') || 'Komut'}: {sqlResult.command}</p>
                  {sqlResult.rows && sqlResult.rows.length > 0 && (
                    <div className="sql-table">
                      <table>
                        <thead>
                          <tr>
                            {Object.keys(sqlResult.rows[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sqlResult.rows.map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((value, valIdx) => (
                                <td key={valIdx}>{String(value ?? 'NULL')}</td>
                              ))}
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
        <div className="backend-section">
          <h2>{t('backend.fileEditor') || 'Dosya Editörü'}</h2>
          <div className="file-editor">
            <div className="file-browser">
              <div className="file-path">
                <button onClick={navigateUp} disabled={currentDirectory === 'src'}>
                  ↑ {t('backend.upDirectory') || 'Üst Dizin'}
                </button>
                <span>/{currentDirectory}</span>
              </div>
              <div className="file-list">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className={`file-item ${file.type} ${selectedFile?.path === file.path ? 'selected' : ''}`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {file.type === 'directory' ? '📁' : '📄'} {file.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="file-content">
              {selectedFile ? (
                <>
                  <div className="file-header">
                    <span>{selectedFile.name}</span>
                    <button onClick={handleFileSave} disabled={saving}>
                      {saving ? (t('backend.saving') || 'Kaydediliyor...') : (t('backend.save') || '💾 Kaydet')}
                    </button>
                  </div>
                  {fileLoading ? (
                    <div className="loading">Dosya yükleniyor...</div>
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
                <div className="no-file">{t('backend.selectFile') || 'Dosya seçin'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackendPage

