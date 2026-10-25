import axios from 'axios';
import api from '../../../shared/api/axios';
import type {
  OnboardingStateResponse,
  OnboardingPlanOption,
  CheckoutSummaryResponse,
  SaveAccountPlanRequest,
  SaveBrandingDraftRequest,
  PresignAssetRequest,
  PresignAssetResponse,
  SaveBillingProfileRequest,
  StartCheckoutResponse,
  VerifyPaymentRequest,
  LaunchWorkspaceResponse,
} from '../types/onboarding.types';

export const onboardingApi = {
  async getState(): Promise<OnboardingStateResponse> {
    const res = await api.get<{ data?: OnboardingStateResponse } | OnboardingStateResponse>(
      '/onboarding/state',
    );
    const body = res.data;
    if (body && typeof body === 'object' && 'data' in body && body.data) {
      return body.data;
    }
    return body as OnboardingStateResponse;
  },

  async listPlans(): Promise<OnboardingPlanOption[]> {
    const res = await api.get<{ data?: OnboardingPlanOption[] } | OnboardingPlanOption[]>(
      '/onboarding/plans',
    );
    const body = res.data;
    if (body && typeof body === 'object' && 'data' in body && Array.isArray(body.data)) {
      return body.data;
    }
    return (Array.isArray(body) ? body : []) as OnboardingPlanOption[];
  },

  async saveAccountAndPlan(
    payload: SaveAccountPlanRequest,
  ): Promise<{ success: boolean; currentStep: string }> {
    const res = await api.post('/onboarding/account-plan', payload);
    return res.data?.data || res.data;
  },

  async presignAsset(
    payload: PresignAssetRequest,
  ): Promise<PresignAssetResponse> {
    const res = await api.post('/onboarding/branding/presign', payload);
    return res.data?.data || res.data;
  },

  async uploadAssetToStorage(
    uploadUrl: string,
    file: File,
  ): Promise<void> {
    // Bare axios call without auth credentials for S3 presigned PUT
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  async saveBrandingDraft(
    payload: SaveBrandingDraftRequest,
  ): Promise<{ success: boolean }> {
    const res = await api.patch('/onboarding/branding/draft', payload);
    return res.data?.data || res.data;
  },

  async completeBranding(
    payload: SaveBrandingDraftRequest,
  ): Promise<{ success: boolean; currentStep: string }> {
    const res = await api.post('/onboarding/branding/complete', payload);
    return res.data?.data || res.data;
  },

  async skipBranding(): Promise<{ success: boolean; currentStep: string }> {
    const res = await api.post('/onboarding/branding/skip');
    return res.data?.data || res.data;
  },

  async saveBillingProfile(
    payload: SaveBillingProfileRequest,
  ): Promise<{ success: boolean }> {
    const res = await api.post('/onboarding/billing-profile', payload);
    return res.data?.data || res.data;
  },

  async getCheckoutSummary(): Promise<CheckoutSummaryResponse> {
    const res = await api.get<{ data?: CheckoutSummaryResponse } | CheckoutSummaryResponse>(
      '/onboarding/checkout-summary',
    );
    const body = res.data;
    if (body && typeof body === 'object' && 'data' in body && body.data) {
      return body.data;
    }
    return body as CheckoutSummaryResponse;
  },

  async startCheckout(): Promise<StartCheckoutResponse> {
    const res = await api.post('/onboarding/checkout/start');
    return res.data?.data || res.data;
  },

  async verifyPayment(
    payload: VerifyPaymentRequest,
  ): Promise<{ success: boolean; paymentId: string; currentStep: string }> {
    const res = await api.post('/onboarding/checkout/verify', payload);
    return res.data?.data || res.data;
  },

  async launchWorkspace(): Promise<LaunchWorkspaceResponse> {
    const res = await api.post('/onboarding/launch');
    return res.data?.data || res.data;
  },
};
