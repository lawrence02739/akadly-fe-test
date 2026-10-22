import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import { TestWizardLayout } from '../components/TestWizardLayout';
import { SettingsGroupCard } from '../components/SettingsGroupCard';
import { SettingsRow } from '../components/SettingsRow';
import { ToggleRow } from '../components/ToggleRow';
import { AllowedUrlsInput } from '../components/AllowedUrlsInput';
import { PreviewAssessmentModal } from '../components/PreviewAssessmentModal';
import { useTest, useUpdateTestSettings } from '../hooks/useTests';
import {
  ProctoringType,
  FlagSensitivity,
  ViolationType,
  type TestSettings,
} from '../types';

export const TestSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const { data: test, isLoading } = useTest(testId);
  const updateSettingsMutation = useUpdateTestSettings();

  const [previewOpen, setPreviewOpen] = useState(false);

  // Settings State initialized with defaults
  const [settings, setSettings] = useState<TestSettings>({
    proctoring: {
      type: ProctoringType.NONE,
      studentsPerProctor: 30,
      allowLiveChat: false,
      proctorCanPause: false,
      identityVerificationRequired: false,
    },
    violations: {
      flagThreshold: FlagSensitivity.MEDIUM,
      autoPauseOnViolation: false,
      maxViolationsAllowed: 3,
      monitoredTypes: [],
    },
    lockdown: {
      requireLockdownBrowser: false,
      disableRightClick: false,
      disableCopyPaste: false,
      disableMultipleMonitors: false,
      allowedUrls: [],
    },
    monitoring: {
      webcamRequired: false,
      microphoneMonitoring: false,
      phoneDetection: false,
    },
  });

  useEffect(() => {
    if (test?.settings) {
      setSettings({
        proctoring: {
          type: test.settings.proctoring?.type || ProctoringType.NONE,
          studentsPerProctor: test.settings.proctoring?.studentsPerProctor ?? 30,
          allowLiveChat: test.settings.proctoring?.allowLiveChat ?? false,
          proctorCanPause: test.settings.proctoring?.proctorCanPause ?? false,
          identityVerificationRequired:
            test.settings.proctoring?.identityVerificationRequired ?? false,
        },
        violations: {
          flagThreshold:
            test.settings.violations?.flagThreshold || FlagSensitivity.MEDIUM,
          autoPauseOnViolation:
            test.settings.violations?.autoPauseOnViolation ?? false,
          maxViolationsAllowed:
            test.settings.violations?.maxViolationsAllowed ?? 3,
          monitoredTypes: test.settings.violations?.monitoredTypes || [],
        },
        lockdown: {
          requireLockdownBrowser:
            test.settings.lockdown?.requireLockdownBrowser ?? false,
          disableRightClick: test.settings.lockdown?.disableRightClick ?? false,
          disableCopyPaste: test.settings.lockdown?.disableCopyPaste ?? false,
          disableMultipleMonitors:
            test.settings.lockdown?.disableMultipleMonitors ?? false,
          allowedUrls: test.settings.lockdown?.allowedUrls || [],
        },
        monitoring: {
          webcamRequired: test.settings.monitoring?.webcamRequired ?? false,
          microphoneMonitoring:
            test.settings.monitoring?.microphoneMonitoring ?? false,
          phoneDetection: test.settings.monitoring?.phoneDetection ?? false,
        },
      });
    }
  }, [test]);

  const isProctored = settings.proctoring.type !== ProctoringType.NONE;

  // Cross-field handlers
  const handleProctoringTypeChange = (type: ProctoringType) => {
    setSettings((prev) => {
      const willBeNone = type === ProctoringType.NONE;
      return {
        ...prev,
        proctoring: {
          ...prev.proctoring,
          type,
        },
        violations: {
          ...prev.violations,
          // If Proctoring is NONE, autoPauseOnViolation cannot be true
          autoPauseOnViolation: willBeNone ? false : prev.violations.autoPauseOnViolation,
        },
      };
    });
  };

  const handleToggleViolationType = (vType: ViolationType) => {
    setSettings((prev) => {
      const current = prev.violations.monitoredTypes;
      const exists = current.includes(vType);
      const nextMonitored = exists
        ? current.filter((t) => t !== vType)
        : [...current, vType];

      // Auto-sync with monitoring
      let webcam = prev.monitoring.webcamRequired;
      let mic = prev.monitoring.microphoneMonitoring;
      let phone = prev.monitoring.phoneDetection;

      if (vType === ViolationType.FACE_OUT_OF_FRAME || vType === ViolationType.MULTIPLE_FACES) {
        if (!exists) webcam = true;
      }
      if (vType === ViolationType.NOISE_DETECTED) {
        if (!exists) mic = true;
      }
      if (vType === ViolationType.PHONE_DETECTED) {
        phone = !exists;
      }

      return {
        ...prev,
        violations: {
          ...prev.violations,
          monitoredTypes: nextMonitored,
        },
        monitoring: {
          ...prev.monitoring,
          webcamRequired: webcam,
          microphoneMonitoring: mic,
          phoneDetection: phone,
        },
      };
    });
  };

  const handleTogglePhoneDetection = (checked: boolean) => {
    setSettings((prev) => {
      const current = prev.violations.monitoredTypes;
      const nextMonitored = checked
        ? Array.from(new Set([...current, ViolationType.PHONE_DETECTED]))
        : current.filter((t) => t !== ViolationType.PHONE_DETECTED);

      return {
        ...prev,
        violations: {
          ...prev.violations,
          monitoredTypes: nextMonitored,
        },
        monitoring: {
          ...prev.monitoring,
          phoneDetection: checked,
        },
      };
    });
  };

  const saveSettings = async (): Promise<boolean> => {
    if (!testId) return false;
    try {
      await updateSettingsMutation.mutateAsync({
        id: testId,
        dto: settings,
      });
      return true;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Failed to update settings',
      );
      return false;
    }
  };

  const handleSaveDraft = async () => {
    const ok = await saveSettings();
    if (ok) {
      toast.success('Settings draft saved');
    }
  };

  const handleNext = async () => {
    const ok = await saveSettings();
    if (ok) {
      navigate(`/partner/test-studio/${testId}/review`);
    }
  };

  const isWebcamForced =
    settings.violations.monitoredTypes.includes(ViolationType.FACE_OUT_OF_FRAME) ||
    settings.violations.monitoredTypes.includes(ViolationType.MULTIPLE_FACES);

  const isMicForced = settings.violations.monitoredTypes.includes(
    ViolationType.NOISE_DETECTED,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#005963] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <TestWizardLayout
      currentStep={3}
      test={test}
      onSaveDraft={handleSaveDraft}
      onNext={handleNext}
      onPreview={() => setPreviewOpen(true)}
      isSaving={updateSettingsMutation.isPending}
      nextButtonLabel="Next : Review"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Card 1: PROCTORING MODE */}
          <SettingsGroupCard title="PROCTORING MODE">
            <div className="divide-y divide-slate-100">
              <SettingsRow
                label="Proctoring Type"
                subtitle="Determine verification and monitoring mode."
                rightElement={
                  <div className="relative">
                    <select
                      value={settings.proctoring.type}
                      onChange={(e) =>
                        handleProctoringTypeChange(e.target.value as ProctoringType)
                      }
                      className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-800 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-[#005963]"
                    >
                      <option value={ProctoringType.NONE}>None</option>
                      <option value={ProctoringType.AI_PROCTORED}>AI Proctored</option>
                      <option value={ProctoringType.LIVE_PROCTORED}>Live Proctored</option>
                      <option value={ProctoringType.HYBRID}>Hybrid</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                }
              />

              <SettingsRow
                label="Proctor-to-Student Ratio"
                subtitle="Assigned coverage density for human auditors."
                disabled={!isProctored}
                disabledReason="Requires Proctoring Mode to be active"
                rightElement={
                  <div className="flex items-center border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white shadow-2xs">
                    <span className="text-slate-400 mr-1 font-semibold">1:</span>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      disabled={!isProctored}
                      value={settings.proctoring.studentsPerProctor}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          proctoring: {
                            ...prev.proctoring,
                            studentsPerProctor: Math.max(1, parseInt(e.target.value) || 1),
                          },
                        }))
                      }
                      className="w-8 text-center font-bold text-slate-800 bg-transparent focus:outline-hidden"
                    />
                    <span className="text-slate-500 font-medium ml-1">Ratio</span>
                  </div>
                }
              />

              <ToggleRow
                label="Allow Live Chat with Proctor"
                description="Open real-time emergency support channel."
                checked={settings.proctoring.allowLiveChat}
                disabled={!isProctored}
                disabledReason="Requires Proctoring Mode to be active"
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    proctoring: { ...prev.proctoring, allowLiveChat: checked },
                  }))
                }
              />

              <ToggleRow
                label="Proctor Can Pause Exam"
                description="Grant administrators remote session lock access."
                checked={settings.proctoring.proctorCanPause}
                disabled={!isProctored}
                disabledReason="Requires Proctoring Mode to be active"
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    proctoring: { ...prev.proctoring, proctorCanPause: checked },
                  }))
                }
              />

              <ToggleRow
                label="Identity Verification Required"
                description="Execute automated profile match routines on entry."
                checked={settings.proctoring.identityVerificationRequired}
                disabled={!isProctored}
                disabledReason="Requires Proctoring Mode to be active"
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    proctoring: {
                      ...prev.proctoring,
                      identityVerificationRequired: checked,
                    },
                  }))
                }
              />
            </div>
          </SettingsGroupCard>

          {/* Card 2: VIOLATION & FLAGS */}
          <SettingsGroupCard title="VIOLATION & FLAGS">
            <div className="divide-y divide-slate-100">
              <SettingsRow
                label="Flag Threshold"
                subtitle="Determine algorithm sensitivity index for review."
                rightElement={
                  <div className="relative">
                    <select
                      value={settings.violations.flagThreshold}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          violations: {
                            ...prev.violations,
                            flagThreshold: e.target.value as FlagSensitivity,
                          },
                        }))
                      }
                      className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-800 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-[#005963]"
                    >
                      <option value={FlagSensitivity.LOW}>Low Sensitivity</option>
                      <option value={FlagSensitivity.MEDIUM}>Medium Sensitivity</option>
                      <option value={FlagSensitivity.HIGH}>High Sensitivity</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                }
              />

              <ToggleRow
                label="Auto-Pause on Violation"
                description="Freeze sandbox instantly when a violation registers."
                checked={settings.violations.autoPauseOnViolation}
                disabled={!isProctored}
                disabledReason="Requires Proctoring Mode to be active"
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    violations: { ...prev.violations, autoPauseOnViolation: checked },
                  }))
                }
              />

              <SettingsRow
                label="Maximum Violations Allowed"
                subtitle="Max tolerance count before permanent session lockout."
                rightElement={
                  <div className="flex items-center border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white shadow-2xs">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.violations.maxViolationsAllowed}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          violations: {
                            ...prev.violations,
                            maxViolationsAllowed: Math.max(1, parseInt(e.target.value) || 1),
                          },
                        }))
                      }
                      className="w-7 text-center font-bold text-slate-800 bg-transparent focus:outline-hidden"
                    />
                    <span className="text-slate-500 font-medium ml-1">Flags</span>
                  </div>
                }
              />

              <div className="py-4 space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    Violation Types Monitored
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure monitored security trigger parameters.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: ViolationType.TAB_SWITCH, label: 'Tab Switch' },
                    { id: ViolationType.FACE_OUT_OF_FRAME, label: 'Face Out of Frame' },
                    { id: ViolationType.MULTIPLE_FACES, label: 'Multiple Faces' },
                    { id: ViolationType.NOISE_DETECTED, label: 'Noise Detected' },
                    { id: ViolationType.PHONE_DETECTED, label: 'Phone Detected' },
                  ].map((item) => {
                    const active = settings.violations.monitoredTypes.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleViolationType(item.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          active
                            ? 'border-[#005963] text-[#005963] bg-teal-50/50 shadow-2xs'
                            : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SettingsGroupCard>

          {/* Card 3: DEVICE & BROWSER LOCKDOWN */}
          <SettingsGroupCard title="DEVICE & BROWSER LOCKDOWN">
            <div className="divide-y divide-slate-100">
              <ToggleRow
                label="Require Lockdown Browser"
                description="Force sandbox focus and block all external navigation."
                checked={settings.lockdown.requireLockdownBrowser}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    lockdown: { ...prev.lockdown, requireLockdownBrowser: checked },
                  }))
                }
              />

              <ToggleRow
                label="Disable Right Click"
                description="Prevent page inspect operations during session."
                checked={settings.lockdown.disableRightClick}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    lockdown: { ...prev.lockdown, disableRightClick: checked },
                  }))
                }
              />

              <ToggleRow
                label="Disable Copy-Paste"
                description="Lock keyboard standard transfer registers globally."
                checked={settings.lockdown.disableCopyPaste}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    lockdown: { ...prev.lockdown, disableCopyPaste: checked },
                  }))
                }
              />

              <ToggleRow
                label="Disable Multiple Monitors"
                description="Terminate test if secondary video cards activate."
                checked={settings.lockdown.disableMultipleMonitors}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    lockdown: { ...prev.lockdown, disableMultipleMonitors: checked },
                  }))
                }
              />

              <div className="py-4 space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    Allowed URLs
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure specific whitelisted syllabus domains.
                  </p>
                </div>
                <AllowedUrlsInput
                  urls={settings.lockdown.allowedUrls}
                  disabled={!settings.lockdown.requireLockdownBrowser}
                  onChange={(urls) =>
                    setSettings((prev) => ({
                      ...prev,
                      lockdown: { ...prev.lockdown, allowedUrls: urls },
                    }))
                  }
                />
              </div>
            </div>
          </SettingsGroupCard>

          {/* Card 4: MONITORING & SURVEILLANCE */}
          <SettingsGroupCard title="MONITORING & SURVEILLANCE">
            <div className="divide-y divide-slate-100">
              <ToggleRow
                label="Webcam Required"
                description="Force continuous camera profile mapping frames."
                checked={settings.monitoring.webcamRequired}
                disabled={isWebcamForced}
                disabledReason="Enforced by facial detection violation monitoring"
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    monitoring: { ...prev.monitoring, webcamRequired: checked },
                  }))
                }
              />

              <ToggleRow
                label="Microphone Monitoring"
                description="Audit environmental noise frequencies in real-time."
                checked={settings.monitoring.microphoneMonitoring}
                disabled={isMicForced}
                disabledReason="Enforced by noise detection violation monitoring"
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    monitoring: {
                      ...prev.monitoring,
                      microphoneMonitoring: checked,
                    },
                  }))
                }
              />

              <ToggleRow
                label="Phone Detection"
                description="Flag object shapes resembling mobile hardware."
                checked={settings.monitoring.phoneDetection}
                onChange={handleTogglePhoneDetection}
              />
            </div>
          </SettingsGroupCard>
        </div>
      </div>

      {previewOpen && test && (
        <PreviewAssessmentModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          test={test}
        />
      )}
    </TestWizardLayout>
  );
};
