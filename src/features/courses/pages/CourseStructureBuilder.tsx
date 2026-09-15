import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, FileText, Headphones, File, Type, Heading, Link as LinkIcon, HelpCircle, TestTube, Code, CheckSquare, ListOrdered, MonitorPlay, ChevronDown, GripVertical, Trash2, Plus, Eye, Share } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import VideoContentEditor from '../components/editor/VideoContentEditor';
import PdfContentEditor from '../components/editor/PdfContentEditor';
import QuizContentEditor from '../components/editor/QuizContentEditor';

export default function CourseStructureBuilder() {
  const navigate = useNavigate();
  const { courseId: _courseId } = useParams();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [modules, setModules] = useState([
    {
      id: 'm1',
      title: 'Introduction',
      items: [
        { id: 'i1', type: 'VIDEO', title: 'Welcome Video', detail: '5:14 sec' },
        { id: 'i2', type: 'PDF', title: 'Course Overview PDF', detail: '32 Pages' },
        { id: 'i3', type: 'QUIZ', title: 'Module 1 Knowledge Check', detail: '5 Questions' },
      ],
    },
    {
      id: 'm2',
      title: 'Core Concepts',
      items: [],
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    // Simplified drag-and-drop: only handle top-level module reordering for now
    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Web Development Fundamentals</h1>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded">DRAFT</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">{modules.length} Modules</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Eye className="w-4 h-4" /> Preview Mode
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
        {/* Left Panel - Palette */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto shrink-0">
          <h2 className="font-bold text-slate-800 mb-1">Course Structure</h2>
          <p className="text-xs text-slate-500 mb-6">Drag to add to course</p>

          <h3 className="text-xs font-bold text-slate-800 mb-3">Upload Content</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <PaletteTile icon={Video} label="Video" />
            <PaletteTile icon={FileText} label="PDF" />
            <PaletteTile icon={Headphones} label="Audio" />
            <PaletteTile icon={File} label="File" />
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-3">Create Content</h3>
          <div className="grid grid-cols-2 gap-2">
            <PaletteTile icon={Type} label="Text" />
            <PaletteTile icon={Heading} label="Heading" />
            <PaletteTile icon={LinkIcon} label="Link" />
            <PaletteTile icon={HelpCircle} label="Quiz" />
            <PaletteTile icon={TestTube} label="Test" />
            <PaletteTile icon={Code} label="Coding" />
            <PaletteTile icon={CheckSquare} label="Assignment" />
            <PaletteTile icon={ListOrdered} label="Form" />
            <PaletteTile icon={MonitorPlay} label="Live Class" />
          </div>
        </div>

        {/* Center Panel - Tree Builder */}
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <div className="max-w-3xl mx-auto space-y-4">
                {modules.map((module) => (
                  <SortableModule key={module.id} module={module} onSelectItem={setSelectedItem} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Right Panel - Editor Shell */}
        <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col shrink-0">
           {selectedItem ? (
             <>
               {selectedItem.type === 'VIDEO' && <VideoContentEditor item={selectedItem} />}
               {selectedItem.type === 'PDF' && <PdfContentEditor item={selectedItem} />}
               {selectedItem.type === 'QUIZ' && <QuizContentEditor item={selectedItem} />}
               {!['VIDEO', 'PDF', 'QUIZ'].includes(selectedItem.type) && (
                 <div className="p-6 flex flex-col items-center justify-center text-center h-full text-slate-500">
                    <p className="mb-2 text-lg">🚧</p>
                    <p className="text-sm font-medium">Editor for {selectedItem.type} is coming soon.</p>
                 </div>
               )}
             </>
           ) : (
             <>
               <div className="p-4 border-b border-slate-200">
                 <h2 className="text-lg font-bold text-slate-800">Content</h2>
                 <p className="text-sm text-slate-500">Select an item to edit</p>
               </div>
               <div className="flex-1 p-6 flex items-center justify-center text-slate-400 text-sm text-center">
                 Select an item from the tree to edit its content.
               </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
}

function SortableModule({ module, onSelectItem }: { module: any, onSelectItem: (item: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab p-1 -ml-1 hover:bg-slate-100 rounded">
            <GripVertical className="w-5 h-5 text-slate-400" />
          </div>
          <ChevronDown className="w-5 h-5 text-slate-500" />
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{module.title}</h3>
            <p className="text-xs text-slate-500">{module.items.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
            <ChevronDown className="w-3 h-3" /> Collapse All
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-medium hover:bg-teal-800">
            <Plus className="w-3 h-3" /> Add Module
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 pl-8">
        {module.items.map((item: any) => (
          <div key={item.id} onClick={() => onSelectItem(item)} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-500 transition-colors cursor-pointer">
            <GripVertical className="w-4 h-4 text-slate-400 cursor-grab shrink-0" />
            <div className="w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-600 rounded">
              <Video className="w-3 h-3" />
            </div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">{item.type}</span>
            <span className="flex-1 text-sm font-medium text-slate-700">{item.title}</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.detail}</span>
          </div>
        ))}
        <div className="border border-dashed border-blue-300 rounded-lg p-3 flex items-center justify-center text-sm font-medium text-blue-600 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors mt-2">
          + Drop or Click to add item
        </div>
      </div>
    </div>
  );
}

function PaletteTile({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm cursor-grab transition-all">
      <Icon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
    </div>
  );
}
