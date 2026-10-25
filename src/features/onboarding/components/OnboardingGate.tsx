import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

interface OnboardingGateProps {
  children?: React.ReactNode;
}

export const OnboardingGate: React.FC<OnboardingGateProps> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Only owners undergo the tenant onboarding wizard
  const isOwner = user.isOwner ?? false;
  const onboardingStatus = user.onboarding?.status;

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isPartnerRoute = location.pathname.startsWith('/partner');

  // If owner has pending / in-progress onboarding and tries to access partner dashboard:
  if (isOwner && onboardingStatus && onboardingStatus !== 'COMPLETED') {
    if (isPartnerRoute) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // If owner has already completed onboarding and tries to access /onboarding:
  if (isOnboardingRoute && onboardingStatus === 'COMPLETED') {
    return <Navigate to="/partner/courses" replace />;
  }

  return children ? <>{children}</> : null;
};
