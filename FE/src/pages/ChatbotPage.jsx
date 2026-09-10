import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { askChatbot } from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là Chuyên gia Dinh dưỡng VeggieAI (RAG Chatbot). Bạn có thắc mắc gì về chế độ ăn chay, vi chất B12, Sắt hay nguyên liệu thay thế không?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const data = await askChatbot(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '1rem' }}>
        <Bot /> AI Nutrition Chatbot (RAG Semantic Search)
      </h2>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
            <div style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              background: msg.sender === 'user' ? '#059669' : 'white',
              color: msg.sender === 'user' ? 'white' : '#0f172a',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#64748b', fontStyle: 'italic' }}>AI đang tìm kiếm tri thức dinh dưỡng...</div>}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Hỏi về dinh dưỡng chay, thay thế nguyên liệu..."
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
        <Button onClick={handleSend}><Send size={18} /></Button>
      </div>
    </Card>
  );
}
