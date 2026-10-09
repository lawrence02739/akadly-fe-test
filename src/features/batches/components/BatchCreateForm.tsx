import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";
import { listCourses } from "../../courses/api/courses.api";
import { instructorsApi, type Instructor } from "../../instructors/api/instructors.api";
import { type TeacherAssignment, createBatch } from "../api/batches.api";

type CourseOption = { id: string; title: string; status?: string };
type CreatedBatchView = {
  id: string;
  name: string;
  course: string;
  teachers: string;
  dates: string;
  capacity: number;
  status: "Active" | "Upcoming";
};

const field =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0C5A69] disabled:bg-slate-50";
const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function BatchCreateForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (batch: CreatedBatchView) => void;
}) {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([{ userId: '', teachingRole: 'instructor' }]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [teachers, setTeachers] = useState<Instructor[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    courseId: "",
    primaryTeacherUserId: "",
    coTeacherUserId: "",
    startsAt: "",
    endsAt: "",
    days: [] as string[],
    startTime: "",
    endTime: "",
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
    capacity: "",
    waitlistEnabled: true,
    description: "",
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      listCourses(),
      (async () => {
        const all: Instructor[] = [];
        let page = 1;
        while (true) {
          const result = await instructorsApi.list({ page, pageSize: 100, status: "active" });
          all.push(...result.data);
          if (!result.meta.hasNext) return all;
          page++;
        }
      })(),
    ])
      .then(([courseItems, members]) => {
        if (!active) return;
        setCourses(
          courseItems.filter(
            (course: CourseOption) => course.status !== "ARCHIVED",
          ),
        );
        setTeachers(members);
      })
      .catch(
        () =>
          active &&
          setLoadingError(
            "Could not load courses and teaching team. Please retry.",
          ),
      )
      .finally(() => active && setLoadingOptions(false));
    return () => {
      active = false;
    };
  }, []);

  const course = courses.find((item) => item.id === form.courseId);
  const setValue = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const toggleDay = (day: string) =>
    setValue(
      "days",
      form.days.includes(day)
        ? form.days.filter((item) => item !== day)
        : [...form.days, day],
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.endsAt < form.startsAt)
      return toast.error("End date must be on or after the start date.");
    setSaving(true);
    try {
      const created = await createBatch({
        name: form.name,
        courseId: form.courseId,
        teacherAssignments: assignments,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        schedule: {
          days: form.days,
          startTime: form.startTime,
          endTime: form.endTime,
          timezone: form.timezone,
        },
        capacity: Number(form.capacity),
        waitlistEnabled: form.waitlistEnabled,
        description: form.description.trim() || undefined,
      });
      toast.success("Batch created successfully.");
      onCreated({
        id: created.id,
        name: created.name,
        course: created.courseTitle,
        teachers: assignments.map(entry => teachers.find(item => item.userId === entry.userId)?.name)
          .filter(Boolean)
          .join(" · "),
        dates: `${new Date(created.startsAt).toLocaleDateString()} – ${new Date(created.endsAt).toLocaleDateString()}`,
        capacity: created.capacity,
        status: created.status === "active" ? "Active" : "Upcoming",
      });
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message || "Could not create the batch.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={15} />
            Batches
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Create a batch</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose an existing course and active teaching team, then set the
            cohort schedule and capacity.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {form.name &&
          form.courseId &&
          assignments.every(entry => entry.userId) &&
          form.startsAt &&
          form.endsAt &&
          form.days.length &&
          form.capacity
            ? "Required fields complete"
            : "Complete required fields"}
        </span>
      </div>
      <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[1fr_310px]">
        <div className="space-y-4">
          <Panel
            title="Batch basics"
            description="Courses and active team members are fetched from this workspace."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Batch name *
                <input
                  required
                  maxLength={160}
                  value={form.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  className={field}
                  placeholder="e.g. UX Design · Spring 2027"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Course *
                <select
                  required
                  disabled={loadingOptions}
                  value={form.courseId}
                  onChange={(e) => setValue("courseId", e.target.value)}
                  className={field}
                >
                  <option value="">
                    {loadingOptions ? "Loading courses…" : "Select a course"}
                  </option>
                  {courses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-3 sm:col-span-2"><p className="text-sm font-semibold">Assigned teachers *</p>
                {assignments.map((entry, index) => <div key={index} className="flex flex-wrap gap-2">
                  <select required className={field} value={entry.userId} onChange={event => setAssignments(current => current.map((item,i) => i === index ? { ...item, userId: event.target.value } : item))}>
                    <option value="">Select teacher</option>{teachers.filter(item => item.userId === entry.userId || !assignments.some(selected => selected.userId === item.userId)).map(item => <option key={item.userId} value={item.userId}>{item.name}</option>)}
                  </select>
                  <select className={field} value={entry.teachingRole} onChange={event => setAssignments(current => current.map((item,i) => i === index ? { ...item, teachingRole: event.target.value as TeacherAssignment['teachingRole'] } : item))}><option value="instructor">Instructor</option><option value="co_instructor">Co-instructor</option></select>
                  {assignments.length > 1 && <button type="button" onClick={() => setAssignments(current => current.filter((_,i) => i !== index))}>Remove</button>}
                </div>)}
                <button type="button" onClick={() => setAssignments(current => [...current,{ userId: '', teachingRole: 'instructor' }])} className="text-sm font-semibold text-[#0C5A69]">+ Add teacher</button>
              </div>
            </div>
            {loadingError && (
              <p className="mt-3 text-sm text-rose-600">{loadingError}</p>
            )}
            {!loadingOptions &&
              !loadingError &&
              (!courses.length || !teachers.length) && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  {!courses.length
                    ? "Create a course before creating a batch."
                    : "Add an active team member before assigning a teacher."}
                </p>
              )}
          </Panel>
          <Panel
            title="Dates & schedule"
            description="Set the learning window and live session schedule."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Start date *
                <input
                  required
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setValue("startsAt", e.target.value)}
                  className={field}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                End date *
                <input
                  required
                  type="date"
                  min={form.startsAt || undefined}
                  value={form.endsAt}
                  onChange={(e) => setValue("endsAt", e.target.value)}
                  className={field}
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">
                Start time *
                <input
                  required
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setValue("startTime", e.target.value)}
                  className={field}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                End time *
                <input
                  required
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setValue("endTime", e.target.value)}
                  className={field}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Timezone *
                <input
                  required
                  value={form.timezone}
                  onChange={(e) => setValue("timezone", e.target.value)}
                  className={field}
                />
              </label>
            </div>
            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-slate-700">
                Session days *
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {days.map((day) => (
                  <label
                    key={day}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${form.days.includes(day) ? "border-[#0C5A69] bg-[#eaf5f6] text-[#0C5A69]" : "border-slate-200 text-slate-600"}`}
                  >
                    <input
                      required={form.days.length === 0}
                      type="checkbox"
                      checked={form.days.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="sr-only"
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </fieldset>
          </Panel>
          <Panel
            title="Enrollment"
            description="Set capacity, waitlist behavior and learner-facing description."
          >
            <div className="flex flex-wrap gap-6">
              <label className="block w-40 text-sm font-medium text-slate-700">
                Capacity *
                <input
                  required
                  min="1"
                  max="100000"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setValue("capacity", e.target.value)}
                  className={field}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  checked={form.waitlistEnabled}
                  onChange={(e) =>
                    setValue("waitlistEnabled", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#0C5A69]"
                />
                <span>
                  <b className="block text-sm">Enable waitlist</b>
                  <small className="text-xs text-slate-500">
                    Students can wait when the batch is full.
                  </small>
                </span>
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Short description
              <textarea
                maxLength={500}
                value={form.description}
                onChange={(e) => setValue("description", e.target.value)}
                className={field + " min-h-24"}
                placeholder="Describe this cohort for enrolled students."
              />
            </label>
          </Panel>
          <div className="flex flex-wrap justify-between gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("batch-review-summary")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Review
              </button>
              <button
                disabled={saving || loadingOptions || Boolean(loadingError)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} />
                {saving ? "Creating…" : "Create batch"}
              </button>
            </div>
          </div>
        </div>
        <aside id="batch-review-summary">
          <Panel title="Review summary" description="Live form preview">
            <h3 className="text-base font-bold">{form.name || "Batch name"}</h3>
            <p className="mt-1 text-xs text-[#0C5A69]">
              {course?.title || "No course selected"}
            </p>
            <div className="mt-5 space-y-4 border-t border-slate-100 pt-4 text-sm">
              <p>
                <b>Teaching team</b>
                <br />
                <span className="text-slate-500">
                  {assignments.map(entry => teachers.find(item => item.userId === entry.userId)?.name)
                    .filter(Boolean)
                    .join(" · ") || "No teachers selected"}
                </span>
              </p>
              <p>
                <b>Dates</b>
                <br />
                <span className="text-slate-500">
                  {form.startsAt || "Start date"} – {form.endsAt || "End date"}
                </span>
              </p>
              <p>
                <b>Schedule</b>
                <br />
                <span className="text-slate-500">
                  {form.days.length
                    ? `${form.days.join(", ")} · ${form.startTime || "start"}–${form.endTime || "end"} ${form.timezone}`
                    : "No session days selected"}
                </span>
              </p>
              <p>
                <b>Enrollment</b>
                <br />
                <span className="text-slate-500">
                  {form.capacity || "0"} seats · Waitlist{" "}
                  {form.waitlistEnabled ? "on" : "off"}
                </span>
              </p>
            </div>
          </Panel>
          <p className="mt-3 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-700">
            The batch is saved when you select Create batch. Students can be
            added from its detail page.
          </p>
        </aside>
      </form>
    </div>
  );
}
