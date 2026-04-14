import { useAssessmentsByDay } from "../hooks/useAssessmentsByDay";

export default function DayAssessmentsList({
  selectedDate,
}: {
  selectedDate: Date;
}) {
  const { assessments, isLoading } = useAssessmentsByDay(
    selectedDate.toISOString().split("T")[0],
  );

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
            {assessment.assessment_name}
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
