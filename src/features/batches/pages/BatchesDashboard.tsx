import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MoreHorizontal, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import BatchCreateForm from "../components/BatchCreateForm";
import BatchManagePage from "./BatchManagePage";
import BatchTeachersPanel from "../components/BatchTeachersPanel";
import {
  batchApi,
  listBatches,
  type BatchListItem,
  type BatchListResult,
  type BatchStudent,
} from "../api/batches.api";
import { teamApi, type ApiMember } from "../../team/api/team.api";
import { listStudentOptions } from "../../students/api/students.api";
import type { StudentOption } from "../../students/types";
import { listCourses } from "../../courses/api/courses.api";

type Status = "upcoming" | "active" | "completed" | "cancelled";
const statusLabel = (status: Status) =>
  status[0].toUpperCase() + status.slice(1);
const date = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const StatusBadge = ({ status }: { status: Status }) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "active" ? "bg-emerald-50 text-emerald-700" : status === "completed" ? "bg-slate-100 text-slate-600" : status === "cancelled" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}
  >
    {statusLabel(status)}
  </span>
);
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 ${className}`}
  >
    {children}
  </section>
);

function teacherNames(batch: BatchListItem, members: ApiMember[]) {
  return (batch.teacherAssignments?.map(entry => entry.userId) ?? [batch.primaryTeacherUserId, batch.coTeacherUserId])
    .filter(Boolean)
    .map(
      (id) =>
        members.find((member) => member.userId === id)?.name ??
        "Assigned teacher",
    )
    .join(" � ");
}

function Overview({
  onOpen,
  onCreate,
}: {
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [result, setResult] = useState<BatchListResult | null>(null);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [archiveView, setArchiveView] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(
      () => {
        setLoading(true);
        Promise.all([
          listBatches({
            page,
            pageSize: 20,
            search: search || undefined,
            status: (status || undefined) as Status | undefined,
            view: archiveView ? "archived" : "active",
            courseId: courseId || undefined,
            sortBy: "startsAt",
            sortOrder,
          }),
          teamApi.members({ page: 1, pageSize: 100, status: "active" }),
          listCourses(),
        ])
          .then(([batches, team, courseItems]) => {
            if (mounted) {
              setResult(batches);
              setMembers(team.data);
              setCourses(courseItems);
            }
          })
          .catch(() => mounted && toast.error("Could not load batches."))
          .finally(() => mounted && setLoading(false));
      },
      search ? 300 : 0,
    );
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [search, status, courseId, sortOrder, page, archiveView, reloadKey]);
  const archivedAction = async (batch: BatchListItem, action: "restore" | "delete") => {
    if (bulkDeleting) return;
    if (action === "delete" && !window.confirm(`Permanently delete ${batch.name}? This cannot be undone.`)) return;
    try {
      if (action === "restore") await batchApi.restore(batch.id);
      else await batchApi.permanentlyDelete(batch.id);
      toast.success(action === "restore" ? "Batch restored" : "Batch permanently deleted");
      setSelectedArchivedIds(ids => ids.filter(id => id !== batch.id));
      if (result?.items.length === 1 && page > 1) {
        setPage(value => value - 1);
      } else {
        setReloadKey(value => value + 1);
      }
    } catch (error) {
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Could not update batch.");
    }
  };
  const deletableArchived = (result?.items ?? []).filter(
    batch => batch.enrolledCount === 0 && batch.waitlistCount === 0,
  );
  const selectedArchived = deletableArchived.filter(batch => selectedArchivedIds.includes(batch.id));
  const bulkDeleteArchived = async () => {
    if (!selectedArchived.length || bulkDeleting) return;
    if (!window.confirm(`Permanently delete ${selectedArchived.length} archived batches? This cannot be undone.`)) return;
    setBulkDeleting(true);
    const deletedIds: string[] = [];
    try {
      for (const batch of selectedArchived) {
        try {
          await batchApi.permanentlyDelete(batch.id);
          deletedIds.push(batch.id);
        } catch {
          // Continue so one changed batch does not prevent deletion of the others.
        }
      }
      if (deletedIds.length) toast.success(`${deletedIds.length} archived batch${deletedIds.length === 1 ? "" : "es"} permanently deleted`);
      if (deletedIds.length !== selectedArchived.length) toast.error(`${selectedArchived.length - deletedIds.length} batch${selectedArchived.length - deletedIds.length === 1 ? "" : "es"} could not be deleted. Refresh and check students or waitlist.`);
      setSelectedArchivedIds(ids => ids.filter(id => !deletedIds.includes(id)));
      if (deletedIds.length === result?.items.length && page > 1) {
        setPage(value => value - 1);
      } else {
        setReloadKey(value => value + 1);
      }
    } finally {
      setBulkDeleting(false);
    }
  };
  const metrics = result?.metrics ?? {
    activeBatches: 0,
    enrolledStudents: 0,
    waitlistedStudents: 0,
    startingSoon: 0,
  };
  return (
    <main className="mx-auto max-w-7xl space-y-5 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batches & Cohorts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Plan, fill, and support every learning cohort in one place.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
        >
          <Plus size={16} />
          Create batch
        </button>
      </div>
      <div className="flex gap-2 border-b border-slate-200 pb-2" aria-label="Batch view">
        <button type="button" disabled={bulkDeleting} onClick={() => { if (!archiveView) return; setSelectedArchivedIds([]); setResult(null); setArchiveView(false); setPage(1); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${!archiveView ? "bg-[#0C5A69] text-white" : "text-slate-600 hover:bg-slate-100"}`}>Batches</button>
        <button type="button" disabled={bulkDeleting} onClick={() => { if (archiveView) return; setSelectedArchivedIds([]); setResult(null); setArchiveView(true); setPage(1); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${archiveView ? "bg-[#0C5A69] text-white" : "text-slate-600 hover:bg-slate-100"}`}>Archive</button>
      </div>
      {!archiveView && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active batches", metrics.activeBatches, "text-[#0C5A69]"],
          ["Students enrolled", metrics.enrolledStudents, "text-amber-600"],
          ["On waitlists", metrics.waitlistedStudents, "text-rose-600"],
          ["Starting soon", metrics.startingSoon, "text-emerald-600"],
        ].map(([label, value, color]) => (
          <Card key={String(label)}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-slate-500">
              {label === "Starting soon"
                ? "Within the next 14 days"
                : "Across your batches"}
            </p>
          </Card>
        ))}
      </div>}
      <Card className="p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => { setSelectedArchivedIds([]); setSearch(e.target.value); setPage(1); }}
              placeholder="Search batches or courses"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </label>
          <select
            value={status}
            onChange={(e) => { setSelectedArchivedIds([]); setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={courseId}
            onChange={(e) => {
              setSelectedArchivedIds([]);
              setCourseId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSelectedArchivedIds([]);
              setSortOrder((value) => (value === "asc" ? "desc" : "asc"));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {sortOrder === "asc" ? "Oldest first" : "Newest first"}
          </button>
        </div>
      </Card>
      {archiveView && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-slate-600">{selectedArchived.length} selected for permanent deletion. Restore batches with students or a waitlist, then transfer or remove them before deleting.</span>
          <button type="button" disabled={!selectedArchived.length || bulkDeleting} onClick={() => void bulkDeleteArchived()} className="rounded-lg border border-rose-200 px-3 py-2 font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
            {bulkDeleting ? "Deleting..." : `Delete selected (${selectedArchived.length})`}
          </button>
        </div>
      )}
      {result && result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            disabled={!result.pagination.hasPrev}
            onClick={() => { setSelectedArchivedIds([]); setPage((value) => value - 1); }}
            className="rounded border px-3 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {result.pagination.page} of {result.pagination.totalPages}
          </span>
          <button
            disabled={!result.pagination.hasNext}
            onClick={() => { setSelectedArchivedIds([]); setPage((value) => value + 1); }}
            className="rounded border px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                {archiveView && <th className="px-5 py-3"><input type="checkbox" aria-label="Select all deletable batches on this page" checked={deletableArchived.length > 0 && deletableArchived.every(batch => selectedArchivedIds.includes(batch.id))} disabled={!deletableArchived.length || bulkDeleting} onChange={event => setSelectedArchivedIds(event.target.checked ? deletableArchived.map(batch => batch.id) : [])} /></th>}
                <th className="px-5 py-3">Batch & course</th>
                <th className="px-5 py-3">Teachers</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Waitlist</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={archiveView ? 8 : 7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading batches�
                  </td>
                </tr>
              ) : result?.items.length ? (
                result.items.map((batch) => (
                  <tr
                    key={batch.id}
                    onClick={() => { if (!archiveView) onOpen(batch.id); }}
                    className={archiveView ? "hover:bg-slate-50" : "cursor-pointer hover:bg-slate-50"}
                  >
                    {archiveView && <td className="px-5 py-4"><input type="checkbox" aria-label={`Select ${batch.name} for permanent deletion`} checked={selectedArchivedIds.includes(batch.id)} disabled={batch.enrolledCount > 0 || batch.waitlistCount > 0 || bulkDeleting} onClick={event => event.stopPropagation()} onChange={event => setSelectedArchivedIds(ids => event.target.checked ? [...ids, batch.id] : ids.filter(id => id !== batch.id))} /></td>}
                    <td className="px-5 py-4">
                      <b>{batch.name}</b>
                      <p className="mt-1 text-xs text-slate-500">
                        {batch.courseTitle}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {teacherNames(batch, members)}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {date(batch.startsAt)} � {date(batch.endsAt)}
                    </td>
                    <td className="px-5 py-4">
                      <b className="text-xs">
                        {batch.enrolledCount} / {batch.capacity}
                      </b>
                      <div className="mt-2 h-1.5 w-24 rounded bg-slate-100">
                        <div
                          className="h-full rounded bg-[#0C5A69]"
                          style={{
                            width: `${Math.min(100, (batch.enrolledCount / batch.capacity) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">{batch.waitlistCount}</td>
                    <td className="px-5 py-4">
                      {archiveView ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Archived</span>
                      ) : (
                        <StatusBadge status={batch.status} />
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {archiveView ? <div className="flex justify-end gap-2"><button type="button" disabled={bulkDeleting} onClick={() => void archivedAction(batch, "restore")} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-[#0C5A69] disabled:opacity-50">Restore</button><button type="button" onClick={() => void archivedAction(batch, "delete")} disabled={bulkDeleting || batch.enrolledCount > 0 || batch.waitlistCount > 0} title={batch.enrolledCount > 0 || batch.waitlistCount > 0 ? "Restore this batch, then transfer or remove students before permanent deletion" : undefined} className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">Delete permanently</button></div> : <button
                        type="button"
                        aria-label={`View ${batch.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpen(batch.id);
                        }}
                        className="rounded-md border border-slate-200 p-1.5 hover:bg-slate-50"
                      >
                        <MoreHorizontal size={16} />
                      </button>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={archiveView ? 8 : 7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}

function Detail({
  id,
  onBack,
  onManage,
}: {
  id: string;
  onBack: () => void;
  onManage: () => void;
}) {
  const [batch, setBatch] = useState<BatchListItem | null>(null);
  const [students, setStudents] = useState<BatchStudent[]>([]);
  const [waitlist, setWaitlist] = useState<BatchStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<StudentOption[]>(
    [],
  );
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [edit, setEdit] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [waitlistId, setWaitlistId] = useState("");
  const reload = useCallback(() =>
    Promise.all([
      batchApi.get(id),
      batchApi.students(id),
      batchApi.waitlist(id),
      listStudentOptions(),
      teamApi.members({ page: 1, pageSize: 100, status: "active" }),
    ])
      .then(([b, s, w, options, team]) => {
        setBatch(b);
        setStudents(s);
        setWaitlist(w);
        setAvailableStudents(options);
        setMembers(team.data);
      })
      .catch(() => toast.error("Could not load batch details.")), [id]);
  useEffect(() => {
    reload();
  }, [reload]);
  const call = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
      await reload();
      return true;
    } catch (error) {
      toast.error(
        (error as any)?.response?.data?.message ||
          "Action could not be completed.",
      );
      return false;
    }
  };
  const visibleStudents = students.filter((student) =>
    `${student.name} ${student.email}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase()),
  );
  if (!batch)
    return (
      <main className="py-16 text-center text-slate-500">Loading batch�</main>
    );
  return (
    <main className="mx-auto max-w-7xl space-y-5 pb-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft size={16} />
        Batches
      </button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{batch.name}</h1>
            <StatusBadge status={batch.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {batch.courseTitle} � {date(batch.startsAt)} � {date(batch.endsAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onManage}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Transfer students
          </button>
          <button
            onClick={() => setEdit(!edit)}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            {edit ? "Close edit" : "Edit batch"}
          </button>
          <button
            onClick={() => {
              if (
                !window.confirm(
                  "Archive this batch? You can restore it later from Archive.",
                )
              )
                return;
              batchApi
                .archive(id)
                .then(() => {
                  toast.success("Batch archived");
                  onBack();
                })
                .catch((error) =>
                  toast.error(
                    (error as { response?: { data?: { message?: string } } })
                      ?.response?.data?.message || "Could not archive batch.",
                  ),
                );
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Archive batch
          </button>
        </div>
      </div>
      {edit && (
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              call(
                () =>
                  batchApi.update(id, {
                    name: String(form.get("name")),
                    description: String(form.get("description")),
                    status: String(form.get("status")) as Status,
                  }),
                "Batch updated",
              );
              setEdit(false);
            }}
            className="grid gap-3 md:grid-cols-3"
          >
            <input
              name="name"
              defaultValue={batch.name}
              className="rounded-lg border p-2.5 text-sm"
            />
            <input
              name="description"
              defaultValue={batch.description || ""}
              placeholder="Description"
              className="rounded-lg border p-2.5 text-sm"
            />
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={batch.status}
                className="min-w-0 flex-1 rounded-lg border p-2.5 text-sm"
              >
                {(
                  ["upcoming", "active", "completed", "cancelled"] as Status[]
                ).map((value) => (
                  <option key={value} value={value}>
                    {statusLabel(value)}
                  </option>
                ))}
              </select>
              <button className="rounded-lg bg-[#0C5A69] px-4 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </form>
        </Card>
      )}
      <BatchTeachersPanel batchId={id} onChanged={reload} />
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold text-slate-500">Course</p>
          <p className="mt-2 text-sm font-bold">{batch.courseTitle}</p>
          <p className="mt-2 text-xs text-slate-500">
            {teacherNames(batch, members)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold text-slate-500">Date range</p>
          <p className="mt-2 text-sm font-bold">
            {date(batch.startsAt)} – {date(batch.endsAt)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {batch.schedule?.days?.join(" & ") || "Schedule unavailable"} ·{" "}
            {batch.schedule?.startTime || ""}–{batch.schedule?.endTime || ""}{" "}
            {batch.schedule?.timezone || ""}
          </p>
        </Card>
        <Card>
          <div className="flex justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">Capacity</p>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
              {Math.max(0, batch.capacity - students.length)} seats open
            </span>
          </div>
          <p className="mt-2 text-sm font-bold">
            {students.length} / {batch.capacity} students
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#0C5A69]"
              style={{
                width: `${Math.min(100, (students.length / batch.capacity) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {waitlist.length} students currently waiting
          </p>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold">Student roster</h2>
                <p className="text-xs text-slate-500">
                  {students.length} enrolled students
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  call(
                    () => batchApi.addStudents(id, [studentId]),
                    "Student added",
                  );
                  setStudentId("");
                }}
                className="flex gap-2"
              >
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="min-w-0 rounded-lg border px-3 py-2 text-xs"
                  required
                >
                  <option value="">Select student</option>
                  {availableStudents
                    .filter(
                      (option) =>
                        !students.some(
                          (student) => student.studentId === option.id,
                        ) &&
                        !waitlist.some(
                          (student) => student.studentId === option.id,
                        ),
                    )
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.fullName} · {option.studentCode}
                      </option>
                    ))}
                </select>
                <button className="rounded-lg bg-[#0C5A69] px-3 py-2 text-xs font-semibold text-white">
                  Add
                </button>
              </form>
            </div>
            <label className="relative mt-4 block">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search enrolled students"
                className="w-full rounded-lg border py-2 pl-8 pr-3 text-xs"
              />
            </label>
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <div className="grid min-w-[520px] grid-cols-[minmax(0,2fr)_1fr_1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase text-slate-500">
                <span>Student</span>
                <span>Joined</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleStudents.length ? (
                  visibleStudents.map((student) => (
                    <div
                      key={student.studentId}
                      className="grid min-w-[520px] grid-cols-[minmax(0,2fr)_1fr_1fr_auto] items-center gap-3 px-3 py-3"
                    >
                      <div>
                        <b className="text-sm">{student.name}</b>
                        <p className="text-xs text-slate-500">
                          {student.email} · Joined{" "}
                          {student.joinedAt ? date(student.joinedAt) : "today"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-600">
                        {student.joinedAt ? date(student.joinedAt) : "—"}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Enrolled
                      </span>
                      <button
                        onClick={() =>
                          call(
                            () => batchApi.removeStudent(id, student.studentId),
                            "Student removed",
                          )
                        }
                        className="text-xs font-semibold text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-sm text-slate-500">
                    {students.length
                      ? "No students match this search."
                      : "No students are enrolled yet."}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Showing {visibleStudents.length} of {students.length} enrolled
              students
            </p>
          </Card>
        </div>
        <aside className="space-y-4">
          <Card>
            <h2 className="font-bold">Capacity</h2>
            <p className="mt-2 text-xl font-bold">
              {students.length} / {batch.capacity}
            </p>
            <div className="mt-3 h-2 rounded bg-slate-100">
              <div
                className="h-full rounded bg-[#0C5A69]"
                style={{
                  width: `${Math.min(100, (students.length / batch.capacity) * 100)}%`,
                }}
              />
            </div>
          </Card>
          <Card>
            <h2 className="font-bold">Waitlist</h2>
            <p className="text-xs text-slate-500">
              {waitlist.length} students waiting
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                call(
                  () => batchApi.addWaitlist(id, [waitlistId]),
                  "Student added to waitlist",
                );
                setWaitlistId("");
              }}
              className="mt-3 flex gap-2"
            >
              <select
                value={waitlistId}
                onChange={(e) => setWaitlistId(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border px-2 py-2 text-xs"
                required
              >
                <option value="">Select student</option>
                {availableStudents
                  .filter(
                    (option) =>
                      !students.some(
                        (student) => student.studentId === option.id,
                      ) &&
                      !waitlist.some(
                        (student) => student.studentId === option.id,
                      ),
                  )
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.fullName}
                    </option>
                  ))}
              </select>
              <button className="rounded-lg border px-2 text-xs">Add</button>
            </form>
            <div className="mt-3 divide-y">
              {waitlist.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm">{student.name}</span>
                  <button
                    onClick={() =>
                      call(
                        () => batchApi.removeWaitlist(id, student.studentId),
                        "Removed from waitlist",
                      )
                    }
                    className="text-xs text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

export default function BatchesDashboard() {
  const [view, setView] = useState<"overview" | "create" | "detail" | "manage">(
    "overview",
  );
  const [selectedId, setSelectedId] = useState("");
  if (view === "create")
    return (
      <BatchCreateForm
        onCancel={() => setView("overview")}
        onCreated={() => setView("overview")}
      />
    );
  if (view === "manage" && selectedId)
    return <BatchManagePage id={selectedId} onBack={() => setView("detail")} />;
  if (view === "detail" && selectedId)
    return (
      <Detail
        id={selectedId}
        onBack={() => setView("overview")}
        onManage={() => setView("manage")}
      />
    );
  return (
    <Overview
      onCreate={() => setView("create")}
      onOpen={(id) => {
        setSelectedId(id);
        setView("detail");
      }}
    />
  );
}
