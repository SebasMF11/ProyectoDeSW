export type DayAssessment = {
  assessment_id: string;
  assessment_name: string;
  type: string;
  percentage: number;
  has_grade?: boolean;
  grade_value?: number | null;
  course: {
    course_name: string;
    color?: string;
  };
};

export default function DayAssessmentsList({
  selectedDate,
  assessments = [],
  isLoading = false,
}: {
  selectedDate: Date;
  assessments?: DayAssessment[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (assessments.length === 0) {
    return <div className="text-gray-500">You don't have events</div>;
  }

  return (
    <div className="space-y-3">
      {assessments.map((assessment) => (
        <div
          key={assessment.assessment_id}
          className="border-l-4 pl-4 py-2"
          style={{ borderColor: assessment.course.color ?? "#ccc" }}
        >
          <p className="font-semibold text-gray-800">
            <span className={assessment.has_grade ? "line-through" : ""}>
              {assessment.assessment_name}
            </span>
            {assessment.has_grade && assessment.grade_value != null ? (
              <span className="ml-2 text-sm font-medium text-gray-500">
                {Number.isFinite(Number(assessment.grade_value))
                  ? Number(assessment.grade_value).toFixed(1)
                  : String(assessment.grade_value)}
              </span>
            ) : null}
          </p>
          <p className="text-sm text-gray-600">
            {assessment.course.course_name}
          </p>
          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <span>Type: {assessment.type}</span>
            <span>{assessment.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
