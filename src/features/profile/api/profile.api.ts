import api from '../../../shared/api/axios';
import type {
  ActiveSession,
  ChangePasswordPayload,
  CommonUserProfile,
  InstructorSelfProfile,
  MyAccessContext,
  NotificationPreferences,
  SecurityOverview,
  TeachingPreferences,
  UpdateInstructorSelfProfileDto,
} from '../types/profile.types';

export const getAuthMe = async (): Promise<{
  id?: string;
  email?: string;
  name?: string;
  profile?: CommonUserProfile;
  access?: MyAccessContext;
  memberType?: 'user' | 'instructor';
  roles?: Array<{
    id: string;
    key: string;
    name: string;
    systemKey: 'owner' | 'admin' | 'staff' | 'instructor' | null;
  }>;
  instructor?: MyAccessContext['instructor'];
  user?: {
    id: string;
    email: string;
    fullName?: string;
    name?: string;
    roles?: string[];
  };
}> => {
  const { data } = await api.get('/auth/me');
  return data?.data ?? data;
};

export const updateMyProfile = async (
  payload: Partial<CommonUserProfile> & {
    profilePictureKey?: string;
    removeProfilePicture?: boolean;
  },
): Promise<unknown> => {
  const { data } = await api.patch('/auth/me/profile', payload);
  return data?.data ?? data;
};

export const presignProfilePicture = async (payload: {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}): Promise<{
  uploadUrl: string;
  key: string;
  fileKey: string;
  fileUrl?: string;
}> => {
  const { data } = await api.post('/auth/me/profile-picture/presign', payload);
  const unwrapped = data?.data ?? data;
  const key = unwrapped.key || unwrapped.fileKey;
  return {
    ...unwrapped,
    key,
    fileKey: unwrapped.fileKey || key,
  };
};

// Account & Security
export const getSecurityOverview = async (): Promise<SecurityOverview> => {
  const { data } = await api.get('/auth/me/security');
  return data?.data ?? data;
};

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post('/auth/me/change-password', payload);
  return data?.data ?? data;
};

export const getActiveSessions = async (): Promise<ActiveSession[]> => {
  const { data } = await api.get('/auth/me/sessions');
  const res = data?.data ?? data;
  return Array.isArray(res) ? res : [];
};

export const revokeSession = async (
  sessionId: string,
): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/auth/me/sessions/${sessionId}`);
  return data?.data ?? data;
};

export const signOutOtherSessions = async (): Promise<{ success: boolean }> => {
  const { data } = await api.post('/auth/me/sessions/sign-out-others');
  return data?.data ?? data;
};

// Instructor Self-Service
export const getInstructorSelfProfile =
  async (): Promise<InstructorSelfProfile> => {
    const { data } = await api.get('/instructor-profile/me');
    return data?.data ?? data;
  };

export const updateInstructorSelfProfile = async (
  payload: UpdateInstructorSelfProfileDto,
): Promise<InstructorSelfProfile> => {
  const { data } = await api.patch('/instructor-profile/me', payload);
  return data?.data ?? data;
};

export const getTeachingPreferences =
  async (): Promise<TeachingPreferences> => {
    const { data } = await api.get('/instructor-profile/me/teaching-preferences');
    return data?.data ?? data;
  };

export const updateTeachingPreferences = async (
  payload: TeachingPreferences,
): Promise<TeachingPreferences> => {
  const { data } = await api.put(
    '/instructor-profile/me/teaching-preferences',
    payload,
  );
  return data?.data ?? data;
};

export const getNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const { data } = await api.get(
      '/instructor-profile/me/notification-preferences',
    );
    return data?.data ?? data;
  };

export const updateNotificationPreferences = async (
  payload: NotificationPreferences,
): Promise<NotificationPreferences> => {
  const { data } = await api.put(
    '/instructor-profile/me/notification-preferences',
    payload,
  );
  return data?.data ?? data;
};
