import { useEffect, useState } from "react";
import { assessmentsByMonthRequest } from "../api/assessment.api";

// Definir la estructura de los datos de evaluación recibidos de la API
interface RawAssessment {
  assessment_id: number;
  assessment_name: string;
  type: string;
  due_date: string; // YYYY-MM-DD
  course: {
    course_name: string;
    color?: string; // Color asignado desde CourseController
  };
  percentage: number;
}

// Definir el tipo de retorno del hook
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

        // Transformar la respuesta a formato de colores por fecha
        const assessmentsByDate: Record<string, string[]> = {};

        if (
          response.data.assessments &&
          Array.isArray(response.data.assessments)
        ) {
          response.data.assessments.forEach((assessment: RawAssessment) => {
            const color = assessment.course?.color ?? "#808080";
            // Normalizar la fecha a YYYY-MM-DD (remove timestamp)
            const dateKey = assessment.due_date.split("T")[0];

            // Agregar el color a la fecha
            if (!assessmentsByDate[dateKey]) {
              assessmentsByDate[dateKey] = [];
            }
            assessmentsByDate[dateKey].push(color);
          });
        }

        setAssessments(assessmentsByDate);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [year, month]);

  return { assessments, isLoading, error };
}
