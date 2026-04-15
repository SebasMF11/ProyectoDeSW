import { semesterViewRequest } from "../api/semester";

export type Semester = {
  semester_id: number;
  semester_name: string;
  start_date?: string;
  end_date?: string;
};

export const loadSemesters = async (): Promise<Semester[]> => {
  try {
    const response = await semesterViewRequest();
    // semesterViewRequest retorna un array directamente
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error loading semesters:", error);
    return [];
  }
};
