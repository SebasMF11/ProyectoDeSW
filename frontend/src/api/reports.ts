import { httpClient } from "./httpClient";

export interface CourseAssessment {
  grade_id: string;
  value: number;
  name: string;
  type: string;
  percentage: number;
  due_date: string;
}

export interface DetailedCourseReport {
  course_id: string;
  course_name: string;
  credits: number;
  teacher?: string;
  color?: string;
  status: string;
  isApproved: boolean;
  evaluatedPercentage: number;
  finalGrade: number;
  assessments: CourseAssessment[];
}

export interface SemesterReport {
  semester_id: string;
  semester_name: string;
  start_date: string;
  end_date: string;
  semesterAverage: number;
  totalCredits: number;
  approvedCredits: number;
  courses: DetailedCourseReport[];
}

export interface AcademicTranscriptResponse {
  overallGPA: number;
  totalCreditsEnrolled: number;
  totalCreditsApproved: number;
  totalCoursesApproved: number;
  totalCoursesEvaluated: number;
  approvalRate: number;
  academicStanding: string;
  semesters: SemesterReport[];
}

export interface ScheduleSlot {
  day_id: string;
  course_id: string;
  course_name: string;
  teacher: string;
  color: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  classroom: string;
}

export interface UpcomingAssessment {
  assessment_id: string;
  name: string;
  type: string;
  percentage: number;
  due_date: string;
  daysRemaining: number | null;
  urgency: "urgente" | "proximo" | "normal" | "finalizado";
  course_name: string;
  color: string;
}

export interface ScheduleAgendaResponse {
  semester: {
    semester_id: string;
    name: string;
    start_date: string;
    end_date: string;
  } | null;
  scheduleSlots: ScheduleSlot[];
  upcomingAssessments: UpcomingAssessment[];
}

/**
 * Reporte 1: Boletín de Calificaciones y Rendimiento Académico (GPA)
 */
export const academicTranscriptRequest = (semesterId?: string) => {
  const params = semesterId ? `?semesterId=${encodeURIComponent(semesterId)}` : "";
  return httpClient.get<AcademicTranscriptResponse>(`reports/transcript${params}`);
};

/**
 * Reporte 2: Horario Semanal y Agenda de Evaluaciones
 */
export const scheduleAgendaRequest = (semesterId?: string) => {
  const params = semesterId ? `?semesterId=${encodeURIComponent(semesterId)}` : "";
  return httpClient.get<ScheduleAgendaResponse>(`reports/schedule${params}`);
};
