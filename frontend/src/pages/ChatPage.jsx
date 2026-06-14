import { useState, useEffect, useRef } from 'react';
import API from '../utils/api'; // ✅ Swapped axios for your API utility
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const propertyId = params.get('property');
    const sellerId = params.get('seller');

    if (propertyId && sellerId) {
      initiateNewChat(propertyId, sellerId);
      navigate('/chat', { replace: true });
    }
  }, [location.search]);

  useEffect(() => {
    if (socket && activeChat) {
      socket.emit('join-chat', activeChat._id);

      socket.on('new-message', (data) => {
        if (data.conversationId === activeChat._id) {
          setMessages((prev) => [
            ...prev,
            {
              ...data.message,
              sender: { _id: data.senderId },
            },
          ]);
        }
      });

      socket.on('user-typing', () => setTyping(true));
      socket.on('user-stop-typing', () => setTyping(false));

      return () => {
        socket.emit('leave-chat', activeChat._id);
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      // ✅ Removed localhost and headers
      const { data } = await API.get('/chat/conversations');
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation) => {
    setActiveChat(conversation);
    try {
      const propId = conversation?.propertyId?._id || conversation?.propertyId;
      if (!propId) return;

      // ✅ Removed localhost and headers
      const { data } = await API.get(`/chat/conversations/${propId}/messages`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const initiateNewChat = async (propertyId, sellerId) => {
    try {
      // ✅ Removed localhost and headers
      const { data } = await API.post('/chat/conversations', { 
        propertyId, 
        receiverId: sellerId 
      });
      setActiveChat(data.conversation);
      fetchMessages(data.conversation);
      fetchConversations();
    } catch (err) {
      console.error('Failed to initiate chat:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const receiverId = activeChat?.participants?.find((p) => p?._id !== user?._id)?._id;

    try {
      // ✅ Removed localhost and headers
      const { data } = await API.post('/chat/messages', {
        conversationId: activeChat?._id,
        propertyId: activeChat?.propertyId?._id || activeChat?.propertyId,
        receiverId,
        message: newMessage,
      });

      socket.emit('send-message', {
        conversationId: activeChat?._id,
        message: data.message,
        senderId: user?._id,
        receiverId,
      });

      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTyping = () => {
    socket.emit('typing', { conversationId: activeChat?._id, userId: user?._id });
    setTimeout(() => {
      socket.emit('stop-typing', { conversationId: activeChat?._id, userId: user?._id });
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 h-[calc(100vh-80px)]">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex">

          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-blue-950">{t('chat.messages')}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations?.map((conv) => {
                const otherUser = conv?.participants?.find((p) => p?._id !== user?._id);
                return (
                  <div
                    key={conv._id}
                    onClick={() => fetchMessages(conv)}
                    className={`p-4 cursor-pointer hover:bg-blue-50 transition-all border-b border-gray-100 ${
                      activeChat?._id === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                        {otherUser?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">
                          {otherUser?.fullName || t('chat.unknown')}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {conv?.lastMessage || t('chat.noMessages')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!conversations || conversations.length === 0) && (
                <div className="text-center text-gray-500 p-8">{t('chat.noConversations')}</div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  {(() => {
                    const otherUser = activeChat?.participants?.find((p) => p?._id !== user?._id);
                    return (
                      <>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                          {otherUser?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {otherUser?.fullName || t('chat.unknown')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activeChat?.propertyId?.title || t('chat.property')}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages?.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg?.sender?._id === user?._id || msg?.sender === user?._id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          msg?.sender?._id === user?._id || msg?.sender === user?._id
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{msg?.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg?.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {typing && <div className="text-sm text-gray-400 italic">{t('chat.typing')}</div>}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleTyping}
                      placeholder={t('chat.typeMessage')}
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                    >
                      {t('chat.send')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">💬</span>
                  <p className="text-lg">{t('chat.selectChat')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;