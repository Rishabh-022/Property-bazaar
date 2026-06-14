import { useState } from 'react';
import API from '../utils/api'; // ✅ Swapped axios for your API utility

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Welcome to PropertyBazzar! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const options = [
    { label: '📝 How to register?', reply: 'To register, click "Register" on the top right. Fill in your details. It’s free!' },
    { label: '🏠 How to list a property?', reply: 'Click "Sell Property" in the navbar. Fill in details, upload images, and submit for review.' },
    { label: '✅ What documents are verified?', reply: 'We verify Aadhaar, Registration Number, Khata Number, Khasra Number, and PAN.' },
    { label: '💬 How to chat with a seller?', reply: 'On any property detail page, click "Chat with Seller" to start a real‑time conversation.' },
    { label: '⏳ How long does approval take?', reply: 'Usually 24‑48 hours. You’ll get an email.' },
    { label: '🤔 Something else', reply: 'Email support@propertybazzar.com or call +91 1800-123-4567' },
  ];

  const handleOptionClick = (option) => {
    setMessages(prev => [...prev, { sender: 'user', text: option.label }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: option.reply }]);
    }, 500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setLoading(true);

    try {
      // ✅ Removed localhost and used API
      const { data } = await API.post('/chatbot', { query });
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="bg-white w-80 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 mb-4 flex flex-col h-[450px]">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center">
            <span className="flex items-center gap-2">🤖 Support</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 text-xl">&times;</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white self-end rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400 italic">Thinking...</div>}
          </div>

          {/* Quick Options */}
          <div className="p-2 bg-white border-t border-gray-100 flex flex-wrap gap-1 overflow-y-auto max-h-24">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition transform hover:scale-110 ml-auto block"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default SupportChatbot;