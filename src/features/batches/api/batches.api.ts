import api from "../../../shared/api/axios";

export type CreateBatchPayload = {
  name: string;
  courseId: string;
  primaryTeacherUserId: string;
  coTeacherUserId?: string;
  startsAt: string;
  endsAt: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    timezone: string;
  };
  capacity: number;
  waitlistEnabled: boolean;
  description?: string;
};

export type CreatedBatch = CreateBatchPayload & {
  id: string;
  courseTitle: string;
  status: "upcoming" | "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type BatchListItem = CreatedBatch & {
  enrolledCount: number;
  waitlistCount: number;
  archivedAt?: string | null;
};

export type BatchListResult = {
  items: BatchListItem[];
  metrics: {
    activeBatches: number;
    enrolledStudents: number;
    waitlistedStudents: number;
    startingSoon: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type BatchListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "upcoming" | "active" | "completed" | "cancelled";
  view?: "active" | "archived";
  courseId?: string;
  sortBy?: "name" | "startsAt" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export async function createBatch(
  payload: CreateBatchPayload,
): Promise<CreatedBatch> {
  const { data } = await api.post("/batches", payload);
  return data.data;
}

export async function listBatches(
  query: BatchListQuery = {},
): Promise<BatchListResult> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const suffix = params.toString();
  const { data } = await api.get(`/batches${suffix ? `?${suffix}` : ""}`);
  return data.data;
}

export type BatchStudent = {
  studentId: string;
  name: string;
  email: string;
  joinedAt?: string;
  addedAt?: string;
};
export type BatchContent = {
  _id?: string;
  title: string;
  type: "lesson" | "resource" | "template";
  url?: string;
  courseNodeId?: string;
  createdAt: string;
};
export type BatchAnnouncement = {
  _id?: string;
  message: string;
  audience: "all_students" | "waitlist";
  scheduledFor?: string;
  createdAt: string;
};

const unwrap = async <T>(
  response: Promise<{ data: { data: T } }>,
): Promise<T> => (await response).data.data;

type BatchResourcePage<T> = {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
};

async function listAllBatchResources<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  while (true) {
    const result = await unwrap<BatchResourcePage<T>>(
      api.get(path, { params: { page, pageSize: 100 } }),
    );
    items.push(...result.items);
    if (!result.pagination.hasNext) return items;
    page += 1;
  }
}

export const batchApi = {
  get: (id: string) => unwrap<BatchListItem>(api.get(`/batches/${id}`)),
  update: (
    id: string,
    payload: {
      name?: string;
      description?: string;
      status?: "upcoming" | "active" | "completed" | "cancelled";
    },
  ) => unwrap<BatchListItem>(api.patch(`/batches/${id}`, payload)),
  archive: (id: string) =>
    unwrap<BatchListItem>(api.post(`/batches/${id}/archive`)),
  restore: (id: string) =>
    unwrap<BatchListItem>(api.post(`/batches/${id}/restore`)),
  permanentlyDelete: (id: string) =>
    unwrap<{ deleted: true }>(api.delete(`/batches/${id}/permanent`)),
  students: (id: string) =>
    listAllBatchResources<BatchStudent>(`/batches/${id}/students`),
  addStudents: (id: string, studentIds: string[]) =>
    unwrap<{ students: BatchStudent[]; waitlist: BatchStudent[] }>(
      api.post(`/batches/${id}/students`, { studentIds }),
    ),
  removeStudent: (id: string, studentId: string) =>
    unwrap<{ students: BatchStudent[]; waitlist: BatchStudent[] }>(
      api.delete(`/batches/${id}/students/${studentId}`),
    ),
  waitlist: (id: string) =>
    listAllBatchResources<BatchStudent>(`/batches/${id}/waitlist`),
  addWaitlist: (id: string, studentIds: string[]) =>
    unwrap<BatchStudent[]>(api.post(`/batches/${id}/waitlist`, { studentIds })),
  removeWaitlist: (id: string, studentId: string) =>
    unwrap<BatchStudent[]>(api.delete(`/batches/${id}/waitlist/${studentId}`)),
  content: (id: string) =>
    listAllBatchResources<BatchContent>(`/batches/${id}/content`),
  linkableContent: (id: string) =>
    unwrap<Array<{ id: string; title: string; type: string }>>(api.get(`/batches/${id}/linkable-content`)),
  addContent: (
    id: string,
    payload: Pick<BatchContent, "title" | "type" | "url" | "courseNodeId">,
  ) => unwrap<BatchContent[]>(api.post(`/batches/${id}/content`, payload)),
  updateContent: (
    id: string,
    contentId: string,
    payload: Partial<Pick<BatchContent, "title" | "type" | "url" | "courseNodeId">>,
  ) =>
    unwrap<BatchContent[]>(
      api.patch(`/batches/${id}/content/${contentId}`, payload),
    ),
  removeContent: (id: string, contentId: string) =>
    unwrap<BatchContent[]>(api.delete(`/batches/${id}/content/${contentId}`)),
  announcements: (id: string) =>
    listAllBatchResources<BatchAnnouncement>(`/batches/${id}/announcements`),
  addAnnouncement: (
    id: string,
    payload: Pick<BatchAnnouncement, "message" | "audience" | "scheduledFor">,
  ) =>
    unwrap<BatchAnnouncement[]>(
      api.post(`/batches/${id}/announcements`, payload),
    ),
  updateAnnouncement: (
    id: string,
    announcementId: string,
    payload: Partial<
      Pick<BatchAnnouncement, "message" | "audience" | "scheduledFor">
    >,
  ) =>
    unwrap<BatchAnnouncement[]>(
      api.patch(`/batches/${id}/announcements/${announcementId}`, payload),
    ),
  removeAnnouncement: (id: string, announcementId: string) =>
    unwrap<BatchAnnouncement[]>(
      api.delete(`/batches/${id}/announcements/${announcementId}`),
    ),
  transfer: (
    id: string,
    payload: { destinationBatchId: string; studentIds: string[] },
  ) =>
    unwrap<{ transferred: number }>(
      api.post(`/batches/${id}/transfers`, payload),
    ),
};
