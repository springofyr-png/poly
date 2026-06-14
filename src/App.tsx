import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Brain, BookOpen, GraduationCap, Sparkles, Bot, MessageCircle, Languages, Mic } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ChatProvider, useChat } from './context/ChatContext';
import BottomNav from './components/layout/BottomNav';
import ChatScreen from './components/chat/ChatScreen';
import HistoryScreen from './components/history/HistoryScreen';
import NotesScreen from './components/notes/NotesScreen';
import QuizScreen from './components/quiz/QuizScreen';
import ProfileScreen from './components/profile/ProfileScreen';
import type { TabType } from './types';

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, BookOpen, GraduationCap, Sparkles, Bot, MessageCircle, Languages, Mic,
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { settings } = useTheme();
  const { currentSession, startNewSession } = useChat();

  const handleTabChange = (tab: TabType) => {
    if (tab === 'chat' && !currentSession) {
      startNewSession();
    }
    setActiveTab(tab);
  };

  const CurrentIcon = ICON_MAP[settings.aiIcon] || Brain;

  const handleGoHome = () => {
    startNewSession();
    setActiveTab('chat');
  };

  return (
    <div className="h-screen flex justify-center overflow-hidden" style={{ backgroundColor: `hsl(${settings.milkyH}, ${settings.milkyS}%, 97%)` }}>
      <div className="w-full max-w-app h-full flex flex-col relative">
        {/* Top bar with Poly logo — clickable to go home */}
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 px-4 pt-3 pb-1 flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-accent-200 flex items-center justify-center">
            <CurrentIcon size={14} className="text-accent-600" />
          </div>
          <span className="text-sm font-medium text-milky-600">Poly</span>
        </button>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'chat' ? 0 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'chat' && <ChatScreen />}
              {activeTab === 'history' && <HistoryScreen />}
              {activeTab === 'notes' && <NotesScreen />}
              {activeTab === 'quiz' && <QuizScreen />}
              {activeTab === 'profile' && <ProfileScreen onTabChange={handleTabChange} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation — fixed at bottom */}
        <div className="flex-shrink-0 sticky bottom-0">
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </ThemeProvider>
  );
}
