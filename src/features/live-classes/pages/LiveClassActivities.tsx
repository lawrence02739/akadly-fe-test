import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Video, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  CalendarView,
  UpdateScope,
  LiveClassStatus,
  type CalendarSessionItem,
  type LiveClassListItem,
} from '../types';
import {
  useLiveClassCalendar,
  useLiveClassStats,
  useLiveClassConflicts,
  useLiveClassesList,
  useLiveClassDetails,
  useUpdateLiveClass,
  useDeleteLiveClass,
} from '../hooks/useLiveClasses';
import { listCourses } from '../../courses/api/courses.api';
import { listBatches } from '../../batches/api/batches.api';
import { useInstructors } from '../../courses/hooks/useMasterData';

import { StatsCards } from '../components/StatsCards';
import { ConflictBanner } from '../components/ConflictBanner';
import { CalendarToolbar } from '../components/CalendarToolbar';
import { MonthGrid } from '../components/MonthGrid';
import { WeekGrid } from '../components/WeekGrid';
import { DayList } from '../components/DayList';
import { TodayAgendaPanel } from '../components/TodayAgendaPanel';
import { LiveClassListView } from '../components/LiveClassListView';
import { ConflictsDrawer } from '../components/ConflictsDrawer';
import { LiveClassDetailsDrawer } from '../components/LiveClassDetailsDrawer';
import { ScopeDialog } from '../components/ScopeDialog';

export const LiveClassActivities: React.FC = () => {
  const navigate = useNavigate();

  // Active view tab: 'calendar' or 'list'
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>(CalendarView.MONTH);

  // Timezone preference with localStorage
  const [timezone, setTimezone] = useState<string>(() => {
    try {
      return localStorage.getItem('preferred_timezone') || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  });

  const handleTimezoneChange = (newTz: string) => {
    setTimezone(newTz);
    try {
      localStorage.setItem('preferred_timezone', newTz);
    } catch {
      // Ignore localStorage failure
    }
  };

  // Current calendar anchor date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>();
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>('LIVE,UPCOMING');

  // List view state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawers and Modals
  const [conflictsDrawerOpen, setConflictsDrawerOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Delete / Cancel scope modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetCancelId, setTargetCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelCredits, setCancelCredits] = useState(0);
  const [cancelScope, setCancelScope] = useState<UpdateScope>(UpdateScope.THIS);

  // Master data queries
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  });

  const { data: batchesData } = useQuery({
    queryKey: ['batches', { courseId: selectedCourseId }],
    queryFn: () => listBatches({ courseId: selectedCourseId, pageSize: 100 }),
    enabled: Boolean(selectedCourseId),
  });

  const { data: instructorsData = [] } = useInstructors();

  // Filter option arrays
  const courseOptions = useMemo(() => {
    if (!Array.isArray(coursesData)) return [];
    return coursesData.map((c: { id: string; title: string }) => ({
      id: c.id,
      name: c.title,
    }));
  }, [coursesData]);

  const batchOptions = useMemo(() => {
    const rawBatches = batchesData?.items ?? batchesData?.batches ?? [];
    return rawBatches.map((b: { id: string; name: string }) => ({
      id: b.id,
      name: b.name,
    }));
  }, [batchesData]);

  const instructorOptions = useMemo(() => {
    return instructorsData.map((i) => ({ id: i.id, name: i.name }));
  }, [instructorsData]);

  // Operational Stats
  const { data: statsData, isLoading: isLoadingStats } = useLiveClassStats({
    date: currentDateStr,
    timezone,
    courseId: selectedCourseId,
    batchId: selectedBatchId,
    instructorId: selectedInstructorId,
  });

  // Conflicts Query
  const { data: conflictsData } = useLiveClassConflicts({
    courseId: selectedCourseId,
    batchId: selectedBatchId,
    instructorId: selectedInstructorId,
  });

  // Calendar Query (main grid)
  const { data: calendarData } = useLiveClassCalendar({
    date: currentDateStr,
    view: calendarView,
    timezone,
    courseId: selectedCourseId,
    batchId: selectedBatchId,
    instructorId: selectedInstructorId,
    status: selectedStatus || undefined,
  });

  // Today's Agenda Query (for the right panel, always view=DAY on today)
  const { data: todayAgendaData } = useLiveClassCalendar({
    date: todayStr,
    view: CalendarView.DAY,
    timezone,
    courseId: selectedCourseId,
    batchId: selectedBatchId,
    instructorId: selectedInstructorId,
  });

  // List View Query
  const { data: listData, isLoading: isListLoading } = useLiveClassesList({
    page,
    pageSize,
    search: search.trim() || undefined,
    courseId: selectedCourseId,
    batchId: selectedBatchId,
    instructorId: selectedInstructorId,
    status: selectedStatus || undefined,
  });

  // Details Query
  const { data: liveClassDetails } = useLiveClassDetails(selectedSessionId ?? undefined);

  // Mutations
  const updateMutation = useUpdateLiveClass();
  const deleteMutation = useDeleteLiveClass();

  // Navigation helpers for Prev / Next / Today
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (calendarView === CalendarView.MONTH) {
        next.setMonth(next.getMonth() - 1);
      } else if (calendarView === CalendarView.WEEK) {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (calendarView === CalendarView.MONTH) {
        next.setMonth(next.getMonth() + 1);
      } else if (calendarView === CalendarView.WEEK) {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Period title computation
  const periodTitle = useMemo(() => {
    if (calendarView === CalendarView.MONTH) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: timezone,
      }).format(currentDate);
    }
    if (calendarView === CalendarView.WEEK) {
      const range = calendarData?.range;
      if (range) {
        const fromD = new Date(range.from + 'T00:00:00');
        const toD = new Date(range.to + 'T00:00:00');
        const fromStr = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: timezone,
        }).format(fromD);
        const toStr = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: timezone,
        }).format(toD);
        return `${fromStr} – ${toStr}`;
      }
      return 'Week Schedule';
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone,
    }).format(currentDate);
  }, [calendarView, currentDate, calendarData?.range, timezone]);

  // Session click handler
  const handleSelectSession = (session: CalendarSessionItem | LiveClassListItem) => {
    setSelectedSessionId(session.id);
    setDetailsDrawerOpen(true);
  };

  const handleEditSession = (id: string) => {
    setDetailsDrawerOpen(false);
    navigate(`/partner/live-classes/${id}/edit`);
  };

  // Cancel Session modal open
  const handleOpenCancelModal = (id: string) => {
    setTargetCancelId(id);
    setCancelReason('');
    setCancelCredits(0);
    setCancelScope(UpdateScope.THIS);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetCancelId) return;

    try {
      await updateMutation.mutateAsync({
        id: targetCancelId,
        payload: {
          status: LiveClassStatus.CANCELLED,
          cancelReason: cancelReason.trim() || undefined,
          creditsIssued: cancelCredits,
          scope: cancelScope,
        },
      });
      toast.success('Live class cancelled successfully');
      setCancelModalOpen(false);
      setDetailsDrawerOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to cancel live class.';
      toast.error(msg);
    }
  };

  // Delete session handler
  const handleOpenDeleteModal = (id: string) => {
    setTargetDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (scope: UpdateScope) => {
    if (!targetDeleteId) return;

    try {
      await deleteMutation.mutateAsync({ id: targetDeleteId, scope });
      toast.success('Live class deleted successfully');
      setDeleteModalOpen(false);
      setDetailsDrawerOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to delete live class.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Live Classes</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Schedule, manage and track live lectures across all courses and cohorts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConflictsDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>
                {conflictsData?.total ?? statsData?.instructorConflicts?.count ?? 0} conflicts
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/partner/live-classes/create')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Quick create</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 4 Dashboard Stats Cards */}
        <StatsCards stats={statsData} isLoading={isLoadingStats} />

        {/* Amber Conflict Banner */}
        <ConflictBanner
          summary={conflictsData?.summary ?? ''}
          totalConflicts={conflictsData?.total ?? 0}
          onReviewConflicts={() => setConflictsDrawerOpen(true)}
        />

        {/* Calendar / List Toolbar with Filters */}
        <CalendarToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          calendarView={calendarView}
          onViewChange={setCalendarView}
          title={periodTitle}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          timezone={timezone}
          onTimezoneChange={handleTimezoneChange}
          courses={courseOptions}
          selectedCourseId={selectedCourseId}
          onSelectCourse={(id) => {
            setSelectedCourseId(id);
            setSelectedBatchId(undefined); // Reset batch when course changes
          }}
          batches={batchOptions}
          selectedBatchId={selectedBatchId}
          onSelectBatch={setSelectedBatchId}
          instructors={instructorOptions}
          selectedInstructorId={selectedInstructorId}
          onSelectInstructor={setSelectedInstructorId}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        {/* Main Content Area */}
        {activeTab === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* Calendar Grid (8 cols on large screens, or full width) */}
            <div className="lg:col-span-8 space-y-4">
              {calendarView === CalendarView.MONTH && (
                <MonthGrid
                  days={calendarData?.days ?? []}
                  timezone={timezone}
                  onSelectSession={handleSelectSession}
                  onSelectDay={(dateStr) => {
                    setCurrentDate(new Date(dateStr + 'T00:00:00'));
                    setCalendarView(CalendarView.DAY);
                  }}
                />
              )}

              {calendarView === CalendarView.WEEK && (
                <WeekGrid
                  days={calendarData?.days ?? []}
                  timezone={timezone}
                  onSelectSession={handleSelectSession}
                />
              )}

              {calendarView === CalendarView.DAY && (
                <DayList
                  day={calendarData?.days?.[0]}
                  timezone={timezone}
                  onSelectSession={handleSelectSession}
                />
              )}

              {/* Status Legend Row */}
              <div className="flex flex-wrap items-center gap-4 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Legend:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span>Live Now</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Upcoming</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Completed</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Cancelled</span>
                </span>
              </div>
            </div>

            {/* Today's Agenda (4 cols on large screens) */}
            <div className="lg:col-span-4">
              <TodayAgendaPanel
                todayDay={todayAgendaData?.days?.[0]}
                timezone={timezone}
                onSelectSession={handleSelectSession}
                onOpenFullAgenda={() => {
                  setCurrentDate(new Date());
                  setCalendarView(CalendarView.DAY);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <LiveClassListView
              items={listData?.items ?? []}
              pagination={listData?.pagination}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              search={search}
              onSearchChange={setSearch}
              timezone={timezone}
              onSelectSession={handleSelectSession}
              onEditSession={(item) => handleEditSession(item.id)}
              onDeleteSession={(item) => handleOpenDeleteModal(item.id)}
              isLoading={isListLoading}
            />
          </div>
        )}
      </div>

      {/* Review Conflicts Drawer */}
      <ConflictsDrawer
        isOpen={conflictsDrawerOpen}
        conflicts={conflictsData?.items ?? []}
        onClose={() => setConflictsDrawerOpen(false)}
      />

      {/* Session Details Drawer */}
      <LiveClassDetailsDrawer
        isOpen={detailsDrawerOpen}
        liveClass={liveClassDetails}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedSessionId(null);
        }}
        onEdit={(session) => handleEditSession(session.id)}
        onCancel={(session) => handleOpenCancelModal(session.id)}
        onDelete={(session) => handleOpenDeleteModal(session.id)}
      />

      {/* Delete Scope Dialog */}
      <ScopeDialog
        isOpen={deleteModalOpen}
        actionType="delete"
        title={liveClassDetails?.title ?? 'this live class'}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={(scope) => void handleConfirmDelete(scope)}
        isLoading={deleteMutation.isPending}
      />

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Cancel Live Class
              </h3>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this class? Enrolled students will receive a cancellation notice.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Instructor unavailable due to emergency"
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credits to issue to enrolled students
              </label>
              <input
                type="number"
                min={0}
                value={cancelCredits}
                onChange={(e) => setCancelCredits(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Scope selection if part of series */}
            {(liveClassDetails?.siblings?.total ?? 1) > 1 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cancellation scope
                </label>
                <select
                  value={cancelScope}
                  onChange={(e) => setCancelScope(e.target.value as UpdateScope)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={UpdateScope.THIS}>This class only</option>
                  <option value={UpdateScope.THIS_AND_FOLLOWING}>
                    This and all following classes
                  </option>
                  <option value={UpdateScope.ALL}>All classes in this series</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCancel()}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Cancelling...' : 'Confirm cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClassActivities;
