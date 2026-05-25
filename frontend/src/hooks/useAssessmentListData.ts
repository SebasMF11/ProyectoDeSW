import { useEffect, useState } from "react";
import { assessmentBySemesterRequest } from "../api/assessment.api";
import { courseBySemesterRequest } from "../api/course";
import { gradeByCourseRequest } from "../api/grade";
import type { Semester } from "./useSemesters";

type Course = {
    course_id: string;
    courses: { name: string };
    status?: string;
    teacher?: string;
    credits?: number;
    color?: string;
};

type Grade = {
    value: number;
    assessment: {
        name?: string;
        dueDate?: string;
        courseName?: string;
    };
};

type CachedAssessmentListData = {
    courses: Course[];
    assessments: Assessment[];
    gradeMap: Record<string, number>;
};

const assessmentListCache = new Map<string, CachedAssessmentListData>();

export type Assessment = {
    assessment_id: string;
    name: string;
    type: string;
    due_date?: string;
    percentage?: number;
    course?: {
        courses?: { name: string };
    };
};

export const assessmentKey = (
    courseName?: string,
    name?: string,
    dueDate?: string,
) => `${courseName || ""}::${name || ""}::${dueDate || ""}`;

const isActiveStatus = (status?: string) =>
    typeof status === "string" && status.trim().toLowerCase() === "active";

type UseAssessmentListDataResult = CachedAssessmentListData & {
    loading: boolean;
    errorMessage: string;
};

export function useAssessmentListData(
    selectedSemester: string,
    semesters: Semester[],
): UseAssessmentListDataResult {
    const [courses, setCourses] = useState<Course[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [gradeMap, setGradeMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadSemesterContent = async () => {
            if (!selectedSemester) {
                if (cancelled) return;
                setCourses([]);
                setAssessments([]);
                setGradeMap({});
                setErrorMessage("");
                setLoading(false);
                return;
            }

            const currentSemester = semesters.find(
                (semester) => semester.name === selectedSemester,
            );

            if (!currentSemester?.semester_id) {
                if (cancelled) return;
                setCourses([]);
                setAssessments([]);
                setGradeMap({});
                setErrorMessage("");
                setLoading(false);
                return;
            }

            const cachedData = assessmentListCache.get(currentSemester.semester_id);
            if (cachedData) {
                if (cancelled) return;
                setCourses(cachedData.courses);
                setAssessments(cachedData.assessments);
                setGradeMap(cachedData.gradeMap);
                setErrorMessage("");
                setLoading(false);
                return;
            }

            try {
                if (cancelled) return;
                setLoading(true);
                setErrorMessage("");

                const [coursesResponse, assessmentsResponse] = await Promise.all([
                    courseBySemesterRequest(selectedSemester),
                    assessmentBySemesterRequest(currentSemester.semester_id),
                ]);

                const semesterCourses: Course[] = Array.isArray(
                    coursesResponse.data?.courses,
                )
                    ? coursesResponse.data.courses
                    : [];
                const activeCourses = semesterCourses.filter((course) =>
                    isActiveStatus(course.status),
                );

                const semesterAssessments: Assessment[] = Array.isArray(
                    assessmentsResponse.data?.assessments,
                )
                    ? assessmentsResponse.data.assessments
                    : [];

                const activeCourseNames = new Set(
                    activeCourses.map((course) => course.courses.name),
                );
                const filteredAssessments = semesterAssessments.filter((assessment) =>
                    activeCourseNames.has(assessment.course?.courses?.name || ""),
                );

                const gradeResponses = await Promise.all(
                    activeCourses.map((course) =>
                        gradeByCourseRequest(course.course_id)
                            .then((response) => ({
                                courseId: course.course_id,
                                grades: Array.isArray(response.data?.grades)
                                    ? response.data.grades
                                    : [],
                            }))
                            .catch(() => ({ courseId: course.course_id, grades: [] })),
                    ),
                );

                const nextGradeMap: Record<string, number> = {};
                gradeResponses.forEach((gradeResponse) => {
                    gradeResponse.grades.forEach((grade: Grade) => {
                        const key = assessmentKey(
                            grade.assessment?.courseName,
                            grade.assessment?.name,
                            grade.assessment?.dueDate,
                        );
                        nextGradeMap[key] = grade.value;
                    });
                });

                const nextData = {
                    courses: activeCourses,
                    assessments: filteredAssessments,
                    gradeMap: nextGradeMap,
                };

                if (cancelled) return;
                assessmentListCache.set(currentSemester.semester_id, nextData);
                setCourses(nextData.courses);
                setAssessments(nextData.assessments);
                setGradeMap(nextData.gradeMap);
            } catch (error) {
                if (cancelled) return;
                console.error(error);
                setCourses([]);
                setAssessments([]);
                setGradeMap({});
                setErrorMessage("The semester information could not be loaded");
            } finally {
                if (cancelled) return;
                setLoading(false);
            }
        };

        loadSemesterContent();

        return () => {
            cancelled = true;
        };
    }, [selectedSemester, semesters]);

    return {
        courses,
        assessments,
        gradeMap,
        loading,
        errorMessage,
    };
}