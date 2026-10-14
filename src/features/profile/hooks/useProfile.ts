import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  changePassword,
  getActiveSessions,
  getAuthMe,
  getInstructorSelfProfile,
  getNotificationPreferences,
  getSecurityOverview,
  getTeachingPreferences,
  revokeSession,
  signOutOtherSessions,
  updateInstructorSelfProfile,
  updateMyProfile,
  updateNotificationPreferences,
  updateTeachingPreferences,
} from '../api/profile.api';
import type {
  ChangePasswordPayload,
  CommonUserProfile,
  NotificationPreferences,
  TeachingPreferences,
  UpdateInstructorSelfProfileDto,
} from '../types/profile.types';

export const useMyAuth = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getAuthMe,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInstructorSelfProfileQuery = () => {
  return useQuery({
    queryKey: ['instructor-profile', 'me'],
    queryFn: getInstructorSelfProfile,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateInstructorSelfProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateInstructorSelfProfileDto) =>
      updateInstructorSelfProfile(payload),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      void queryClient.invalidateQueries({
        queryKey: ['instructor-profile', 'me'],
      });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};

export const useUpdateMyProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Partial<CommonUserProfile> & {
        profilePictureKey?: string;
        removeProfilePicture?: boolean;
      },
    ) => updateMyProfile(payload),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};

export const useTeachingPreferencesQuery = () => {
  return useQuery({
    queryKey: ['instructor-profile', 'teaching-preferences'],
    queryFn: getTeachingPreferences,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateTeachingPreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TeachingPreferences) =>
      updateTeachingPreferences(payload),
    onSuccess: () => {
      toast.success('Teaching preferences updated successfully');
      void queryClient.invalidateQueries({
        queryKey: ['instructor-profile', 'teaching-preferences'],
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to save teaching preferences';
      toast.error(message);
    },
  });
};

export const useNotificationPreferencesQuery = () => {
  return useQuery({
    queryKey: ['instructor-profile', 'notification-preferences'],
    queryFn: getNotificationPreferences,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationPreferences) =>
      updateNotificationPreferences(payload),
    onSuccess: () => {
      toast.success('Notification preferences updated successfully');
      void queryClient.invalidateQueries({
        queryKey: ['instructor-profile', 'notification-preferences'],
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to save notification preferences';
      toast.error(message);
    },
  });
};

export const useSecurityOverviewQuery = () => {
  return useQuery({
    queryKey: ['auth', 'security'],
    queryFn: getSecurityOverview,
    staleTime: 1000 * 60 * 5,
  });
};

export const useChangePasswordMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed successfully');
      void queryClient.invalidateQueries({ queryKey: ['auth', 'security'] });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to change password';
      toast.error(message);
    },
  });
};

export const useActiveSessionsQuery = () => {
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: getActiveSessions,
    staleTime: 1000 * 30,
  });
};

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      toast.success('Session signed out');
      void queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to revoke session';
      toast.error(message);
    },
  });
};

export const useSignOutOtherSessionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOutOtherSessions,
    onSuccess: () => {
      toast.success('Signed out of all other sessions');
      void queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to sign out other sessions';
      toast.error(message);
    },
  });
};
