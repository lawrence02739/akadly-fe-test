import { create } from 'zustand';
import type {
  BrandFont,
  OnboardingStateResponse,
} from '../types/onboarding.types';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface BrandingDraftState {
  workspaceName: string;
  slug: string;
  displayName: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: BrandFont;
  loginHeadline: string;
  loginMessage: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  logoKey: string | null;
  faviconKey: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;

  // Actions
  updateField: <K extends keyof BrandingDraftState>(
    key: K,
    value: BrandingDraftState[K],
  ) => void;
  updateFields: (fields: Partial<BrandingDraftState>) => void;
  initFromState: (response: OnboardingStateResponse) => void;
  setSaveStatus: (status: SaveStatus) => void;
}

export const useBrandingDraftStore = create<BrandingDraftState>((set) => ({
  workspaceName: 'My Academy',
  slug: 'myacademy',
  displayName: 'My Academy',
  primaryColor: '#4F46E5',
  accentColor: '#2AA399',
  fontFamily: 'SANS_SERIF',
  loginHeadline: 'Welcome to your academy',
  loginMessage: 'A little progress. A world of possibilities.',
  logoUrl: null,
  faviconUrl: null,
  logoKey: null,
  faviconKey: null,
  saveStatus: 'idle',
  lastSavedAt: null,

  updateField: (key, value) => {
    set({ [key]: value });
  },

  updateFields: (fields) => {
    set(fields);
  },

  initFromState: (response) => {
    set({
      workspaceName: response.workspaceName,
      slug: response.slug,
      displayName: response.branding.displayName || response.workspaceName,
      primaryColor: response.branding.primaryColor || '#4F46E5',
      accentColor: response.branding.accentColor || '#2AA399',
      fontFamily: response.branding.fontFamily || 'SANS_SERIF',
      loginHeadline:
        response.branding.loginHeadline || 'Welcome to your academy',
      loginMessage:
        response.branding.loginMessage ||
        'A little progress. A world of possibilities.',
      logoUrl: response.branding.logoUrl,
      faviconUrl: response.branding.faviconUrl,
      logoKey: response.branding.logoKey,
      faviconKey: response.branding.faviconKey,
      saveStatus: 'saved',
    });
  },

  setSaveStatus: (status) => {
    set({
      saveStatus: status,
      ...(status === 'saved' ? { lastSavedAt: new Date() } : {}),
    });
  },
}));
