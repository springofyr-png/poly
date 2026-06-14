import { useState } from 'react';
import { Search, Trash2, MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import type { ChatSession } from '../../types';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const dayMs = 86400000;

  if (diff < dayMs && d.getDate() === now.getDate()) return '오늘';
  if (diff < dayMs * 2) return '어제';
  if (diff < dayMs * 7) return '이번 주';

  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function groupByDate(sessions: ChatSession[]): Record<string, ChatSession[]> {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const label = formatDate(s.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  return groups;
}

export default function HistoryScreen() {
  const { sessions, loadSession, deleteSession, searchSessions } = useChat();
  const [query, setQuery] = useState('');
  const filtered = query.trim() ? searchSessions(query) : sessions;
  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-medium text-milky-700 mb-3">대화 기록</h2>
        <div className="flex items-center gap-2 bg-milky-100 rounded-xl px-3 py-2 border border-milky-200">
          <Search size={16} className="text-milky-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="대화 검색..."
            className="flex-1 bg-transparent outline-none text-sm text-milky-800 placeholder-milky-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-milky-400">
            <MessageCircle size={32} className="mb-2 opacity-30" />
            <p className="text-sm">아직 대화 기록이 없어요</p>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => (
            <div key={label} className="mb-4">
              <p className="text-xs font-medium text-milky-400 mb-2">{label}</p>
              {items.map(session => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className="flex items-center gap-3 bg-milky-100 rounded-xl px-4 py-3 mb-2 cursor-pointer hover:bg-milky-200 transition-colors border border-milky-150"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={14} className="text-accent-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-milky-700 truncate">{session.title}</p>
                    <p className="text-xs text-milky-400">
                      {session.messages.length}개 메시지 · {new Date(session.updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteSession(session.id); }}
                    className="p-1.5 rounded-lg hover:bg-milky-200 transition-colors text-milky-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
