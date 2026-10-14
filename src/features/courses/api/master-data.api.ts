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

export const fetchInstructors = async (): Promise<{ id: string, name: string, email: string }[]> => {
  const { data } = await api.get('/auth/users');
  return data.data.users;
};
