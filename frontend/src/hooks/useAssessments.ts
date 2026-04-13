import { useEffect, useState } from "react";
import { assessmentsByMonthRequest } from "../api/assessment.api";

interface RawAssessment {
  assessment_id: number;
  assessment_name: string;
  type: string;
  due_date: string; // YYYY-MM-DD
  course: {
    course_name: string;
    color: string; // Color asignado desde CourseController
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
        console.log(`📅 Fetching assessments for ${year}-${month}`);
        const response = await assessmentsByMonthRequest(year, month);
        console.log("📅 API Response:", response);

        // Transformar la respuesta a formato de colores por fecha
        const assessmentsByDate: Record<string, string[]> = {};

        if (
          response.data.assessments &&
          Array.isArray(response.data.assessments)
        ) {
          console.log(
            `📅 Encontradas ${response.data.assessments.length} actividades`,
          );
          response.data.assessments.forEach((assessment: RawAssessment) => {
            const color = assessment.course.color;
            // Normalizar la fecha a YYYY-MM-DD (remove timestamp)
            const dateKey = assessment.due_date.split("T")[0];

            console.log(
              `  - ${assessment.assessment_name} (${assessment.course.course_name}) en ${dateKey} - Color: ${color}`,
            );

            // Agregar el color a la fecha
            if (!assessmentsByDate[dateKey]) {
              assessmentsByDate[dateKey] = [];
            }
            assessmentsByDate[dateKey].push(color);
          });
        } else {
          console.log("📅 No assessments found or wrong data format");
        }

        console.log("📅 Assessments by date:", assessmentsByDate);
        setAssessments(assessmentsByDate);
      } catch (err) {
        console.error("❌ Error fetching assessments:", err);
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
