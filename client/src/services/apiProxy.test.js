import { competitionService, teamService } from './apiService';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

import apiClient from './apiService';

describe('API Proxy Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('competitionService', () => {
    test('getCompetitions should fetch competitions from proxy', async () => {
      const mockCompetitions = {
        competitions: [
          { id: 2021, code: 'PL', name: 'Premier League' },
          { id: 2014, code: 'FL1', name: 'Ligue 1' },
        ],
      };

      apiClient.get.mockResolvedValue({ data: mockCompetitions });

      const result = await competitionService.getCompetitions();

      expect(apiClient.get).toHaveBeenCalledWith('/competitions');
      expect(result).toEqual(mockCompetitions.competitions);
    });

    test('getTeams should fetch teams for a competition', async () => {
      const competitionCode = 'PL';
      const mockTeams = {
        teams: [
          { id: 65, name: 'Manchester United' },
          { id: 66, name: 'Liverpool' },
        ],
      };

      apiClient.get.mockResolvedValue({ data: mockTeams });

      const result = await competitionService.getTeams(competitionCode);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/competitions/${competitionCode}/teams`
      );
      expect(result).toEqual(mockTeams.teams);
    });
  });

  describe('teamService', () => {
    test('getTeam should fetch team details with squad', async () => {
      const teamId = 65;
      const mockTeam = {
        id: 65,
        name: 'Manchester United',
        squad: [
          { id: 1, name: 'David de Gea', position: 'Goalkeeper' },
          { id: 2, name: 'Harry Maguire', position: 'Defender' },
        ],
      };

      apiClient.get.mockResolvedValue({ data: mockTeam });

      const result = await teamService.getTeam(teamId);

      expect(apiClient.get).toHaveBeenCalledWith(`/teams/${teamId}`);
      expect(result).toEqual(mockTeam);
    });
  });

  describe('error handling', () => {
    test('should handle network errors gracefully', async () => {
      apiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(competitionService.getCompetitions()).rejects.toThrow();
    });
  });
});
