import { assessmentKey, type Assessment } from "../hooks/useAssessmentListData";

type Course = {
    course_id: string;
    courses?: { name?: string };
    teacher?: string;
    credits?: number;
    color?: string;
};

export type SimulatedEntry = { grade?: number; percentage?: number };
export type SimulatedGradesMap = Record<string, SimulatedEntry>;

export type CourseSimulation = {
    courseId: string;
    courseName: string;
    teacher: string;
    credits: number;
    currentGrade: number;
    projectedGrade: number;
    evaluatedPercentage: number;
    simulatedPercentage: number;
    remainingPercentage: number;
    assessments: Array<{
        key: string;
        assessmentId: string;
        name: string;
        dueDate?: string;
        percentage: number;
        realGrade: number | null;
        simulatedGrade: number | null;
        projectedGrade: number;
    }>;
};

export type SemesterSimulation = {
    courseSimulations: CourseSimulation[];
    semesterAverage: number;
    totalCredits: number;
};

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const toNumericGrade = (value: number | undefined) => {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return value;
};

export const calculateSemesterSimulation = ({
    courses,
    assessments,
    gradeMap,
    simulatedGrades,
    simulatedExtras,
}: {
    courses: Course[];
    assessments: Assessment[];
    gradeMap: Record<string, number>;
    simulatedGrades: SimulatedGradesMap;
    // Extra simulated assessments grouped by courseId
    simulatedExtras?: Record<
        string,
        Array<{ id: string; name: string; grade?: number; percentage: number }>
    >;
}): SemesterSimulation => {
    const assessmentsByCourse = new Map<string, Assessment[]>();

    assessments.forEach((assessment) => {
        const courseName = assessment.course?.courses?.name;
        if (!courseName) return;

        const currentList = assessmentsByCourse.get(courseName) ?? [];
        currentList.push(assessment);
        assessmentsByCourse.set(courseName, currentList);
    });

    const courseSimulations = courses.map((course) => {
        const courseName = course.courses?.name || "Unnamed course";
        const courseAssessments = assessmentsByCourse.get(courseName) ?? [];

        let currentGrade = 0;
        let projectedGrade = 0;
        let evaluatedPercentage = 0;
        let simulatedPercentage = 0;

        const assessmentsSummary = courseAssessments.map((assessment) => {
            const key = assessmentKey(
                courseName,
                assessment.name,
                assessment.due_date,
            );
            // allow simulated override of percentage
            const simulatedEntry = simulatedGrades[key];
            const percentage = Number(simulatedEntry?.percentage ?? assessment.percentage) || 0;
            const realGrade = toNumericGrade(gradeMap[key]);
            const simulatedGrade = toNumericGrade(simulatedEntry?.grade);
            const projectedAssessmentGrade = realGrade ?? simulatedGrade ?? 0;

            if (realGrade !== null) {
                evaluatedPercentage += percentage;
            } else if (simulatedGrade !== null) {
                simulatedPercentage += percentage;
            }

            currentGrade += (realGrade ?? 0) * (percentage / 100);
            projectedGrade += projectedAssessmentGrade * (percentage / 100);

            return {
                key,
                assessmentId: assessment.assessment_id,
                name: assessment.name,
                dueDate: assessment.due_date,
                percentage,
                realGrade,
                simulatedGrade,
                projectedGrade: projectedAssessmentGrade,
            };
        });

        // include any extra simulated assessments for this course
        const extras = (simulatedExtras && simulatedExtras[course.course_id]) || [];
        extras.forEach((extra) => {
            const percentage = Number(extra.percentage) || 0;
            const simulatedGrade = toNumericGrade(extra.grade);
            if (simulatedGrade != null) {
                simulatedPercentage += percentage;
            }
            projectedGrade += (simulatedGrade ?? 0) * (percentage / 100);
            assessmentsSummary.push({
                key: `${course.course_id}::extra::${extra.id}`,
                assessmentId: extra.id,
                name: extra.name,
                dueDate: undefined,
                percentage,
                realGrade: null,
                simulatedGrade,
                projectedGrade: simulatedGrade ?? 0,
            });
        });

        const remainingPercentage = Math.max(
            0,
            100 - evaluatedPercentage - simulatedPercentage,
        );

        return {
            courseId: course.course_id,
            courseName,
            teacher: course.teacher || "Unassigned",
            credits: Number(course.credits) || 0,
            currentGrade: roundToTwoDecimals(currentGrade),
            projectedGrade: roundToTwoDecimals(projectedGrade),
            evaluatedPercentage,
            simulatedPercentage,
            remainingPercentage,
            assessments: assessmentsSummary,
        };
    });

    const totalCredits = courseSimulations.reduce(
        (acc, course) => acc + course.credits,
        0,
    );

    const semesterAverage =
        totalCredits > 0
            ? courseSimulations.reduce(
                (acc, course) => acc + course.projectedGrade * course.credits,
                0,
            ) / totalCredits
            : 0;

    return {
        courseSimulations,
        semesterAverage: roundToTwoDecimals(semesterAverage),
        totalCredits,
    };
};
