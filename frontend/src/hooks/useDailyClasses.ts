import { useEffect, useMemo, useState } from "react";
import { getDay } from "date-fns";
import { courseBySemesterRequest } from "../api/course";
import { dayViewRequest } from "../api/day.api";

type CourseRecord = {
    course_id: string;
    status?: string;
    color?: string;
    courses?: {
        name?: string;
    };
};

type DayRecord = {
    day_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    classroom?: string;
};

export type DailyClassItem = {
    dayId: string;
    courseId: string;
    courseName: string;
    color: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    classroom?: string;
};

type UseDailyClassesResult = {
    classes: DailyClassItem[];
    loading: boolean;
    errorMessage: string;
};

const DAY_NAMES = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

const normalizeStatus = (status?: string) =>
    (status || "").trim().toLowerCase();

const normalizeDay = (day?: string) => (day || "").trim().toLowerCase();

const getDefaultColor = (color?: string) => color || "#0f93ad";

const normalizeTime = (timeValue?: string) => (timeValue || "--:--").slice(0, 5);

export function useDailyClasses(
    selectedDate: Date,
    selectedSemester: string,
): UseDailyClassesResult {
    const [allClasses, setAllClasses] = useState<DailyClassItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const selectedDayOfWeek = useMemo(
        () => DAY_NAMES[getDay(selectedDate)] ?? "",
        [selectedDate],
    );

    useEffect(() => {
        let cancelled = false;

        const loadDailyClasses = async () => {
            if (!selectedSemester) {
                setAllClasses([]);
                setErrorMessage("");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setErrorMessage("");

                console.log("[useDailyClasses] selectedSemester:", selectedSemester);
                console.log("[useDailyClasses] selectedDayOfWeek:", selectedDayOfWeek);

                const { data: courseData } = await courseBySemesterRequest(selectedSemester);
                const semesterCourses: CourseRecord[] = Array.isArray(courseData?.courses)
                    ? courseData.courses
                    : [];

                console.log("[useDailyClasses] semesterCourses:", semesterCourses);

                const activeCourses = semesterCourses.filter(
                    (course) => normalizeStatus(course.status) === "active",
                );

                console.log("[useDailyClasses] activeCourses:", activeCourses);

                const courseSchedules = await Promise.all(
                    activeCourses.map(async (course) => {
                        try {
                            const { data } = await dayViewRequest(course.course_id);
                            const days: DayRecord[] = Array.isArray(data?.days)
                                ? data.days
                                : [];

                            console.log("[useDailyClasses] course days:", {
                                courseId: course.course_id,
                                courseName: course.courses?.name ?? "Sin nombre",
                                days,
                            });

                            return days.map<DailyClassItem>((day) => ({
                                dayId: day.day_id,
                                courseId: course.course_id,
                                courseName: course.courses?.name ?? "Sin nombre",
                                color: getDefaultColor(course.color),
                                dayOfWeek: normalizeDay(day.day_of_week),
                                startTime: normalizeTime(day.start_time),
                                endTime: normalizeTime(day.end_time),
                                classroom: day.classroom,
                            }));
                        } catch (error) {
                            console.error("Error loading class days", course.course_id, error);
                            return [];
                        }
                    }),
                );

                const nextClasses = courseSchedules.flat().filter((classItem) => {
                    return classItem.dayOfWeek === selectedDayOfWeek;
                });

                console.log("[useDailyClasses] nextClasses:", nextClasses);

                nextClasses.sort((first, second) => {
                    const timeComparison = first.startTime.localeCompare(second.startTime);
                    if (timeComparison !== 0) return timeComparison;
                    return first.courseName.localeCompare(second.courseName);
                });

                if (!cancelled) {
                    setAllClasses(nextClasses);
                }
            } catch (error) {
                console.error("Error loading daily classes", error);
                if (!cancelled) {
                    setAllClasses([]);
                    setErrorMessage("No se pudieron cargar las clases del día");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDailyClasses();

        return () => {
            cancelled = true;
        };
    }, [selectedSemester, selectedDayOfWeek]);

    const classes = useMemo(
        () =>
            allClasses.filter(
                (classItem) => classItem.dayOfWeek === selectedDayOfWeek,
            ),
        [allClasses, selectedDayOfWeek],
    );

    return { classes, loading, errorMessage };
}