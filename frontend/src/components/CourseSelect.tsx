import type { ChangeEvent, SelectHTMLAttributes } from "react";

export type Course = {
  course_id: string;
  courses: { name: string };
  teacher?: string;
  credits?: number;
  color?: string;
  status?: string;
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
  label = "Course",
  emptyOptionText = "There are no courses available",
  placeholderOptionText,
  value,
  onValueChange,
  selectProps,
}: CourseSelectProps) {
  const hasControlledValue = value !== undefined;
  const availableCourses = courses.filter(
    (c) => (c.status || "").toLowerCase() !== "completed",
  );

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
        {availableCourses.length > 0 && placeholderOptionText ? (
          <option value="" disabled>
            {placeholderOptionText}
          </option>
        ) : null}

        {availableCourses.length === 0 ? (
          <option value="">{emptyOptionText}</option>
        ) : null}

        {availableCourses.map((course) => (
          <option key={course.course_id} value={course.courses.name}>
            {course.courses.name}
          </option>
        ))}
      </select>
    </>
  );
}

export default CourseSelect;
