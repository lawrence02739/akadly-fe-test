import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { Test, CreateTestDto } from '../types';
import { useCreateTest, useUpdateTest } from '../hooks/useTests';
import { useTags, useCreateTag } from '../../courses/hooks/useMasterData';
import CreatableDropdown from '../../../shared/components/CreatableDropdown';

interface TestSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test?: Test | null;
  onSuccess?: (testId: string) => void;
}

export const TestSettingsModal: React.FC<TestSettingsModalProps> = ({ isOpen, onClose, test, onSuccess }) => {
  const createMutation = useCreateTest();
  const updateMutation = useUpdateTest();

  const [title, setTitle] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [languageSupport, setLanguageSupport] = useState(false);
  const [language, setLanguage] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTill, setAvailableTill] = useState('');
  const [autoSubmitOnExpiry, setAutoSubmitOnExpiry] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [lockTabSwitching, setLockTabSwitching] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [subject, setSubject] = useState('');
  
  const { data: tagsList } = useTags();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (test) {
        setTitle(test.title || '');
        setTimeLimitMinutes(test.timeLimitMinutes || 30);
        setLanguageSupport(test.languageSupport || false);
        setLanguage(test.language || '');
        
        // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
        const formatForInput = (isoStr: string) => {
          if (!isoStr) return '';
          const d = new Date(isoStr);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };
        
        setAvailableFrom(formatForInput(test.availableFrom));
        setAvailableTill(formatForInput(test.availableTill));
        setAutoSubmitOnExpiry(test.autoSubmitOnExpiry ?? true);
        setShuffleQuestions(test.shuffleQuestions ?? false);
        setLockTabSwitching(test.lockTabSwitching ?? false);
        setSelectedTags(test.tags || []);
        setDifficulty(test.difficulty || 'medium');
        setSubject(test.subject || '');
      } else {
        setTitle('');
        setTimeLimitMinutes(30);
        setLanguageSupport(false);
        setLanguage('');
        setAvailableFrom('');
        setAvailableTill('');
        setAutoSubmitOnExpiry(true);
        setShuffleQuestions(false);
        setLockTabSwitching(false);
        setSelectedTags([]);
        setDifficulty('medium');
        setSubject('');
      }
      setShowAdvanced(false);
    }
  }, [isOpen, test]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    
    if (!availableFrom || !availableTill) {
      alert('Available From and Available Till are required.');
      return;
    }

    if (new Date(availableTill) <= new Date(availableFrom)) {
      alert('Available Till must be after Available From.');
      return;
    }

    const dto: CreateTestDto = {
      title: title.trim(),
      timeLimitMinutes,
      languageSupport,
      language: languageSupport ? language : undefined,
      availableFrom: new Date(availableFrom).toISOString(),
      availableTill: new Date(availableTill).toISOString(),
      autoSubmitOnExpiry,
      shuffleQuestions,
      lockTabSwitching,
      tags: selectedTags,
      difficulty,
      subject,
    };

    if (test) {
      updateMutation.mutate({ id: test.id, dto }, {
        onSuccess: () => {
          onClose();
          if (onSuccess) onSuccess(test.id);
        }
      });
    } else {
      createMutation.mutate(dto, {
        onSuccess: (newTest) => {
          onClose();
          if (onSuccess) onSuccess(newTest.id);
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h2>{test ? 'Edit live test' : 'New live test'}</h2>
          <button className="modal-close" onClick={onClose} disabled={isPending}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field full">
              <label>Title <span className="req">*</span></label>
              <input type="text" placeholder="e.g. Midterm — Live Assessment" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="field full">
              <label>Time limit (in minutes) <span className="req">*</span></label>
              <input type="number" placeholder="Time limit (in minutes)" min="1" value={timeLimitMinutes} onChange={e => setTimeLimitMinutes(Number(e.target.value))} />
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
              <label>Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="field">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>

            <div className="field full">
              <label className="check-row" style={{ width: 'fit-content' }}>
                <input type="checkbox" checked={languageSupport} onChange={e => setLanguageSupport(e.target.checked)} /> Another language support
              </label>
            </div>
            {languageSupport && (
              <div className="field full">
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="">Select language...</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            )}
          </div>

          <div className="section-label">Test open window</div>
          <div className="form-grid">
            <div className="field">
              <label>Available from <span className="req">*</span></label>
              <input type="datetime-local" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
            </div>
            <div className="field">
              <label>Available till <span className="req">*</span></label>
              <input type="datetime-local" value={availableTill} onChange={e => setAvailableTill(e.target.value)} />
            </div>
          </div>

          <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)} style={{ marginTop: '24px' }}>
            <ChevronDown size={14} className={`chev ${showAdvanced ? 'open' : ''}`} style={{ marginRight: 4 }} />
            Show advanced options
          </button>
          
          {showAdvanced && (
            <div className="advanced-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }}>
              <label className="check-row">
                <input type="checkbox" checked={autoSubmitOnExpiry} onChange={e => setAutoSubmitOnExpiry(e.target.checked)} />
                Auto-submit at time expiry
              </label>
              <label className="check-row">
                <input type="checkbox" checked={shuffleQuestions} onChange={e => setShuffleQuestions(e.target.checked)} />
                Shuffle question order
              </label>
              <label className="check-row">
                <input type="checkbox" checked={lockTabSwitching} onChange={e => setLockTabSwitching(e.target.checked)} />
                Lock tab switching
              </label>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={isPending}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>Submit</button>
        </div>
      </div>
    </div>
  );
};
