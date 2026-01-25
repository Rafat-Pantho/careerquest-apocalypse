import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [questCount, setQuestCount] = useState(0);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Guild Comms (Socket.io)');
    });

    newSocket.on('onlineUsersUpdate', (count) => {
      setOnlineUsers(count);
    });

    newSocket.on('questCountUpdate', (count) => {
      setQuestCount(count);
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, questCount }}>
      {children}
    </SocketContext.Provider>
  );
};
