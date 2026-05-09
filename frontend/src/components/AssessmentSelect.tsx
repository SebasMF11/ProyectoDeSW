import type { ChangeEvent, SelectHTMLAttributes } from "react";

export type Assessment = {
  assessment_id: string;
  name: string;
  course?: {
    courses?: { name: string };
  };
};

type AssessmentSelectProps = {
  assessments: Assessment[];
  id?: string;
  label?: string;
  emptyOptionText?: string;
  placeholderOptionText?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
};

function AssessmentSelect({
  assessments,
  id = "assessment-select",
  label = "Actividad",
  emptyOptionText = "No hay actividades registradas",
  placeholderOptionText,
  value,
  onValueChange,
  selectProps,
}: AssessmentSelectProps) {
  const hasControlledValue = value !== undefined;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    selectProps?.onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <>
      <label htmlFor={id} className="formText">
        {label}
      </label>
      <select
        className="formControl"
        id={id}
        {...selectProps}
        {...(hasControlledValue ? { value } : {})}
        onChange={handleChange}
      >
        {assessments.length > 0 && placeholderOptionText ? (
          <option value="" disabled>
            {placeholderOptionText}
          </option>
        ) : null}

        {assessments.length === 0 ? (
          <option value="">{emptyOptionText}</option>
        ) : null}

        {assessments.map((assessment) => (
          <option key={assessment.assessment_id} value={assessment.name}>
            {assessment.name}
          </option>
        ))}
      </select>
    </>
  );
}

export default AssessmentSelect;
