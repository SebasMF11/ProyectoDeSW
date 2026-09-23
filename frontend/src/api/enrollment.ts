import { httpClient } from "./httpClient";

export interface DaySlotPayload {
  day_of_week: string;
  start_time: string;
  end_time: string;
  classroom?: string;
}

export interface EnrollmentCoursePayload {
  courses_id: string;
  course_name?: string;
  credits: number;
  teacher?: string;
  color?: string;
  days: DaySlotPayload[];
}

export interface EnrollmentBatchPayload {
  semester_id: string;
  courses: EnrollmentCoursePayload[];
}

export interface ValidationResponse {
  valid: boolean;
  semesterName: string;
  currentCredits: number;
  batchCredits: number;
  totalCredits: number;
  maxCredits: number;
  availableCredits: number;
}

export interface ProcessResponse {
  message: string;
  semester: string;
  enrolledCoursesCount: number;
  totalCredits: number;
  courses: Array<{
    course_id: string;
    credits: number;
    teacher: string;
    color: string;
  }>;
}

/**
 * Pre-valida el lote de matrícula sin persistir cambios
 */
export const validateEnrollmentRequest = (data: EnrollmentBatchPayload) =>
  httpClient.post<ValidationResponse>("enrollment/validate", data);

/**
 * Procesa la matrícula transaccional en bloque
 */
export const processEnrollmentRequest = (data: EnrollmentBatchPayload) =>
  httpClient.post<ProcessResponse>("enrollment/process", data);
