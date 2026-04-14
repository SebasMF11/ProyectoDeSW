import { useEffect, useState } from "react";
import { assessmentsByDayRequest } from "../api/assessment.api";

export interface Assessment {
  assessment_id: number;
  assessment_name: string;
  type: string;
  due_date: string;
  percentage: number;
  course: {
    course_name: string;
    color?: string;
  };
}

interface UseAssessmentsReturn {
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;
}

export function useAssessmentsByDay(date: string): UseAssessmentsReturn {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await assessmentsByDayRequest(date);

        if (
          response.data.assessments &&
          Array.isArray(response.data.assessments)
        ) {
          setAssessments(response.data.assessments);
        } else {
          setAssessments([]);
        }
      } catch (err) {
        console.error("Error fetching assessments by day:", err);
        setError(
          err instanceof Error ? err.message : "Error loading assessments"
        );
        setAssessments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [date]);

  return { assessments, isLoading, error };
}
