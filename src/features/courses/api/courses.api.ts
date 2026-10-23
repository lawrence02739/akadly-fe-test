import api from '../../../shared/api/axios';

export const listCourses = async () => {
  const { data } = await api.get('/courses');
  return data.data; // Return the actual array
};

export const getCourse = async (id: string) => {
  const { data } = await api.get(`/courses/${id}`);
  return data.data;
};

export const createCourse = async (dto: any) => {
  const { id: _id, tenantId, createdAt, updatedAt, __v, nodes, coInstructors, supportStaff, ...createPayload } = dto;
  const coInstructorIds =
    dto.coInstructorIds !== undefined
      ? dto.coInstructorIds
      : Array.isArray(coInstructors)
        ? coInstructors.map((ci: any) => (typeof ci === 'string' ? ci : ci?.id || ci?._id)).filter(Boolean)
        : undefined;

  const supportStaffId =
    dto.supportStaffId !== undefined
      ? dto.supportStaffId
      : typeof supportStaff === 'string'
        ? supportStaff
        : supportStaff && typeof supportStaff === 'object'
          ? supportStaff.id || supportStaff._id || null
          : supportStaff === null
            ? null
            : undefined;

  const instructor =
    typeof dto.instructor === 'object' && dto.instructor
      ? dto.instructor.id || dto.instructor._id || ''
      : dto.instructor;

  const { data } = await api.post('/courses', {
    ...createPayload,
    instructor: instructor || undefined,
    coInstructorIds,
    supportStaffId,
  });
  return data.data;
};

export const updateCourse = async (id: string, dto: any) => {
  const { id: _id, tenantId, createdAt, updatedAt, __v, nodes, coInstructors, supportStaff, ...updatePayload } = dto;
  const coInstructorIds =
    dto.coInstructorIds !== undefined
      ? dto.coInstructorIds
      : Array.isArray(coInstructors)
        ? coInstructors.map((ci: any) => (typeof ci === 'string' ? ci : ci?.id || ci?._id)).filter(Boolean)
        : undefined;

  const supportStaffId =
    dto.supportStaffId !== undefined
      ? dto.supportStaffId
      : typeof supportStaff === 'string'
        ? supportStaff
        : supportStaff && typeof supportStaff === 'object'
          ? supportStaff.id || supportStaff._id || null
          : supportStaff === null
            ? null
            : undefined;

  const instructor =
    typeof dto.instructor === 'object' && dto.instructor
      ? dto.instructor.id || dto.instructor._id || ''
      : dto.instructor;

  const { data } = await api.patch(`/courses/${id}`, {
    ...updatePayload,
    instructor: instructor || undefined,
    coInstructorIds,
    supportStaffId,
  });
  return data.data;
};

export const deleteCourse = async (id: string) => {
  await api.delete(`/courses/${id}`);
};

export const fetchCourseStructure = async (courseId: string) => {
  const { data } = await api.get(`/courses/${courseId}/structure`);
  return data.data ?? data;
};
