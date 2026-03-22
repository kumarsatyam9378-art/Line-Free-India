import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, MessageEntry, BarberProfile } from '../store/AppContext';

export default function CustomerChat() {
  const { salonId } = useParams<{ salonId: string }>();
  const { user, customerProfile, getSalonMessages, sendMessage, getSalonById, allSalons } = useApp();
  const nav = useNavigate();
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [salon, setSalon] = useState<BarberProfile | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (salonId) {
      const found = allSalons.find(s => s.uid === salonId);
      if (found) setSalon(found);
      else getSalonById(salonId).then(setSalon);
    }
  }, [salonId, allSalons]);

  const loadMessages = async () => {
    if (!salonId) return;
    const msgs = await getSalonMessages(salonId);
    setMessages(msgs);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => {
    loadMessages();
    const iv = setInterval(loadMessages, 5000);
    return () => clearInterval(iv);
  }, [salonId]);

  const handleSend = async () => {
    if (!text.trim() || !salonId || !user || !salon) return;
    setSending(true);
    await sendMessage({
      salonId,
      salonName: salon.salonName,
      customerId: user.uid,
      customerName: customerProfile?.name || user.displayName || 'Customer',
      customerPhoto: customerProfile?.photoURL || user.photoURL || '',
      message: text.trim(),
      createdAt: Date.now(),
      read: false,
    });
    setText('');
    setSending(false);
    await loadMessages();
  };

  const formatTime = (ts: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: MessageEntry[] }[] = [];
  messages.forEach(msg => {
    const dateLabel = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateLabel) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, msgs: [msg] });
    }
  });

  return (
    <div className="min-h-screen flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="p-4 glass-strong flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => nav(-1)} className="text-lg">←</button>
        <div className="w-10 h-10 rounded-full bg-card-2 overflow-hidden flex-shrink-0">
          {salon?.photoURL ? (
            <img src={salon.photoURL} className="w-10 h-10 object-cover" alt="" />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center text-xl">💈</div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{salon?.salonName || 'Salon'}</p>
          <p className="text-text-dim text-[10px]">{salon?.name}</p>
        </div>
        {salon?.phone && (
          <a href={`tel:${salon.phone}`} className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary">📞</a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3">💬</span>
            <p className="text-text-dim font-medium">No messages yet</p>
            <p className="text-text-dim text-xs mt-1">Send your first message to {salon?.salonName || 'this salon'}</p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group, gi) => (
              <div key={gi}>
                <div className="text-center mb-3">
                  <span className="text-[10px] text-text-dim bg-card px-3 py-1 rounded-full">{group.date}</span>
                </div>
                {group.msgs.map((msg, i) => {
                  const isMine = msg.customerId === user?.uid;
                  return (
                    <div key={msg.id || i} className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${
                        isMine
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-card border border-border rounded-bl-md'
                      }`}>
                        {!isMine && (
                          <p className="text-[10px] font-semibold text-primary mb-0.5">{msg.customerName}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-white/60' : 'text-text-dim'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 glass-strong sticky bottom-0">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="input-field flex-1 text-sm py-3"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-lg">➤</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
