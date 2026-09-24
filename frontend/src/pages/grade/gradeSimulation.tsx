import { useEffect, useMemo, useState } from "react";
import { FaRotateLeft, FaTrash, FaPlus, FaLock } from "react-icons/fa6";
import FloatingActionMenu from "../../components/FloatingActionMenu";
import SemesterSelect from "../../components/SemesterSelect";
import useSemesters from "../../hooks/useSemesters";
import {
  useAssessmentListData,
  type Assessment,
} from "../../hooks/useAssessmentListData";
import { getSemesterAverageRequest } from "../../api/grade";
import { calculateSemesterSimulation } from "../../utils/gradeSimulation";

function GradeSimulation() {
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [simulatedGrades, setSimulatedGrades] = useState<
    Record<string, { grade?: number; percentage?: number }>
  >({});
  const [simulatedExtras, setSimulatedExtras] = useState<
    Record<
      string,
      Array<{ id: string; name: string; grade?: number; percentage: number }>
    >
  >({});
  const [currentSemesterAverage, setCurrentSemesterAverage] = useState<
    number | null
  >(null);
  const [averageError, setAverageError] = useState("");
  const [loadingAverage, setLoadingAverage] = useState(false);

  const { courses, assessments, gradeMap, loading, errorMessage } =
    useAssessmentListData(selectedSemester, semesters);

  useEffect(() => {
    if (!latestSemesterName) return;
    setSelectedSemester((currentValue) => currentValue || latestSemesterName);
  }, [latestSemesterName]);

  useEffect(() => {
    setSimulatedGrades({});
  }, [selectedSemester]);

  useEffect(() => {
    const loadCurrentAverage = async () => {
      setCurrentSemesterAverage(null);
      if (!selectedSemester) {
        setAverageError("");
        return;
      }
      const currentSemester = semesters.find(
        (s) => s.name === selectedSemester,
      );
      if (!currentSemester?.semester_id) {
        setAverageError("");
        return;
      }
      try {
        setLoadingAverage(true);
        setAverageError("");
        const { data } = await getSemesterAverageRequest(
          currentSemester.semester_id,
        );
        const result = data?.result?.semesterAverage;
        setCurrentSemesterAverage(typeof result === "number" ? result : null);
      } catch (error) {
        console.error(error);
        setAverageError("The current semester average could not be loaded");
      } finally {
        setLoadingAverage(false);
      }
    };
    loadCurrentAverage();
  }, [selectedSemester, semesters]);

  const projection = useMemo(
    () =>
      calculateSemesterSimulation({
        courses,
        assessments: assessments as Assessment[],
        gradeMap,
        simulatedGrades,
        simulatedExtras,
      }),
    [assessments, courses, gradeMap, simulatedGrades, simulatedExtras],
  );

  const hasSimulationValues =
    Object.keys(simulatedGrades).length > 0 ||
    Object.values(simulatedExtras).some((arr) => arr.length > 0);

  const handleSimulationChange = (
    key: string,
    field: "grade" | "percentage",
    value: string,
  ) => {
    setSimulatedGrades((current) => {
      const next = { ...(current || {}) };
      const existing = next[key] ?? {};
      if (!value.trim()) {
        const updated = { ...existing };
        if (field === "grade") delete updated.grade;
        else delete updated.percentage;
        if (Object.keys(updated).length === 0) delete next[key];
        else next[key] = updated;
        return next;
      }
      const parsed = Number(value);
      if (Number.isNaN(parsed)) return current;
      next[key] = { ...existing, [field]: parsed };
      return next;
    });
  };

  const addSimulatedExtra = (courseId: string) => {
    setSimulatedExtras((current) => {
      const next = { ...(current || {}) };
      const list = next[courseId] ? [...next[courseId]] : [];
      const id = String(Date.now()) + Math.random().toString(16).slice(2, 8);
      list.push({
        id,
        name: "New simulated",
        grade: undefined,
        percentage: 10,
      });
      next[courseId] = list;
      return next;
    });
  };

  const updateSimulatedExtra = (
    courseId: string,
    id: string,
    field: "name" | "grade" | "percentage",
    value: string,
  ) => {
    setSimulatedExtras((current) => {
      const next = { ...(current || {}) };
      const list = (next[courseId] || []).map((item) => {
        if (item.id !== id) return item;
        if (field === "name") return { ...item, name: value };
        if (field === "grade")
          return { ...item, grade: value === "" ? undefined : Number(value) };
        return { ...item, percentage: Number(value) };
      });
      next[courseId] = list;
      return next;
    });
  };

  const removeSimulatedExtra = (courseId: string, id: string) => {
    setSimulatedExtras((current) => {
      const next = { ...(current || {}) };
      next[courseId] = (next[courseId] || []).filter((i) => i.id !== id);
      return next;
    });
  };

  const clearSimulation = () => setSimulatedGrades({});

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col gap-4 bg-white px-4 py-6 sm:px-6 lg:px-8">
      <header className=" bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5f6b64]">
              Grade simulator
            </p>
            <h1 className="mt-0.5 text-2xl font-bold text-[#102018] sm:text-3xl">
              Project your final average
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#0f93ad] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b7f96] disabled:cursor-not-allowed disabled:bg-[#8bbcc6]"
              onClick={clearSimulation}
              disabled={!hasSimulationValues}
            >
              <FaRotateLeft size={13} />
              Clear simulation
            </button>
          </div>
        </div>

        <div className="mt-4 grid flex items-center grid-cols-2 gap-3 border-t border-[#e4eae5] pt-4">
          <div className="rounded-2xl bg-[#eef4f0] px-4 py-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5a6a61]">
              Current average
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#102018]">
              {loadingAverage ? "..." : (currentSemesterAverage ?? "—")}
            </p>
          </div>
          <div className="rounded-2xl bg-[#ecf7fa] px-4 py-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2d4f5c]">
              Projected average
            </p>
            <p className="mt-1 text-2xl font-bold text-[#065f73]">
              {projection.semesterAverage}
            </p>
          </div>
        </div>
      </header>

      {errorMessage || semesterError || averageError ? (
        <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage || semesterError || averageError}
        </p>
      ) : null}

      <section className="bg-white px-5 py-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5f6b64]">
              Scenario builder
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-[#102018]">
              Enter hypothetical grades for pending assessments
            </h2>
          </div>
          <div className="w-full max-w-xs">
            <SemesterSelect
              semesters={semesters}
              value={selectedSemester}
              onValueChange={setSelectedSemester}
              placeholderOptionText="Select a semester"
              emptyOptionText="No semesters available"
            />
          </div>
        </div>

        {loadingSemesters || loading ? (
          <p className="text-sm text-[#53605a]">Loading simulation data...</p>
        ) : null}

        {!loadingSemesters &&
        !loading &&
        selectedSemester &&
        courses.length === 0 ? (
          <p className="text-sm text-[#53605a]">
            There are no active courses available for the selected semester.
          </p>
        ) : null}

        {!loadingSemesters && !loading && courses.length > 0 ? (
          <div className="space-y-4">
            {projection.courseSimulations.map((course) => {
              const extras = simulatedExtras[course.courseId] || [];
              return (
                <article
                  key={course.courseId}
                  className="overflow-hidden rounded-2xl border border-[#dfe6e1]"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 bg-[#f4f7f4] px-5 py-3">
                    <div>
                      <h3 className="text-base font-bold text-[#102018]">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-[#5d6a62]">
                        {course.teacher} · {course.credits} credits
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-xl border border-[#cdd7cf] bg-white px-3 py-1.5 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5a6960]">
                          Current
                        </p>
                        <p className="text-base font-bold text-[#102018]">
                          {course.currentGrade}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#9fd8e8] bg-[#ecf7fa] px-3 py-1.5 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#46636d]">
                          Projected
                        </p>
                        <p className="text-base font-bold text-[#0b7f96]">
                          {course.projectedGrade}
                        </p>
                      </div>
                    </div>
                  </header>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#e4eae5] bg-white">
                          <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Assessment
                          </th>
                          <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Real grade
                          </th>
                          <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Simulated grade
                          </th>
                          <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Weight %
                          </th>
                          <th className="px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Contribution
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.assessments.map((assessment) => {
                          const canSimulate = assessment.realGrade === null;
                          const isExtra = String(assessment.key).includes(
                            "::extra::",
                          );
                          const inputValueObj =
                            simulatedGrades[assessment.key] ?? {};
                          const inputGrade = inputValueObj.grade;
                          const inputPercentage =
                            inputValueObj.percentage ?? assessment.percentage;

                          return (
                            <tr
                              key={assessment.key}
                              className="border-b border-[#eef2ef] bg-white last:border-b-0 hover:bg-[#fafcfa]"
                            >
                              <td className="px-5 py-3">
                                <p className="font-semibold text-[#102018]">
                                  {assessment.name}
                                </p>
                                <p className="text-xs text-[#5d6a62]">
                                  {assessment.percentage}%
                                </p>
                              </td>

                              <td className="px-4 py-3 text-center">
                                {assessment.realGrade !== null ? (
                                  <span className="font-semibold text-[#102018]">
                                    {assessment.realGrade.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-[#f0f4f1] px-2.5 py-0.5 text-xs font-medium text-[#5d6a62]">
                                    Pending
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {canSimulate && !isExtra ? (
                                  <input
                                    className="w-20 rounded-lg border border-[#cfd7d1] bg-white px-2 py-1.5 text-center text-sm font-semibold text-[#102018] outline-none transition focus:border-[#0f93ad] focus:ring-1 focus:ring-[#0f93ad]/20"
                                    type="number"
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    placeholder="0.0–5.0"
                                    value={inputGrade ?? ""}
                                    onChange={(e) =>
                                      handleSimulationChange(
                                        assessment.key,
                                        "grade",
                                        e.target.value,
                                      )
                                    }
                                  />
                                ) : isExtra ? (
                                  <span className="font-semibold text-[#102018]">
                                    {assessment.simulatedGrade != null
                                      ? assessment.simulatedGrade.toFixed(1)
                                      : "—"}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-[#8fa395]">
                                    <FaLock size={10} />
                                    Locked
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {canSimulate && !isExtra ? (
                                  <input
                                    className="w-16 rounded-lg border border-[#cfd7d1] bg-white px-2 py-1.5 text-center text-sm font-semibold text-[#102018] outline-none transition focus:border-[#0f93ad] focus:ring-1 focus:ring-[#0f93ad]/20"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={inputPercentage ?? ""}
                                    onChange={(e) =>
                                      handleSimulationChange(
                                        assessment.key,
                                        "percentage",
                                        e.target.value,
                                      )
                                    }
                                  />
                                ) : (
                                  <span className="text-sm text-[#5d6a62]">
                                    {assessment.percentage}
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-3 text-center font-semibold text-[#0b7f96]">
                                {assessment.projectedGrade.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[#e4eae5] bg-[#f8faf8] px-5 py-3">
                    <span className="rounded-full border border-[#cdd7cf] bg-white px-3 py-1 text-xs font-semibold text-[#5d6a62]">
                      Evaluated{" "}
                      <span className="text-[#102018]">
                        {course.evaluatedPercentage}%
                      </span>
                    </span>
                    <span className="rounded-full border border-[#9fd8e8] bg-[#ecf7fa] px-3 py-1 text-xs font-semibold text-[#46636d]">
                      Simulated{" "}
                      <span className="text-[#102018]">
                        {course.simulatedPercentage}%
                      </span>
                    </span>
                    <span className="rounded-full border border-[#d5c9be] bg-[#f7f0ea] px-3 py-1 text-xs font-semibold text-[#6f5c50]">
                      Remaining{" "}
                      <span className="text-[#102018]">
                        {course.remainingPercentage}%
                      </span>
                    </span>
                  </div>

                  <div className="border-t border-[#e4eae5] px-5 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                        Simulated extras
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#9fd8e8] bg-[#ecf7fa] px-3 py-1 text-xs font-semibold text-[#0b7f96] transition hover:bg-[#d4eef5]"
                        onClick={() => addSimulatedExtra(course.courseId)}
                      >
                        <FaPlus size={10} />
                        Add assessment
                      </button>
                    </div>

                    {extras.length === 0 ? (
                      <p className="text-xs text-[#8fa395]">
                        No extra assessments added yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-[1fr_80px_90px_36px] gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Name
                          </p>
                          <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Weight %
                          </p>
                          <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-[#5f6b64]">
                            Grade
                          </p>
                          <span />
                        </div>

                        {extras.map((extra) => (
                          <div
                            key={extra.id}
                            className="grid grid-cols-[1fr_80px_90px_36px] items-center gap-2"
                          >
                            <input
                              className="w-full rounded-lg border border-[#cfd7d1] px-3 py-1.5 text-sm text-[#102018] outline-none transition focus:border-[#0f93ad]"
                              value={extra.name}
                              onChange={(e) =>
                                updateSimulatedExtra(
                                  course.courseId,
                                  extra.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                            />
                            <input
                              className="w-full rounded-lg border border-[#cfd7d1] px-2 py-1.5 text-center text-sm font-semibold text-[#102018] outline-none transition focus:border-[#0f93ad]"
                              type="number"
                              min={0}
                              max={100}
                              value={String(extra.percentage)}
                              onChange={(e) =>
                                updateSimulatedExtra(
                                  course.courseId,
                                  extra.id,
                                  "percentage",
                                  e.target.value,
                                )
                              }
                            />
                            <input
                              className="w-full rounded-lg border border-[#cfd7d1] px-2 py-1.5 text-center text-sm font-semibold text-[#102018] outline-none transition focus:border-[#0f93ad]"
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              value={extra.grade ?? ""}
                              onChange={(e) =>
                                updateSimulatedExtra(
                                  course.courseId,
                                  extra.id,
                                  "grade",
                                  e.target.value,
                                )
                              }
                            />
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                              onClick={() =>
                                removeSimulatedExtra(course.courseId, extra.id)
                              }
                              aria-label="Remove extra assessment"
                            >
                              <FaTrash
                                size={14}
                                color="white"
                                className="absolute"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <FloatingActionMenu ariaLabel="Grade simulation actions" />
    </main>
  );
}

export default GradeSimulation;
