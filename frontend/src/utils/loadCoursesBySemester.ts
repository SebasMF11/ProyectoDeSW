import { courseBySemesterRequest } from "../api/course";

export type Course = {
  course_name: string;
};

export const loadCoursesBySemester = async (
  semesterName: string,
): Promise<Course[]> => {
  if (!semesterName) {
    return [];
  }

  try {
    const response = await courseBySemesterRequest(semesterName);
    // courseBySemesterRequest retorna { courses: [...] }
    const courses = response.data?.courses;
    return Array.isArray(courses) ? courses : [];
  } catch (error) {
    console.error(`Error loading courses for semester ${semesterName}:`, error);
    return [];
  }
};
