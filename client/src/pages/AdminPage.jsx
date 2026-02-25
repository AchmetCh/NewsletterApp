import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { userAPI } from '../api/users';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userAPI.delete(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>User Management</h1>
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
            + Create User
          </button>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                        color: user.role === 'admin' ? '#1e40af' : '#374151'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleDelete(user._id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(newUser) => {
              setUsers([newUser, ...users]);
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.create({ email, password, role });
      onSuccess(response.data.user);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
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
        <h2 style={{ marginBottom: '1.5rem' }}>Create User</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
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
              {loading ? 'Creating...' : 'Create User'}
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

export default AdminPage;
