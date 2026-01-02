import { describe, it, expect } from 'vitest';
import { checkProfileCompletion } from './profile-completion';
import { mockUser, mockPreferences } from '@/tests/fixtures/test-data';

describe('checkProfileCompletion', () => {
  describe('when profile and preferences are complete', () => {
    it('should return 100% completion for all fields', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.isMandatoryComplete).toBe(true);
      expect(result.mandatoryProgress).toBe(100);
      expect(result.mandatoryFieldsComplete).toBe(result.mandatoryFieldsTotal);
      expect(result.missingMandatoryFields).toEqual([]);
    });

    it('should calculate overall progress correctly', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.overallProgress).toBeGreaterThan(70);
      expect(result.overallFieldsComplete).toBeGreaterThan(0);
    });
  });

  describe('when profile is null', () => {
    it('should show all profile mandatory fields as incomplete', () => {
      const result = checkProfileCompletion(null, mockPreferences);

      expect(result.isMandatoryComplete).toBe(false);
      expect(result.missingMandatoryFields).toContain('Full Name');
      expect(result.missingMandatoryFields).toContain('Date of Birth');
      expect(result.missingMandatoryFields).toContain('Gender');
      expect(result.missingMandatoryFields).toContain('Height');
    });

    it('should still count preferences mandatory fields', () => {
      const result = checkProfileCompletion(null, mockPreferences);

      // 4 profile mandatory fields missing, but 5 preferences mandatory fields complete
      expect(result.mandatoryFieldsComplete).toBe(5);
      expect(result.mandatoryFieldsTotal).toBe(9);
    });
  });

  describe('when preferences are null', () => {
    it('should show all preferences mandatory fields as incomplete', () => {
      const result = checkProfileCompletion(mockUser, null);

      expect(result.isMandatoryComplete).toBe(false);
      expect(result.missingMandatoryFields).toContain('Fitness Goal');
      expect(result.missingMandatoryFields).toContain('Experience Level');
      expect(result.missingMandatoryFields).toContain('Training Frequency');
      expect(result.missingMandatoryFields).toContain('Session Duration');
      expect(result.missingMandatoryFields).toContain('Equipment Level');
    });
  });

  describe('when both profile and preferences are null', () => {
    it('should show 0% completion', () => {
      const result = checkProfileCompletion(null, null);

      expect(result.isMandatoryComplete).toBe(false);
      expect(result.mandatoryProgress).toBe(0);
      expect(result.mandatoryFieldsComplete).toBe(0);
      expect(result.overallProgress).toBe(0);
    });
  });

  describe('profile tab completion', () => {
    it('should count 4 required fields correctly', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.profileTabRequired).toBe(4);
    });

    it('should count total 6 fields (4 required + 2 optional)', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.profileTabComplete).toBeGreaterThanOrEqual(4);
      expect(result.profileTabComplete).toBeLessThanOrEqual(6);
    });

    it('should mark incomplete when fullName is empty', () => {
      const incompleteUser = { ...mockUser, fullName: '' };
      const result = checkProfileCompletion(incompleteUser, mockPreferences);

      expect(result.profileTabRequired).toBe(3);
      expect(result.missingMandatoryFields).toContain('Full Name');
    });

    it('should mark incomplete when fullName is whitespace', () => {
      const incompleteUser = { ...mockUser, fullName: '   ' };
      const result = checkProfileCompletion(incompleteUser, mockPreferences);

      expect(result.profileTabRequired).toBe(3);
      expect(result.missingMandatoryFields).toContain('Full Name');
    });
  });

  describe('training tab completion', () => {
    it('should count 4 required fields correctly', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.trainingTabRequired).toBe(4);
    });

    it('should count total 7 fields (4 required + 3 optional)', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.trainingTabComplete).toBeGreaterThanOrEqual(4);
      expect(result.trainingTabComplete).toBeLessThanOrEqual(7);
    });

    it('should mark incomplete when trainingFrequency is 0', () => {
      const incompletePrefs = { ...mockPreferences, trainingFrequency: 0 };
      const result = checkProfileCompletion(mockUser, incompletePrefs);

      expect(result.missingMandatoryFields).toContain('Training Frequency');
    });

    it('should mark incomplete when sessionDuration is less than 15', () => {
      const incompletePrefs = { ...mockPreferences, sessionDuration: 10 };
      const result = checkProfileCompletion(mockUser, incompletePrefs);

      expect(result.missingMandatoryFields).toContain('Session Duration');
    });
  });

  describe('equipment tab completion', () => {
    it('should count 1 required field correctly', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.equipmentTabRequired).toBe(1);
    });

    it('should count total 2 fields (1 required + 1 optional)', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.equipmentTabComplete).toBeGreaterThanOrEqual(1);
      expect(result.equipmentTabComplete).toBeLessThanOrEqual(2);
    });
  });

  describe('lifestyle tab completion', () => {
    it('should count all 5 optional fields', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.lifestyleTabComplete).toBeGreaterThanOrEqual(0);
      expect(result.lifestyleTabComplete).toBeLessThanOrEqual(5);
    });

    it('should not affect mandatory completion', () => {
      const noLifestyle = {
        ...mockPreferences,
        activityLevel: null,
        occupationType: null,
        typicalBedtime: null,
        typicalWakeTime: null,
        preferredCardio: null,
      };
      const result = checkProfileCompletion(mockUser, noLifestyle);

      // Mandatory should still be complete
      expect(result.isMandatoryComplete).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays for focus areas', () => {
      const prefsWithEmptyArray = { ...mockPreferences, focusAreas: [] };
      const result = checkProfileCompletion(mockUser, prefsWithEmptyArray);

      expect(result.missingOptionalFields).toContain('Focus Areas');
    });

    it('should handle empty arrays for preferred training times', () => {
      const prefsWithEmptyArray = { ...mockPreferences, preferredTrainingTimes: [] };
      const result = checkProfileCompletion(mockUser, prefsWithEmptyArray);

      expect(result.missingOptionalFields).toContain('Preferred Training Times');
    });

    it('should handle null values correctly', () => {
      const incompleteUser = {
        ...mockUser,
        fullName: null,
        dateOfBirth: null,
        gender: null,
        heightCm: null,
      };
      const result = checkProfileCompletion(incompleteUser, mockPreferences);

      expect(result.profileTabRequired).toBe(0);
      expect(result.missingMandatoryFields.length).toBe(4);
    });
  });

  describe('percentage calculations', () => {
    it('should return whole numbers for percentages', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.mandatoryProgress % 1).toBe(0);
      expect(result.overallProgress % 1).toBe(0);
    });

    it('should cap percentages at 100', () => {
      const result = checkProfileCompletion(mockUser, mockPreferences);

      expect(result.mandatoryProgress).toBeLessThanOrEqual(100);
      expect(result.overallProgress).toBeLessThanOrEqual(100);
    });

    it('should floor percentages to 0 minimum', () => {
      const result = checkProfileCompletion(null, null);

      expect(result.mandatoryProgress).toBeGreaterThanOrEqual(0);
      expect(result.overallProgress).toBeGreaterThanOrEqual(0);
    });
  });
});
