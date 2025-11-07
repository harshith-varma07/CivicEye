import api from './api';

export const gamificationService = {
  getLeaderboard: async (params) => {
    const response = await api.get('/gamification/leaderboard', { params });
    return response.data;
  },

  getBadges: async () => {
    const response = await api.get('/gamification/badges');
    return response.data;
  },

  getUserStats: async (userId) => {
    const url = userId ? `/gamification/stats/${userId}` : '/gamification/stats';
    const response = await api.get(url);
    return response.data;
  },
};
