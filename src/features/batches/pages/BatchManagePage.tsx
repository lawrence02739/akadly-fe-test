import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Link2, Send, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  batchApi,
  listBatches,
  type BatchAnnouncement,
  type BatchContent,
  type BatchListItem,
  type BatchStudent,
} from "../api/batches.api";

const card = "rounded-xl border border-slate-200 bg-white p-4";
const button =
  "rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50";

export default function BatchManagePage({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const [batch, setBatch] = useState<BatchListItem | null>(null);
  const [students, setStudents] = useState<BatchStudent[]>([]);
  const [content, setContent] = useState<BatchContent[]>([]);
  const [announcements, setAnnouncements] = useState<BatchAnnouncement[]>([]);
  const [destinations, setDestinations] = useState<BatchListItem[]>([]);
  const [destinationError, setDestinationError] = useState(false);
  const [refreshingDestinations, setRefreshingDestinations] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [destinationId, setDestinationId] = useState("");
  const [showTransfer, setShowTransfer] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "announcements">(
    "content",
  );
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<BatchContent["type"]>("resource");
  const [courseNodes, setCourseNodes] = useState<Array<{ id: string; title: string; type: string }>>([]);
  const [courseNodeId, setCourseNodeId] = useState("");
  const [editingContentId, setEditingContentId] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] =
    useState<BatchAnnouncement["audience"]>("all_students");
  const [scheduledFor, setScheduledFor] = useState("");
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshDestinations = useCallback(async () => {
    setRefreshingDestinations(true);
    const batches: BatchListItem[] = [];
    let page = 1;
    try {
      while (true) {
        const result = await listBatches({ page, pageSize: 100 });
        batches.push(...result.items);
        if (!result.pagination.hasNext) break;
        page += 1;
      }
      setDestinations(batches.filter((item) => item.id !== id));
      setDestinationError(false);
    } catch {
      setDestinationError(true);
    } finally {
      setRefreshingDestinations(false);
    }
  }, [id]);

  const reload = useCallback(async () => {
    const [details, roster, linked, posts] = await Promise.all([
      batchApi.get(id),
      batchApi.students(id),
      batchApi.content(id),
      batchApi.announcements(id),
    ]);
    setBatch(details);
    setStudents(roster);
    setSelected((current) =>
      current.filter((studentId) =>
        roster.some((student) => student.studentId === studentId),
      ),
    );
    setContent(linked);
    setAnnouncements(posts);
    await refreshDestinations();
  }, [id, refreshDestinations]);

  useEffect(() => {
    void reload().catch(() => toast.error("Could not load cohort management."));
  }, [reload]);

  useEffect(() => {
    if (!batch?.id) return;
    void batchApi.linkableContent(id)
      .then(setCourseNodes)
      .catch(() => toast.error("Could not load course content."));
  }, [batch?.id, id]);

  useEffect(() => {
    const refreshOnFocus = () => void refreshDestinations();
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [refreshDestinations]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      try {
        await reload();
      } catch {
        toast.error("Saved, but the latest list could not load. Refresh to see it.");
      }
      return true;
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(". ") : message || "Action failed.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const destination = destinations.find((item) => item.id === destinationId);
  const eligibleDestinations = destinations.filter(
    (item) =>
      item.status !== "cancelled" &&
      item.status !== "completed" &&
      item.capacity > item.enrolledCount,
  );
  const available = destination
    ? destination.capacity - destination.enrolledCount
    : 0;
  const canTransfer =
    selected.length > 0 &&
    destination !== undefined &&
    destination.status !== "cancelled" &&
    destination.status !== "completed" &&
    available >= selected.length;
  const selectedStudents = useMemo(
    () => students.filter((student) => selected.includes(student.studentId)),
    [students, selected],
  );

  if (!batch)
    return (
      <main className="py-16 text-center text-slate-500">Loading cohort…</main>
    );

  return (
    <main className="mx-auto max-w-7xl space-y-4 pb-8 text-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {batch.name}{" "}
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 align-middle text-xs font-semibold text-emerald-700">
              {batch.status}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Share cohort content, communicate updates, and manage student
            transfers.
          </p>
        </div>
        <button onClick={onBack} className={button}>
          <ArrowLeft size={14} className="mr-1 inline" />
          Back to batch
        </button>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <div className="space-y-4">
          <section className={card}>
            <div className="mb-4 flex flex-wrap gap-4 border-b border-slate-100 pb-3 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("content")}
                className={
                  activeTab === "content" ? "text-[#0C5A69]" : "text-slate-600"
                }
              >
                Content{" "}
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5">
                  {content.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("announcements")}
                className={
                  activeTab === "announcements"
                    ? "text-[#0C5A69]"
                    : "text-slate-600"
                }
              >
                Announcements{" "}
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5">
                  {announcements.length}
                </span>
              </button>
            </div>
            {activeTab === "content" ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold">Linked content</h2>
                    <p className="text-xs text-slate-500">
                      Only this cohort can see these lessons and resources.
                    </p>
                  </div>
                </div>
                <form
                  className="mt-4 grid gap-2 sm:grid-cols-[1fr_145px]"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const saved = await run(
                      () =>
                        (editingContentId ? batchApi.updateContent(id, editingContentId, {
                          title, type, url: courseNodeId ? "" : url, courseNodeId,
                        }) : batchApi.addContent(id, {
                          title,
                          type,
                          url: courseNodeId ? undefined : url || undefined,
                          courseNodeId: courseNodeId || undefined,
                        })),
                      editingContentId ? "Content updated." : "Content linked.",
                    );
                    if (saved) { setTitle(""); setUrl(""); setCourseNodeId(""); setEditingContentId(""); }
                  }}
                >
                  <input
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Content title"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <select
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value as BatchContent["type"])
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="lesson">Lesson</option>
                    <option value="resource">Resource</option>
                    <option value="template">Template</option>
                  </select>
                  <select
                    value={courseNodeId}
                    onChange={(event) => {
                      const selectedNode = courseNodes.find((node) => node.id === event.target.value);
                      setCourseNodeId(event.target.value);
                      if (selectedNode) { setTitle(selectedNode.title); setUrl(""); setType("lesson"); }
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
                    aria-label="Existing course content"
                  >
                    <option value="">External URL</option>
                    {courseNodes.map((node) => <option key={node.id} value={node.id}>{node.title} ({node.type})</option>)}
                  </select>
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="HTTPS resource URL"
                    disabled={Boolean(courseNodeId)}
                    required={!courseNodeId}
                    type="url"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    disabled={busy}
                    className="rounded-lg bg-[#0C5A69] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <Link2 size={14} className="mr-1 inline" />
                    {editingContentId ? "Save content" : "Link content"}
                  </button>
                  {editingContentId && <button type="button" className={button} onClick={() => { setEditingContentId(""); setTitle(""); setUrl(""); setCourseNodeId(""); }}>Cancel edit</button>}
                </form>
                <div className="mt-4 space-y-2">
                  {content.length ? (
                    content.map((item) => (
                      <div
                        key={item._id || item.title}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.title}{" "}
                            <span className="ml-2 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] capitalize text-sky-700">
                              {item.type}
                            </span>
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {item.courseNodeId ? "Course content" : item.url}
                          </p>
                        </div>
                        {item._id && (<div className="flex items-center gap-2">
                          <button type="button" disabled={busy} onClick={() => { setEditingContentId(item._id!); setTitle(item.title); setType(item.type); setUrl(item.url ?? ""); setCourseNodeId(item.courseNodeId ?? ""); }} className="text-xs font-semibold text-[#0C5A69]">Edit</button>
                          <button
                            aria-label={`Remove ${item.title}`}
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () => batchApi.removeContent(id, item._id!),
                                "Content removed.",
                              )
                            }
                            className="text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>)}
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-sm text-slate-500">
                      No content linked yet.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-sm font-bold">Announcements</h2>
                <p className="text-xs text-slate-500">
                  Scheduled messages for this cohort.
                </p>
                <div className="mt-4 space-y-2">
                  {announcements.length ? (
                    announcements.map((item) => (
                      <div
                        key={item._id || item.createdAt}
                        className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.message}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.audience === "waitlist"
                              ? "Waitlisted students"
                              : "All students"}{" "}
                            ·{" "}
                            {item.scheduledFor
                              ? new Date(item.scheduledFor).toLocaleString()
                              : "Posted"}
                          </p>
                        </div>
                        {item._id && item.scheduledFor && new Date(item.scheduledFor).getTime() > now && (<div className="flex items-center gap-2">
                          <button type="button" disabled={busy} className="text-xs font-semibold text-[#0C5A69]" onClick={() => { setEditingAnnouncementId(item._id!); setMessage(item.message); setAudience(item.audience); const date = new Date(item.scheduledFor!); setScheduledFor(new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)); }}>Edit</button>
                          <button
                            aria-label="Remove announcement"
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () =>
                                  batchApi.removeAnnouncement(id, item._id!),
                                "Announcement removed.",
                              )
                            }
                            className="text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>)}
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-sm text-slate-500">
                      No announcements yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
          <section className={card}>
            <h2 className="text-sm font-bold">Announcements</h2>
            <p className="text-xs text-slate-500">
              Schedule a concise update for this cohort.
            </p>
            <form
              className="mt-3"
              onSubmit={async (event) => {
                event.preventDefault();
                const saved = await run(
                  () =>
                    (editingAnnouncementId ? batchApi.updateAnnouncement(id, editingAnnouncementId, {
                      message, audience, scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
                    }) : batchApi.addAnnouncement(id, {
                      message,
                      audience,
                      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
                    })),
                  editingAnnouncementId ? "Announcement updated." : "Announcement saved.",
                );
                if (saved) { setMessage(""); setScheduledFor(""); setEditingAnnouncementId(""); }
              }}
            >
              <textarea
                required
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write an announcement"
                className="min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <select
                  value={audience}
                  onChange={(event) =>
                    setAudience(
                      event.target.value as BatchAnnouncement["audience"],
                    )
                  }
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="all_students">All students</option>
                  <option value="waitlist">Waitlisted students</option>
                </select>
                <input
                  aria-label="Schedule date and time"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(event) => setScheduledFor(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 p-2 text-xs"
                />
                <button
                  disabled={busy}
                  className="rounded-lg bg-[#0C5A69] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  <Send size={13} className="mr-1 inline" />
                  {editingAnnouncementId ? "Save changes" : scheduledFor ? "Schedule" : "Post now"}
                </button>
                {editingAnnouncementId && <button type="button" className={button} onClick={() => { setEditingAnnouncementId(""); setMessage(""); setScheduledFor(""); }}>Cancel edit</button>}
              </div>
            </form>
          </section>
        </div>
        <aside className={`${card} xl:sticky xl:top-3`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Transfer students</h2>
              <p className="mt-1 text-xs text-slate-500">
                Move selected students to another batch, including a different
                course.
              </p>
            </div>
            <button
              aria-label="Close transfer panel"
              onClick={() => setShowTransfer(false)}
              className="text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
          {!showTransfer ? (
            <button
              onClick={() => setShowTransfer(true)}
              className="mt-5 w-full rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-semibold text-white"
            >
              Select students
            </button>
          ) : (
            <>
              <p className="mt-5 border-t pt-3 text-[11px] font-bold uppercase tracking-wide text-[#0C5A69]">
                Students{" "}
                <span className="float-right text-slate-500">
                  {selected.length} selected
                </span>
              </p>
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      selected.length === students.length
                        ? []
                        : students.map((student) => student.studentId),
                    )
                  }
                  className="mt-2 text-xs font-semibold text-[#0C5A69] underline"
                >
                  {selected.length === students.length
                    ? "Clear selection"
                    : "Select all students"}
                </button>
              )}
              <div className="mt-2 max-h-52 space-y-1 overflow-auto">
                {students.map((student) => (
                  <label
                    key={student.studentId}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 p-2"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(student.studentId)}
                      onChange={() =>
                        setSelected((current) =>
                          current.includes(student.studentId)
                            ? current.filter(
                                (item) => item !== student.studentId,
                              )
                            : [...current, student.studentId],
                        )
                      }
                      className="accent-[#0C5A69]"
                    />
                    <span className="min-w-0">
                      <b className="block truncate text-xs">{student.name}</b>
                      <small className="block truncate text-slate-500">
                        {student.email}
                      </small>
                    </span>
                  </label>
                ))}
                {!students.length && (
                  <p className="text-xs text-slate-500">
                    No enrolled students available.
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 text-xs font-semibold">
                <span>
                  Destination batch * ({eligibleDestinations.length} available)
                </span>
                <button
                  type="button"
                  disabled={refreshingDestinations}
                  onClick={() => void refreshDestinations()}
                  className="text-[#0C5A69] underline disabled:opacity-50"
                >
                  {refreshingDestinations ? "Refreshing…" : "Refresh batches"}
                </button>
              </div>
              <div
                className="mt-2 space-y-2"
                role="group"
                aria-label="Destination batch"
              >
                {eligibleDestinations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={destinationId === item.id}
                    onClick={() => setDestinationId(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-xs transition-colors ${
                      destinationId === item.id
                        ? "border-[#0C5A69] bg-cyan-50 text-[#0C5A69]"
                        : "border-slate-200 hover:border-[#0C5A69] hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-semibold">
                      {item.name} · {item.courseTitle}
                    </span>
                    <span>{item.capacity - item.enrolledCount} seats open</span>
                  </button>
                ))}
              </div>
              {destinationError && (
                <div className="mt-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                  Could not load batches.{" "}
                  <button
                    type="button"
                    onClick={() => void reload()}
                    className="font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              {!destinationError && eligibleDestinations.length === 0 && (
                <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  No active destination batch has open seats. Create another
                  batch or increase capacity to transfer students.
                </p>
              )}
              {destination && (
                <div
                  className={`mt-4 rounded-lg p-3 text-xs ${canTransfer ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}
                >
                  <b>
                    {canTransfer
                      ? "Ready to transfer"
                      : "Check selection and capacity"}
                  </b>
                  <p className="mt-1">
                    {destination.enrolledCount + selected.length} /{" "}
                    {destination.capacity} students after transfer · {available}{" "}
                    seats open now
                  </p>
                </div>
              )}
              {destination && selected.length === 0 && (
                <p className="mt-2 text-xs text-amber-800">
                  Select at least one student above to enable transfer.
                </p>
              )}
              {destination && selected.length > available && (
                <p className="mt-2 text-xs text-amber-800">
                  Select no more than {available} student
                  {available === 1 ? "" : "s"} for this batch.
                </p>
              )}
              {destination && destination.courseId !== batch.courseId && (
                <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                  This transfer changes the selected students' assigned course
                  from {batch.courseTitle} to {destination.courseTitle}. Their
                  existing payment records stay unchanged.
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                {selectedStudents.length} student
                {selectedStudents.length === 1 ? "" : "s"} will move after
                confirmation.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowTransfer(false)}
                  className={`${button} flex-1`}
                >
                  Back
                </button>
                <button
                  disabled={!canTransfer || busy}
                  onClick={() => {
                    if (
                      destination?.courseId !== batch.courseId &&
                      !window.confirm(
                        `Move ${selected.length} student(s) from ${batch.courseTitle} to ${destination?.courseTitle}? Their assigned course will change; payment records will stay unchanged.`,
                      )
                    )
                      return;
                    void run(
                      () =>
                        batchApi.transfer(id, {
                          destinationBatchId: destinationId,
                          studentIds: selected,
                        }),
                      "Students transferred.",
                    ).then((ok) => {
                      if (!ok) return;
                      setSelected([]);
                      setDestinationId("");
                      setShowTransfer(false);
                    });
                  }}
                  className="flex-1 rounded-lg bg-[#0C5A69] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Confirm transfer
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
