import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/auth';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setMessage(response.data?.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process your request right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot password</h1>
        <p style={styles.subtitle}>Enter your email and we will send you a reset link.</p>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="you@example.com"
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>

        <div style={styles.footerRow}>
          <Link to="/login" style={styles.link}>Back to login</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '1rem'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    padding: '2rem'
  },
  title: {
    margin: 0,
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#4b5563'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#111827'
  },
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.7rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  error: {
    marginBottom: '1rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '6px'
  },
  success: {
    marginBottom: '1rem',
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.75rem',
    borderRadius: '6px'
  },
  footerRow: {
    marginTop: '1rem',
    textAlign: 'center'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none'
  }
};

export default ForgotPasswordPage;
