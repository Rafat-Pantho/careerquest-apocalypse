import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Button from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GuildChatPage = () => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch history and join room
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/tavern`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data.data);
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchHistory();

    if (socket) {
      socket.emit('joinRoom', 'tavern');
      
      socket.on('message', (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (socket) socket.off('message');
    };
  }, [socket, token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      sender: user._id,
      content: newMessage,
      room: 'tavern'
    };

    socket.emit('chatMessage', messageData);
    setNewMessage('');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-cinzel text-gold-400">The Tavern</h1>
          <p className="text-parchment-300">Pull up a chair and share tales with fellow adventurers.</p>
        </div>

        <div className="flex-1 bg-dungeon-900/50 border border-dungeon-700 rounded-lg p-4 overflow-y-auto mb-4 custom-scrollbar">
          {loading ? (
            <div className="text-center text-parchment-500 mt-10">Loading scrolls...</div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMe ? 'bg-dungeon-800 border-gold-500/30' : 'bg-dungeon-800 border-dungeon-600'} border rounded-lg p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isMe && (
                          <span className="text-xs font-bold text-gold-400">
                            {msg.sender.heroName} <span className="text-parchment-500">({msg.sender.heroClass})</span>
                          </span>
                        )}
                        <span className="text-[10px] text-parchment-600">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-parchment-200 text-sm break-words">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Speak your mind, hero..."
            className="flex-1 bg-dungeon-900 border border-dungeon-600 rounded px-4 py-2 text-parchment-100 focus:border-gold-500 focus:outline-none"
          />
          <Button type="submit" variant="gold" disabled={!newMessage.trim()}>
            Send
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default GuildChatPage;
