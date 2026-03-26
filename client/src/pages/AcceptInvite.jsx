// client/src/pages/AcceptInvite.jsx
// Add this route to your App.jsx:
//   <Route path="/accept-invite" element={<AcceptInvite />} />
// This route must be PUBLIC (outside any ProtectedRoute wrapper).

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateInviteToken, acceptInvite } from '../api/invite';

export default function AcceptInvite() {
    const navigate = useNavigate();
    const token = new URLSearchParams(window.location.search).get('token');

    const [email, setEmail] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [tokenLoading, setTokenLoading] = useState(true);

    const [form, setForm] = useState({
        name: '',
        team: '',
        title: '',
        password: '',
        confirmPassword: '',
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!token) {
            setTokenError('Invalid invite link. Please request a new one from your admin.');
            setTokenLoading(false);
            return;
        }

        validateInviteToken(token)
            .then((data) => {
                setEmail(data.email);
                setTokenLoading(false);
            })
            .catch((err) => {
                setTokenError(err.response?.data?.message || 'This invite link is invalid or has expired.');
                setTokenLoading(false);
            });
    }, [token]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        setFormError('');

        if (!form.name.trim()) return setFormError('Name is required.');
        if (form.password.length < 8) return setFormError('Password must be at least 8 characters.');
        if (form.password !== form.confirmPassword) return setFormError('Passwords do not match.');

        setSubmitting(true);
        try {
            await acceptInvite({
                token,
                name: form.name.trim(),
                team: form.team.trim(),
                title: form.title.trim(),
                password: form.password,
            });
            setDone(true);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Loading state ───────────────────────────────────────
    if (tokenLoading) {
        return (
            <div style={styles.page}>
                <p>Validating your invite link...</p>
            </div>
        );
    }

    // ─── Invalid/expired token ───────────────────────────────
    if (tokenError) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h2>Invalid Invite</h2>
                    <p style={{ color: '#6b7280' }}>{tokenError}</p>
                    <p style={{ color: '#6b7280' }}>Please contact your admin to request a new invitation.</p>
                </div>
            </div>
        );
    }

    // ─── Success state ───────────────────────────────────────
    if (done) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h2>Account Created!</h2>
                    <p style={{ color: '#6b7280' }}>Your account has been set up successfully.</p>
                    <button style={styles.btn} onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // ─── Profile setup form ──────────────────────────────────
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2>Set Up Your Account</h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    Invited as <strong>{email}</strong>
                </p>

                {[
                    { label: 'Full Name *', name: 'name', type: 'text', placeholder: 'Jane Smith' },
                    { label: 'Team', name: 'team', type: 'text', placeholder: 'Marketing' },
                    { label: 'Title', name: 'title', type: 'text', placeholder: 'Newsletter Editor' },
                    { label: 'Password *', name: 'password', type: 'password', placeholder: 'Min. 8 characters' },
                    { label: 'Confirm Password *', name: 'confirmPassword', type: 'password', placeholder: 'Re-enter password' },
                ].map(({ label, name, type, placeholder }) => (
                    <div key={name} style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            {label}
                        </label>
                        <input
                            name={name}
                            type={type}
                            placeholder={placeholder}
                            value={form[name]}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                ))}

                {formError && (
                    <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{formError}</p>
                )}

                <button style={styles.btn} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Creating Account...' : 'Create Account'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '2rem',
    },
    card: {
        background: '#fff',
        borderRadius: '10px',
        padding: '2rem',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    },
    input: {
        width: '100%',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        fontSize: '0.9rem',
        boxSizing: 'border-box',
    },
    btn: {
        width: '100%',
        padding: '0.65rem',
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.95rem',
        cursor: 'pointer',
        fontWeight: 600,
    },
};