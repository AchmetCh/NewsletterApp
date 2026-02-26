import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 'bold' }}>
            Newsletter Builder
          </Link>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
            Dashboard
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
              Admin
            </Link>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#1e40af',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
