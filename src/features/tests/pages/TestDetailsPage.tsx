import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { TestWizardLayout } from '../components/TestWizardLayout';
import {
  GeneralSpecsCard,
  type GeneralSpecsFormData,
} from '../components/GeneralSpecsCard';
import {
  GradingMetricsCard,
  type GradingMetricsFormData,
} from '../components/GradingMetricsCard';
import { PreviewAssessmentModal } from '../components/PreviewAssessmentModal';
import { useTest, useCreateTest, useUpdateTest } from '../hooks/useTests';
import {
  TestDifficulty,
  CertificationIssuance,
  FeedbackMechanism,
  type CreateTestDto,
  type UpdateTestDto,
} from '../types';

export const TestDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const isNew = !testId || testId === 'new';

  const { data: test, isLoading } = useTest(testId);
  const createMutation = useCreateTest();
  const updateMutation = useUpdateTest();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [generalSpecs, setGeneralSpecs] = useState<GeneralSpecsFormData>({
    title: '',
    testType: undefined,
    subject: '',
    categoryId: undefined,
    instructorName: '',
    instructorId: undefined,
    enrollmentFee: undefined,
    description: '',
    difficulty: TestDifficulty.MEDIUM,
    tags: [],
    coverImage: undefined,
  });

  const [gradingMetrics, setGradingMetrics] = useState<GradingMetricsFormData>({
    passingPercentage: 50,
    retakeFee: undefined,
    maxAttempts: null,
    certificationIssuance: CertificationIssuance.NONE,
    timeLimitMinutes: 60,
    validityPeriodDays: 365,
    feedbackMechanism: FeedbackMechanism.NONE,
    derivedTotalMarks: 0,
    derivedQuestionCount: 0,
  });

  useEffect(() => {
    if (test) {
      setGeneralSpecs({
        title: test.title || '',
        testType: test.testType,
        subject: test.subject || '',
        categoryId: test.category?.categoryId,
        instructorName: test.instructor?.instructorName || '',
        instructorId: test.instructor?.instructorId,
        enrollmentFee: test.enrollmentFee,
        description: test.description || '',
        difficulty: test.difficulty || TestDifficulty.MEDIUM,
        tags: test.tags || [],
        coverImage: test.coverImage,
      });

      setGradingMetrics({
        passingPercentage: test.grading?.passingPercentage ?? 50,
        retakeFee: test.grading?.retakeFee,
        maxAttempts: test.grading?.maxAttempts ?? null,
        certificationIssuance: test.grading?.certificationIssuance ?? CertificationIssuance.NONE,
        timeLimitMinutes: test.timeLimitMinutes ?? 60,
        validityPeriodDays: test.grading?.validityPeriodDays ?? 365,
        feedbackMechanism: test.grading?.feedbackMechanism ?? FeedbackMechanism.NONE,
        derivedTotalMarks: test.grading?.totalMarks ?? 0,
        derivedQuestionCount: test.questionCount ?? 0,
      });
    }
  }, [test]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!generalSpecs.title.trim()) {
      errs.title = 'Test Name is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (): Promise<string | null> => {
    if (!validate()) {
      toast.error('Please fix the validation errors before saving.');
      return null;
    }

    const payload: CreateTestDto = {
      title: generalSpecs.title.trim(),
      testType: generalSpecs.testType,
      subject: generalSpecs.subject || undefined,
      category: generalSpecs.categoryId ? { categoryId: generalSpecs.categoryId } : undefined,
      instructorId: generalSpecs.instructorId,
      enrollmentFee: generalSpecs.enrollmentFee,
      description: generalSpecs.description || undefined,
      difficulty: generalSpecs.difficulty,
      tags: generalSpecs.tags,
      coverImage: generalSpecs.coverImage,
      timeLimitMinutes: gradingMetrics.timeLimitMinutes,
      grading: {
        passingPercentage: gradingMetrics.passingPercentage,
        retakeFee: gradingMetrics.retakeFee,
        maxAttempts: gradingMetrics.maxAttempts,
        certificationIssuance: gradingMetrics.certificationIssuance,
        validityPeriodDays: gradingMetrics.validityPeriodDays,
        feedbackMechanism: gradingMetrics.feedbackMechanism,
      },
    };

    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(payload);
        toast.success('Test draft created successfully');
        navigate(`/partner/test-studio/${created.id}/details`, { replace: true });
        return created.id;
      } else {
        const updated = await updateMutation.mutateAsync({
          id: testId!,
          dto: payload as UpdateTestDto,
        });
        toast.success('Test details updated');
        return updated.id;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save test details');
      return null;
    }
  };

  const handleNext = async () => {
    const savedId = await handleSave();
    if (savedId) {
      navigate(`/partner/test-studio/${savedId}/questions`);
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <TestWizardLayout
      currentStep={1}
      test={test}
      onSaveDraft={handleSave}
      onNext={handleNext}
      onPreview={test ? () => setPreviewOpen(true) : undefined}
      isSaving={isSaving}
      nextButtonLabel="Next : Link Questions"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Card: General Specifications */}
        <GeneralSpecsCard
          formData={generalSpecs}
          onChange={(updates) => setGeneralSpecs((prev) => ({ ...prev, ...updates }))}
          errors={errors}
        />

        {/* Right Card: Grading & Evaluation Metrics */}
        <GradingMetricsCard
          formData={gradingMetrics}
          onChange={(updates) => setGradingMetrics((prev) => ({ ...prev, ...updates }))}
          errors={errors}
        />
      </div>

      {test && (
        <PreviewAssessmentModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          test={test}
        />
      )}
    </TestWizardLayout>
  );
};
