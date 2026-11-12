'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Shield,
  Lock,
  Calendar,
  CheckCircle,
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
    onSendMessage(
      `📅 APPOINTMENT SCHEDULED: Depot Security Desk pickup on ${appointmentDate} at ${appointmentTime}. Security officer notified.`
    );
    setTimeout(() => {
      setShowScheduler(false);
      setAppointmentBooked(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl rounded-apple-2xl studio-surface border border-hairline p-6 shadow-2xl flex flex-col h-[640px] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-hairline">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-apple-md bg-white/10 flex items-center justify-center border border-hairline">
                <Shield className="w-4 h-4 text-apple-blue" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Encrypted Relay Channel
                </h3>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">
                  Re: {targetItem.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScheduler((prev) => !prev)}
                className="px-3 py-1.5 rounded-apple-pill bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all border border-hairline"
              >
                <Calendar className="w-3.5 h-3.5 text-apple-blue" />
                <span className="hidden sm:inline">Schedule Pickup</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Redaction Notice */}
          <div className="my-2.5 p-2 rounded-apple-md bg-black/60 border border-hairline flex items-center gap-2 text-[10px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-tesla-crimson flex-shrink-0" />
            <span>Personal phone numbers and external links are automatically scrubbed for security.</span>
          </div>

          {/* Scheduler Popdown */}
          {showScheduler && (
            <div className="p-3.5 rounded-apple-lg bg-black/80 border border-hairline mb-2.5 space-y-2.5">
              <span className="text-xs font-semibold text-white block">
                Security Desk Handover Reservation
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-apple-md bg-white/5 border border-hairline text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Time</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-apple-md bg-white/5 border border-hairline text-white font-mono"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleBookAppointment}
                className="w-full py-2 rounded-apple-pill bg-white text-black font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-telemetry-emerald" />
                <span>{appointmentBooked ? 'Appointment Reserved' : 'Confirm Appointment'}</span>
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <Shield className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
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
                    <span className="text-[10px] font-mono text-slate-500 mb-0.5 px-1">
                      {msg.senderHandle} ({msg.senderRole})
                    </span>
                    <div
                      className={`max-w-[85%] px-3.5 py-2 rounded-apple-md text-xs ${
                        isMe
                          ? 'bg-apple-blue text-white rounded-tr-none'
                          : 'bg-white/10 text-white rounded-tl-none border border-hairline'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSend} className="pt-3 border-t border-hairline flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message (phones/links auto-scrubbed)..."
              className="flex-1 px-3.5 py-2 rounded-apple-pill bg-white/5 border border-hairline text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-apple-blue"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="w-9 h-9 rounded-full bg-apple-blue hover:bg-apple-blueHover text-white flex items-center justify-center disabled:opacity-40 transition-all flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
