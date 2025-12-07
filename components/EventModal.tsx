import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { formatIsoDateTime } from '../utils/dateUtils';
import { parseNaturalLanguageEvent } from '../services/gemini';
import { Sparkles, X, Loader2, Calendar as CalendarIcon, MapPin, AlignLeft } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  selectedDate: Date;
}

const COLORS = [
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Indigo', value: 'bg-indigo-500' },
  { label: 'Red', value: 'bg-red-500' },
  { label: 'Green', value: 'bg-green-500' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Purple', value: 'bg-purple-500' },
];

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      const startDate = new Date(selectedDate);
      startDate.setHours(9, 0, 0, 0); // Default 9 AM
      const endDate = new Date(selectedDate);
      endDate.setHours(10, 0, 0, 0); // Default 10 AM

      setTitle('');
      setStart(formatIsoDateTime(startDate));
      setEnd(formatIsoDateTime(endDate));
      setDescription('');
      setLocation('');
      setAiInput('');
      setColor(COLORS[0].value);
    }
  }, [isOpen, selectedDate]);

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    const result = await parseNaturalLanguageEvent(aiInput, new Date()); // Use current time as ref for "tomorrow", etc.
    setIsAiLoading(false);

    if (result) {
      setTitle(result.title);
      // Ensure ISO strings are formatted for datetime-local input
      if (result.start) setStart(formatIsoDateTime(new Date(result.start)));
      if (result.end) setEnd(formatIsoDateTime(new Date(result.end)));
      if (result.description) setDescription(result.description);
      if (result.location) setLocation(result.location);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      description,
      location,
      color,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Add New Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* AI Magic Section */}
          <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Sparkles size={14} />
              Magic Create
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Lunch with mom tomorrow at 12pm..."
                className="flex-1 text-sm border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg px-3 py-2 border outline-none"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              />
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiLoading || !aiInput}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px]"
              >
                {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>

          <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="Event Title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
                <input
                  required
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
                <input
                  required
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Add location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <AlignLeft size={14} className="text-slate-400" /> Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-slate-200 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                placeholder="Add details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${c.value} ${color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
};