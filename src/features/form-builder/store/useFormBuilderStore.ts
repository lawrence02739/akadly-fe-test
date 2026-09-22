import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import type { FormSection, FormBlock, FormOption, BlockType, QuestionType, FormSettings, FormTheme } from '../types/form-builder.types';
import api from '../../../shared/api/axios';
import toast from 'react-hot-toast';

interface FormState {
  formId: string | null;
  title: string;
  description: string;
  sections: FormSection[];
  activeSectionId: string | null;
  activeBlockId: string | null;
  theme: FormTheme;
  settings: FormSettings;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isSaving: boolean;
  isPublishing: boolean;
  lastSavedAt: string | null;
  isSettingsOpen: boolean;
  isThemeOpen: boolean;
  isPreviewMode: boolean;
  activeTab: 'QUESTIONS' | 'RESPONSES';
  activePropertiesTab: 'GENERAL' | 'VALIDATION' | 'LAYOUT' | 'LOGIC';
  mediaModal: {
    isOpen: boolean;
    blockId: string | null;
    sectionId: string | null;
    type: 'IMAGE' | 'VIDEO' | null;
  };
  importModal: {
    isOpen: boolean;
  };
  shareModal: {
    isOpen: boolean;
  };
}

interface FormBuilderActions {
  // Global Actions
  setFormId: (id: string) => void;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  updateSettings: (settings: Partial<FormSettings>) => void;

  // Selection
  setActiveBlock: (blockId: string, sectionId: string) => void;
  clearSelection: () => void;

  // Sections
  addSection: (afterSectionId?: string) => void;
  deleteSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;

  // Loading
  loadForm: (formId: string, isPublic?: boolean, password?: string) => Promise<void>;
  resetForm: () => void;

  // Blocks
  addBlock: (sectionId: string, type: BlockType, questionType?: QuestionType, afterBlockId?: string) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  updateBlock: (sectionId: string, blockId: string, updates: Partial<FormBlock>) => void;

  // Option Management
  addOption: (sectionId: string, blockId: string, isOther?: boolean) => void;
  updateOption: (sectionId: string, blockId: string, optionId: string, label: string) => void;
  updateOptionProps: (sectionId: string, blockId: string, optionId: string, updates: Partial<FormOption>) => void;
  removeOption: (sectionId: string, blockId: string, optionId: string) => void;
  reorderOption: (sectionId: string, blockId: string, oldIndex: number, newIndex: number) => void;

  moveBlock: (sectionId: string, fromIndex: number, toIndex: number) => void;
  moveBlockToSection: (blockId: string, fromSectionId: string, toSectionId: string, toIndex: number) => void;
  updateTheme: (updates: Partial<FormTheme>) => void;

  // UI State actions
  toggleSettings: () => void;
  toggleTheme: () => void;
  togglePreview: () => void;
  setActiveTab: (tab: 'QUESTIONS' | 'RESPONSES') => void;
  setActivePropertiesTab: (tab: 'GENERAL' | 'VALIDATION' | 'LAYOUT' | 'LOGIC') => void;
  openMediaModal: (type: 'IMAGE' | 'VIDEO', blockId: string, sectionId: string) => void;
  closeMediaModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
  openShareModal: () => void;
  closeShareModal: () => void;
  saveForm: (isPublishing?: boolean) => Promise<string | undefined>;
}

type FormStore = FormState & FormBuilderActions;

const FILE_TYPE_MIME_MAP: Record<string, string> = {
  Image: 'image/*', Video: 'video/*', Audio: 'audio/*', PDF: 'application/pdf',
  Document: 'application/msword', Presentation: 'application/vnd.ms-powerpoint',
  Spreadsheet: 'application/vnd.ms-excel', Drawing: 'image/*',
};

const QUESTION_DEFAULT_TITLES: Record<QuestionType, string> = {
  SHORT_TEXT: 'Short Answer', LONG_TEXT: 'Long Answer', EMAIL: 'Email Address', PHONE: 'Phone Number',
  NUMBER: 'Number', URL: 'Website URL', MULTIPLE_CHOICE: 'Multiple Choice', CHECKBOXES: 'Checkboxes',
  DROPDOWN: 'Dropdown', FILE_UPLOAD: 'File Upload', IMAGE_UPLOAD: 'Image Upload', VIDEO_UPLOAD: 'Video Upload',
  AUDIO_UPLOAD: 'Audio Upload', DATE: 'Date', TIME: 'Time', DATE_TIME: 'Date & Time', RATING: 'Rating',
  LINEAR_SCALE: 'Linear Scale', GRID_MCQ: 'Multiple Choice Grid', GRID_CHECKBOX: 'Checkbox Grid', SIGNATURE: 'Signature',
};

const getDefaultQuestionTitle = (questionType?: QuestionType) =>
  QUESTION_DEFAULT_TITLES[questionType || 'MULTIPLE_CHOICE'];

const serializeField = (block: FormBlock, order: number) => {
  const contentTypes: Partial<Record<BlockType, string>> = {
    TITLE_DESCRIPTION: 'HEADING', IMAGE: 'DISPLAY_IMAGE', VIDEO: 'DISPLAY_VIDEO', SECTION_BREAK: 'SECTION_BREAK',
  };
  const type = block.type === 'QUESTION' ? block.questionType : contentTypes[block.type];
  const isUpload = ['FILE_UPLOAD', 'IMAGE_UPLOAD', 'VIDEO_UPLOAD', 'AUDIO_UPLOAD'].includes(type || '');
  const allowedMimeTypes = block.settings?.allowedFileTypes?.map(typeName => FILE_TYPE_MIME_MAP[typeName] || typeName);
  return {
    id: block.id,
    type,
    label: block.title,
    description: block.description,
    order: order + 1,
    required: Boolean(block.validation?.required),
    placeholder: block.settings?.placeholder,
    validation: block.validation ? {
      minLength: block.validation.minLength,
      maxLength: block.validation.maxLength,
      min: block.validation.min,
      max: block.validation.max,
      pattern: block.validation.pattern,
      customErrorMessage: block.validation.customErrorMessage,
    } : undefined,
    upload: isUpload ? {
      maxFiles: block.settings?.maxFiles || 1,
      maxFileSizeMb: block.settings?.maxFileSizeMB || (type === 'VIDEO_UPLOAD' ? 500 : type === 'AUDIO_UPLOAD' ? 100 : 10),
      allowedMimeTypes: block.settings?.allowSpecificFileTypes ? allowedMimeTypes : undefined,
    } : undefined,
    settings: block.settings ? {
      readOnly: block.settings.readOnly,
      shuffleOptions: block.settings.shuffleOptions,
      scaleMin: block.settings.scaleMin,
      scaleMax: block.settings.scaleMax,
      scaleMinLabel: block.settings.scaleMinLabel,
      scaleMaxLabel: block.settings.scaleMaxLabel,
    } : undefined,
    options: block.options,
    rows: block.rows,
    columns: block.columns,
    logic: block.logicRules,
    mediaUrl: block.mediaUrl,
    mediaKey: block.mediaKey,
    width: block.width,
    labelAlignment: block.labelAlignment,
    subLabel: block.subLabel,
    hidden: block.isHidden,
  };
};

const isEmptyStarterQuestion = (block: FormBlock) =>
  block.type === 'QUESTION' &&
  block.questionType === 'MULTIPLE_CHOICE' &&
  !block.title.trim() &&
  !block.description?.trim() &&
  !block.validation?.required &&
  (!block.logicRules || block.logicRules.length === 0) &&
  block.options?.length === 1 &&
  !block.options[0].label.trim();

const normalizeLoadedBlock = (block: FormBlock): FormBlock => ({
  ...block,
  title: block.type === 'QUESTION' && !block.title?.trim()
    ? getDefaultQuestionTitle(block.questionType)
    : block.title,
  options: ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(block.questionType || '')
    ? block.options?.map((option, index) => ({ ...option, label: option.label?.trim() || `Option ${index + 1}` }))
    : block.options,
});

const initialSectionId = uuidv4();

const initialState: FormState = {
  formId: null,
  title: 'Untitled form',
  description: '',
  theme: {
    primaryColor: '#673ab7', // Google Forms default purple
    backgroundColor: '#f0ebf8',
    fontFamily: 'Inter, sans-serif',
    customCss: '',
  },
  settings: {
    isPublic: false,
    acceptResponses: true,
    limitOneResponse: false,
    collectEmail: false,
    allowEditing: false,
    showProgressBar: false,
    shuffleQuestions: false,
    confirmationMessage: 'Your response has been recorded.',
  },
  status: 'DRAFT',
  isSettingsOpen: false,
  isThemeOpen: false,
  isPreviewMode: false,
  activeTab: 'QUESTIONS',
  activePropertiesTab: 'GENERAL',
  mediaModal: {
    isOpen: false,
    blockId: null,
    sectionId: null,
    type: null,
  },
  importModal: {
    isOpen: false,
  },
  shareModal: {
    isOpen: false,
  },
  sections: [
    {
      id: initialSectionId,
      title: 'Untitled Section',
      blocks: []
    }
  ],
  activeBlockId: null,
  activeSectionId: initialSectionId,
  isSaving: false,
  isPublishing: false,
  lastSavedAt: null,
};

export const useFormBuilderStore = create<FormStore>()(
  temporal(
    immer((set, get) => ({
      ...initialState,

      setFormId: (id) => set((state) => { state.formId = id; }),
      setTitle: (title) => set((state) => { state.title = title; state.lastSavedAt = null; }),
      setDescription: (description) => set((state) => { state.description = description; state.lastSavedAt = null; }),

      updateSettings: (updates) => set((state) => {
        state.settings = { ...state.settings, ...updates };
        state.lastSavedAt = null;
      }),

      updateTheme: (updates) => set((state) => {
        state.theme = { ...state.theme, ...updates };
        state.lastSavedAt = null;
      }),

      setActiveBlock: (blockId, sectionId) => set((state) => {
        state.activeBlockId = blockId;
        state.activeSectionId = sectionId;
      }),

      clearSelection: () => set((state) => {
        state.activeBlockId = null;
      }),

      addSection: (afterSectionId) => set((state) => {
        state.lastSavedAt = null;
        const newSection: FormSection = {
          id: uuidv4(),
          title: 'Untitled Section',
          blocks: [],
        };
        if (afterSectionId) {
          const index = state.sections.findIndex(s => s.id === afterSectionId);
          state.sections.splice(index + 1, 0, newSection);
        } else {
          state.sections.push(newSection);
        }
        state.activeSectionId = newSection.id;
        state.activeBlockId = null;
      }),

      deleteSection: (sectionId) => set((state) => {
        state.lastSavedAt = null;
        if (state.sections.length <= 1) return; // Cannot delete last section
        state.sections = state.sections.filter(s => s.id !== sectionId);
        if (state.activeSectionId === sectionId) {
          state.activeSectionId = state.sections[0].id;
          state.activeBlockId = null;
        }
      }),

      updateSection: (sectionId, updates) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (section) {
          Object.assign(section, updates);
        }
      }),

      moveSection: (fromIndex, toIndex) => set((state) => {
        state.lastSavedAt = null;
        const [movedSection] = state.sections.splice(fromIndex, 1);
        state.sections.splice(toIndex, 0, movedSection);
      }),

      reorderSections: (startIndex, endIndex) => set((state) => {
        state.lastSavedAt = null;
        const [movedSection] = state.sections.splice(startIndex, 1);
        state.sections.splice(endIndex, 0, movedSection);
      }),

      addBlock: (sectionId, type, questionType, afterBlockId) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return;

        const newBlock: FormBlock = {
          id: uuidv4(),
          type,
          title: type === 'QUESTION' ? getDefaultQuestionTitle(questionType) : (type === 'TITLE_DESCRIPTION' ? 'Heading' : (type === 'IMAGE' ? 'Image' : type === 'VIDEO' ? 'Video' : 'Question')),
          validation: type === 'QUESTION' ? { required: false } : undefined,
        };

        if (type === 'QUESTION') {
          newBlock.questionType = questionType || 'MULTIPLE_CHOICE';
          if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(newBlock.questionType)) {
            newBlock.options = [{ id: uuidv4(), label: 'Option 1' }];
          }
          if (['FILE_UPLOAD', 'IMAGE_UPLOAD', 'VIDEO_UPLOAD', 'AUDIO_UPLOAD'].includes(newBlock.questionType)) {
            newBlock.settings = {
              maxFiles: 1,
              maxFileSizeMB: newBlock.questionType === 'VIDEO_UPLOAD' ? 500 : newBlock.questionType === 'AUDIO_UPLOAD' ? 100 : 10,
            };
          }
        }

        if (afterBlockId) {
          const index = section.blocks.findIndex(b => b.id === afterBlockId);
          if (index >= 0) section.blocks.splice(index + 1, 0, newBlock);
          else section.blocks.push(newBlock);
        } else {
          section.blocks.push(newBlock);
        }

        state.activeBlockId = newBlock.id;
        state.activeSectionId = sectionId;
      }),

      deleteBlock: (sectionId, blockId) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (section) {
          section.blocks = section.blocks.filter(b => b.id !== blockId);
        }
        if (state.activeBlockId === blockId) {
          state.activeBlockId = null;
        }
      }),

      addOption: (sectionId, blockId, isOther = false) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return;
        const block = section.blocks.find(b => b.id === blockId);
        if (!block) return;

        if (!block.options) block.options = [];
        const newOption = {
          id: uuidv4(),
          label: isOther ? 'Other' : `Option ${block.options.filter(option => !option.isOther).length + 1}`,
          isOther
        };

        // If adding 'Other', it should always be the last option.
        if (isOther) {
          block.options.push(newOption);
        } else {
          // If there's an 'Other' option, insert before it
          const otherIndex = block.options.findIndex(o => o.isOther);
          if (otherIndex > -1) {
            block.options.splice(otherIndex, 0, newOption);
          } else {
            block.options.push(newOption);
          }
        }
      }),

      updateOption: (sectionId, blockId, optionId, label) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return;
        const block = section.blocks.find(b => b.id === blockId);
        if (!block || !block.options) return;

        const option = block.options.find(o => o.id === optionId);
        if (option) {
          option.label = label;
        }
      }),

      updateOptionProps: (sectionId, blockId, optionId, updates) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return;
        const block = section.blocks.find(b => b.id === blockId);
        if (!block || !block.options) return;

        const option = block.options.find(o => o.id === optionId);
        if (option) {
          Object.assign(option, updates);
        }
      }),

      removeOption: (sectionId, blockId, optionId) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return;
        const block = section.blocks.find(b => b.id === blockId);
        if (!block || !block.options) return;

        block.options = block.options.filter(o => o.id !== optionId);
      }),

      reorderOption: (sectionId, blockId, oldIndex, newIndex) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return;
        const block = section.blocks.find(b => b.id === blockId);
        if (!block || !block.options) return;

        const [moved] = block.options.splice(oldIndex, 1);
        block.options.splice(newIndex, 0, moved);
      }),

      updateBlock: (sectionId, blockId, updates) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (section) {
          const block = section.blocks.find(b => b.id === blockId);
          if (block) {
            Object.assign(block, updates);
          }
        }
      }),

      moveBlock: (sectionId, fromIndex, toIndex) => set((state) => {
        state.lastSavedAt = null;
        const section = state.sections.find(s => s.id === sectionId);
        if (section) {
          const [movedBlock] = section.blocks.splice(fromIndex, 1);
          section.blocks.splice(toIndex, 0, movedBlock);
        }
      }),

      moveBlockToSection: (blockId, fromSectionId, toSectionId, toIndex) => set((state) => {
        state.lastSavedAt = null;
        const fromSection = state.sections.find(s => s.id === fromSectionId);
        const toSection = state.sections.find(s => s.id === toSectionId);
        if (fromSection && toSection) {
          const blockIndex = fromSection.blocks.findIndex(b => b.id === blockId);
          if (blockIndex > -1) {
            const [block] = fromSection.blocks.splice(blockIndex, 1);
            toSection.blocks.splice(toIndex, 0, block);
          }
        }
      }),

      toggleSettings: () => set((state) => {
        state.isSettingsOpen = !state.isSettingsOpen;
        if (state.isSettingsOpen) state.isThemeOpen = false; // close the other
      }),

      toggleTheme: () => set((state) => {
        state.isThemeOpen = !state.isThemeOpen;
        if (state.isThemeOpen) state.isSettingsOpen = false;
      }),

      togglePreview: () => set((state) => {
        state.isPreviewMode = !state.isPreviewMode;
      }),

      setActiveTab: (tab) => set((state) => {
        state.activeTab = tab;
      }),

      setActivePropertiesTab: (tab) => set((state) => {
        state.activePropertiesTab = tab;
      }),

      openMediaModal: (type, blockId, sectionId) => set((state) => {
        state.mediaModal = { isOpen: true, type, blockId, sectionId };
      }),

      closeMediaModal: () => set((state) => {
        state.mediaModal.isOpen = false;
      }),

      openImportModal: () => set((state) => {
        state.importModal.isOpen = true;
      }),

      closeImportModal: () => set({ importModal: { isOpen: false } }),

      openShareModal: () => set({ shareModal: { isOpen: true } }),
      closeShareModal: () => set({ shareModal: { isOpen: false } }),

      saveForm: async (isPublishing = false) => {
        set((state) => {
          if (isPublishing) state.isPublishing = true;
          else state.isSaving = true;
        });
        try {
          const state = get();
          const password = state.settings.password?.trim();
          if (state.settings.requirePassword && (!password || password.length < 6 || password.length > 128)) {
            throw new Error('Form password must be between 6 and 128 characters.');
          }
          const expiry = state.settings.expiryDate ? new Date(state.settings.expiryDate) : null;
          if (expiry && (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now())) {
            throw new Error('Choose a valid future expiry date and time.');
          }
          const payload = {
            title: state.title,
            description: state.description,
            sections: state.sections.map((section, sectionIndex) => ({
              id: section.id,
              title: section.title || `Section ${sectionIndex + 1}`,
              description: section.description,
              order: sectionIndex + 1,
              fields: section.blocks.filter(block => !isEmptyStarterQuestion(block)).map(serializeField),
              goToSectionId: section.goToSectionId,
              repeatable: section.isRepeatable,
            })),
            settings: {
              ...state.settings,
              acceptResponses: true,
              showProgressBar: false,
              password: state.settings.requirePassword ? password : undefined,
              expiryDate: expiry?.toISOString(),
              redirectUrl: state.settings.redirectUrl || undefined,
            },
            theme: {
              ...state.theme,
              headerImageUrl: state.theme.headerImageUrl || undefined,
            },
            status: state.status,
          };

          const method = state.formId ? 'PUT' : 'POST';
          const url = state.formId ? `/form-builder/forms/${state.formId}` : '/form-builder/forms';
          const { data } = await api.request({ method, url, data: payload });

          let savedFormId = state.formId || undefined;
          set((state) => {
            state.isSaving = false;
            state.isPublishing = false;
            state.lastSavedAt = new Date().toLocaleTimeString();
            if (!state.formId && data?.data?.id) {
              state.formId = data.data.id;
              savedFormId = data.data.id;
            }
          });

          if (isPublishing && savedFormId) {
            await api.post(`/form-builder/forms/${savedFormId}/publish`);
            set((state) => { state.status = 'PUBLISHED'; });
            toast.success('Form published successfully.');
          } else {
            toast.success('Form saved.');
          }

          return savedFormId;
        } catch (error) {
          console.error('Failed to save form:', error);
          set((state) => { state.isSaving = false; state.isPublishing = false; });
          const apiMessage = (error as any)?.response?.data?.message;
          const message = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
          toast.error(message || (error instanceof Error ? error.message : 'Failed to save form. Please try again.'), { id: 'form-save-error' });
        } finally {
          set((state) => { state.isSaving = false; state.isPublishing = false; });
        }
      },

      loadForm: async (formId: string, isPublic = false, password?: string) => {
        try {
          const response = password && isPublic
            ? await api.post(`/form-builder/forms/${formId}/unlock`, { password })
            : await api.get(`/form-builder/forms/${isPublic ? 'public/' : ''}${formId}`);
          const { data } = response.data;

          set((state) => {
            state.formId = data.id || data._id;
            state.title = data.title || 'Untitled form';
            state.description = data.description || '';
            state.status = data.status || 'DRAFT';

            if (data.schemaJson && data.schemaJson.sections && data.schemaJson.sections.length > 0) {
              state.sections = data.schemaJson.sections.map((section: FormSection) => ({
                ...section,
                blocks: section.blocks.map(normalizeLoadedBlock),
              }));
            } else if (Array.isArray(data.schemaJson) && data.schemaJson.length > 0) {
              state.sections = data.schemaJson.map((section: FormSection) => ({
                ...section,
                blocks: section.blocks.map(normalizeLoadedBlock),
              }));
            } else if (isPublic) {
              state.sections = [];
            }

            if (data.settingsJson && Object.keys(data.settingsJson).length > 0) {
              state.settings = { ...state.settings, ...data.settingsJson };
              if (data.settingsJson.expiryDate) {
                const expiry = new Date(data.settingsJson.expiryDate);
                if (!Number.isNaN(expiry.getTime())) {
                  const local = new Date(expiry.getTime() - expiry.getTimezoneOffset() * 60000);
                  state.settings.expiryDate = local.toISOString().slice(0, 16);
                }
              }
            }

            if (data.themeJson && Object.keys(data.themeJson).length > 0) {
              state.theme = { ...state.theme, ...data.themeJson };
            }

            state.activeSectionId = state.sections[0]?.id || null;
            state.activeBlockId = null;
          });
        } catch (error) {
          console.error('Failed to load form:', error);
          throw error;
        }
      },

      resetForm: () => set(initialState),
    })),
    {
      partialize: (state) => {
        // Exclude UI state from undo/redo history
        const { isSettingsOpen, isThemeOpen, isPreviewMode, activeTab, activeBlockId, activeSectionId, isSaving, mediaModal, importModal, ...rest } = state;
        return rest;
      }
    }
  ));
