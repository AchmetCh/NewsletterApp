import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../api/users';
import { sendInvite, fetchInvites, revokeInvite, resendInvite } from '../../api/invite';
import styles from './AdminPage.module.css';
import logo from '../../../assets/kw_logo.png';
import usersIllustration from '../../../assets/users_invite_illustration_transparent.png';

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalizeStatus = (user) => {
  if (user.status) return user.status.charAt(0).toUpperCase() + user.status.slice(1);
  return 'Active';
};

const mergeUsersAndInvites = (users, invites) => {
  const inviteNameByEmail = new Map(
    invites.map(inv => [
      String(inv.email || '').toLowerCase(),
      typeof inv.name === 'string' ? inv.name.trim() : '',
    ]),
  );

  const rows = users.map(u => ({
    _id: u._id,
    name:
      (typeof u.name === 'string' && u.name.trim()) ||
      inviteNameByEmail.get(String(u.email || '').toLowerCase()) ||
      '—',
    email: u.email,
    role: u.role === 'admin' ? 'Admin' : 'Editor',
    status: normalizeStatus(u),
    isUser: true,
  }));

  invites.forEach(inv => {
    // Accepted/used invites represent already-created accounts and should not
    // appear as standalone rows in the users table.
    if (inv.used) return;

    if (rows.find(r => r.email === inv.email)) return;
    let status = 'Pending';
    if (new Date(inv.expiresAt) < new Date()) status = 'Expired';
    rows.push({
      _id: inv._id,
      name: inv.name || '—',
      email: inv.email,
      role: 'Editor',
      status,
      isUser: false,
      inviteId: inv._id,
    });
  });

  return rows;
};

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [filter, setFilter] = useState('All');
  const [pageSize, setPageSize] = useState(6);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, invitesRes] = await Promise.all([
        userAPI.getAll(),
        fetchInvites(),
      ]);
      setUsers(usersRes.data);
      setInvites(invitesRes);
    } catch (err) {
      console.error('Failed to load users/invites', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userAPI.delete(userId);
      setOpenMenuId(null);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRevoke = async (inviteId) => {
    if (!window.confirm('Revoke this invite?')) return;
    try {
      await revokeInvite(inviteId);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke invite');
    }
  };

  const handleResend = async (inviteId) => {
    try {
      await resendInvite(inviteId);
      alert('Invite resent successfully.');
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend invite');
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setEditForm({ name: row.name === '—' ? '' : row.name, email: row.email, role: row.role });
    setOpenMenuId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', email: '', role: '' });
  };

  const saveEdit = async () => {
    try {
      await userAPI.update(editingId, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role.toLowerCase(),
      });
      setEditingId(null);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const rows = mergeUsersAndInvites(users, invites);
  const filtered = filter === 'All' ? rows : rows.filter(r => r.status === filter);
  const safePageSize = pageSize > 0 ? pageSize : 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / safePageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * safePageSize;
  const displayed = filtered.slice(startIndex, startIndex + safePageSize);
  const isEmpty = rows.length === 0;

  // Reset to page 1 when filter or pageSize changes
  useEffect(() => { setCurrentPage(1); }, [filter, pageSize]);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (safePage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
  };

  const sidebarClass = `${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`;
  const mainClass = `${styles.main} ${collapsed ? styles.mainCollapsed : ''}`;

  return (
    <>
      {/* Google Fonts — Raleway + Lato + Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Raleway:wght@500;700&family=Lato:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0"
        rel="stylesheet"
      />

      <div className={styles.shell}>

        {/* ── Sidebar ── */}
        <aside className={sidebarClass}>

          {/* Logo */}
          <div className={styles.logo}>
            <img src={logo} alt="KeelWorks logo" className={styles.logoImg} />
            {!collapsed && (
              <div className={styles.logoText}>
                <span className={styles.logoName}>KeelWorks</span>
                <span className={styles.logoSub}>Newsletter App</span>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <div className={styles.sidebarCollapse} onClick={() => setCollapsed(c => !c)}>
            <span className={`material-symbols-outlined ${styles.navIcon}`}>
              {collapsed ? 'arrow_menu_open' : 'arrow_menu_close'}
            </span>
          </div>

          {/* Nav */}
          <nav className={styles.nav}>
            <button className={styles.navItemActive}>
              <span className={`material-symbols-outlined ${styles.navIcon}`}>group</span>
              {!collapsed && <span className={styles.navLabel}>Users</span>}
            </button>
          </nav>

          {/* Exit */}
          <div className={styles.sidebarFooter}>
            <button className={styles.exitBtn} onClick={() => navigate('/dashboard')}>
              <span className={`material-symbols-outlined ${styles.navIcon}`}>logout</span>
              {!collapsed && <span className={styles.navLabel}>Exit</span>}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className={mainClass}>

          {/* Topbar */}
          <div className={styles.topbar}>
            <div className={styles.avatar}>JS</div>
          </div>

          {/* Page content */}
          <div className={styles.page}>
            <h1 className={styles.pageTitle}>Users</h1>

            {loading ? (
              <p className={styles.pageSubtitle}>Loading...</p>

            ) : isEmpty ? (

              /* ── Empty state ── */
              <>
                <p className={styles.pageSubtitle}>
                  To begin using the Newsletter App, invite users who need access.&nbsp;
                  Once added, they can start working on newsletters.
                </p>
                <div className={styles.emptyTopBar}>
                  <button className={styles.inviteBtn} onClick={() => setShowInviteModal(true)}>
                    Invite User
                  </button>
                </div>
                <div className={styles.emptyCard}>
                  <img
                    src={usersIllustration}
                    alt="No users yet"
                    className={styles.emptyIllustration}
                  />
                  <p className={styles.emptyLabel}>No user yet</p>
                  <button className={styles.inviteBtn} onClick={() => setShowInviteModal(true)}>
                    Invite User
                  </button>
                </div>
              </>

            ) : (

              /* ── Populated state ── */
              <>
                <p className={styles.pageSubtitle}>
                  Admins can invite, edit, suspend, or remove users.
                </p>

                <div className={styles.toolbar}>
                  <select
                    className={styles.filterSelect}
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  >
                    {['All', 'Active', 'Pending', 'Expired', 'Suspended'].map(f => {
                      const count = f === 'All' ? rows.length : rows.filter(r => r.status === f).length;
                      return <option key={f} value={f}>{f} ({count})</option>;
                    })}
                  </select>
                  <button className={styles.inviteBtn} onClick={() => setShowInviteModal(true)}>
                    Invite User
                  </button>
                </div>

                <div className={styles.tableCard}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>User Name</th>
                        <th className={styles.th}>Email</th>
                        <th className={styles.th}>Role</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.thRight}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayed.map(row => (
                        <tr key={row._id} className={`${styles.tr} ${editingId === row._id ? styles.trEditing : ''}`}>
                          {/* User Name */}
                          <td className={styles.td}>
                            {editingId === row._id ? (
                              <input
                                className={styles.inlineInput}
                                value={editForm.name}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="User name"
                              />
                            ) : (
                              <span className={styles.fieldBox}>{row.name}</span>
                            )}
                          </td>

                          {/* Email */}
                          <td className={styles.td}>
                            {editingId === row._id ? (
                              <input
                                className={styles.inlineInput}
                                value={editForm.email}
                                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="Email"
                              />
                            ) : (
                              <span className={styles.emailText}>{row.email}</span>
                            )}
                          </td>

                          {/* Role */}
                          <td className={styles.td}>
                            {editingId === row._id ? (
                              <select
                                className={styles.inlineSelect}
                                value={editForm.role}
                                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                              >
                                <option value="Admin">Admin</option>
                                <option value="Editor">Editor</option>
                              </select>
                            ) : (
                              <span className={styles.roleBox}>
                                {row.role}
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#9CA3AF' }}>expand_more</span>
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className={styles.td}>
                            <span className={styles.statusText}>{row.status}</span>
                          </td>

                          {/* Actions */}
                          <td className={styles.tdRight}>
                            {editingId === row._id ? (
                              <div className={styles.inlineActions}>
                                <button className={styles.cancelBtn} onClick={cancelEdit}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>close</span>
                                  Cancel
                                </button>
                                <button className={styles.saveBtn} onClick={saveEdit}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check</span>
                                  Save
                                </button>
                              </div>
                            ) : (
                              (() => {
                                const btnRef = { current: null };
                                return (
                                  <>
                                    <button
                                      ref={el => btnRef.current = el}
                                      className={styles.menuBtn}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(openMenuId === row._id ? null : row._id);
                                      }}
                                    >
                                      •••
                                    </button>
                                    {openMenuId === row._id && (
                                      <DropdownMenu
                                        row={row}
                                        anchorRef={btnRef}
                                        onEdit={() => startEdit(row)}
                                        onSuspend={() => { loadAll(); }}
                                        onResend={() => handleResend(row.inviteId)}
                                        onDelete={() => { handleDelete(row._id); setOpenMenuId(null); }}
                                        onRevoke={() => { handleRevoke(row.inviteId); setOpenMenuId(null); }}
                                        onClose={() => setOpenMenuId(null)}
                                      />
                                    )}
                                  </>
                                );
                              })()
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className={styles.pagination}>
                    <div className={styles.paginationLeft}>
                      <span className={styles.paginationText}>Show </span>
                      <select
                        className={styles.pageSizeSelect}
                        value={safePageSize}
                        onChange={e => setPageSize(Number(e.target.value))}
                      >
                        {[6, 10, 25].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <span className={styles.paginationText}>
                        &nbsp;— {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + safePageSize, filtered.length)} of {filtered.length}
                      </span>
                    </div>

                    <div className={styles.paginationRight}>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                      >
                        ‹
                      </button>

                      {getPageNumbers().map((p, i) =>
                        p === '...'
                          ? <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>…</span>
                          : <button
                            key={p}
                            className={p === safePage ? styles.pageBtnActive : styles.pageBtn}
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </button>
                      )}

                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.footer}>© 2026 KeelWorks Newsletter App</div>
        </main>

        {/* ── Invite modal ── */}
        {showInviteModal && (
          <InviteModal
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => { setShowInviteModal(false); loadAll(); }}
          />
        )}
      </div>
    </>
  );
}

// ── DropdownMenu ──────────────────────────────────────────────────────────────

function DropdownMenu({ row, onEdit, onDelete, onRevoke, onResend, onSuspend, onClose, anchorRef }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calculate position from anchor button
  const rect = anchorRef?.current?.getBoundingClientRect();
  const dropdownStyle = rect ? {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  } : {};

  const handleSuspend = async () => {
    try {
      await userAPI.suspend(row._id);
      onClose();
      // Trigger table reload via a page-level callback
      onSuspend();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suspend user');
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  return (
    <div ref={ref} className={styles.dropdown} style={dropdownStyle}>
      {row.isUser && (
        <>
          <button className={styles.dropItem} onClick={handleEdit}>
            <span className="material-symbols-outlined">edit</span>
            Edit
          </button>
          <button className={styles.dropItem} onClick={handleSuspend}>
            <span className="material-symbols-outlined">person_off</span>
            {row.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
          </button>
          <button className={`${styles.dropItem} ${styles.dropItemDanger}`} onClick={onDelete}>
            <span className="material-symbols-outlined">delete</span>
            Delete
          </button>
        </>
      )}
      {!row.isUser && row.status === 'Pending' && (
        <>
          <button className={styles.dropItem} onClick={() => { onResend(); onClose(); }}>
            <span className="material-symbols-outlined">send</span>
            Resend Invite
          </button>
          <button className={`${styles.dropItem} ${styles.dropItemDanger}`} onClick={onRevoke}>
            <span className="material-symbols-outlined">cancel</span>
            Revoke Invite
          </button>
        </>
      )}
      {!row.isUser && row.status === 'Expired' && (
        <button className={styles.dropItem} onClick={() => { onResend(); onClose(); }}>
          <span className="material-symbols-outlined">send</span>
          Resend Invite
        </button>
      )}
      {!row.isUser && row.status !== 'Pending' && row.status !== 'Expired' && (
        <span className={styles.dropItemDisabled}>No actions</span>
      )}
    </div>
  );
}

// ── InviteModal ───────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'User name is required.';
    if (!email.trim()) e.email = 'User email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Enter a valid email address.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await sendInvite(email.trim(), name.trim());
      onSuccess();
    } catch (err) {
      setErrors({ email: err.response?.data?.message || 'Failed to send invite.' });
    } finally {
      setLoading(false);
    }
  };

  // Clear field error as soon as the user starts correcting it
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <button className={styles.modalCloseBtn} onClick={onClose}>✕</button>

        <h2 className={styles.modalTitle}>Invite User</h2>
        <p className={styles.modalSubtitle}>
          Send an invitation to a new user to join the newsletter app.
        </p>

        {/* User Name */}
        <label className={styles.modalLabel}>User Name</label>
        <input
          type="text"
          placeholder="Enter user name"
          value={name}
          onChange={handleNameChange}
          className={`${styles.modalInput} ${errors.name ? styles.modalInputError : ''}`}
        />
        {errors.name && <p className={styles.modalFieldError}>{errors.name}</p>}

        {/* User Email */}
        <label className={styles.modalLabel} style={{ marginTop: '1rem' }}>User Email</label>
        <input
          type="email"
          autoFocus
          placeholder="Enter user email"
          value={email}
          onChange={handleEmailChange}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className={`${styles.modalInput} ${errors.email ? styles.modalInputError : ''}`}
        />
        {errors.email && <p className={styles.modalFieldError}>{errors.email}</p>}

        {/* Note */}
        <label className={styles.modalLabel} style={{ marginTop: '1rem' }}>Note (Optional)</label>
        <textarea
          placeholder="Add a note for the user"
          value={note}
          onChange={e => setNote(e.target.value)}
          className={styles.modalTextarea}
          rows={4}
        />

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.modalSubmitBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}