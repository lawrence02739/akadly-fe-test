import api from '../../../shared/api/axios';
import type {
  AddAssignmentDto,
  CreateInstructorDto,
  InstructorOption,
  InstructorView,
  ListInstructorsParams,
  PaginatedInstructorsResponse,
  PaginationMeta,
  UpdateInstructorDto,
  UpdatePermissionsDto,
} from '../types/instructor.types';

function normalizeInstructor<T extends { fullName?: string; name?: string }>(item: T): T {
  if (!item) return item;
  const resolved = item.fullName || item.name || '';
  return {
    ...item,
    name: resolved,
    fullName: resolved,
  };
}

export const listInstructors = async (
  params: ListInstructorsParams = {},
): Promise<PaginatedInstructorsResponse> => {
  const response = await api.get('/instructors', { params });
  const raw = response.data;

  let items: any[] = [];
  let meta: PaginationMeta = {
    page: params.page || 1,
    pageSize: params.limit || 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  if (Array.isArray(raw?.data)) {
    items = raw.data;
    if (raw?.meta?.pagination) {
      meta = raw.meta.pagination;
    }
  } else if (raw?.data && typeof raw.data === 'object') {
    if (Array.isArray(raw.data.items)) {
      items = raw.data.items;
      meta = raw.data.pagination || raw.data.meta || meta;
    } else if (Array.isArray(raw.data.data)) {
      items = raw.data.data;
      meta = raw.data.meta || raw.data.pagination || meta;
    }
  } else if (Array.isArray(raw?.items)) {
    items = raw.items;
    meta = raw.pagination || raw.meta || meta;
  } else if (Array.isArray(raw)) {
    items = raw;
  }

  if (meta.total === 0 && items.length > 0) {
    meta.total = items.length;
  }

  return {
    data: items.map(normalizeInstructor),
    meta,
  };
};

export const listInstructorOptions = async (
  search?: string,
): Promise<InstructorOption[]> => {
  const { data } = await api.get('/instructors/options', {
    params: search ? { search } : {},
  });
  const res = data.data ?? data;
  if (Array.isArray(res)) {
    return res.map(normalizeInstructor);
  }
  return res;
};

export const listSpecialties = async (): Promise<string[]> => {
  const { data } = await api.get('/instructors/specialties');
  return data.data ?? data;
};

export const getInstructor = async (id: string): Promise<InstructorView> => {
  const { data } = await api.get(`/instructors/${id}`);
  return normalizeInstructor(data.data ?? data);
};

export const createInstructor = async (
  dto: CreateInstructorDto,
): Promise<InstructorView> => {
  const payload = { ...dto };
  if ('name' in payload && payload.fullName) {
    delete (payload as { name?: string }).name;
  }
  const { data } = await api.post('/instructors', payload);
  return normalizeInstructor(data.data ?? data);
};

export const updateInstructor = async (
  id: string,
  dto: UpdateInstructorDto,
): Promise<InstructorView> => {
  const payload = { ...dto };
  if ('name' in payload && payload.fullName) {
    delete (payload as { name?: string }).name;
  }
  const { data } = await api.patch(`/instructors/${id}`, payload);
  return normalizeInstructor(data.data ?? data);
};

export const deleteInstructor = async (id: string): Promise<void> => {
  await api.delete(`/instructors/${id}`);
};

export const restoreInstructor = async (
  id: string,
): Promise<InstructorView> => {
  const { data } = await api.post(`/instructors/${id}/restore`);
  return normalizeInstructor(data.data ?? data);
};

export const setInstructorStatus = async (
  id: string,
  status: 'active' | 'suspended',
  reason?: string,
): Promise<InstructorView> => {
  const { data } = await api.patch(`/instructors/${id}/status`, {
    status,
    reason,
  });
  return normalizeInstructor(data.data ?? data);
};

export const sendInstructorInvitation = async (
  id: string,
): Promise<InstructorView> => {
  const { data } = await api.post(`/instructors/${id}/send-invitation`);
  return normalizeInstructor(data.data ?? data);
};

export const revokeInstructorInvitation = async (
  id: string,
): Promise<InstructorView> => {
  const { data } = await api.post(`/instructors/${id}/revoke-invitation`);
  return normalizeInstructor(data.data ?? data);
};

export const addInstructorAssignment = async (
  id: string,
  dto: AddAssignmentDto,
): Promise<InstructorView> => {
  const { data } = await api.post(`/instructors/${id}/assignments`, dto);
  return normalizeInstructor(data.data ?? data);
};

export const removeInstructorAssignment = async (
  id: string,
  assignmentId: string,
): Promise<InstructorView> => {
  const { data } = await api.delete(
    `/instructors/${id}/assignments/${assignmentId}`,
  );
  return normalizeInstructor(data.data ?? data);
};

export const updateInstructorPermissions = async (
  id: string,
  dto: UpdatePermissionsDto,
): Promise<InstructorView> => {
  const { data } = await api.patch(`/instructors/${id}/permissions`, dto);
  return normalizeInstructor(data.data ?? data);
};

export const getConvertibleUsers = async (
  search?: string,
): Promise<import('../types/instructor.types').ConvertibleUserItem[]> => {
  const { data } = await api.get('/instructors/convertible-users', {
    params: search ? { search } : {},
  });
  const res = data?.data ?? data;
  return Array.isArray(res) ? res : [];
};

export const convertToInstructor = async (
  dto: import('../types/instructor.types').ConvertToInstructorDto,
): Promise<InstructorView> => {
  const { data } = await api.post('/instructors/convert', dto);
  return normalizeInstructor(data.data ?? data);
};

export const removeInstructorRole = async (
  id: string,
  options?: { removeAssignments?: boolean },
): Promise<unknown> => {
  const { data } = await api.post(`/instructors/${id}/remove-role`, options ?? {});
  return data?.data ?? data;
};

