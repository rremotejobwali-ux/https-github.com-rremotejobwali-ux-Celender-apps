import React, { useState, useMemo } from 'react';
import { CalendarEvent, DayInfo } from './types';
import { 
  MONTH_NAMES, 
  WEEK_DAYS, 
  generateCalendarGrid, 
  isSameDate, 
  formatTime,
  formatDateFull
} from './utils/dateUtils';
import { EventModal } from './components/EventModal';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, MapPin, Clock } from 'lucide-react';

// Seed some initial data for visual appeal
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Design Review',
    start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    color: 'bg-indigo-500',
    description: 'Review new calendar mockups.',
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Team Lunch',
    start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(14, 0, 0, 0)).toISOString(),
    color: 'bg-green-500',
    location: 'Taco Place'
  }
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarGrid = useMemo(() => 
    generateCalendarGrid(year, month, events), 
    [year, month, events]
  );

  const selectedDayEvents = useMemo(() => 
    events.filter(e => isSameDate(new Date(e.start), selectedDate))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events, selectedDate]
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <CalIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Celender App</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white hover:shadow rounded-md transition-all text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <div className="w-40 text-center font-semibold text-slate-700 select-none">
              {MONTH_NAMES[month]} {year}
            </div>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white hover:shadow rounded-md transition-all text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => {
              setSelectedDate(new Date());
              setCurrentDate(new Date());
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            Today
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Calendar Grid Section */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {WEEK_DAYS.map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 grid-rows-6 flex-1 bg-slate-50">
            {calendarGrid.map((day, index) => {
              const isSelected = isSameDate(day.date, selectedDate);
              return (
                <div 
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    relative border-b border-r border-slate-200 p-2 cursor-pointer transition-colors group
                    ${!day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-800'}
                    ${isSelected ? 'bg-indigo-50/60 ring-inset ring-2 ring-indigo-500' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                      ${day.isToday ? 'bg-indigo-600 text-white shadow-md' : ''}
                      ${isSelected && !day.isToday ? 'text-indigo-600' : ''}
                    `}>
                      {day.date.getDate()}
                    </span>
                  </div>

                  {/* Event Dots (Desktop) */}
                  <div className="space-y-1 overflow-hidden max-h-[calc(100%-2rem)]">
                    {day.events.slice(0, 3).map((event, i) => (
                      <div 
                        key={i} 
                        className={`text-xs px-1.5 py-0.5 rounded truncate text-white ${event.color} opacity-90 hover:opacity-100 shadow-sm`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-slate-400 font-medium pl-1">
                        + {day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Sidebar for Selected Day Details */}
        <aside className="w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-2xl font-bold text-slate-800">
                {formatDateFull(selectedDate).split(',')[0]}
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full transition-colors"
                title="Add event on this day"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-slate-500 font-medium">
               {formatDateFull(selectedDate).split(',').slice(1).join(',')}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedDayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                <CalIcon size={48} className="mb-2 opacity-20" />
                <p>No events scheduled for this day.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-sm text-indigo-600 hover:underline"
                >
                  Create an event
                </button>
              </div>
            ) : (
              selectedDayEvents.map(event => (
                <div key={event.id} className="group relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-indigo-100 pl-4 overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${event.color}`}></div>
                  
                  <h3 className="font-semibold text-slate-800 text-lg mb-1">{event.title}</h3>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="mt-3 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

      </div>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}