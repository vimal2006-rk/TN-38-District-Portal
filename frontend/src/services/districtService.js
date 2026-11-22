import api from './api';

export const getAllDistricts    = ()           => api.get('/districts');
export const getDistrictBySlug = (slug)       => api.get(`/districts/${slug}`);
export const createDistrict    = (data)       => api.post('/districts', data);
export const updateDistrict    = (id, data)   => api.put(`/districts/${id}`, data);
export const deleteDistrict    = (id)         => api.delete(`/districts/${id}`);
