import type { ChangeEvent, SelectHTMLAttributes } from "react";

type Course = {
  course_name: string;
};

type CourseSelectProps = {
  courses: Course[];
  id?: string;
  label?: string;
  emptyOptionText?: string;
  placeholderOptionText?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
};

function CourseSelect({
  courses,
  id = "course-select",
  label = "Curso",
  emptyOptionText = "No hay cursos registrados",
  placeholderOptionText,
  value,
  onValueChange,
  selectProps,
}: CourseSelectProps) {
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
        {courses.length > 0 && placeholderOptionText ? (
          <option value="" disabled>
            {placeholderOptionText}
          </option>
        ) : null}

        {courses.length === 0 ? (
          <option value="">{emptyOptionText}</option>
        ) : null}

        {courses.map((course) => (
          <option key={course.course_name} value={course.course_name}>
            {course.course_name}
          </option>
        ))}
      </select>
    </>
  );
}

export default CourseSelect;
