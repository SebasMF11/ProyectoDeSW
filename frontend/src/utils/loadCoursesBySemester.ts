import { courseBySemesterRequest } from "../api/course";

export type Course = {
  courses_id: string;
  course_name: string;
  prerequisite_course?: { courses_id: string; name: string } | null;
};

type CourseBySemesterResponseItem = {
  courses_id?: string;
  courses?: {
    name?: string;
    prerequisite_course?: { courses_id: string; name: string } | null;
  };
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

    if (!Array.isArray(courses)) {
      return [];
    }

    return courses.map((course: CourseBySemesterResponseItem) => ({
      courses_id: course.courses_id ?? "",
      course_name: course.courses?.name ?? "",
      prerequisite_course: course.courses?.prerequisite_course ?? null,
    }));
  } catch (error) {
    console.error(`Error loading courses for semester ${semesterName}:`, error);
    return [];
  }
};
