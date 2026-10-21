import api from '../../../shared/api/axios';

export type MasterDataType =
  | 'CATEGORY'
  | 'TAG'
  | 'SUBJECT'
  | 'SPECIALITY'
  | 'SPECIALTY';

export interface MasterData {
  _id: string;
  tenantId: string;
  type: MasterDataType;
  name: string;
  code?: string;
  status: string;
}

export const fetchMasterData = async (
  type?: MasterDataType,
): Promise<MasterData[]> => {
  const query = type ? `?type=${type}` : '';
  const { data } = await api.get(`/master-data${query}`);
  return data.data; // assuming typical wrap
};

export const createMasterData = async (
  type: MasterDataType,
  name: string,
): Promise<MasterData> => {
  const { data } = await api.post('/master-data', { type, name });
  return data.data || data; // handle both wrapped and unwrapped just in case
};

export const fetchInstructors = async (): Promise<
  { id: string; name: string; email: string; specialty?: string }[]
> => {
  try {
    const { data } = await api.get('/instructors/options');
    const items = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
    if (items.length > 0) {
      return items.map((u: any) => ({
        id: u.id || u._id,
        name: u.fullName || u.name || u.email,
        email: u.email,
        specialty: u.specialty,
      }));
    }
  } catch {
    // fallback to /users
  }

  const { data } = await api.get('/users?status=active&limit=100');
  const items = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return items.map((u: { id: string; name: string; email: string }) => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));
};

