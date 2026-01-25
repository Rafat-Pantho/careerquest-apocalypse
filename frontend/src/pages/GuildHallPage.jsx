import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Button from '../components/ui/Button';
import { getAvatarEmoji } from '../utils/avatarUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const GuildHallPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [guild, setGuild] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchGuild = async () => {
      try {
        const res = await axios.get(`${API_URL}/guilds/${id}`);
        setGuild(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGuild();
  }, [id]);

  // Chat Logic
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (token && id) fetchHistory();

    if (socket && id) {
      socket.emit('joinRoom', id);
      
      const handleMessage = (message) => {
        if (message.room === id) {
          setMessages((prev) => [...prev, message]);
        }
      };

      socket.on('message', handleMessage);
      return () => socket.off('message', handleMessage);
    }
  }, [socket, id, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      sender: user._id,
      content: newMessage,
      room: id
    };

    socket.emit('chatMessage', messageData);
    setNewMessage('');
  };

  if (!guild) return <DashboardLayout>Loading Guild Hall...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        {/* Guild Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dungeon-card border-gold-500">
            <h1 className="text-2xl font-cinzel text-gold-400 mb-2">{guild.name}</h1>
            <p className="text-parchment-400 text-sm mb-4">{guild.description}</p>
            <div className="flex justify-between text-sm text-parchment-300 border-t border-dungeon-700 pt-4">
              <span>Lvl {guild.level}</span>
              <span>{guild.members.length} Members</span>
            </div>
          </div>

          <div className="dungeon-card">
            <h3 className="text-lg font-cinzel text-parchment-200 mb-4">Members</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {guild.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-2 rounded hover:bg-dungeon-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-sm">{getAvatarEmoji(member.avatar)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-parchment-100">{member.heroName}</p>
                    <p className="text-xs text-parchment-500">{member.heroClass}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guild Chat Column */}
        <div className="lg:col-span-2 flex flex-col bg-dungeon-900/50 border border-dungeon-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-dungeon-700 bg-dungeon-800/50">
            <h2 className="font-cinzel text-gold-400">Guild Chat</h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.sender._id === user._id;
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isMe ? 'bg-dungeon-800 border-gold-500/30' : 'bg-dungeon-800 border-dungeon-600'} border rounded-lg p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isMe && (
                        <span className="text-xs font-bold text-gold-400">
                          {msg.sender.heroName}
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

          <div className="p-4 bg-dungeon-800/30 border-t border-dungeon-700">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message your guild..."
                className="flex-1 bg-dungeon-900 border border-dungeon-600 rounded px-4 py-2 text-parchment-100 focus:border-gold-500 focus:outline-none"
              />
              <Button type="submit" variant="gold" disabled={!newMessage.trim()}>Send</Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuildHallPage;
