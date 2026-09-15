import { Edit3, Copy, BarChart2, Upload, Trash2, Users, Star } from 'lucide-react';
import type { Course } from '../../../data/mockCourses';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      {/* Cover Image */}
      <div className="h-40 w-full overflow-hidden relative">
        <img 
          src={course.coverUrl} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradients to make the image pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Tags */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {course.tags.map(tag => (
              <span key={tag} className="text-xs font-semibold px-2 py-1 bg-slate-100 text-primary-700 rounded-md">
                {tag}
              </span>
            ))}
          </div>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md ${
            course.status === 'PUBLISHED' 
              ? 'bg-emerald-50 text-emerald-600'
              : course.status === 'DRAFT'
              ? 'bg-sky-50 text-sky-600'
              : 'bg-rose-50 text-rose-600'
          }`}>
            {course.status}
          </span>
        </div>

        {/* Title & Desc */}
        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <img src={course.author.avatar} alt={course.author.name} className="w-8 h-8 rounded-full border border-slate-200" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">{course.author.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">{course.author.role}</span>
          </div>
        </div>

        {/* Stats & Price */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">{course.stats.users}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold">{course.stats.rating}</span>
            </div>
          </div>
          <div className="text-right">
            {course.price === 0 ? (
              <span className="text-sm font-bold text-slate-800">Free <span className="text-xs text-slate-400 font-medium">/ plan</span></span>
            ) : (
              <span className="text-sm font-bold text-slate-800">${course.price} <span className="text-xs text-slate-400 font-medium">/ one-time</span></span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 text-slate-400">
          <button className="hover:text-primary-600 transition-colors p-1"><Edit3 className="w-4 h-4" /></button>
          <button className="hover:text-primary-600 transition-colors p-1"><Copy className="w-4 h-4" /></button>
          <button className="hover:text-primary-600 transition-colors p-1"><BarChart2 className="w-4 h-4" /></button>
          <button className="hover:text-primary-600 transition-colors p-1"><Upload className="w-4 h-4" /></button>
          <button className="hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
