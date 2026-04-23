// client/src/pages/AcceptInvite.jsx
// Public route — add to App.jsx outside ProtectedRoute:
//   <Route path="/accept-invite" element={<AcceptInvite />} />

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateInviteToken, acceptInvite } from '../api/invite';
import kwLogo from '../../assets/kw_logo.png';

export default function AcceptInvite() {
    const navigate = useNavigate();
    const token = new URLSearchParams(window.location.search).get('token');

    const [email, setEmail] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [tokenLoading, setTokenLoading] = useState(true);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setTokenError('Invalid invite link. Please request a new one from your admin.');
            setTokenLoading(false);
            return;
        }
        validateInviteToken(token)
            .then(data => { setEmail(data.email); setTokenLoading(false); })
            .catch(err => {
                setTokenError(err.response?.data?.message || 'This invite link is invalid or has expired.');
                setTokenLoading(false);
            });
    }, [token]);

    const validate = () => {
        const e = {};
        if (password.length < 8)
            e.password = 'Password must be at least 8 characters.';
        if (password !== confirmPassword)
            e.confirmPassword = 'Passwords do not match.';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setSubmitting(true);
        try {
            await acceptInvite({ token, password });
            setDone(true);
        } catch (err) {
            setErrors({ password: err.response?.data?.message || 'Failed to set password. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ───────────────────────────────────────────────
    if (tokenLoading) {
        return (
            <div style={s.page}>
                <p style={{ color: '#6B7280' }}>Validating your invite link...</p>
            </div>
        );
    }

    // ── Invalid / expired token ───────────────────────────────
    if (tokenError) {
        return (
            <div style={s.page}>
                <div style={s.card}>
                    <h2 style={s.title}>Invalid Invite</h2>
                    <p style={s.subtitle}>{tokenError}</p>
                    <p style={s.subtitle}>Please contact your admin to request a new invitation.</p>
                </div>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────
    if (done) {
        return (
            <div style={s.page}>
                <div style={s.card}>
                    <div style={s.successIcon}>✓</div>
                    <h2 style={s.title}>You're all set!</h2>
                    <p style={s.subtitle}>
                        Your password has been set. You can now log in with <strong>{email}</strong>.
                    </p>
                    <button style={s.btn} onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // ── Password setup form ───────────────────────────────────
    return (
        <div style={s.page}>
            <div style={s.card}>

                {/* Logo */}
                <div style={s.logoRow}>
                    <img src={kwLogo} alt="KeelWorks logo" style={s.logoMark} />
                    <div style={s.logoText}>
                        <div style={s.logoName}>KeelWorks</div>
                        <div style={s.logoSub}>Newsletter App</div>
                    </div>
                </div>

                <h2 style={s.title}>Set your password</h2>
                <p style={s.subtitle}>
                    You've been invited as <strong>{email}</strong>.<br />
                    Set a password to activate your account.
                </p>

                {/* Password */}
                <div style={s.field}>
                    <label style={s.label}>Password</label>
                    <input
                        type="password"
                        autoFocus
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                        }}
                        style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
                    />
                    {errors.password && <p style={s.fieldError}>{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div style={s.field}>
                    <label style={s.label}>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={e => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={{ ...s.input, ...(errors.confirmPassword ? s.inputError : {}) }}
                    />
                    {errors.confirmPassword && <p style={s.fieldError}>{errors.confirmPassword}</p>}
                </div>

                <button style={{ ...s.btn, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Setting password...' : 'Activate Account'}
                </button>
            </div>
        </div>
    );
}

const s = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F7F7',
        padding: '2rem',
        fontFamily: "'Lato', 'Segoe UI', sans-serif",
    },
    card: {
        background: '#fff',
        borderRadius: '12px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.35rem',
    },
    logoMark: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        objectFit: 'contain',
        objectPosition: 'center',
        display: 'block',
        flexShrink: 0,
    },
    logoText: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: '8px',
    },
    logoName: {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
        fontSize: '1rem',
        color: '#00929C',
        lineHeight: 1.2,
    },
    logoSub: {
        fontFamily: "'Raleway', sans-serif",
        fontSize: '0.72rem',
        color: '#825E8B',
        lineHeight: 1.2,
    },
    title: {
        fontSize: '1.3rem',
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 0.4rem',
    },
    subtitle: {
        fontSize: '0.875rem',
        color: '#6B7280',
        margin: '0 0 1.5rem',
        lineHeight: 1.5,
    },
    field: {
        marginBottom: '1.1rem',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.35rem',
    },
    input: {
        width: '100%',
        padding: '0.6rem 0.75rem',
        borderRadius: '8px',
        border: '1.5px solid #D1D5DB',
        fontSize: '0.9rem',
        boxSizing: 'border-box',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s',
    },
    inputError: {
        borderColor: '#DC2626',
    },
    fieldError: {
        color: '#DC2626',
        fontSize: '0.8rem',
        margin: '0.3rem 0 0',
    },
    btn: {
        width: '100%',
        padding: '0.7rem',
        background: '#00929C',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.95rem',
        cursor: 'pointer',
        fontWeight: 600,
        fontFamily: 'inherit',
        marginTop: '0.5rem',
        transition: 'background 0.15s',
    },
    successIcon: {
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: '#ECFDF5',
        color: '#059669',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 700,
        margin: '0 auto 1.25rem',
    },
};