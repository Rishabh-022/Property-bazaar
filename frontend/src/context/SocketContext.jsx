import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      // Socket.io needs the root server URL, not the /api route
      // VITE_API_URL looks like https://backend.onrender.com/api
      // We strip the /api part so the connection goes to the server root
      const serverUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const newSocket = io(serverUrl);

      setSocket(newSocket);

      newSocket.emit('user-connect', user._id);

      newSocket.on('user-online', (userId) => {
        setOnlineUsers(prev => [...prev, userId]);
      });

      newSocket.on('user-offline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      newSocket.on('message-notification', (data) => {
        setNotifications(prev => [...prev, data]);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};