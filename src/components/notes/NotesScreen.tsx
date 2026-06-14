import { useState } from 'react';
import { Search, Trash2, StickyNote, BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import type { Note } from '../../types';

const CATEGORY_CONFIG: Record<string, { icon: typeof BookOpen; label: string; color: string }> = {
  grammar: { icon: BookOpen, label: '문법', color: 'bg-accent-100 text-accent-600' },
  vocabulary: { icon: Lightbulb, label: '어휘', color: 'bg-milky-200 text-milky-600' },
  expression: { icon: StickyNote, label: '표현', color: 'bg-accent-100 text-accent-500' },
  mistake: { icon: AlertTriangle, label: '오답', color: 'bg-red-50 text-red-500' },
};

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.grammar;
  const Icon = config.icon;

  return (
    <div
      className="bg-milky-100 rounded-xl px-4 py-3 mb-2 border border-milky-150 cursor-pointer hover:bg-milky-200 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.color}`}>{config.label}</span>
          </div>
          <p className="text-sm font-medium text-milky-700">{note.title}</p>
          {expanded && (
            <p className="text-xs text-milky-500 mt-2 whitespace-pre-wrap leading-relaxed">{note.content}</p>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(note.id); }}
          className="p-1.5 rounded-lg hover:bg-milky-200 transition-colors text-milky-400 hover:text-red-400 flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function NotesScreen() {
  const { notes, deleteNote, clearAllNotes } = useChat();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = notes.filter(n => {
    const matchQuery = !query.trim() || n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === 'all' || n.category === filter;
    return matchQuery && matchFilter;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-milky-700">학습 노트</h2>
          {notes.length > 0 && (
            <button
              onClick={clearAllNotes}
              className="text-xs px-3 py-1 rounded-lg bg-milky-150 text-milky-500 hover:bg-red-50 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} /> 전체 삭제
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 bg-milky-100 rounded-xl px-3 py-2 border border-milky-200 mb-2">
          <Search size={16} className="text-milky-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="노트 검색..."
            className="flex-1 bg-transparent outline-none text-sm text-milky-800 placeholder-milky-400"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {[{ id: 'all', label: '전체' }, ...Object.entries(CATEGORY_CONFIG).map(([id, c]) => ({ id, label: c.label }))].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`text-xs px-3 py-1 rounded-full flex-shrink-0 transition-colors ${
                filter === cat.id
                  ? 'bg-accent-300 text-white'
                  : 'bg-milky-150 text-milky-500 hover:bg-milky-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-milky-400">
            <StickyNote size={32} className="mb-2 opacity-30" />
            <p className="text-sm">아직 노트가 없어요</p>
            <p className="text-xs mt-1">대화하면 자동으로 생성돼요!</p>
          </div>
        ) : (
          filtered.map(note => (
            <NoteCard key={note.id} note={note} onDelete={deleteNote} />
          ))
        )}
      </div>
    </div>
  );
}
