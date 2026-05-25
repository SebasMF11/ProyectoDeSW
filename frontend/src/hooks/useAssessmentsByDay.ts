import { useEffect, useState } from "react";
import { assessmentsByDayRequest } from "../api/assessment.api";
import { format } from "date-fns";

export interface Assessment {
  assessment_id: string;
  assessment_name: string;
  type: string;
  due_date: string;
  percentage: number;
  has_grade?: boolean;
  grade_value?: number | null;
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

export function useAssessmentsByDay(selectedDate: Date): UseAssessmentsReturn {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const date = format(selectedDate, "yyyy-MM-dd");

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
          const mapped: Assessment[] = response.data.assessments.map(
            (a: any) => ({
              assessment_id: a.assessment_id,
              assessment_name: a.name,
              type: a.type,
              due_date: a.due_date,
              percentage: a.percentage,
              has_grade: Boolean(a.has_grade),
              grade_value: a.grade_value ?? null,
              course: {
                course_name: a.course?.courses?.name ?? "",
                color: a.course?.color ?? undefined,
              },
            }),
          );
          setAssessments(mapped);
        } else {
          setAssessments([]);
        }
      } catch (err) {
        console.error("Error fetching assessments by day:", err);
        setError(
          err instanceof Error ? err.message : "Error loading assessments",
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
