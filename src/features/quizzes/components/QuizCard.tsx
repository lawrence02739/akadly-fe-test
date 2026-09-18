import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Clock, List, Edit2, Trash2 } from 'lucide-react';
import type { Quiz } from '../types';


interface QuizCardProps {
  quiz: Quiz;
  onClick: () => void;
  onEditSettings: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onClick,
  onEditSettings,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleAction = (e: React.MouseEvent, action: (e: React.MouseEvent) => void) => {
    e.stopPropagation();
    setMenuOpen(false);
    action(e);
  };

  return (
    <div className="quiz-card" onClick={onClick}>
      <div className="quiz-card-top">
        <span className={`status-pill ${quiz.status.toLowerCase()}`}>
          {quiz.status}
        </span>
        <div className="card-menu-wrap" ref={menuRef}>
          <button className="icon-btn" onClick={handleMenuClick} aria-label="More options">
            <MoreHorizontal size={17} />
          </button>
          {menuOpen && (
            <div className="card-menu" onClick={(e) => e.stopPropagation()}>
              <button onClick={(e) => handleAction(e, onClick)}>
                <Edit2 size={14} /> Open builder
              </button>
              <button onClick={(e) => handleAction(e, onEditSettings)}>
                <Edit2 size={14} /> Edit settings
              </button>

              <button className="danger" onClick={(e) => handleAction(e, onDelete)}>
                <Trash2 size={14} /> Delete quiz
              </button>
            </div>
          )}
        </div>
      </div>
      <h3>{quiz.title}</h3>
      <div className="quiz-card-meta">
        <span><Clock size={12} /> {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'No limit'}</span>
        <span><List size={12} /> {quiz.questionCount || 0} question{(quiz.questionCount || 0) !== 1 ? 's' : ''}</span>
      </div>
      <div className="quiz-card-foot">
        <div className="quiz-card-tags">
          {(quiz.tags || []).slice(0, 3).map((t, idx) => (
            <span key={idx} className="tag">{t}</span>
          ))}
          {(!quiz.tags || quiz.tags.length === 0) && (
            <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
              Updated {new Date(quiz.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
