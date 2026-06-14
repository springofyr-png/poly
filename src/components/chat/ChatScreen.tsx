import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Brain, BookOpen, GraduationCap, Sparkles, Bot, MessageCircle, Languages, Mic, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, BookOpen, GraduationCap, Sparkles, Bot, MessageCircle, Languages, Mic,
};

function PolyIcon({ size = 20, className = '' }: { size?: number | string; className?: string }) {
  const { settings } = useTheme();
  const IconComponent = ICON_MAP[settings.aiIcon] || Brain;
  return <IconComponent size={size} className={className} />;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <div className="w-7 h-7 rounded-full bg-accent-200 flex items-center justify-center flex-shrink-0">
        <PolyIcon size={14} />
      </div>
      <div className="bg-milky-150 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-accent-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: { role: string; content: string } }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-2 px-4 py-1.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-accent-200 flex items-center justify-center flex-shrink-0 mt-1">
          <PolyIcon size={14} />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-accent-300 text-white rounded-tr-sm'
            : 'bg-milky-150 text-milky-800 rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

export default function ChatScreen() {
  const { currentSession, isTyping, sendMessage, startNewSession, weaknesses } = useChat();
  const { settings } = useTheme();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = currentSession && currentSession.messages.length > 0;

  const langNames: Record<string, string> = { en: '영어', fr: '불어' };
  const subtitle = settings.languages.map(l => langNames[l] || l).join(', ') + ', 뭐든 물어보세요!';

  const defaultSuggestions = ['간단한 인사하기', '전치사가 헷갈려', '동사 활용 알려줘'];
  const weaknessSuggestions = weaknesses.slice(0, 2).map(w => w.topic);
  const suggestions = weaknessSuggestions.length > 0
    ? [...weaknessSuggestions, ...defaultSuggestions.slice(0, 3 - weaknessSuggestions.length)]
    : defaultSuggestions;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  // Welcome state - chat bar centered on screen
  if (!hasMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent-200 flex items-center justify-center mb-2">
            <PolyIcon size={32} />
          </div>
          <h2 className="text-xl font-medium text-milky-700">Poly</h2>
          <p className="text-sm text-milky-400 text-center mb-4">
            {subtitle}
          </p>
          <div className="w-full flex items-center gap-2 bg-milky-100 rounded-2xl px-4 py-3 shadow-sm border border-milky-200">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Poly에게 질문해보세요..."
              className="flex-1 bg-transparent outline-none text-sm text-milky-800 placeholder-milky-400 resize-none min-h-[20px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl bg-accent-400 flex items-center justify-center text-white disabled:opacity-30 transition-opacity flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { setInput(suggestion); }}
                className="text-xs px-3 py-1.5 rounded-full bg-milky-150 text-milky-500 hover:bg-milky-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Chat view with messages
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        <AnimatePresence>
          {currentSession.messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 pb-2 pt-1">
        <div className="flex items-end gap-2 bg-milky-100 rounded-2xl px-4 py-2.5 shadow-sm border border-milky-200">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent outline-none text-sm text-milky-800 placeholder-milky-400 resize-none min-h-[20px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-xl bg-accent-400 flex items-center justify-center text-white disabled:opacity-30 transition-opacity flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {currentSession.messages.length === 1 && (
        <div className="flex justify-center pb-2">
          <button
            onClick={() => { startNewSession(); }}
            className="text-xs px-3 py-1 rounded-full bg-milky-150 text-milky-500 hover:bg-milky-200 transition-colors"
          >
            새 대화 시작
          </button>
        </div>
      )}
    </div>
  );
}
