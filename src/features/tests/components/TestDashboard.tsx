import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useTests } from '../hooks/useTests';
import { TestCard } from './TestCard';
import { TestSettingsModal } from './TestSettingsModal';

interface TestDashboardProps {
  onOpenTest: (id: string) => void;
  onEditSettings: (id: string) => void;
}

export const TestDashboard: React.FC<TestDashboardProps> = ({ onOpenTest, onEditSettings }) => {
  const { data: tests, isLoading } = useTests();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'live' | 'closed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return <div className="qs-view"><div className="empty-state"><p>Loading live tests...</p></div></div>;
  }

  const getStatus = (test: any) => {
    if (test.status === 'DRAFT') return 'draft';
    const now = new Date();
    const from = new Date(test.availableFrom);
    const till = new Date(test.availableTill);
    if (now < from) return 'scheduled';
    if (now > till) return 'closed';
    return 'live';
  };

  const filteredTests = (tests || []).filter(test => {
    if (search && !test.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all') {
      const status = getStatus(test);
      if (filter !== status) return false;
    }
    return true;
  });

  return (
    <div className="qs-view">
      <div className="dash-head">
        <div>
          <h1>Live Tests</h1>
          <p>Create and manage scheduled assessments with time limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} style={{ marginRight: 4 }} /> New live test
        </button>
      </div>

      <div className="dash-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search live tests..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {(['all', 'draft', 'scheduled', 'live', 'closed'] as const).map(f => (
            <button 
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="empty-state">
          <h3>No tests found</h3>
          <p>You don't have any live tests matching these filters.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            Create your first test
          </button>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredTests.map(test => (
            <TestCard key={test.id} test={test} onClick={() => onOpenTest(test.id)} onEditSettings={() => onEditSettings(test.id)} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <TestSettingsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={onOpenTest}
        />
      )}
    </div>
  );
};
