import { useEffect, useState } from "react";
import { assessmentsByMonthRequest } from "../api/assessment.api";

interface RawAssessment {
  assessment_id: string;
  name: string;
  type: string;
  due_date: string; // timestamptz — puede venir como ISO string
  course: {
    courses: { name: string };
    color: string;
  };
  percentage: number;
}

interface UseAssessmentsReturn {
  assessments: Record<string, string[]>; // { "YYYY-MM-DD": ["#color1", "#color2"] }
  isLoading: boolean;
  error: string | null;
}

export function useAssessments(
  year: number,
  month: number,
): UseAssessmentsReturn {
  const [assessments, setAssessments] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await assessmentsByMonthRequest(year, month);

        const assessmentsByDate: Record<string, string[]> = {};

        if (
          response.data.assessments &&
          Array.isArray(response.data.assessments)
        ) {
          response.data.assessments.forEach((assessment: RawAssessment) => {
            const color = assessment.course?.color;
            // due_date es timestamptz, normalizar a YYYY-MM-DD
            const dateKey = assessment.due_date
              ? assessment.due_date.split("T")[0]
              : null;

            if (!dateKey || !color) return;

            if (!assessmentsByDate[dateKey]) {
              assessmentsByDate[dateKey] = [];
            }
            assessmentsByDate[dateKey].push(color);
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
