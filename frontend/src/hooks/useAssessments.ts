import { useEffect, useState } from "react";
import { assessmentsByMonthRequest } from "../api/assessment.api";

interface RawAssessment {
  assessment_id: string;
  name: string;
  type: string;
  due_date: string;
  course: {
    courses: { name: string };
    color: string;
  };
  percentage: number;
  has_grade?: boolean;
}

export interface CalendarAssessmentDot {
  color: string;
  hasGrade: boolean;
}

interface UseAssessmentsReturn {
  assessments: Record<string, CalendarAssessmentDot[]>;
  isLoading: boolean;
  error: string | null;
}

export function useAssessments(
  year: number,
  month: number,
): UseAssessmentsReturn {
  const [assessments, setAssessments] = useState<
    Record<string, CalendarAssessmentDot[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await assessmentsByMonthRequest(year, month);
        const assessmentsByDate: Record<string, CalendarAssessmentDot[]> = {};

        if (
          response.data.assessments &&
          Array.isArray(response.data.assessments)
        ) {
          response.data.assessments.forEach((assessment: RawAssessment) => {
            const color = assessment.course?.color;
            const hasGrade = Boolean(assessment.has_grade);
            const dateKey = assessment.due_date
              ? assessment.due_date.split("T")[0]
              : null;

            if (!dateKey || !color) return;

            if (!assessmentsByDate[dateKey]) {
              assessmentsByDate[dateKey] = [];
            }
            assessmentsByDate[dateKey].push({ color, hasGrade });
          });
        }

        setAssessments(assessmentsByDate);
      } catch (err) {
        console.error("Error fetching assessments:", err);
        setError(
          err instanceof Error ? err.message : "Error loading assessments",
        );
        setAssessments({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [year, month]);

  return { assessments, isLoading, error };
}
