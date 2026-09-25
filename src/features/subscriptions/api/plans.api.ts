import api from '../../../shared/api/axios';

export interface TenantPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: 'INR' | 'USD';
  interval: 'monthly' | 'yearly';
  isPopular: boolean;
  allowedModules: string[];
  userLimit: number | null;
  studentLimit: number | null;
  contentLimit: number | null;
  courseLimit: number | null;
}

export const plansApi = {
  async list(): Promise<TenantPlan[]> {
    const response = await api.get<{ data: TenantPlan[] }>('/plans');
    return response.data.data;
  },
};
