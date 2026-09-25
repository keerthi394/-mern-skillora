// Mentor messages — reuses same socket logic as student messages
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export default function MentorMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('user:join', user._id);
    socket.on('message:receive', (msg) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });
    return () => socket.disconnect();
  }, [user._id]);

  useEffect(() => {
    messageAPI.getConversations().then(r => {
      setConversations(r.data.conversations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    setMsgLoading(true);
    messageAPI.getMessages(active.conversationId).then(r => {
      setMessages(r.data.messages || []);
      setMsgLoading(false);
    }).catch(() => setMsgLoading(false));
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!text.trim() || !active) return;
    const msg = text.trim();
    setText('');
    socketRef.current?.emit('message:send', { senderId: user._id, receiverId: active.other._id, message: msg });
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1>Messages</h1>
        <p>Chat with your students in real-time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', height: 'calc(100vh - 220px)' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e3a5f' }}>Conversations</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && <div style={{ padding: '1rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
            {!loading && conversations.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No conversations yet.</div>}
            {conversations.map(c => (
              <div key={c.conversationId} onClick={() => setActive(c)} style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer', background: active?.conversationId === c.conversationId ? '#eff6ff' : 'white', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                <div className="avatar" style={{ width: 40, height: 40 }}>{c.other?.name?.[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e3a5f' }}>{c.other?.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!active ? (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#64748b' }}><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div><p>Select a conversation to start chatting.</p></div>
          </div>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="avatar" style={{ width: 36, height: 36 }}>{active.other?.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{active.other?.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'capitalize' }}>{active.other?.role}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {msgLoading && <div style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
              {messages.map(m => {
                const isMine = m.senderId?._id === user._id || m.senderId === user._id;
                return (
                  <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}>{m.message}</div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: '0.875rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
              <input type="text" className="form-input" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} style={{ flex: 1 }} />
              <button onClick={send} className="btn-primary" disabled={!text.trim()}>Send</button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
