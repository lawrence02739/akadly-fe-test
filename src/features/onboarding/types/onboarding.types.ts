export type OnboardingStep =
  | 'ACCOUNT_PLAN'
  | 'BRANDING'
  | 'CHECKOUT'
  | 'LAUNCH';

export type OnboardingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type BrandFont = 'SANS_SERIF' | 'SERIF' | 'ROUNDED' | 'MONOSPACE';

export type BrandingAssetType = 'LOGO' | 'FAVICON';

export interface OnboardingAccountState {
  email: string;
  name: string;
  passwordSet: boolean;
  googleLinked: boolean;
  avatarUrl?: string | null;
}

export interface OnboardingPlanState {
  selectedPlanId: string | null;
  isPlanLocked: boolean;
  lockedReason?: string;
  currentPlanSnapshot?: {
    code: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
  } | null;
}

export interface OnboardingBrandingState {
  displayName: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: BrandFont;
  loginHeadline: string;
  loginMessage: string;
  logoKey: string | null;
  logoUrl: string | null;
  faviconKey: string | null;
  faviconUrl: string | null;
}

export interface OnboardingBillingProfileState {
  legalName: string;
  billingEmail: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  gstin?: string | null;
}

export interface OnboardingStateResponse {
  tenantId: string;
  workspaceName: string;
  slug: string;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  account: OnboardingAccountState;
  plan: OnboardingPlanState;
  branding: OnboardingBrandingState;
  billingProfile: OnboardingBillingProfileState | null;
  canLaunch: boolean;
  isCompleted: boolean;
}

export interface OnboardingPlanOption {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isCurrent: boolean;
  isLocked: boolean;
  isRecommended?: boolean;
}

export interface CheckoutSummaryResponse {
  planId: string;
  planName: string;
  planCode: string;
  currency: string;
  interval: string;
  baseAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  requiresPayment: boolean;
  alreadyPaid: boolean;
}

export interface SaveAccountPlanRequest {
  password?: string;
  ownerName?: string;
  planId?: string;
}

export interface SaveBrandingDraftRequest {
  displayName?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: BrandFont;
  loginHeadline?: string;
  loginMessage?: string;
  logoKey?: string;
  faviconKey?: string;
}

export interface PresignAssetRequest {
  assetType: BrandingAssetType;
  filename: string;
  contentType: string;
  byteSize: number;
}

export interface PresignAssetResponse {
  uploadUrl: string;
  key: string;
  assetType: BrandingAssetType;
}

export interface SaveBillingProfileRequest {
  legalName: string;
  billingEmail: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  gstin?: string;
}

export interface StartCheckoutResponse {
  requiresPayment: boolean;
  alreadyPaid: boolean;
  message?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  academyName?: string;
  prefill?: {
    name?: string;
    email?: string;
  };
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface LaunchWorkspaceResponse {
  success: boolean;
  alreadyCompleted?: boolean;
  redirectUrl: string;
  scaffoldNote?: string;
  siteUrl?: string;
}
