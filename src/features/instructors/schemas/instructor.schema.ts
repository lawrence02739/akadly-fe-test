import { InstructorType, type WeeklySlot } from '../types/instructor.types';
import { sumWeeklySlotsHours } from '../utils/format';

export interface FormValidationErrors {
  [field: string]: string | undefined;
}

export function validateInstructorForm(data: {
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  specialty: string;
  instructorType: InstructorType;
  engagement: {
    startDate?: string | null;
    endDate?: string | null;
    requiredWeeklyHours?: number | null;
    weeklySchedule?: WeeklySlot[];
    timezone?: string;
    renewalNote?: string;
    renewalReviewDate?: string | null;
  };
}): FormValidationErrors {
  const errors: FormValidationErrors = {};

  const rawName = data.fullName || data.name;
  if (!rawName?.trim()) {
    errors.name = 'Full name is required';
    errors.fullName = 'Full name is required';
  } else if (rawName.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters';
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (rawName.trim().length > 120) {
    errors.name = 'Full name cannot exceed 120 characters';
    errors.fullName = 'Full name cannot exceed 120 characters';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.specialty?.trim()) {
    errors.specialty = 'Specialty is required';
  }

  const { engagement, instructorType } = data;

  switch (instructorType) {
    case InstructorType.FULL_TIME:
      // Start date optional, end date forbidden
      break;

    case InstructorType.PART_TIME:
      if (!engagement.startDate) {
        errors['engagement.startDate'] = 'Employment start date is required';
      }
      if (
        !engagement.requiredWeeklyHours ||
        engagement.requiredWeeklyHours < 1 ||
        engagement.requiredWeeklyHours > 60
      ) {
        errors['engagement.requiredWeeklyHours'] =
          'Weekly hours must be between 1 and 60';
      }
      if (!engagement.weeklySchedule || engagement.weeklySchedule.length === 0) {
        errors['engagement.weeklySchedule'] =
          'At least one weekly schedule slot is required';
      } else {
        const totalHours = sumWeeklySlotsHours(engagement.weeklySchedule);
        if (
          engagement.requiredWeeklyHours &&
          Math.abs(totalHours - engagement.requiredWeeklyHours) > 0.01
        ) {
          errors['engagement.weeklySchedule'] =
            `Schedule total (${totalHours.toFixed(1)} hrs) does not match required ${engagement.requiredWeeklyHours} hrs/wk`;
        }
      }
      break;

    case InstructorType.CONTRACT_BASED:
    case InstructorType.GUEST:
      if (!engagement.startDate) {
        errors['engagement.startDate'] = 'Start date is required';
      }
      if (!engagement.endDate) {
        errors['engagement.endDate'] = 'End date is required';
      }
      if (engagement.startDate && engagement.endDate) {
        if (new Date(engagement.endDate) <= new Date(engagement.startDate)) {
          errors['engagement.endDate'] = 'End date must be after start date';
        }
      }
      if (
        instructorType === InstructorType.CONTRACT_BASED &&
        engagement.renewalNote &&
        engagement.renewalNote.length > 500
      ) {
        errors['engagement.renewalNote'] =
          'Renewal note cannot exceed 500 characters';
      }
      break;
  }

  return errors;
}
