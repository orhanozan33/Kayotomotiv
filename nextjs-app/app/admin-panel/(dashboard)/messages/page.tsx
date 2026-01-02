'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { contactAPI } from '@/lib/services/adminApi';
import ConfirmModal from '@/components/admin/ConfirmModal';
import styles from './messages.module.css';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  updated_at?: string;
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, messageId: null as string | null });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMessages();
  }, [statusFilter, searchTerm]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const response = await contactAPI.getMessages(params);
      setMessages(response.data.messages || []);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      showError(t('adminMessages.errors.loading') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      await contactAPI.updateStatus(messageId, newStatus);
      showSuccess(t('adminMessages.statusUpdated'));
      loadMessages();
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus as any });
      }
    } catch (error: any) {
      showError(t('adminMessages.errors.updating') + ': ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.messageId) return;
    try {
      await contactAPI.deleteMessage(deleteModal.messageId);
      showSuccess(t('adminMessages.deletedSuccessfully'));
      setDeleteModal({ isOpen: false, messageId: null });
      loadMessages();
      if (selectedMessage && selectedMessage.id === deleteModal.messageId) {
        setShowDetailModal(false);
        setSelectedMessage(null);
      }
    } catch (error: any) {
      showError(t('adminMessages.errors.deleting') + ': ' + (error.response?.data?.error || error.message));
    }
  };

  const openDetailModal = async (message: Message) => {
    try {
      if (message.status === 'unread') {
        await contactAPI.updateStatus(message.id, 'read');
        message.status = 'read';
      }
      setSelectedMessage(message);
      setShowDetailModal(true);
      loadMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      setSelectedMessage(message);
      setShowDetailModal(true);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      unread: { label: t('adminMessages.unread'), class: styles.badgeUnread },
      read: { label: t('adminMessages.read'), class: styles.badgeRead },
      replied: { label: t('adminMessages.replied'), class: styles.badgeReplied }
    };
    return badges[status] || badges.unread;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  return (
    <div className={styles.messagesPage}>
      <div className={styles.pageHeader}>
        <h1>{t('adminMessages.title')}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px', marginLeft: '2rem' }}>
          <input
            type="text"
            placeholder={t('adminMessages.search') || 'Gönderen, konu veya mesaj ile ara...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              flex: 1,
            }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
            <option value="all">{t('adminMessages.all')} ({total})</option>
            <option value="unread">{t('adminMessages.unread')}</option>
            <option value="read">{t('adminMessages.read')}</option>
            <option value="replied">{t('adminMessages.replied')}</option>
          </select>
        </div>
      </div>

      <div className={styles.messagesTable}>
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: '150px' }}>{t('adminMessages.sender')}</th>
              <th style={{ minWidth: '200px' }}>{t('adminMessages.subject')}</th>
              <th style={{ minWidth: '100px' }}>{t('adminMessages.status')}</th>
              <th style={{ minWidth: '150px' }}>{t('adminMessages.date')}</th>
              <th style={{ minWidth: '150px' }}>{t('adminMessages.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  {t('adminMessages.noMessages')}
                </td>
              </tr>
            ) : (
              messages.map((message) => {
                const badge = getStatusBadge(message.status);
                return (
                  <tr key={message.id} className={message.status === 'unread' ? styles.unreadRow : ''}>
                    <td>{message.name}</td>
                    <td>{message.subject || '-'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${badge.class}`}>{badge.label}</span>
                    </td>
                    <td>{formatDate(message.created_at)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button onClick={() => openDetailModal(message)} className={styles.btnView}>{t('adminMessages.view')}</button>
                        <button onClick={() => setDeleteModal({ isOpen: true, messageId: message.id })} className={styles.btnDelete}>{t('adminMessages.delete')}</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showDetailModal && selectedMessage && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{t('adminMessages.messageDetail')}</h2>
              <button onClick={() => setShowDetailModal(false)} className={styles.closeBtn}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <label>{t('adminMessages.name') || 'İsim'}:</label>
                <span>{selectedMessage.name}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('adminMessages.email') || 'E-posta'}:</label>
                <span>{selectedMessage.email}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('adminMessages.phone') || 'Telefon'}:</label>
                <span>{selectedMessage.phone || '-'}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('adminMessages.subject') || 'Konu'}:</label>
                <span>{selectedMessage.subject || '-'}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('adminMessages.status') || 'Durum'}:</label>
                <span className={`${styles.statusBadge} ${getStatusBadge(selectedMessage.status).class}`}>
                  {getStatusBadge(selectedMessage.status).label}
                </span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('adminMessages.date') || 'Tarih'}:</label>
                <span>{formatDate(selectedMessage.created_at)}</span>
              </div>
              {selectedMessage.updated_at && selectedMessage.updated_at !== selectedMessage.created_at && (
                <div className={styles.detailRow}>
                  <label>{t('adminMessages.updatedAt') || 'Güncellenme Tarihi'}:</label>
                  <span>{formatDate(selectedMessage.updated_at)}</span>
                </div>
              )}
              <div className={`${styles.detailRow} ${styles.fullWidth}`}>
                <label>{t('adminMessages.message') || 'Mesaj'}:</label>
                <div className={styles.messageContent}>{selectedMessage.message}</div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <select
                value={selectedMessage.status}
                onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value)}
                className={styles.statusSelect}
              >
                <option value="unread">{t('adminMessages.unread') || 'Okunmadı'}</option>
                <option value="read">{t('adminMessages.read') || 'Okundu'}</option>
                <option value="replied">{t('adminMessages.replied') || 'Yanıtlandı'}</option>
              </select>
              <button onClick={() => setDeleteModal({ isOpen: true, messageId: selectedMessage.id })} className={styles.btnDelete}>
                {t('adminMessages.delete') || 'Sil'}
              </button>
              <button onClick={() => setShowDetailModal(false)} className={styles.btnSecondary}>{t('adminMessages.close') || 'Kapat'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, messageId: null })}
        onConfirm={handleDelete}
        title={t('adminMessages.deleteTitle') || 'Mesajı Sil'}
        message={t('adminMessages.confirmDelete') || 'Bu mesajı silmek istediğinizden emin misiniz?'}
      />
    </div>
  );
}
