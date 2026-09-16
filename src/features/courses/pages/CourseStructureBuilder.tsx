import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Video, FileText, Headphones, File, Type, Heading,
  Link as LinkIcon, HelpCircle, TestTube, Code, CheckSquare,
  ListOrdered, MonitorPlay, ChevronDown, GripVertical, Trash2,
  Plus, Eye, Share, Loader2
} from 'lucide-react';
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor,
  useSensor, useSensors, closestCenter, pointerWithin,
  rectIntersection, getFirstCollision
} from '@dnd-kit/core';
import type {
  DragEndEvent, DragStartEvent, DragOverEvent,
  UniqueIdentifier, CollisionDetection
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import NodeContentEditor from '../components/editor/NodeContentEditor';
import NodeContentViewer from '../components/preview/NodeContentViewer';
import { useCourseNodes, useCreateCourseNode, useDeleteCourseNode, useUpdateCourseNode } from '../hooks/useCourseNodes';

// ─── Type icon map ────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, any> = {
  VIDEO: Video, AUDIO: Headphones, PDF: FileText, FILE: File,
  TEXT: Type, HEADING: Heading, LINK: LinkIcon, QUIZ: HelpCircle,
  TEST: TestTube, CODING: Code, ASSIGNMENT: CheckSquare,
  FORM: ListOrdered, LIVE: MonitorPlay,
};
const TYPE_COLORS: Record<string, string> = {
  VIDEO: 'bg-blue-50 text-blue-600', AUDIO: 'bg-purple-50 text-purple-600',
  PDF: 'bg-red-50 text-red-600', FILE: 'bg-slate-100 text-slate-600',
  TEXT: 'bg-emerald-50 text-emerald-600', HEADING: 'bg-amber-50 text-amber-600',
  LINK: 'bg-indigo-50 text-indigo-600',
};

export default function CourseStructureBuilder() {
  const navigate = useNavigate();
  const { courseId = '' } = useParams();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // ── local optimistic state ────────────────────────────────────────────────
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  // Backend Integration
  const { data: rawNodes, isLoading } = useCourseNodes(courseId as string);
  const { mutate: createNode, isPending: isCreating } = useCreateCourseNode();
  const { mutate: deleteNode } = useDeleteCourseNode();
  const { mutate: updateNode } = useUpdateCourseNode();

  // Transform flat nodes → { modules, itemsByModule }
  const { modules, itemsByModule, allIds } = useMemo(() => {
    if (!rawNodes) return { modules: [], itemsByModule: {}, allIds: [] };
    const mods = rawNodes
      .filter((n: any) => n.type === 'MODULE')
      .sort((a: any, b: any) => a.sequence - b.sequence);
    const ibm: Record<string, any[]> = {};
    for (const m of mods) {
      ibm[m.id] = rawNodes
        .filter((n: any) => n.parentId === m.id)
        .sort((a: any, b: any) => a.sequence - b.sequence);
    }
    const allIds: UniqueIdentifier[] = [
      ...mods.map((m: any) => m.id),
      ...Object.values(ibm).flat().map((i: any) => i.id),
    ];
    return { modules: mods, itemsByModule: ibm, allIds };
  }, [rawNodes]);

  // helper: which module does an item belong to?
  const findModuleOfItem = useCallback((id: UniqueIdentifier) => {
    for (const [modId, items] of Object.entries(itemsByModule)) {
      if (items.find((i: any) => i.id === id)) return modId;
    }
    return null;
  }, [itemsByModule]);

  const isPaletteId = (id: UniqueIdentifier) =>
    typeof id === 'string' && id.startsWith('palette-');
  const isDroppableModId = (id: UniqueIdentifier) =>
    typeof id === 'string' && id.startsWith('droppable-mod-');
  const isModuleId = (id: UniqueIdentifier) =>
    modules.some((m: any) => m.id === id);
  const isItemId = (id: UniqueIdentifier) => findModuleOfItem(id) !== null;

  // ── Collision detection: prefer items/modules, fall back to droppable zones ─
  const collisionDetection: CollisionDetection = useCallback((args) => {
    // palette tiles: only match droppable module zones
    if (activeId && isPaletteId(activeId)) {
      return rectIntersection({ ...args, droppableContainers: args.droppableContainers.filter(c => isDroppableModId(c.id)) });
    }
    // For sortable items first try closestCenter, then fall back to droppable module zones
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  }, [activeId, modules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Active drag item ──────────────────────────────────────────────────────
  const activePaletteType = activeId && isPaletteId(activeId)
    ? (activeId as string).replace('palette-', '') : null;
  const activeModule = activeId && isModuleId(activeId)
    ? modules.find((m: any) => m.id === activeId) : null;
  const activeItem = activeId && isItemId(activeId)
    ? Object.values(itemsByModule).flat().find((i: any) => i.id === activeId) : null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    const ovr = over.id;

    // ── 1. Palette → droppable module zone ──────────────────────────────────
    if (isPaletteId(active.id) && isDroppableModId(ovr)) {
      const moduleId = (ovr as string).replace('droppable-mod-', '');
      const itemType = (active.id as string).replace('palette-', '');
      createNode({
        courseId,
        dto: { type: itemType as any, title: `New ${itemType}`, parentId: moduleId }
      });
      return;
    }

    // ── 2. Module reorder ────────────────────────────────────────────────────
    if (isModuleId(active.id) && isModuleId(ovr) && active.id !== ovr) {
      const oldIndex = modules.findIndex((m: any) => m.id === active.id);
      const newIndex = modules.findIndex((m: any) => m.id === ovr);
      // Determine the new sequence: midpoint between neighbours in destination
      const reordered = arrayMove(modules, oldIndex, newIndex);
      const idx = reordered.findIndex((m: any) => m.id === active.id);
      const prev = reordered[idx - 1];
      const next = reordered[idx + 1];
      let newSeq: number;
      if (!prev) newSeq = (next?.sequence ?? Date.now()) - 1000;
      else if (!next) newSeq = (prev?.sequence ?? Date.now()) + 1000;
      else newSeq = Math.floor((prev.sequence + next.sequence) / 2);

      updateNode({ courseId, nodeId: active.id as string, dto: { sequence: newSeq } });
      return;
    }

    // ── 3. Item reorder / cross-module move ──────────────────────────────────
    if (isItemId(active.id)) {
      const srcModId = findModuleOfItem(active.id)!;

      // Over another item
      if (isItemId(ovr) && active.id !== ovr) {
        const srcModId = findModuleOfItem(active.id)!;
        const dstModId = findModuleOfItem(ovr)!;
        
        let newSeq: number;
        
        if (srcModId === dstModId) {
          // Reordering within the same module
          const items = itemsByModule[srcModId];
          const oldIndex = items.findIndex((i: any) => i.id === active.id);
          const newIndex = items.findIndex((i: any) => i.id === ovr);
          
          const reordered = arrayMove(items, oldIndex, newIndex);
          const idx = reordered.findIndex((i: any) => i.id === active.id);
          const prev = reordered[idx - 1];
          const next = reordered[idx + 1];
          
          if (!prev) newSeq = (next?.sequence ?? Date.now()) - 1000;
          else if (!next) newSeq = (prev?.sequence ?? Date.now()) + 1000;
          else newSeq = Math.floor((prev.sequence + next.sequence) / 2);
        } else {
          // Moving to a different module, over a specific item
          const dstItems = itemsByModule[dstModId] ?? [];
          const overItem = dstItems.find((i: any) => i.id === ovr);
          // Just place it slightly before the item we're hovering over
          newSeq = (overItem?.sequence ?? Date.now()) - 10;
        }

        updateNode({
          courseId,
          nodeId: active.id as string,
          dto: { parentId: dstModId, sequence: newSeq }
        });
        return;
      }

      // Over a droppable module zone (empty module or cross-module drop)
      if (isDroppableModId(ovr)) {
        const dstModId = (ovr as string).replace('droppable-mod-', '');
        if (srcModId !== dstModId) {
          updateNode({
            courseId,
            nodeId: active.id as string,
            dto: { parentId: dstModId, sequence: Date.now() }
          });
        }
      }
    }
  };

  const addModule = () => {
    createNode({ courseId, dto: { type: 'MODULE', title: 'New Module' } });
  };

  const handleDeleteNode = (nodeId: string) => {
    deleteNode({ courseId, nodeId });
    if (selectedItem?.id === nodeId) setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Course Structure</h1>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded">DRAFT</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">{modules.length} Modules</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${isPreviewMode ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Eye className="w-4 h-4" /> {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
          </button>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Sequential</span>
            <div className="w-8 h-4 bg-slate-200 rounded-full relative cursor-pointer">
              <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-colors">
            <Share className="w-4 h-4" /> Publish Course
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Left Panel – Palette */}
          {!isPreviewMode && (
            <div className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto shrink-0">
              <h2 className="font-bold text-slate-800 mb-1">Course Structure</h2>
              <p className="text-xs text-slate-500 mb-6">Drag to add to course</p>

              <h3 className="text-xs font-bold text-slate-800 mb-3">Upload Content</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <PaletteTile id="palette-VIDEO"      icon={Video}      label="Video" />
                <PaletteTile id="palette-PDF"        icon={FileText}   label="PDF" />
                <PaletteTile id="palette-AUDIO"      icon={Headphones} label="Audio" />
                <PaletteTile id="palette-FILE"       icon={File}       label="File" />
              </div>

              <h3 className="text-xs font-bold text-slate-800 mb-3">Create Content</h3>
              <div className="grid grid-cols-2 gap-2">
                <PaletteTile id="palette-TEXT"       icon={Type}        label="Text" />
                <PaletteTile id="palette-HEADING"    icon={Heading}     label="Heading" />
                <PaletteTile id="palette-LINK"       icon={LinkIcon}    label="Link" />
                <PaletteTile id="palette-QUIZ"       icon={HelpCircle}  label="Quiz" />
                <PaletteTile id="palette-TEST"       icon={TestTube}    label="Test" />
                <PaletteTile id="palette-CODING"     icon={Code}        label="Coding" />
                <PaletteTile id="palette-ASSIGNMENT" icon={CheckSquare} label="Assignment" />
                <PaletteTile id="palette-FORM"       icon={ListOrdered} label="Form" />
                <PaletteTile id="palette-LIVE"       icon={MonitorPlay} label="Live Class" />
              </div>
            </div>
          )}

          {/* Center Panel – Tree */}
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto relative">
            <div className="max-w-3xl mx-auto space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              ) : (
                <SortableContext items={modules.map((m: any) => m.id)} strategy={verticalListSortingStrategy}>
                  {modules.map((module: any) => (
                    <SortableModule
                      key={module.id}
                      module={module}
                      items={itemsByModule[module.id] ?? []}
                      onSelectItem={setSelectedItem}
                      onDeleteNode={handleDeleteNode}
                      isPreviewMode={isPreviewMode}
                      activeId={activeId}
                    />
                  ))}
                </SortableContext>
              )}

              {!isPreviewMode && (
                <button
                  onClick={addModule}
                  disabled={isCreating}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Add Module
                </button>
              )}
            </div>
          </div>

          {/* Drag Overlay – shows while dragging */}
          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activePaletteType && (
              <div className="w-[110px] h-[78px] bg-white border-2 border-teal-500 shadow-xl rounded-xl flex flex-col items-center justify-center gap-1 opacity-95 rotate-2">
                {(() => { const I = TYPE_ICONS[activePaletteType] ?? File; return <I className="w-5 h-5 text-teal-600" />; })()}
                <span className="text-[11px] font-bold text-teal-600">{activePaletteType}</span>
              </div>
            )}
            {activeModule && (
              <div className="bg-white border-2 border-teal-400 rounded-xl p-4 shadow-2xl opacity-90 w-full">
                <span className="font-semibold text-slate-800">{activeModule.title}</span>
              </div>
            )}
            {activeItem && (
              <div className="flex items-center gap-3 p-3 bg-white border-2 border-teal-400 rounded-lg shadow-2xl opacity-90">
                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${TYPE_COLORS[activeItem.type] ?? 'bg-slate-100 text-slate-600'}`}>{activeItem.type}</span>
                <span className="text-sm font-medium text-slate-700">{activeItem.title}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Right Panel – Editor / Viewer */}
        <div className={`${isPreviewMode ? 'flex-1' : 'w-[420px] shrink-0'} bg-white border-l border-slate-200 flex flex-col`}>
          {selectedItem ? (
            isPreviewMode
              ? <NodeContentViewer key={selectedItem.id} item={selectedItem} />
              : <NodeContentEditor key={selectedItem.id} item={selectedItem} courseId={courseId} />
          ) : (
            <>
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Content</h2>
                <p className="text-sm text-slate-500">Select an item to {isPreviewMode ? 'view' : 'edit'}</p>
              </div>
              <div className="flex-1 p-6 flex items-center justify-center text-slate-400 text-sm text-center">
                Select an item from the tree to {isPreviewMode ? 'view its content.' : 'edit its content.'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SortableModule ──────────────────────────────────────────────────────────
function SortableModule({
  module, items, onSelectItem, onDeleteNode, isPreviewMode, activeId
}: {
  module: any;
  items: any[];
  onSelectItem: (item: any) => void;
  onDeleteNode: (id: string) => void;
  isPreviewMode?: boolean;
  activeId: UniqueIdentifier | null;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
    data: { type: 'module' },
    disabled: !!isPreviewMode,
  });

  // Separate droppable zone for palette drops
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-mod-${module.id}`,
    disabled: !!isPreviewMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  // Highlight module when a palette tile is dragged over its droppable zone
  const isHighlighted = isOver;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-xl transition-all ${
        isHighlighted ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
      } ${isDragging ? 'shadow-2xl' : 'shadow-sm'}`}
    >
      {/* Module Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!isPreviewMode && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded shrink-0 touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-slate-100 rounded shrink-0"
          >
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
          </button>
          <button
            onClick={() => onSelectItem({ ...module, type: 'MODULE' })}
            className="flex-1 text-left px-2 py-1 rounded hover:bg-slate-50 min-w-0"
          >
            <h3 className="font-semibold text-slate-800 text-base truncate">{module.title}</h3>
            <p className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
          {!isPreviewMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteNode(module.id); }}
              className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      {!isCollapsed && (
        <div ref={setDropRef} className="pb-3 px-3 pl-10 space-y-2 min-h-[10px]">
          <SortableContext items={items.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item: any) => (
              <SortableItem
                key={item.id}
                item={item}
                onSelectItem={onSelectItem}
                onDeleteNode={onDeleteNode}
                isPreviewMode={isPreviewMode}
              />
            ))}
          </SortableContext>
          {items.length === 0 && !isPreviewMode && (
            <div className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-sm font-medium transition-colors min-h-[64px] ${
              isOver
                ? 'border-teal-400 bg-teal-50 text-teal-600'
                : 'border-blue-200 bg-blue-50/50 text-slate-400'
            }`}>
              {isOver ? '✓ Drop here' : 'Drag items from the left palette'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SortableItem ────────────────────────────────────────────────────────────
function SortableItem({
  item, onSelectItem, onDeleteNode, isPreviewMode
}: {
  item: any;
  onSelectItem: (item: any) => void;
  onDeleteNode: (id: string) => void;
  isPreviewMode?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item', parentId: item.parentId },
    disabled: !!isPreviewMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = TYPE_ICONS[item.type] ?? File;
  const colorCls = TYPE_COLORS[item.type] ?? 'bg-slate-100 text-slate-600';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelectItem(item)}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-teal-400 transition-all cursor-pointer group ${
        isDragging ? 'border-teal-400 shadow-lg' : 'border-slate-200'
      }`}
    >
      {!isPreviewMode && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-slate-100 rounded shrink-0 touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <div className={`w-6 h-6 flex items-center justify-center rounded shrink-0 ${colorCls}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded shrink-0 ${colorCls}`}>
        {item.type}
      </span>
      <span className="flex-1 text-sm font-medium text-slate-700 truncate">{item.title}</span>
      {!isPreviewMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteNode(item.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── PaletteTile ─────────────────────────────────────────────────────────────
function PaletteTile({ id, icon: Icon, label }: { id: string; icon: any; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md cursor-grab active:cursor-grabbing transition-all touch-none select-none ${
        isDragging ? 'opacity-40 border-teal-400' : 'opacity-100'
      }`}
    >
      <Icon className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
    </div>
  );
}
