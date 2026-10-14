import { useEffect, useState } from 'react';
import CompletionBanner from '../components/CompletionBanner';
import CommonProfileSection from '../components/CommonProfileSection';
import LearnerPreviewCard from '../components/LearnerPreviewCard';
import LearnerVisibleSection from '../components/LearnerVisibleSection';
import PrivateContactCard from '../components/PrivateContactCard';
import ProfileSettingsLayout from '../components/ProfileSettingsLayout';
import {
  useInstructorSelfProfileQuery,
  useMyAuth,
  useUpdateInstructorSelfProfileMutation,
  useUpdateMyProfileMutation,
} from '../hooks/useProfile';

import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { isInstructorUser } from '../utils/profile.utils';

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MyProfilePage() {
  const { data: authData, isLoading: authLoading } = useMyAuth();
  const { data: instructorProfile, isLoading: instructorLoading } =
    useInstructorSelfProfileQuery();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const isInstructor = isInstructorUser(authData, reduxUser, instructorProfile);

  const updateInstructorMutation = useUpdateInstructorSelfProfileMutation();
  const updateCommonProfileMutation = useUpdateMyProfileMutation();

  // Instructor form state
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [showBioToLearners, setShowBioToLearners] = useState(true);
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadedPhotoKey, setUploadedPhotoKey] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  // Common user form state
  const [commonFirstName, setCommonFirstName] = useState('');
  const [commonLastName, setCommonLastName] = useState('');
  const [commonPhone, setCommonPhone] = useState('');
  const [commonLocation, setCommonLocation] = useState('');
  const [commonBio, setCommonBio] = useState('');
  const [commonDob, setCommonDob] = useState('');
  const [commonGender, setCommonGender] = useState('');

  const [isDirty, setIsDirty] = useState(false);

  // Populate instructor fields
  useEffect(() => {
    if (isInstructor && instructorProfile) {
      setFullName(instructorProfile.fullName || '');
      setProfessionalTitle(instructorProfile.professionalTitle || '');
      setExpertise(instructorProfile.expertise || []);
      setBio(instructorProfile.bio || '');
      setShowBioToLearners(instructorProfile.showBioToLearners ?? true);
      setPhone(instructorProfile.phone || '');
      setPhotoUrl(instructorProfile.profilePictureUrl || null);
      setIsDirty(false);
    }
  }, [isInstructor, instructorProfile]);

  // Populate common user fields
  useEffect(() => {
    if (!isInstructor && authData?.profile) {
      const p = authData.profile;
      setCommonFirstName(p.firstName || '');
      setCommonLastName(p.lastName || '');
      setCommonPhone(p.phone || '');
      setCommonLocation(p.location || '');
      setCommonBio(p.bio || '');
      setCommonDob(p.dateOfBirth || '');
      setCommonGender(p.gender || '');
      setPhotoUrl(p.profilePictureUrl || null);
      setIsDirty(false);
    }
  }, [isInstructor, authData]);

  const handlePhotoUploaded = (key: string, previewUrl: string) => {
    setUploadedPhotoKey(key);
    setPhotoUrl(previewUrl);
    setRemovePhoto(false);
    setIsDirty(true);
  };

  const handlePhotoRemoved = () => {
    setUploadedPhotoKey(null);
    setPhotoUrl(null);
    setRemovePhoto(true);
    setIsDirty(true);
  };

  const handleInstructorSave = () => {
    updateInstructorMutation.mutate(
      {
        fullName,
        professionalTitle,
        expertise,
        bio,
        showBioToLearners,
        phone,
        ...(uploadedPhotoKey ? { profilePictureKey: uploadedPhotoKey } : {}),
        ...(removePhoto ? { removeProfilePicture: true } : {}),
      },
      {
        onSuccess: (updated) => {
          setIsDirty(false);
          setUploadedPhotoKey(null);
          setRemovePhoto(false);
          if (updated?.profilePictureUrl) {
            setPhotoUrl(updated.profilePictureUrl);
          }
        },
      },
    );
  };

  const handleCommonUserSave = () => {
    updateCommonProfileMutation.mutate(
      {
        firstName: commonFirstName,
        lastName: commonLastName,
        phone: commonPhone,
        location: commonLocation,
        bio: commonBio,
        dateOfBirth: commonDob,
        gender: commonGender,
        ...(uploadedPhotoKey ? { profilePictureKey: uploadedPhotoKey } : {}),
        ...(removePhoto ? { removeProfilePicture: true } : {}),
      },
      {
        onSuccess: (updated: any) => {
          setIsDirty(false);
          setUploadedPhotoKey(null);
          setRemovePhoto(false);
          if (updated?.profilePictureUrl) {
            setPhotoUrl(updated.profilePictureUrl);
          }
        },
      },
    );
  };

  const handleCancel = () => {
    if (isInstructor && instructorProfile) {
      setFullName(instructorProfile.fullName || '');
      setProfessionalTitle(instructorProfile.professionalTitle || '');
      setExpertise(instructorProfile.expertise || []);
      setBio(instructorProfile.bio || '');
      setShowBioToLearners(instructorProfile.showBioToLearners ?? true);
      setPhone(instructorProfile.phone || '');
      setPhotoUrl(instructorProfile.profilePictureUrl || null);
    } else if (!isInstructor && authData?.profile) {
      const p = authData.profile;
      setCommonFirstName(p.firstName || '');
      setCommonLastName(p.lastName || '');
      setCommonPhone(p.phone || '');
      setCommonLocation(p.location || '');
      setCommonBio(p.bio || '');
      setCommonDob(p.dateOfBirth || '');
      setCommonGender(p.gender || '');
      setPhotoUrl(p.profilePictureUrl || null);
    }
    setUploadedPhotoKey(null);
    setRemovePhoto(false);
    setIsDirty(false);
  };

  if (authLoading || (isInstructor && instructorLoading)) {
    return (
      <ProfileSettingsLayout
        title="My Profile"
        description="Update your personal profile and the information learners see about you."
      >
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </ProfileSettingsLayout>
    );
  }

  const initials = getInitials(
    isInstructor
      ? fullName || instructorProfile?.fullName || authData?.name || ''
      : `${commonFirstName} ${commonLastName}`.trim() || authData?.name || '',
  );

  return (
    <ProfileSettingsLayout
      title="My Profile"
      description="Update your personal profile and the information learners see about you."
      onSave={isInstructor ? handleInstructorSave : handleCommonUserSave}
      onCancel={handleCancel}
      isSaving={
        updateInstructorMutation.isPending ||
        updateCommonProfileMutation.isPending
      }
      isDirty={isDirty}
    >
      {/* Instructor Completion Banner */}
      {isInstructor && instructorProfile?.completion && (
        <CompletionBanner
          percent={instructorProfile.completion.percent}
          missing={instructorProfile.completion.missing}
        />
      )}

      {isInstructor ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main profile form (8 columns) */}
          <div className="space-y-6 xl:col-span-8">
            <LearnerVisibleSection
              initials={initials}
              photoUrl={photoUrl}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoRemoved={handlePhotoRemoved}
              fullName={fullName}
              onFullNameChange={(val) => {
                setFullName(val);
                setIsDirty(true);
              }}
              professionalTitle={professionalTitle}
              onProfessionalTitleChange={(val) => {
                setProfessionalTitle(val);
                setIsDirty(true);
              }}
              expertise={expertise}
              onExpertiseChange={(val) => {
                setExpertise(val);
                setIsDirty(true);
              }}
              bio={bio}
              onBioChange={(val) => {
                setBio(val);
                setIsDirty(true);
              }}
              showBioToLearners={showBioToLearners}
              onShowBioToLearnersChange={(val) => {
                setShowBioToLearners(val);
                setIsDirty(true);
              }}
              academyName={instructorProfile?.managed?.academyName}
              disabled={updateInstructorMutation.isPending}
            />

            <PrivateContactCard
              email={instructorProfile?.email || authData?.email || ''}
              emailVerified={instructorProfile?.emailVerified ?? true}
              phone={phone}
              onPhoneChange={(val) => {
                setPhone(val);
                setIsDirty(true);
              }}
              disabled={updateInstructorMutation.isPending}
            />
          </div>

          {/* Learner Preview Card (4 columns) */}
          <div className="xl:col-span-4">
            <LearnerPreviewCard
              initials={initials}
              photoUrl={photoUrl}
              fullName={fullName}
              professionalTitle={professionalTitle}
              expertise={expertise}
              bio={bio}
              showBioToLearners={showBioToLearners}
            />
          </div>
        </div>
      ) : (
        /* Regular User Profile View */
        <div className="space-y-6">
          <CommonProfileSection
            initials={initials}
            photoUrl={photoUrl}
            onPhotoUploaded={handlePhotoUploaded}
            onPhotoRemoved={handlePhotoRemoved}
            firstName={commonFirstName}
            onFirstNameChange={(val) => {
              setCommonFirstName(val);
              setIsDirty(true);
            }}
            lastName={commonLastName}
            onLastNameChange={(val) => {
              setCommonLastName(val);
              setIsDirty(true);
            }}
            phone={commonPhone}
            onPhoneChange={(val) => {
              setCommonPhone(val);
              setIsDirty(true);
            }}
            location={commonLocation}
            onLocationChange={(val) => {
              setCommonLocation(val);
              setIsDirty(true);
            }}
            bio={commonBio}
            onBioChange={(val) => {
              setCommonBio(val);
              setIsDirty(true);
            }}
            dateOfBirth={commonDob}
            onDateOfBirthChange={(val) => {
              setCommonDob(val);
              setIsDirty(true);
            }}
            gender={commonGender}
            onGenderChange={(val) => {
              setCommonGender(val);
              setIsDirty(true);
            }}
            disabled={updateCommonProfileMutation.isPending}
          />

          <PrivateContactCard
            email={authData?.email || ''}
            emailVerified={true}
            phone={commonPhone}
            onPhoneChange={(val) => {
              setCommonPhone(val);
              setIsDirty(true);
            }}
            disabled={updateCommonProfileMutation.isPending}
          />
        </div>
      )}
    </ProfileSettingsLayout>
  );
}
