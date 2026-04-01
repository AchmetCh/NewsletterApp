// client/src/api/invite.js
// Uses Axios (already installed in the repo) with withCredentials: true
// to match the existing httpOnly cookie auth pattern.

import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // required for httpOnly cookie to be sent
});

// Admin: send an invite to an email address
export const sendInvite = async (email) => {
    const { data } = await API.post('/api/invites', { email });
    return data;
};

// Public: validate a token when the invitee lands on /accept-invite
export const validateInviteToken = async (token) => {
    const { data } = await API.get(`/api/invites/validate?token=${token}`);
    return data; // { email }
};

// Public: submit profile setup to complete account creation
export const acceptInvite = async ({ token, name, team, title, password }) => {
    const { data } = await API.post('/api/invites/accept', {
        token,
        name,
        team,
        title,
        password,
    });
    return data;
};

// Admin: fetch all invites for the user management table
export const fetchInvites = async () => {
    const { data } = await API.get('/api/invites');
    return data;
};

// Admin: revoke a pending invite
export const revokeInvite = async (inviteId) => {
    const { data } = await API.delete(`/api/invites/${inviteId}`);
    return data;
};