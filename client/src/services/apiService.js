import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const competitionService = {
  getCompetitions: async () => {
    const response = await apiClient.get('/competitions');
    return response.data.competitions || [];
  },

  getTeams: async (competitionCode) => {
    const response = await apiClient.get(
      `/competitions/${competitionCode}/teams`
    );
    return response.data.teams || [];
  },
};

export const teamService = {
  getTeam: async (teamId) => {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  },
};

export const healthService = {
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
