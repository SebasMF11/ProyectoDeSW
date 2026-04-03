import type { ChangeEvent, SelectHTMLAttributes } from "react";

type Assessment = {
  assessment_name: string;
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
      <label htmlFor={id}>{label}</label>
      <select
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
          <option
            key={assessment.assessment_name}
            value={assessment.assessment_name}
          >
            {assessment.assessment_name}
          </option>
        ))}
      </select>
    </>
  );
}

export default AssessmentSelect;
