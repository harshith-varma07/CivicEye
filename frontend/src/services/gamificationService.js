import api from './api';

export const gamificationService = {
  getCommunityDashboard: async (params) => {
    const response = await api.get('/gamification/community-dashboard', { params });
    return response.data;
  },

  getNeighborhoodStats: async (params) => {
    const response = await api.get('/gamification/neighborhood-stats', { params });
    return response.data;
  },

  getPersonalContributions: async () => {
    const response = await api.get('/gamification/personal-contributions');
    return response.data;
  },

  claimReward: async (rewardData) => {
    const response = await api.post('/gamification/claim-reward', rewardData);
    return response.data;
  },
};
