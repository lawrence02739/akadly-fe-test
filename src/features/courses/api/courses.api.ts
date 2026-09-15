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
  const { data } = await api.post('/courses', dto);
  return data.data;
};

export const updateCourse = async (id: string, dto: any) => {
  const { id: _id, tenantId, createdAt, updatedAt, __v, nodes, ...updatePayload } = dto;
  const { data } = await api.patch(`/courses/${id}`, updatePayload);
  return data.data;
};

export const deleteCourse = async (id: string) => {
  await api.delete(`/courses/${id}`);
};
