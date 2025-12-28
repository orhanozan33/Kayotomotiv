import { useState, useEffect, useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'
import { pagesAPI } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import './PagesPage.css'

function PagesPage() {
  const { showError } = useError()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletePageModal, setDeletePageModal] = useState({ isOpen: false, pageId: null })
  const [editingPage, setEditingPage] = useState(null)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    meta_description: '',
    is_active: true
  })

  const loadPages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await pagesAPI.getAll().catch(err => {
        console.error('Error loading pages:', err)
        return { data: { pages: [] } }
      })
      setPages(response.data?.pages || [])
    } catch (error) {
      console.error('Error loading pages:', error)
      setPages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPages()
  }, []) // Empty dependency array - only run once on mount

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPage) {
        await pagesAPI.update(editingPage.id, formData)
      } else {
        await pagesAPI.create(formData)
      }
      // Page saved successfully
      setShowForm(false)
      setEditingPage(null)
      setFormData({ slug: '', title: '', content: '', meta_description: '', is_active: true })
      loadPages()
    } catch (error) {
      showError('Error saving page: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleEdit = (page) => {
    setEditingPage(page)
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content || '',
      meta_description: page.meta_description || '',
      is_active: page.is_active !== false
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setDeletePageModal({ isOpen: true, pageId: id })
  }

  const confirmDeletePage = async () => {
    if (!deletePageModal.pageId) return
    try {
      await pagesAPI.delete(deletePageModal.pageId)
      setDeletePageModal({ isOpen: false, pageId: null })
      loadPages()
    } catch (error) {
      showError('Error deleting page: ' + (error.response?.data?.error || error.message))
      setDeletePageModal({ isOpen: false, pageId: null })
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="pages-page">
      <div className="page-header">
        <h1>Pages Management</h1>
        <button onClick={() => {
          setEditingPage(null)
          setFormData({ slug: '', title: '', content: '', meta_description: '', is_active: true })
          setShowForm(true)
        }} className="btn-primary">Add Page</button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingPage ? 'Edit Page' : 'Add Page'}</h2>
            <form onSubmit={handleSubmit}>
              <input name="slug" placeholder="Slug (e.g., about-us)" value={formData.slug} onChange={handleInputChange} required />
              <input name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
              <input name="meta_description" placeholder="Meta Description" value={formData.meta_description} onChange={handleInputChange} />
              <textarea name="content" placeholder="Content" value={formData.content} onChange={handleInputChange} rows="10" />
              <label>
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                Active
              </label>
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id}>
                <td>{page.slug}</td>
                <td>{page.title}</td>
                <td>{page.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  <button onClick={() => handleEdit(page)}>Edit</button>
                  <button onClick={() => handleDelete(page.id)} className="btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deletePageModal.isOpen}
        onClose={() => setDeletePageModal({ isOpen: false, pageId: null })}
        onConfirm={confirmDeletePage}
        title="Sayfayı Sil"
        message="Bu sayfayı silmek istediğinizden emin misiniz?"
        confirmText="Sil"
        cancelText="İptal"
        type="success"
      />
    </div>
  )
}

export default PagesPage

