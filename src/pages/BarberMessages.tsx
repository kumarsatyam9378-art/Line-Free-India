import { useState, useEffect } from 'react';
import { useApp, MessageEntry } from '../store/AppContext';
import BottomNav from '../components/BottomNav';

export default function BarberMessages() {
  const { getBarberMessages, markMessageRead } = useApp();
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const loadMessages = async () => {
    const msgs = await getBarberMessages();
    setMessages(msgs);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    const iv = setInterval(loadMessages, 5000);
    return () => clearInterval(iv);
  }, []);

  // Group messages by customer
  const customerGroups: Record<string, { customerName: string; customerPhoto: string; messages: MessageEntry[]; unread: number; lastMessage: MessageEntry }> = {};
  messages.forEach(msg => {
    if (!customerGroups[msg.customerId]) {
      customerGroups[msg.customerId] = {
        customerName: msg.customerName,
        customerPhoto: msg.customerPhoto,
        messages: [],
        unread: 0,
        lastMessage: msg,
      };
    }
    customerGroups[msg.customerId].messages.push(msg);
    if (!msg.read) customerGroups[msg.customerId].unread++;
    if ((msg.createdAt || 0) > (customerGroups[msg.customerId].lastMessage.createdAt || 0)) {
      customerGroups[msg.customerId].lastMessage = msg;
    }
  });

  // Sort by latest message
  const sortedCustomers = Object.entries(customerGroups).sort(
    (a, b) => (b[1].lastMessage.createdAt || 0) - (a[1].lastMessage.createdAt || 0)
  );

  const totalUnread = messages.filter(m => !m.read).length;

  const formatTime = (ts: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Mark messages as read when viewing
  const handleSelectCustomer = async (customerId: string) => {
    setSelectedCustomer(customerId);
    const group = customerGroups[customerId];
    if (group) {
      for (const msg of group.messages) {
        if (!msg.read && msg.id) {
          await markMessageRead(msg.id);
        }
      }
      loadMessages();
    }
  };

  // Detail view for a customer's messages
  if (selectedCustomer && customerGroups[selectedCustomer]) {
    const group = customerGroups[selectedCustomer];
    return (
      <div className="min-h-screen pb-24 animate-fadeIn">
        {/* Header */}
        <div className="p-4 glass-strong flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSelectedCustomer(null)} className="text-lg">←</button>
          <div className="w-10 h-10 rounded-full bg-card-2 overflow-hidden flex-shrink-0">
            {group.customerPhoto ? (
              <img src={group.customerPhoto} className="w-10 h-10 object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center text-xl">👤</div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{group.customerName}</p>
            <p className="text-text-dim text-[10px]">{group.messages.length} messages</p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-2">
          {group.messages.map((msg, i) => (
            <div key={msg.id || i} className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-2xl bg-card border border-border rounded-bl-md">
                <p className="text-sm">{msg.message}</p>
                <p className="text-[9px] text-text-dim mt-1 text-right">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply via WhatsApp hint */}
        <div className="p-4">
          <div className="p-3 rounded-xl bg-card-2/50 text-center">
            <p className="text-text-dim text-xs">Messages from this customer appear here</p>
            <p className="text-text-dim text-[10px] mt-1">Customers can message you directly from your salon page</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">💬 Messages</h1>
            <p className="text-text-dim text-sm">
              {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
          <button onClick={loadMessages} className="text-primary text-sm font-medium">🔄</button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sortedCustomers.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3 animate-float">💬</span>
            <p className="text-text-dim font-medium">No messages yet</p>
            <p className="text-text-dim text-xs mt-1">When customers message you, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedCustomers.map(([customerId, group], i) => (
              <button
                key={customerId}
                onClick={() => handleSelectCustomer(customerId)}
                className="w-full p-4 rounded-xl bg-card border border-border text-left flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98] animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-card-2 overflow-hidden flex-shrink-0 relative">
                  {group.customerPhoto ? (
                    <img src={group.customerPhoto} className="w-12 h-12 object-cover" alt="" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center text-2xl">👤</div>
                  )}
                  {group.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                      {group.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-semibold text-sm ${group.unread > 0 ? '' : 'text-text-dim'}`}>{group.customerName}</p>
                    <span className="text-[10px] text-text-dim">{formatTime(group.lastMessage.createdAt)}</span>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${group.unread > 0 ? 'font-medium' : 'text-text-dim'}`}>
                    {group.lastMessage.message}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
