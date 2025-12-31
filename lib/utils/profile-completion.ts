/**
 * Profile Completion Utility
 *
 * Tracks user profile completion for two purposes:
 * 1. Mandatory fields - Must be completed to unlock Mo app features
 * 2. Optional fields - Recommended for full app experience
 */

export interface MandatoryFields {
  // Profile (5 required)
  fullName: boolean;
  dateOfBirth: boolean;
  gender: boolean;
  heightCm: boolean;

  // Training (4 required)
  fitnessGoal: boolean;
  experienceLevel: boolean;
  trainingFrequency: boolean;
  sessionDuration: boolean;

  // Equipment (1 required)
  defaultEquipmentLevel: boolean;
}

export interface OptionalFields {
  // Profile
  currentWeight: boolean;
  goalWeight: boolean;

  // Training
  focusAreas: boolean;
  preferredTrainingTimes: boolean;
  restDaysPreference: boolean;

  // Equipment
  availableEquipment: boolean;

  // Lifestyle
  activityLevel: boolean;
  occupationType: boolean;
  typicalBedtime: boolean;
  typicalWakeTime: boolean;
  preferredCardio: boolean;
}

export interface ProfileCompletionStatus {
  // Mandatory
  isMandatoryComplete: boolean;
  mandatoryProgress: number; // 0-100
  mandatoryFieldsComplete: number;
  mandatoryFieldsTotal: number;
  missingMandatoryFields: string[];

  // Overall (mandatory + optional)
  overallProgress: number; // 0-100
  overallFieldsComplete: number;
  overallFieldsTotal: number;
  missingOptionalFields: string[];

  // Breakdown by tab
  profileTabComplete: number; // out of 6 (4 required + 2 optional)
  profileTabRequired: number; // out of 4
  trainingTabComplete: number; // out of 7 (4 required + 3 optional)
  trainingTabRequired: number; // out of 4
  equipmentTabComplete: number; // out of 2 (1 required + 1 optional)
  equipmentTabRequired: number; // out of 1
  lifestyleTabComplete: number; // out of 5 (all optional)
}

const FIELD_LABELS: Record<string, string> = {
  // Profile
  fullName: "Full Name",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  heightCm: "Height",
  currentWeight: "Current Weight",
  goalWeight: "Goal Weight",

  // Training
  fitnessGoal: "Fitness Goal",
  experienceLevel: "Experience Level",
  trainingFrequency: "Training Frequency",
  sessionDuration: "Session Duration",
  focusAreas: "Focus Areas",
  preferredTrainingTimes: "Preferred Training Times",
  restDaysPreference: "Rest Days",

  // Equipment
  defaultEquipmentLevel: "Equipment Level",
  availableEquipment: "Available Equipment",

  // Lifestyle
  activityLevel: "Activity Level",
  occupationType: "Occupation",
  typicalBedtime: "Bedtime",
  typicalWakeTime: "Wake Time",
  preferredCardio: "Preferred Cardio",
};

export function checkProfileCompletion(
  profile: any,
  preferences: any
): ProfileCompletionStatus {
  // Check mandatory fields
  const mandatory: MandatoryFields = {
    // Profile (4 required - removed units since it has a default)
    fullName: !!profile?.fullName?.trim(),
    dateOfBirth: !!profile?.dateOfBirth,
    gender: !!profile?.gender,
    heightCm: !!profile?.heightCm,

    // Training (4 required)
    fitnessGoal: !!preferences?.fitnessGoal,
    experienceLevel: !!preferences?.experienceLevel,
    trainingFrequency: !!preferences?.trainingFrequency && preferences.trainingFrequency > 0,
    sessionDuration: !!preferences?.sessionDuration && preferences.sessionDuration >= 15,

    // Equipment (1 required)
    defaultEquipmentLevel: !!preferences?.defaultEquipmentLevel,
  };

  // Check optional fields
  const optional: OptionalFields = {
    // Profile
    currentWeight: !!profile?.currentWeight,
    goalWeight: !!profile?.goalWeight,

    // Training
    focusAreas: !!preferences?.focusAreas && preferences.focusAreas.length > 0,
    preferredTrainingTimes: !!preferences?.preferredTrainingTimes && preferences.preferredTrainingTimes.length > 0,
    restDaysPreference: !!preferences?.restDaysPreference && preferences.restDaysPreference.length > 0,

    // Equipment
    availableEquipment: !!preferences?.availableEquipment && preferences.availableEquipment.length > 0,

    // Lifestyle
    activityLevel: !!preferences?.activityLevel,
    occupationType: !!preferences?.occupationType,
    typicalBedtime: !!preferences?.typicalBedtime,
    typicalWakeTime: !!preferences?.typicalWakeTime,
    preferredCardio: !!preferences?.preferredCardio,
  };

  // Count completed mandatory fields
  const mandatoryFieldsComplete = Object.values(mandatory).filter(Boolean).length;
  const mandatoryFieldsTotal = Object.keys(mandatory).length;
  const isMandatoryComplete = mandatoryFieldsComplete === mandatoryFieldsTotal;
  const mandatoryProgress = Math.round((mandatoryFieldsComplete / mandatoryFieldsTotal) * 100);

  // Count completed optional fields
  const optionalFieldsComplete = Object.values(optional).filter(Boolean).length;
  const optionalFieldsTotal = Object.keys(optional).length;

  // Overall progress
  const overallFieldsComplete = mandatoryFieldsComplete + optionalFieldsComplete;
  const overallFieldsTotal = mandatoryFieldsTotal + optionalFieldsTotal;
  const overallProgress = Math.round((overallFieldsComplete / overallFieldsTotal) * 100);

  // Missing fields
  const missingMandatoryFields = Object.entries(mandatory)
    .filter(([_, complete]) => !complete)
    .map(([field]) => FIELD_LABELS[field]);

  const missingOptionalFields = Object.entries(optional)
    .filter(([_, complete]) => !complete)
    .map(([field]) => FIELD_LABELS[field]);

  // Tab completion breakdown
  const profileTabComplete = [
    mandatory.fullName,
    mandatory.dateOfBirth,
    mandatory.gender,
    mandatory.heightCm,
    optional.currentWeight,
    optional.goalWeight,
  ].filter(Boolean).length;

  const profileTabRequired = [
    mandatory.fullName,
    mandatory.dateOfBirth,
    mandatory.gender,
    mandatory.heightCm,
  ].filter(Boolean).length;

  const trainingTabComplete = [
    mandatory.fitnessGoal,
    mandatory.experienceLevel,
    mandatory.trainingFrequency,
    mandatory.sessionDuration,
    optional.focusAreas,
    optional.preferredTrainingTimes,
    optional.restDaysPreference,
  ].filter(Boolean).length;

  const trainingTabRequired = [
    mandatory.fitnessGoal,
    mandatory.experienceLevel,
    mandatory.trainingFrequency,
    mandatory.sessionDuration,
  ].filter(Boolean).length;

  const equipmentTabComplete = [
    mandatory.defaultEquipmentLevel,
    optional.availableEquipment,
  ].filter(Boolean).length;

  const equipmentTabRequired = mandatory.defaultEquipmentLevel ? 1 : 0;

  const lifestyleTabComplete = [
    optional.activityLevel,
    optional.occupationType,
    optional.typicalBedtime,
    optional.typicalWakeTime,
    optional.preferredCardio,
  ].filter(Boolean).length;

  return {
    isMandatoryComplete,
    mandatoryProgress,
    mandatoryFieldsComplete,
    mandatoryFieldsTotal,
    missingMandatoryFields,

    overallProgress,
    overallFieldsComplete,
    overallFieldsTotal,
    missingOptionalFields,

    profileTabComplete,
    profileTabRequired,
    trainingTabComplete,
    trainingTabRequired,
    equipmentTabComplete,
    equipmentTabRequired,
    lifestyleTabComplete,
  };
}
