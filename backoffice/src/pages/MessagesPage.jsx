import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { contactAPI } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import './MessagesPage.css'

function MessagesPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, messageId: null })
  const [statusFilter, setStatusFilter] = useState('all')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadMessages()
  }, [statusFilter])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const response = await contactAPI.getMessages(params)
      setMessages(response.data.messages)
      setTotal(response.data.total)
    } catch (error) {
      showError('Mesajlar yüklenirken hata oluştu: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await contactAPI.updateStatus(messageId, newStatus)
      showSuccess('Mesaj durumu güncellendi')
      loadMessages()
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus })
      }
    } catch (error) {
      showError('Durum güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleDelete = async () => {
    try {
      await contactAPI.deleteMessage(deleteModal.messageId)
      showSuccess('Mesaj silindi')
      setDeleteModal({ isOpen: false, messageId: null })
      loadMessages()
      if (selectedMessage && selectedMessage.id === deleteModal.messageId) {
        setShowDetailModal(false)
        setSelectedMessage(null)
      }
    } catch (error) {
      showError('Mesaj silinirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const openDetailModal = async (message) => {
    try {
      if (message.status === 'unread') {
        await contactAPI.updateStatus(message.id, 'read')
        message.status = 'read'
      }
      setSelectedMessage(message)
      setShowDetailModal(true)
      loadMessages()
    } catch (error) {
      console.error('Error updating message status:', error)
      setSelectedMessage(message)
      setShowDetailModal(true)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      unread: { label: 'Okunmadı', class: 'badge-unread' },
      read: { label: 'Okundu', class: 'badge-read' },
      replied: { label: 'Yanıtlandı', class: 'badge-replied' }
    }
    return badges[status] || badges.unread
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>
  }

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>İletişim Mesajları</h1>
        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">Tümü ({total})</option>
            <option value="unread">Okunmadı</option>
            <option value="read">Okundu</option>
            <option value="replied">Yanıtlandı</option>
          </select>
        </div>
      </div>

      <div className="messages-table">
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: '150px' }}>Gönderen</th>
              <th style={{ minWidth: '200px' }}>Konu</th>
              <th style={{ minWidth: '100px' }}>Durum</th>
              <th style={{ minWidth: '150px' }}>Tarih</th>
              <th style={{ minWidth: '150px' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  Mesaj bulunamadı
                </td>
              </tr>
            ) : (
              messages.map((message) => {
                const badge = getStatusBadge(message.status)
                return (
                  <tr key={message.id} className={message.status === 'unread' ? 'unread-row' : ''}>
                    <td>{message.name}</td>
                    <td>{message.subject || '-'}</td>
                    <td>
                      <span className={`status-badge ${badge.class}`}>{badge.label}</span>
                    </td>
                    <td>{formatDate(message.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => openDetailModal(message)} className="btn-view">Görüntüle</button>
                        <button onClick={() => setDeleteModal({ isOpen: true, messageId: message.id })} className="btn-delete">Sil</button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showDetailModal && selectedMessage && (
        <div className="modal">
          <div className="modal-content message-detail-modal">
            <div className="modal-header">
              <h2>Mesaj Detayı</h2>
              <button onClick={() => setShowDetailModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Gönderen:</label>
                <span>{selectedMessage.name}</span>
              </div>
              <div className="detail-row">
                <label>E-posta:</label>
                <span>{selectedMessage.email}</span>
              </div>
              <div className="detail-row">
                <label>Telefon:</label>
                <span>{selectedMessage.phone || '-'}</span>
              </div>
              <div className="detail-row">
                <label>Konu:</label>
                <span>{selectedMessage.subject || '-'}</span>
              </div>
              <div className="detail-row">
                <label>Durum:</label>
                <span className={`status-badge ${getStatusBadge(selectedMessage.status).class}`}>
                  {getStatusBadge(selectedMessage.status).label}
                </span>
              </div>
              <div className="detail-row">
                <label>Tarih:</label>
                <span>{formatDate(selectedMessage.created_at)}</span>
              </div>
              {selectedMessage.updated_at && selectedMessage.updated_at !== selectedMessage.created_at && (
                <div className="detail-row">
                  <label>Güncellenme Tarihi:</label>
                  <span>{formatDate(selectedMessage.updated_at)}</span>
                </div>
              )}
              <div className="detail-row full-width">
                <label>Mesaj İçeriği:</label>
                <div className="message-content">{selectedMessage.message}</div>
              </div>
            </div>
            <div className="modal-footer">
              <select
                value={selectedMessage.status}
                onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value)}
                className="status-select"
              >
                <option value="unread">Okunmadı</option>
                <option value="read">Okundu</option>
                <option value="replied">Yanıtlandı</option>
              </select>
              <button onClick={() => setDeleteModal({ isOpen: true, messageId: selectedMessage.id })} className="btn-delete">
                Sil
              </button>
              <button onClick={() => setShowDetailModal(false)} className="btn-secondary">Kapat</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, messageId: null })}
        onConfirm={handleDelete}
        title="Mesajı Sil"
        message="Bu mesajı silmek istediğinize emin misiniz?"
      />
    </div>
  )
}

export default MessagesPage

