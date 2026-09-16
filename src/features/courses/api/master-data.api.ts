import api from '../../../shared/api/axios';

export interface MasterData {
  _id: string;
  tenantId: string;
  type: 'CATEGORY' | 'TAG';
  name: string;
  code?: string;
  status: string;
}

export const fetchMasterData = async (type: 'CATEGORY' | 'TAG'): Promise<MasterData[]> => {
  const { data } = await api.get(`/master-data?type=${type}`);
  return data.data; // assuming typical wrap
};

export const createMasterData = async (type: 'CATEGORY' | 'TAG', name: string): Promise<MasterData> => {
  const { data } = await api.post('/master-data', { type, name });
  return data.data || data; // handle both wrapped and unwrapped just in case
};

export const fetchInstructors = async (): Promise<{ id: string, name: string, email: string }[]> => {
  const { data } = await api.get('/auth/users');
  return data.data.users;
};
