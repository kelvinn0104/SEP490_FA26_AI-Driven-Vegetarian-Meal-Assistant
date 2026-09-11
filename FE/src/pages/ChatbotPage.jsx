import React, { useState } from 'react';
import { Send, Bot, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { askChatbot } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function ChatbotPage({ onNavigate }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Xin chào! Tôi là Chuyên gia Dinh dưỡng VeggieAI (RAG Chatbot). Bạn có thắc mắc gì về chế độ ăn chay, vi chất B12, Sắt hay cách thay thế nguyên liệu thực dưỡng không?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestQuestionsAsked, setGuestQuestionsAsked] = useState(0);

  const GUEST_LIMIT = 3;
  const isGuest = !user;
  const remainingQuestions = Math.max(0, GUEST_LIMIT - guestQuestionsAsked);
  const hasReachedLimit = isGuest && remainingQuestions === 0;

  const handleSend = async () => {
    if (!input.trim() || hasReachedLimit) return;
    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    if (isGuest) {
      setGuestQuestionsAsked(prev => prev + 1);
    }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', margin: 0 }}>
          <Bot /> AI Nutrition Chatbot (RAG Semantic Search)
        </h2>

        {/* WORKFLOW WF05: GIỚI HẠN SỐ LƯỢT HỎI CHO GUEST */}
        {isGuest ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: hasReachedLimit ? '#fee2e2' : '#ecfdf5', 
            color: hasReachedLimit ? '#b91c1c' : '#047857',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: `1px solid ${hasReachedLimit ? '#fca5a5' : '#a7f3d0'}`
          }}>
            <Sparkles size={14} />
            <span>Dùng thử: Còn {remainingQuestions}/{GUEST_LIMIT} lượt hỏi</span>
          </div>
        ) : (
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            Tài khoản chính thức • Không giới hạn
          </div>
        )}
      </div>

      {/* CHAT MESSAGES STREAM */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
            <div style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              background: msg.sender === 'user' ? '#046a47' : 'white',
              color: msg.sender === 'user' ? 'white' : '#0f172a',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && <div style={{ color: '#64748b', fontStyle: 'italic' }}>AI đang tra cứu tri thức dinh dưỡng...</div>}

        {/* PROMPT WHEN LIMIT REACHED */}
        {hasReachedLimit && (
          <div style={{ 
            padding: '1.25rem', 
            background: '#fff7ed', 
            border: '1.5px solid #fed7aa', 
            borderRadius: '16px', 
            textAlign: 'center', 
            marginTop: '1rem' 
          }}>
            <Lock size={28} color="#ea580c" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ color: '#9a3412', marginBottom: '0.35rem' }}>Bạn đã dùng hết {GUEST_LIMIT} lượt hỏi thử nghiệm miễn phí!</h4>
            <p style={{ color: '#7c2d12', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 1rem auto' }}>
              Khách vãng lai được trải nghiệm tối đa {GUEST_LIMIT} câu hỏi. Hãy đăng ký tài khoản để trò chuyện không giới hạn và lưu trữ lịch sử tư vấn dinh dưỡng.
            </p>
            <Button onClick={() => onNavigate && onNavigate('register')} style={{ background: '#046a47', margin: '0 auto' }}>
              <Sparkles size={16} /> Đăng ký miễn phí để tiếp tục hỏi AI <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* INPUT ROW */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={input}
          disabled={hasReachedLimit}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={hasReachedLimit ? "Vui lòng đăng ký tài khoản để tiếp tục hỏi..." : "Hỏi về dinh dưỡng chay, thiếu máu, vi chất B12..."}
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid #cbd5e1',
            background: hasReachedLimit ? '#f1f5f9' : 'white',
            cursor: hasReachedLimit ? 'not-allowed' : 'text'
          }}
        />
        <Button onClick={handleSend} disabled={hasReachedLimit || loading}>
          <Send size={18} />
        </Button>
      </div>
    </Card>
  );
}
