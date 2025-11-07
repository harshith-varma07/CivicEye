import api from './api';

export const issueService = {
  createIssue: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },

  getIssues: async (params) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  getIssue: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  upvoteIssue: async (id) => {
    const response = await api.put(`/issues/${id}/upvote`);
    return response.data;
  },

  assignIssue: async (id, data) => {
    const response = await api.put(`/issues/${id}/assign`, data);
    return response.data;
  },

  updateIssueStatus: async (id, data) => {
    const response = await api.put(`/issues/${id}/status`, data);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/issues/${id}/comments`, comment);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/issues/analytics/stats');
    return response.data;
  },

  getHotspots: async (params) => {
    const response = await api.get('/issues/analytics/hotspots', { params });
    return response.data;
  },
};
