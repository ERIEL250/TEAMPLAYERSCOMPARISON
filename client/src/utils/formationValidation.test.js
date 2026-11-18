import {
  validateFormation,
  getAvailableFormations,
} from './formationValidation';

describe('formationValidation', () => {
  describe('validateFormation', () => {
    it('should return invalid for unknown formation', () => {
      const result = validateFormation('invalid', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid formation');
    });

    it('should return valid for complete 4-3-3 formation', () => {
      const lineup = {
        gk: { id: 1 },
        lb: { id: 2 },
        lcb: { id: 3 },
        rcb: { id: 4 },
        rb: { id: 5 },
        cdm: { id: 6 },
        cm1: { id: 7 },
        cm2: { id: 8 },
        lw: { id: 9 },
        st: { id: 10 },
        rw: { id: 11 },
      };
      const result = validateFormation('4-3-3', lineup);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for incomplete formation', () => {
      const lineup = { gk: { id: 1 } };
      const result = validateFormation('4-3-3', lineup);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getAvailableFormations', () => {
    it('should return list of available formations', () => {
      const formations = getAvailableFormations();
      expect(formations).toBeInstanceOf(Array);
      expect(formations.length).toBeGreaterThan(0);
      formations.forEach((f) => {
        expect(f).toHaveProperty('key');
        expect(f).toHaveProperty('name');
        expect(f).toHaveProperty('positions');
      });
    });
  });
});
