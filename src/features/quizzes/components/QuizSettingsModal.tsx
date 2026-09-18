import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useCreateQuiz, useUpdateQuiz } from '../hooks/useQuizzes';
import { useTags, useCreateTag } from '../../courses/hooks/useMasterData';
import CreatableDropdown from '../../../shared/components/CreatableDropdown';
import type { Quiz, CreateQuizDto, UpdateQuizDto } from '../types';

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz?: Quiz | null;
  onSuccess?: (quizId: string) => void;
}

export const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onSuccess,
}) => {
  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();
  const { data: tagsList } = useTags();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();

  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [retakeAttempts, setRetakeAttempts] = useState('');
  const [instructions, setInstructions] = useState<'none' | 'default' | 'custom'>('default');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [languageSupport, setLanguageSupport] = useState(false);
  const [language, setLanguage] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (quiz) {
        setTitle(quiz.title);
        setSelectedTags(quiz.tags || []);
        setTimeLimitMinutes(quiz.timeLimitMinutes ? String(quiz.timeLimitMinutes) : '');
        setRetakeAttempts(quiz.retakeAttempts ? String(quiz.retakeAttempts) : '');
        setInstructions(quiz.instructions || 'default');
        setRandomizeQuestions(quiz.randomizeQuestions || false);
        setLanguageSupport(quiz.languageSupport || false);
        setLanguage(quiz.language || '');
      } else {
        setTitle('');
        setSelectedTags([]);
        setTimeLimitMinutes('');
        setRetakeAttempts('');
        setInstructions('default');
        setRandomizeQuestions(false);
        setShuffleOptions(false);
        setLanguageSupport(false);
        setLanguage('');
      }
      setShowAdvanced(false);
    }
  }, [isOpen, quiz]);

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!title.trim()) {
      alert('Give the quiz a title before saving.');
      return;
    }

    const parsedTime = timeLimitMinutes ? Number(timeLimitMinutes) : undefined;
    const parsedRetakes = retakeAttempts ? Number(retakeAttempts) : undefined;

    if (quiz) {
      const dto: UpdateQuizDto = {
        title: title.trim(),
        tags: selectedTags,
        timeLimitMinutes: parsedTime,
        retakeAttempts: parsedRetakes,
        instructions,
        randomizeQuestions,
        languageSupport,
        language: languageSupport ? language : undefined,
      };
      updateMutation.mutate({ id: quiz.id, dto }, {
        onSuccess: () => {
          onClose();
        }
      });
    } else {
      const dto: CreateQuizDto = {
        title: title.trim(),
        tags: selectedTags,
        timeLimitMinutes: parsedTime,
        retakeAttempts: parsedRetakes,
        instructions,
        randomizeQuestions,
        languageSupport,
        language: languageSupport ? language : undefined,
      };
      createMutation.mutate(dto, {
        onSuccess: (data) => {
          onSuccess?.(data.id);
          onClose();
        }
      });
    }
  };

  return (
    <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h2>{quiz ? 'Edit quiz settings' : 'New quiz'}</h2>
          <button className="modal-close" onClick={onClose} disabled={isPending}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field full">
              <label>Quiz title <span className="req">*</span></label>
              <input
                type="text"
                placeholder="e.g. Intro to Biology Unit 1 Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <CreatableDropdown
                label="Tags"
                items={tagsList || []}
                value={selectedTags}
                onChange={(val: any) => setSelectedTags(val)}
                onCreate={(name: string) => createTag(name)}
                isCreating={isCreatingTag}
                multiple={true}
                placeholder="Select or type tags..."
              />
            </div>

            <div className="field">
              <label>Time limit (minutes)</label>
              <div className="hint">Leave blank for no limit</div>
              <input
                type="number"
                placeholder="e.g. 45"
                min="1"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Re-take attempts</label>
              <div className="hint">Leave blank for unlimited</div>
              <input
                type="number"
                placeholder="e.g. 3"
                min="1"
                value={retakeAttempts}
                onChange={(e) => setRetakeAttempts(e.target.value)}
              />
            </div>

            <div className="field full" style={{ marginTop: '4px' }}>
              <label>Instructions</label>
              <div className="radio-row">
                <label className="radio-opt">
                  <input
                    type="radio"
                    name="qf-instr"
                    value="default"
                    checked={instructions === 'default'}
                    onChange={() => setInstructions('default')}
                  />
                  Use standard instructions
                </label>
                <label className="radio-opt">
                  <input
                    type="radio"
                    name="qf-instr"
                    value="custom"
                    checked={instructions === 'custom'}
                    onChange={() => setInstructions('custom')}
                  />
                  Custom welcome screen
                </label>
                <label className="radio-opt">
                  <input
                    type="radio"
                    name="qf-instr"
                    value="none"
                    checked={instructions === 'none'}
                    onChange={() => setInstructions('none')}
                  />
                  Skip instructions (direct to questions)
                </label>
              </div>
            </div>

            <div className="field full">
              <button
                type="button"
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                Advanced settings <ChevronDown size={14} className={`chev ${showAdvanced ? 'open' : ''}`} />
              </button>

              <div className={`advanced-body ${showAdvanced ? '' : 'hidden'}`}>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label className="check-row" style={{ width: 'fit-content', marginBottom: '8px' }}>
                    <input type="checkbox" checked={randomizeQuestions} onChange={(e) => setRandomizeQuestions(e.target.checked)} />
                    Randomize question order
                  </label>
                  <label className="check-row" style={{ width: 'fit-content', marginBottom: '8px' }}>
                    <input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} />
                    Shuffle options for multiple choice
                  </label>
                  <label className="check-row" style={{ width: 'fit-content', marginBottom: '8px' }}>
                    <input type="checkbox" checked={languageSupport} onChange={(e) => setLanguageSupport(e.target.checked)} />
                    Language support
                  </label>

                  {languageSupport && (
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '200px', marginLeft: '28px' }}>
                      <option value="">Select language...</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={isPending}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : (quiz ? 'Save changes' : 'Create quiz')}
          </button>
        </div>
      </div>
    </div>
  );
};
