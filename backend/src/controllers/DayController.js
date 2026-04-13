const dayService = require("../services/DayService");

const validDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MIN_ALLOWED_MINUTES = 6 * 60;
const MAX_ALLOWED_MINUTES = 22 * 60;

const parseTimeToMinutes = (timeValue) => {
  if (!timeValue || typeof timeValue !== "string") {
    return null;
  }

  const parts = timeValue.trim().split(":");
  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const normalizeTime = (timeValue) => {
  const parts = timeValue.trim().split(":");
  const hours = String(Number(parts[0])).padStart(2, "0");
  const minutes = String(Number(parts[1])).padStart(2, "0");

  return `${hours}:${minutes}:00`;
};

const isWithinAllowedHours = (minutes) =>
  minutes >= MIN_ALLOWED_MINUTES && minutes <= MAX_ALLOWED_MINUTES;

exports.getDays = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student_id = req.student.id;
    const days = await dayService.getAll(courseId, student_id);
    res.status(200).json({ days });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createDay = async (req, res) => {
  try {
    const {
      dayOfWeek,
      startTime,
      endTime,
      classroom,
      courseName,
      semesterName,
    } = req.body;
    const student_id = req.student.id;
    const normalizedDayOfWeek = dayOfWeek?.trim().toLowerCase();

    if (!dayOfWeek || !startTime || !endTime || !courseName || !semesterName) {
      return res.status(400).json({
        error:
          "dayOfWeek, startTime, endTime, courseName and semesterName are required",
      });
    }

    if (!validDays.includes(normalizedDayOfWeek)) {
      return res.status(400).json({
        error: `Invalid day. Use: ${validDays.join(", ")}`,
      });
    }

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes === null || endMinutes === null) {
      return res.status(400).json({
        error: "Invalid time format. Use HH:MM",
      });
    }

    if (
      !isWithinAllowedHours(startMinutes) ||
      !isWithinAllowedHours(endMinutes)
    ) {
      return res.status(400).json({
        error: "The schedule must be between 06:00 and 22:00",
      });
    }

    if (startMinutes >= endMinutes) {
      return res
        .status(400)
        .json({ error: "The start time must be earlier than the end time" });
    }

    const course = await dayService.getCourseByNameAndSemester(
      courseName,
      semesterName,
      student_id,
    );
    if (!course) {
      return res.status(404).json({
        error: `Course "${courseName}" not found in semester "${semesterName}"`,
      });
    }

    const conflict = await dayService.checkConflict(
      normalizedDayOfWeek,
      normalizeTime(startTime),
      normalizeTime(endTime),
      student_id,
    );

    if (conflict && conflict.length > 0) {
      return res.status(400).json({
        error: `You already have a class registered on ${dayOfWeek} at that time`,
      });
    }

    const day = await dayService.create(
      {
        day_of_week: normalizedDayOfWeek,
        start_time: normalizeTime(startTime),
        end_time: normalizeTime(endTime),
        classroom,
        course_id: course.course_id,
      },
      student_id,
    );

    if (!day) {
      return res
        .status(404)
        .json({ error: "Course not found or you don't have permission" });
    }

    res.status(201).json({ message: "Day created successfully", day });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateDay = async (req, res) => {
  try {
    const { dayId } = req.params;
    const { dayOfWeek, startTime, endTime, classroom } = req.body;
    const student_id = req.student.id;
    const normalizedDayOfWeek = dayOfWeek?.trim().toLowerCase();

    if (dayOfWeek && !validDays.includes(normalizedDayOfWeek)) {
      return res.status(400).json({
        error: `Invalid day. Use: ${validDays.join(", ")}`,
      });
    }

    const startMinutes = startTime ? parseTimeToMinutes(startTime) : null;
    const endMinutes = endTime ? parseTimeToMinutes(endTime) : null;

    if (
      (startTime && startMinutes === null) ||
      (endTime && endMinutes === null)
    ) {
      return res.status(400).json({
        error: "Invalid time format. Use HH:MM",
      });
    }

    if (
      (startMinutes !== null && !isWithinAllowedHours(startMinutes)) ||
      (endMinutes !== null && !isWithinAllowedHours(endMinutes))
    ) {
      return res.status(400).json({
        error: "The schedule must be between 06:00 and 22:00",
      });
    }

    if (
      startMinutes !== null &&
      endMinutes !== null &&
      startMinutes >= endMinutes
    ) {
      return res
        .status(400)
        .json({ error: "The start time must be earlier than the end time" });
    }

    if (dayOfWeek || startTime || endTime) {
      const conflict = await dayService.checkConflict(
        normalizedDayOfWeek,
        startTime ? normalizeTime(startTime) : null,
        endTime ? normalizeTime(endTime) : null,
        student_id,
      );

      if (conflict && conflict.length > 0) {
        return res.status(400).json({
          error: `You already have a class registered on ${dayOfWeek} at that time`,
        });
      }
    }

    const result = await dayService.update(dayId, student_id, {
      ...(dayOfWeek && { day_of_week: normalizedDayOfWeek }),
      ...(startTime && { start_time: normalizeTime(startTime) }),
      ...(endTime && { end_time: normalizeTime(endTime) }),
      ...(classroom && { classroom }),
    });

    if (!result) {
      return res.status(404).json({
        error: "Day not found or you don't have permission to edit it",
      });
    }

    res.status(200).json({ message: "Day updated successfully", day: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteDay = async (req, res) => {
  try {
    const { dayId } = req.params;
    const student_id = req.student.id;

    const result = await dayService.delete(dayId, student_id);

    if (!result) {
      return res.status(404).json({
        error: "Day not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({ message: "Day deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
