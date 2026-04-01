// client/src/components/InvitePanel.jsx
// Drop this into your existing /admin page where user management lives.
// It handles the invite form + invite list table in one self-contained component.

import { useState, useEffect } from 'react';
import { sendInvite, fetchInvites, revokeInvite } from '../api/invite';

export default function InvitePanel() {
    const [email, setEmail] = useState('');
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadInvites();
    }, []);

    const loadInvites = async () => {
        try {
            const data = await fetchInvites();
            setInvites(data);
        } catch (err) {
            console.error('Failed to load invites:', err.response?.data?.message || err.message);
        }
    };

    const handleInvite = async () => {
        setError('');
        setSuccess('');

        if (!email.trim()) return setError('Please enter an email address.');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return setError('Please enter a valid email address.');

        setLoading(true);
        try {
            await sendInvite(email.trim());
            setSuccess(`Invite sent to ${email.trim()}`);
            setEmail('');
            loadInvites();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send invite.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (inviteId) => {
        if (!window.confirm('Revoke this invite?')) return;
        try {
            await revokeInvite(inviteId);
            loadInvites();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to revoke invite.');
        }
    };

    const getStatus = (invite) => {
        if (invite.used) return { label: 'Accepted', color: '#16a34a' };
        if (new Date(invite.expiresAt) < new Date()) return { label: 'Expired', color: '#6b7280' };
        return { label: 'Pending', color: '#d97706' };
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2>Invite a User</h2>

            {/* Invite form */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                    type="email"
                    placeholder="editor@keelworks.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                    disabled={loading}
                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
                <button
                    onClick={handleInvite}
                    disabled={loading}
                    style={{
                        padding: '0.5rem 1.25rem',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? 'Sending...' : 'Send Invite'}
                </button>
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
            {success && <p style={{ color: '#16a34a', fontSize: '0.875rem' }}>{success}</p>}

            {/* Invites table */}
            <h3 style={{ marginTop: '1.5rem' }}>Invitations</h3>
            {invites.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No invites sent yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem' }}>Email</th>
                            <th style={{ padding: '0.5rem' }}>Status</th>
                            <th style={{ padding: '0.5rem' }}>Sent</th>
                            <th style={{ padding: '0.5rem' }}>Expires</th>
                            <th style={{ padding: '0.5rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invites.map((invite) => {
                            const status = getStatus(invite);
                            const isPending = status.label === 'Pending';
                            return (
                                <tr key={invite._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '0.5rem' }}>{invite.email}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{
                                            color: status.color,
                                            fontWeight: 500,
                                            fontSize: '0.8rem',
                                        }}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {new Date(invite.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {new Date(invite.expiresAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {isPending && (
                                            <button
                                                onClick={() => handleRevoke(invite._id)}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'transparent',
                                                    color: '#dc2626',
                                                    border: '1px solid #dc2626',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                }}
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}