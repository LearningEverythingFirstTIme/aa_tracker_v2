import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Calendar, CheckCircle, MapPin } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  const meetings = useStore((state) => state.meetings);
  const checkIn = useStore((state) => state.checkIn);
  const addHistoryItem = useStore((state) => state.addHistoryItem);
  const addTransaction = useStore((state) => state.addTransaction);
  
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [role, setRole] = useState<'Attendee' | 'Speaker' | 'Secretary' | 'Treasurer' | 'Host'>('Attendee');
  const [contribution, setContribution] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'submitting'>('select');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId);

  const handleCheckIn = async () => {
    if (!selectedMeeting) return;
    
    setStep('submitting');
    setError('');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Add check-in
      await checkIn(selectedMeeting.id, selectedMeeting.name);
      
      // Add to history
      await addHistoryItem({
        date: today,
        meeting: selectedMeeting.name,
        role,
      });
      
      // Add contribution if provided
      const contribAmount = parseFloat(contribution);
      if (!isNaN(contribAmount) && contribAmount > 0) {
        await addTransaction({
          date: today,
          amount: contribAmount,
          type: 'contribution',
          note: `${selectedMeeting.name} - ${role}`,
        });
      }
      
      // Reset and close
      setSelectedMeetingId(null);
      setRole('Attendee');
      setContribution('');
      setStep('select');
      onClose();
    } catch (err) {
      console.error('Check-in error:', err);
      setError('Failed to save check-in. Please try again.');
      setStep('confirm');
    }
  };

  const formatDayTime = (meeting: typeof meetings[0]) => {
    return `${meeting.day}s at ${meeting.time}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brutal-bg/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="brutal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-brutal-text/10">
          <h2 className="text-xl font-heading font-bold text-brutal-text">
            {step === 'select' ? 'Check In' : step === 'submitting' ? 'Saving...' : 'Confirm Check In'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border-2 border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 'select' ? (
          <div className="p-6">
            <p className="text-brutal-text-secondary mb-4">Select the meeting you attended:</p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {meetings.map((meeting) => (
                <button
                  key={meeting.id}
                  onClick={() => setSelectedMeetingId(meeting.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMeetingId === meeting.id
                      ? 'border-brutal-yellow bg-brutal-yellow/10'
                      : 'border-brutal-text/20 hover:border-brutal-text/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading font-semibold text-brutal-text">{meeting.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-brutal-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDayTime(meeting)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-brutal-text-secondary">
                        <MapPin className="w-4 h-4" />
                        {meeting.location}
                      </div>
                    </div>
                    {selectedMeetingId === meeting.id && (
                      <CheckCircle className="w-5 h-5 text-brutal-yellow" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedMeetingId && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="eyebrow block mb-2">Your Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as typeof role)}
                    className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text focus:border-brutal-yellow focus:outline-none"
                  >
                    <option value="Attendee">Attendee</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Host">Host</option>
                  </select>
                </div>

                <div>
                  <label className="eyebrow block mb-2">Contribution (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text placeholder:text-brutal-text-secondary focus:border-brutal-yellow focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setStep('confirm')}
                  className="w-full brutal-btn py-4"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        ) : step === 'submitting' ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 border-4 border-brutal-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-brutal-text-secondary">Saving your check-in...</p>
          </div>
        ) : (
          <div className="p-6">
            {selectedMeeting && (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brutal-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-brutal-yellow" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-brutal-text">
                  {selectedMeeting.name}
                </h3>
                <p className="text-brutal-text-secondary mt-1">{formatDayTime(selectedMeeting)}</p>
                <p className="text-brutal-text-secondary text-sm">{selectedMeeting.location}</p>
                
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brutal-text/5 rounded-full">
                  <span className="text-sm text-brutal-text-secondary">Role:</span>
                  <span className="text-sm font-mono text-brutal-yellow">{role}</span>
                </div>
                
                {contribution && parseFloat(contribution) > 0 && (
                  <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-brutal-green/10 rounded-full">
                    <span className="text-sm text-brutal-text-secondary">Contribution:</span>
                    <span className="text-sm font-mono text-brutal-green">${parseFloat(contribution).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 px-4 py-3 border-2 border-brutal-text/20 rounded-lg text-brutal-text-secondary hover:border-brutal-text/40 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCheckIn}
                className="flex-1 brutal-btn py-3"
              >
                Confirm Check In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
