import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Bot, User, Maximize2, Minimize2,
  ChefHat, Activity, RefreshCw, Paperclip, ChevronRight, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';
import { chatService, getAuthToken } from '../../api';

export default function ChatbotPage({ onNavigate }) {
  const {
    profile,
    metrics,
    weeklyPlan,
    selectedDayIdx,
    recipesDb,
    updateDayMeal,
    isBackendConnected,
    showToast
  } = useVeggieNutrition();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agentMode, setAgentMode] = useState('nutritionist'); // 'nutritionist' | 'chef' | 'substitute' | 'bmi'
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'm-welcome',
      sender: 'ai',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text: `Xin chào **${profile.name}**! Tôi có thể hỗ trợ bạn tìm kiếm công thức món chay, cân đối dinh dưỡng theo chỉ số thể trạng (BMI ${metrics.bmi}) hoặc giải đáp các câu hỏi về thực phẩm thực vật.`
    }
  ]);

  // Load real chat sessions from backend if authenticated
  useEffect(() => {
    if (isBackendConnected && getAuthToken()) {
      chatService.getSessions()
        .then(async (sessions) => {
          if (Array.isArray(sessions) && sessions.length > 0) {
            const latest = sessions[0];
            setActiveSessionId(latest.id);
            try {
              const history = await chatService.getMessages(latest.id);
              if (Array.isArray(history) && history.length > 0) {
                const mapped = history.map(msg => ({
                  id: msg.id ? `msg-${msg.id}` : `m-${Date.now()}`,
                  sender: msg.role === 'user' || msg.sender === 'user' ? 'user' : 'ai',
                  time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
                  text: msg.content || ''
                }));
                setMessages(mapped);
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [isBackendConnected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text: inputText.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentQuery = inputText.trim();
    setInputText('');
    setIsTyping(true);

    // Call Backend live Gemini chatbot if connected
    if (isBackendConnected && getAuthToken()) {
      try {
        let sid = activeSessionId;
        if (!sid) {
          const newSession = await chatService.createSession();
          sid = newSession?.id;
          setActiveSessionId(sid);
        }

        if (sid) {
          const res = await chatService.sendMessage(sid, currentQuery);
          const aiText = res?.aiMessage?.content || res?.content || res?.message;
          if (aiText) {
            const aiMsg = {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              text: aiText
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend chat failed, falling back to local simulation:', err.message);
      }
    }

    // AI Simulation response tailored to profile
    setTimeout(() => {
      let replyText = '';
      let attachedRecipeId = null;

      const q = currentQuery.toLowerCase();
      if (q.includes('đạm') || q.includes('protein') || q.includes('cơ')) {
        replyText = `Để tăng cường đạm thực vật đạt mục tiêu **${metrics.targetProtein}g/ngày** của bạn, tôi gợi ý món **Mì Soba Đậu Hũ Áp Chảo Mè Rang & Đậu Nành Nhật** cung cấp **31g Đạm hoàn chỉnh** cùng đầy đủ 9 axit amin thiết yếu.`;
        attachedRecipeId = 'r1';
      } else if (q.includes('b12') || q.includes('vitamin b12')) {
        replyText = `Vitamin B12 là vi chất quan trọng nhất ở người ăn chay. Món **Bánh Mì Nguyên Cám Phết Bơ Đậu Gà Hummus & Men B12** cung cấp **1.4µg B12** chỉ trong 12 phút chuẩn bị!`;
        attachedRecipeId = 'r7';
      } else if (q.includes('sắt') || q.includes('thiếu máu')) {
        replyText = `Để bổ sung Sắt không heme hiệu quả, bạn nên chọn **Cà Ri Đậu Lăng Đỏ & Cải Bó Xôi** (cung cấp **7.8mg Sắt**). Đừng quên vắt chút chanh tươi để tăng 300% khả năng hấp thu vào cơ thể!`;
        attachedRecipeId = 'r6';
      } else {
        replyText = `Theo chuẩn dinh dưỡng WHO cho thể trạng BMI **${metrics.bmi}** của bạn, thực đơn cân bằng hôm nay nên ưu tiên thực phẩm nguyên phần (Whole Foods) kết hợp rau củ sẫm màu và đậu hạt. Món **Tempeh Kho Tộ Sả Nghệ & Cơm Gạo Lứt** sẽ là lựa chọn tuyệt vời!`;
        attachedRecipeId = 'r5';
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        recipeId: attachedRecipeId
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleApplyToDinner = (recipeId) => {
    updateDayMeal(selectedDayIdx, 'dinner', recipeId);
    showToast(`Đã áp dụng món vào bữa tối (${weeklyPlan[selectedDayIdx].day})`);
  };

  const recipeMap = new Map(recipesDb.map(r => [r.id, r]));

  return (
    <div
      className={`bg-alabaster/40 flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-white p-4'
          : 'h-[calc(100vh-5rem)] max-w-6xl mx-auto py-4 px-4 sm:px-6'
      }`}
    >
      {/* ====================================================================
          1. CHAT CANVAS HEADER
      ==================================================================== */}
      <div className="bg-white rounded-2xl border border-hairline p-3 sm:p-4 shrink-0 shadow-xs flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-alabaster flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-editorial text-base sm:text-lg font-bold text-forest">
                VeggieAI Chatbox
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-olive font-medium">
              Đồng bộ thể trạng {profile.name} (BMI {metrics.bmi} • {metrics.targetProtein}g Đạm)
            </p>
          </div>
        </div>

        {/* Mode Selector Badges */}
        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1 bg-alabaster p-1 rounded-xl border border-hairline">
            {[
              { key: 'nutritionist', label: 'Dinh Dưỡng WHO', icon: Activity },
              { key: 'chef', label: 'Bếp Trưởng 5★', icon: ChefHat },
              { key: 'substitute', label: 'Đổi Món', icon: RefreshCw }
            ].map(m => {
              const Icon = m.icon;
              const isActive = agentMode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setAgentMode(m.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                    isActive ? 'bg-forest text-alabaster shadow-xs' : 'text-olive hover:text-forest'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-forest transition cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. MESSAGES STREAM (CHỈ SCROLL TRONG ĐOẠN CHAT)
      ==================================================================== */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 rounded-2xl bg-white border border-hairline p-4 sm:p-6 shadow-xs">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const attachedRecipe = msg.recipeId ? recipeMap.get(msg.recipeId) : null;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  isUser ? 'bg-emeraldBotanic text-white' : 'bg-forest text-alabaster'
                }`}
              >
                {isUser ? profile.name.charAt(0) : <Sparkles className="w-4 h-4 text-emerald-300" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2.5 max-w-[85%] sm:max-w-[78%]">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-forest text-alabaster rounded-tr-none'
                      : 'bg-alabaster text-forest border border-hairline rounded-tl-none'
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Embedded Recipe Card inside AI message */}
                {attachedRecipe && (
                  <div className="bg-white rounded-2xl border border-hairline p-3.5 shadow-xs space-y-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={attachedRecipe.image}
                        alt={attachedRecipe.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-metric font-bold text-emeraldBotanic uppercase">
                          GỢI Ý TỐI ƯU • {attachedRecipe.matchScore}% MATCH
                        </span>
                        <h4 className="font-editorial text-sm font-bold text-forest truncate">
                          {attachedRecipe.title}
                        </h4>
                        <p className="text-[11px] font-metric text-olive">
                          {attachedRecipe.nutrients.calories} kcal • {attachedRecipe.nutrients.protein}g Đạm • {attachedRecipe.prepTime}p
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-hairline">
                      <button
                        type="button"
                        onClick={() => setSelectedRecipeDetail(attachedRecipe)}
                        className="w-full sm:flex-1 py-1.5 px-3 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-xs font-semibold text-forest transition cursor-pointer text-center"
                      >
                        Xem Công Thức
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyToDinner(attachedRecipe.id)}
                        className="w-full sm:flex-1 py-1.5 px-3 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer text-center whitespace-nowrap shadow-xs"
                      >
                        ⚡ Áp Dụng Bữa Tối
                      </button>
                    </div>
                  </div>
                )}

                <span className={`text-[10px] text-olive font-metric block ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-olive p-2 bg-alabaster rounded-xl w-32 border border-hairline animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emeraldBotanic animate-spin" />
            <span>AI đang soạn...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ====================================================================
          3. SUGGESTIONS & INPUT BAR (NGĂN TRÀN NÚT)
      ==================================================================== */}
      <div className="mt-3 space-y-2 shrink-0">
        {/* Topic Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full min-w-0 flex-nowrap">
          {[
            'Bữa tối nhẹ bụng dưới 400 kcal',
            'Bù đắp 100% Vitamin B12 hôm nay',
            'Nạp 30g đạm thực vật không đậu nành',
            'Cách tăng hấp thụ Sắt non-heme'
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(prompt);
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-hairline text-[11px] font-medium text-forest hover:bg-sage/40 transition cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-full overflow-hidden bg-white rounded-2xl border border-hairline p-2 shadow-xs flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => showToast('Đính kèm ảnh món ăn hoặc nguyên liệu')}
            className="p-2 rounded-xl text-olive hover:text-forest hover:bg-alabaster transition cursor-pointer shrink-0"
            title="Đính kèm nguyên liệu"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Hỏi VeggieAI Chatbox về dinh dưỡng, công thức..."
            rows={1}
            className="flex-1 min-w-0 w-full resize-none bg-transparent text-xs sm:text-sm text-forest placeholder:text-olive/60 focus:outline-none py-1.5 px-1"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 ${
              inputText.trim()
                ? 'bg-forest hover:bg-forestDark text-alabaster shadow-xs active:scale-95'
                : 'bg-hairline text-olive/40 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          isSaved={(profile.savedRecipeIds || []).includes(selectedRecipeDetail.id)}
          onToggleSave={toggleSaveRecipe}
        />
      )}
    </div>
  );
}
