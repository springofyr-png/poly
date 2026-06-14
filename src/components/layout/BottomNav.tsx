import { motion } from 'framer-motion';
import { Clock, StickyNote, MessageCircle, HelpCircle, User } from 'lucide-react';
import type { TabType } from '../../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; icon: typeof Clock; label: string }[] = [
  { id: 'history', icon: Clock, label: '기록' },
  { id: 'notes', icon: StickyNote, label: '노트' },
  { id: 'chat', icon: MessageCircle, label: '채팅' },
  { id: 'quiz', icon: HelpCircle, label: '퀴즈' },
  { id: 'profile', icon: User, label: '프로필' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="relative flex items-end justify-around bg-milky-100/80 backdrop-blur-md border-t border-milky-200/50 px-2 pt-2 pb-4">
      {tabs.map(tab => {
        const isChat = tab.id === 'chat';
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center relative"
          >
            {isChat ? (
              <motion.div
                className="flex flex-col items-center"
                whileTap={{
                  scale: 0.9,
                }}
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-accent-400 flex items-center justify-center shadow-lg -mt-5"
                  animate={isActive ? {
                    boxShadow: [
                      '0 0 0px 0px rgba(180, 120, 80, 0)',
                      '0 0 20px 8px rgba(180, 120, 80, 0.35)',
                      '0 0 8px 2px rgba(180, 120, 80, 0.15)',
                    ],
                  } : {}}
                  transition={isActive ? {
                    boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  } : {}}
                >
                  <Icon size={24} className="text-white" />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.3, 0],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        background: 'radial-gradient(circle, rgba(255,180,100,0.4) 0%, transparent 70%)',
                      }}
                    />
                  )}
                </motion.div>
                <span className={`text-[10px] mt-1 ${isActive ? 'text-accent-500 font-medium' : 'text-milky-400'}`}>
                  {tab.label}
                </span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center py-1">
                <Icon
                  size={20}
                  className={isActive ? 'text-accent-500' : 'text-milky-400'}
                />
                <span className={`text-[10px] mt-1 ${isActive ? 'text-accent-500 font-medium' : 'text-milky-400'}`}>
                  {tab.label}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
