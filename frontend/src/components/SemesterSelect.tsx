import type { ChangeEvent, SelectHTMLAttributes } from "react";
import type { Semester } from "../hooks/useSemesters";

type SemesterSelectProps = {
  semesters: Semester[];
  id?: string;
  label?: string;
  emptyOptionText?: string;
  placeholderOptionText?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
};

function SemesterSelect({
  semesters,
  id = "semester-select",
  label = "Semestre",
  emptyOptionText = "No hay semestres registrados",
  placeholderOptionText,
  value,
  onValueChange,
  selectProps,
}: SemesterSelectProps) {
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
        {semesters.length > 0 && placeholderOptionText ? (
          <option value="" disabled>
            {placeholderOptionText}
          </option>
        ) : null}

        {semesters.length === 0 ? (
          <option value="">{emptyOptionText}</option>
        ) : null}

        {semesters.map((semester) => (
          <option key={semester.semester_id} value={semester.semester_name}>
            {semester.semester_name}
          </option>
        ))}
      </select>
    </>
  );
}

export default SemesterSelect;
