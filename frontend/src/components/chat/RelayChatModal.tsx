'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Shield,
  Lock,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Item, ChatMessage, UserRole } from '../../types';

interface RelayChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item | null;
  messages: ChatMessage[];
  onSendMessage: (rawMessage: string) => Promise<ChatMessage>;
  userRole: UserRole;
}

export const RelayChatModal: React.FC<RelayChatModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  messages,
  onSendMessage,
  userRole,
}) => {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('2026-11-13');
  const [appointmentTime, setAppointmentTime] = useState('14:30');
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  if (!isOpen || !targetItem) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(inputText.trim());
      setInputText('');
    } finally {
      setSending(false);
    }
  };

  const handleBookAppointment = () => {
    setAppointmentBooked(true);
    // Automatically inject a system appointment notification into chat
    onSendMessage(
      `📅 APPOINTMENT SCHEDULED: Depot Security Desk pickup on ${appointmentDate} at ${appointmentTime}. Security officer alerted.`
    );
    setTimeout(() => {
      setShowScheduler(false);
      setAppointmentBooked(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          className="relative w-full max-w-xl rounded-4xl glass-panel-heavy border border-white/20 p-6 sm:p-7 shadow-2xl flex flex-col h-[650px] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7000FF] to-[#00E599] p-[2px]">
                <div className="w-full h-full bg-[#0B0E14] rounded-2xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#00E599]" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Anonymous Relay Channel
                </h3>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[220px] sm:max-w-xs">
                  Re: {targetItem.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScheduler((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/10"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Schedule Handover</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Privacy Auto-Scrubbing Security Banner */}
          <div className="my-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-[11px] text-amber-300">
            <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Auto-Scrubber Active:</strong> Personal phone numbers and external links are automatically redacted to maintain student safety. Arrange all handovers through Campus Security.
            </span>
          </div>

          {/* Handover Scheduler Modal Dropdown */}
          {showScheduler && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-3xl bg-slate-900/95 border border-white/15 mb-3 space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Campus Security Desk Appointment</span>
                <span className="text-[10px] text-emerald-400 font-mono">DEPOT VAULT</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Time Slot</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleBookAppointment}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#00E599] to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{appointmentBooked ? 'Confirmed!' : 'Confirm Appointment'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <Shield className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <p>No messages yet. Send a message to coordinate with the finder or security depot.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === userRole;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 mb-1 px-1">
                      {msg.senderHandle} ({msg.senderRole})
                    </span>
                    <div
                      className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-gradient-to-r from-[#FF5E3A] to-[#FF7A00] text-white shadow-glow-orange/20 rounded-tr-sm'
                          : 'bg-white/10 dark:bg-white/10 text-white rounded-tl-sm border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    {msg.scrubbedNotice && (
                      <span className="text-[9px] text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> External contact scrubbed for safety
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input with Scrubbing */}
          <form onSubmit={handleSend} className="pt-3 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message (phone numbers/links auto-scrubbed)..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00E599]"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-teal-400 text-slate-950 font-bold hover:brightness-110 shadow-glow-emerald disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
