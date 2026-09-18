import React, { useState } from 'react';
import type { Test } from '../types';
import { useDeleteTest } from '../hooks/useTests';

interface TestCardProps {
  test: Test;
  onClick: () => void;
  onEditSettings: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onClick, onEditSettings }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteMutation = useDeleteTest();

  const getStatusLabel = () => {
    if (test.status === 'DRAFT') return { class: 'draft', text: 'DRAFT' };
    
    const now = new Date();
    const from = new Date(test.availableFrom);
    const till = new Date(test.availableTill);
    
    if (now < from) return { class: 'scheduled', text: 'SCHEDULED' };
    if (now > till) return { class: 'closed', text: 'CLOSED' };
    return { class: 'live', text: 'LIVE' };
  };

  const status = getStatusLabel();
  
  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="quiz-card" onClick={onClick}>
      <div className="quiz-card-top">
        <span className={`status-pill ${status.class}`}>{status.text}</span>
        <div className="card-menu-wrap">
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="More options"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1.4" />
              <circle cx="12" cy="12" r="1.4" />
              <circle cx="12" cy="19" r="1.4" />
            </svg>
          </button>
          {menuOpen && (
            <div className="card-menu" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setMenuOpen(false); onClick(); }}>Open builder</button>
              <button onClick={() => { setMenuOpen(false); onEditSettings(); }}>Edit settings</button>
              <button className="danger" onClick={() => {
                if (confirm('Are you sure you want to delete this test?')) {
                  deleteMutation.mutate(test.id);
                }
              }}>Delete test</button>
            </div>
          )}
        </div>
      </div>
      
      <h3>{test.title}</h3>
      
      <div className="quiz-card-meta">
        <span>{test.questionIds?.length || 0} questions</span>
        <span>{test.timeLimitMinutes} min limit</span>
      </div>
      
      <div className="quiz-card-window">
        <span><b>Available from:</b> {formatDate(test.availableFrom)}</span>
        <span><b>Available till:</b> {formatDate(test.availableTill)}</span>
      </div>
      
      <div className="quiz-card-foot">
        <span>Created {new Date(test.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
