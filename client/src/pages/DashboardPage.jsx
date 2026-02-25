import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { newsletterAPI } from '../api/newsletters';

const DashboardPage = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await newsletterAPI.getAll();
      setNewsletters(response.data);
    } catch (err) {
      setError('Failed to load newsletters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this newsletter?')) {
      return;
    }

    try {
      await newsletterAPI.delete(id);
      setNewsletters(newsletters.filter(n => n._id !== id));
    } catch (err) {
      alert('Failed to delete newsletter');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const response = await newsletterAPI.duplicate(id);
      setNewsletters([response.data.newsletter, ...newsletters]);
    } catch (err) {
      alert('Failed to duplicate newsletter');
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Newsletters</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + Create Newsletter
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading newsletters...</p>
        ) : newsletters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No newsletters yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Create your first newsletter
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {newsletters.map((newsletter) => (
              <div
                key={newsletter._id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3 style={{ marginBottom: '0.5rem' }}>{newsletter.title}</h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  {newsletter.month} {newsletter.year}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                  By {newsletter.createdBy?.email}
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(`/editor/${newsletter._id}`)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(newsletter._id)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(newsletter._id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateNewsletterModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchNewsletters();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

const CreateNewsletterModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await newsletterAPI.create({ title, month, year });
      navigate(`/editor/${response.data.newsletter._id}`);
    } catch (err) {
      alert('Failed to create newsletter');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Create Newsletter</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Month</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="e.g., January"
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
