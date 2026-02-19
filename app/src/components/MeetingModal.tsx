import { useState, useEffect } from 'react';
import { useStore, type Meeting } from '../store/useStore';
import { X, Calendar, MapPin, Clock, Tag } from 'lucide-react';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting?: Meeting | null;
}

export function MeetingModal({ isOpen, onClose, meeting }: MeetingModalProps) {
  const addMeeting = useStore((state) => state.addMeeting);
  const updateMeeting = useStore((state) => state.updateMeeting);
  
  const [formData, setFormData] = useState({
    name: '',
    day: 'Monday',
    time: '',
    location: '',
    type: 'Open Discussion',
  });

  useEffect(() => {
    if (meeting) {
      setFormData({
        name: meeting.name,
        day: meeting.day,
        time: meeting.time,
        location: meeting.location,
        type: meeting.type,
      });
    } else {
      setFormData({
        name: '',
        day: 'Monday',
        time: '',
        location: '',
        type: 'Open Discussion',
      });
    }
  }, [meeting, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meeting) {
      updateMeeting(meeting.id, formData);
    } else {
      addMeeting(formData);
    }
    onClose();
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const types = ['Open Discussion', 'Speaker', 'Literature Study', 'Step Study', 'Big Book', 'Topic Discussion'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brutal-bg/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="brutal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-brutal-text/10">
          <h2 className="text-xl font-heading font-bold text-brutal-text">
            {meeting ? 'Edit Meeting' : 'Add New Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="eyebrow block mb-2">Meeting Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Friday Night Lights"
              className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text placeholder:text-brutal-text-secondary focus:border-brutal-yellow focus:outline-none"
              required
            />
          </div>

          {/* Day & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="eyebrow block mb-2">Day</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-text-secondary" />
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none appearance-none"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="eyebrow block mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-text-secondary" />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="eyebrow block mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-text-secondary" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Community Center"
                className="w-full pl-10 pr-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text placeholder:text-brutal-text-secondary focus:border-brutal-yellow focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="eyebrow block mb-2">Meeting Type</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-text-secondary" />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none appearance-none"
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-brutal-text/20 rounded-lg text-brutal-text-secondary hover:border-brutal-text/40 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 brutal-btn py-3">
              {meeting ? 'Save Changes' : 'Add Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
