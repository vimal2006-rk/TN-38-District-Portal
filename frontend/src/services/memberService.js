import api from './api';

export const registerMember      = (data)         => api.post('/members/register', data);
export const getAllMembers        = (params)       => api.get('/members', { params });
export const getMemberById       = (id)           => api.get(`/members/${id}`);
export const updateMemberStatus  = (id, status)   => api.put(`/members/${id}/status`, { status });
export const deleteMember        = (id)           => api.delete(`/members/${id}`);
