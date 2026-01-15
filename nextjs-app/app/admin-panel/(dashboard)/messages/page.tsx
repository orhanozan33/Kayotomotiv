'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { contactAPI, sellCarAPI } from '@/lib/services/adminApi';
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

interface SellCarSubmission {
  id: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  images: string; // JSON string
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  updated_at?: string;
}

type TabType = 'contact' | 'sellCar';

export default function MessagesPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [activeTab, setActiveTab] = useState<TabType>('contact');
  const [messages, setMessages] = useState<Message[]>([]);
  const [submissions, setSubmissions] = useState<SellCarSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SellCarSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as string | null, type: 'contact' as 'contact' | 'sellCar' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    if (activeTab === 'contact') {
      loadMessages();
    } else {
      loadSubmissions();
    }
  }, [statusFilter, searchTerm, activeTab]);

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

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const response = await sellCarAPI.getSubmissions(params);
      setSubmissions(response.data.submissions || []);
      setTotalSubmissions(response.data.total || 0);
    } catch (error: any) {
      showError(t('adminMessages.errors.loading') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (activeTab === 'contact') {
        await contactAPI.updateStatus(id, newStatus);
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status: newStatus as any });
        }
      } else {
        await sellCarAPI.updateStatus(id, newStatus);
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status: newStatus as any });
        }
      }
      showSuccess(t('adminMessages.statusUpdated'));
      if (activeTab === 'contact') {
        loadMessages();
      } else {
        loadSubmissions();
      }
    } catch (error: any) {
      showError(t('adminMessages.errors.updating') + ': ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      if (deleteModal.type === 'contact') {
        await contactAPI.deleteMessage(deleteModal.id);
        if (selectedMessage && selectedMessage.id === deleteModal.id) {
          setShowDetailModal(false);
          setSelectedMessage(null);
        }
        loadMessages();
      } else {
        await sellCarAPI.deleteSubmission(deleteModal.id);
        if (selectedSubmission && selectedSubmission.id === deleteModal.id) {
          setShowDetailModal(false);
          setSelectedSubmission(null);
        }
        loadSubmissions();
      }
      showSuccess(t('adminMessages.deletedSuccessfully'));
      setDeleteModal({ isOpen: false, id: null, type: 'contact' });
    } catch (error: any) {
      showError(t('adminMessages.errors.deleting') + ': ' + (error.response?.data?.error || error.message));
    }
  };

  const openDetailModal = async (item: Message | SellCarSubmission) => {
    try {
      if (activeTab === 'contact') {
        const message = item as Message;
        if (message.status === 'unread') {
          await contactAPI.updateStatus(message.id, 'read');
          message.status = 'read';
        }
        setSelectedMessage(message);
        setShowDetailModal(true);
        loadMessages();
      } else {
        const submission = item as SellCarSubmission;
        if (submission.status === 'unread') {
          await sellCarAPI.updateStatus(submission.id, 'read');
          submission.status = 'read';
        }
        setSelectedSubmission(submission);
        setShowDetailModal(true);
        loadSubmissions();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      if (activeTab === 'contact') {
        setSelectedMessage(item as Message);
      } else {
        setSelectedSubmission(item as SellCarSubmission);
      }
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

  const parseImages = (imagesJson: string): string[] => {
    try {
      return JSON.parse(imagesJson || '[]');
    } catch {
      return [];
    }
  };

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  return (
    <div className={styles.messagesPage}>
      <div className={styles.pageHeader}>
        <h1>{t('adminMessages.title') || 'Mesajlar'}</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'contact' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            {t('adminMessages.contactMessages') || 'İletişim Mesajları'} ({total})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'sellCar' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('sellCar')}
          >
            {t('adminMessages.sellCarSubmissions') || 'Araç Satış Talepleri'} ({totalSubmissions})
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px', marginLeft: '2rem' }}>
          <input
            type="text"
            placeholder={t('adminMessages.search') || 'Ara...'}
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
            <option value="all">{t('adminMessages.all')} ({activeTab === 'contact' ? total : totalSubmissions})</option>
            <option value="unread">{t('adminMessages.unread')}</option>
            <option value="read">{t('adminMessages.read')}</option>
            <option value="replied">{t('adminMessages.replied')}</option>
          </select>
        </div>
      </div>

      {activeTab === 'contact' ? (
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
                          <button onClick={() => setDeleteModal({ isOpen: true, id: message.id, type: 'contact' })} className={styles.btnDelete}>{t('adminMessages.delete')}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.messagesTable}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>{t('adminMessages.customerName') || 'Müşteri'}</th>
                <th style={{ minWidth: '150px' }}>{t('adminMessages.vehicle') || 'Araç'}</th>
                <th style={{ minWidth: '100px' }}>{t('adminMessages.year') || 'Yıl'}</th>
                <th style={{ minWidth: '100px' }}>{t('adminMessages.status')}</th>
                <th style={{ minWidth: '150px' }}>{t('adminMessages.date')}</th>
                <th style={{ minWidth: '150px' }}>{t('adminMessages.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('adminMessages.noSubmissions') || 'Araç satış talebi bulunamadı'}
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const badge = getStatusBadge(submission.status);
                  return (
                    <tr key={submission.id} className={submission.status === 'unread' ? styles.unreadRow : ''}>
                      <td>{submission.customer_name}</td>
                      <td>{submission.brand} {submission.model}</td>
                      <td>{submission.year}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${badge.class}`}>{badge.label}</span>
                      </td>
                      <td>{formatDate(submission.created_at)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button onClick={() => openDetailModal(submission)} className={styles.btnView}>{t('adminMessages.view')}</button>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: submission.id, type: 'sellCar' })} className={styles.btnDelete}>{t('adminMessages.delete')}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetailModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{activeTab === 'contact' ? t('adminMessages.messageDetail') : (t('adminMessages.submissionDetail') || 'Araç Satış Talebi Detayı')}</h2>
              <button onClick={() => setShowDetailModal(false)} className={styles.closeBtn}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              {activeTab === 'contact' && selectedMessage ? (
                <>
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
                  <div className={`${styles.detailRow} ${styles.fullWidth}`}>
                    <label>{t('adminMessages.message') || 'Mesaj'}:</label>
                    <div className={styles.messageContent}>{selectedMessage.message}</div>
                  </div>
                </>
              ) : selectedSubmission ? (
                <>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.customerName') || 'Müşteri Adı'}:</label>
                    <span>{selectedSubmission.customer_name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.email') || 'E-posta'}:</label>
                    <span>{selectedSubmission.customer_email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.phone') || 'Telefon'}:</label>
                    <span>{selectedSubmission.customer_phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.brand') || 'Marka'}:</label>
                    <span>{selectedSubmission.brand}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.model') || 'Model'}:</label>
                    <span>{selectedSubmission.model}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.year') || 'Yıl'}:</label>
                    <span>{selectedSubmission.year}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.transmission') || 'Vites'}:</label>
                    <span>{selectedSubmission.transmission}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.fuelType') || 'Yakıt Türü'}:</label>
                    <span>{selectedSubmission.fuel_type}</span>
                  </div>
                  {selectedSubmission.notes && (
                    <div className={`${styles.detailRow} ${styles.fullWidth}`}>
                      <label>{t('adminMessages.notes') || 'Notlar'}:</label>
                      <div className={styles.messageContent}>{selectedSubmission.notes}</div>
                    </div>
                  )}
                  {parseImages(selectedSubmission.images).length > 0 && (
                    <div className={`${styles.detailRow} ${styles.fullWidth}`}>
                      <label>{t('adminMessages.images') || 'Resimler'}:</label>
                      <div className={styles.imagesGrid}>
                        {parseImages(selectedSubmission.images).map((imageUrl, index) => (
                          <img key={index} src={imageUrl} alt={`Vehicle ${index + 1}`} className={styles.vehicleImage} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.status') || 'Durum'}:</label>
                    <span className={`${styles.statusBadge} ${getStatusBadge(selectedSubmission.status).class}`}>
                      {getStatusBadge(selectedSubmission.status).label}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <label>{t('adminMessages.date') || 'Tarih'}:</label>
                    <span>{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                </>
              ) : null}
            </div>
            <div className={styles.modalFooter}>
              {(activeTab === 'contact' ? selectedMessage : selectedSubmission) && (
                <select
                  value={activeTab === 'contact' ? selectedMessage?.status : selectedSubmission?.status}
                  onChange={(e) => handleStatusChange((activeTab === 'contact' ? selectedMessage : selectedSubmission)!.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="unread">{t('adminMessages.unread') || 'Okunmadı'}</option>
                  <option value="read">{t('adminMessages.read') || 'Okundu'}</option>
                  <option value="replied">{t('adminMessages.replied') || 'Yanıtlandı'}</option>
                </select>
              )}
              <button onClick={() => setDeleteModal({ isOpen: true, id: (activeTab === 'contact' ? selectedMessage : selectedSubmission)!.id, type: activeTab })} className={styles.btnDelete}>
                {t('adminMessages.delete') || 'Sil'}
              </button>
              <button onClick={() => setShowDetailModal(false)} className={styles.btnSecondary}>{t('adminMessages.close') || 'Kapat'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: 'contact' })}
        onConfirm={handleDelete}
        title={t('adminMessages.deleteTitle') || 'Sil'}
        message={t('adminMessages.confirmDelete') || 'Bu öğeyi silmek istediğinizden emin misiniz?'}
      />
    </div>
  );
}
