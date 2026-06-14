import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Message, ChatSession, Note, Weakness, WrongAnswer, QuizQuestion, QuizResult } from '../types';
import { generateResponse, generateQuizQuestions } from '../engine/languageEngine';

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  notes: Note[];
  weaknesses: Weakness[];
  quizQuestions: QuizQuestion[];
  wrongAnswers: WrongAnswer[];
  quizResults: QuizResult[];
  isTyping: boolean;
  sendMessage: (content: string) => void;
  startNewSession: () => void;
  loadSession: (session: ChatSession) => void;
  deleteSession: (id: string) => void;
  deleteNote: (id: string) => void;
  deleteWrongAnswer: (id: string) => void;
  clearAllNotes: () => void;
  clearAllWrongAnswers: () => void;
  generateQuizzes: (count: number) => void;
  answerQuiz: (quizId: string, userAnswer: number) => void;
  searchSessions: (query: string) => ChatSession[];
  filterSessionsByCategory: (category: string) => ChatSession[];
}

const ChatContext = createContext<ChatContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadFromStorage('poly-sessions', []));
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage('poly-notes', []));
  const [weaknesses, setWeaknesses] = useState<Weakness[]>(() => loadFromStorage('poly-weaknesses', []));
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>(() => loadFromStorage('poly-wrong-answers', []));
  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => loadFromStorage('poly-quiz-results', []));
  const [isTyping, setIsTyping] = useState(false);

  const persistNotes = (n: Note[]) => { setNotes(n); saveToStorage('poly-notes', n); };
  const persistWrongAnswers = (w: WrongAnswer[]) => { setWrongAnswers(w); saveToStorage('poly-wrong-answers', w); };
  const persistQuizResults = (r: QuizResult[]) => { setQuizResults(r); saveToStorage('poly-quiz-results', r); };

  const startNewSession = useCallback(() => {
    const session: ChatSession = {
      id: `s-${Date.now()}`,
      title: '새 대화',
      language: 'mixed',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentSession(session);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    let session = currentSession;
    if (!session) {
      session = {
        id: `s-${Date.now()}`,
        title: content.slice(0, 30),
        language: 'mixed',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const userMsg: Message = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
    };

    const updatedMessages = [...session.messages, userMsg];
    const updatedSession = {
      ...session,
      messages: updatedMessages,
      title: session.messages.length === 0 ? content.slice(0, 30) : session.title,
      updatedAt: Date.now(),
    };

    setCurrentSession(updatedSession);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const { response, detectedWeaknesses, generatedNotes } = generateResponse(content, updatedMessages);

      const aiMsg: Message = {
        id: `m-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        createdAt: Date.now(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedMessages, aiMsg],
        updatedAt: Date.now(),
      };

      setCurrentSession(finalSession);
      setIsTyping(false);

      setSessions(prev => {
        const exists = prev.findIndex(s => s.id === finalSession.id);
        const next = exists >= 0
          ? prev.map(s => s.id === finalSession.id ? finalSession : s)
          : [finalSession, ...prev];
        saveToStorage('poly-sessions', next);
        return next;
      });

      if (detectedWeaknesses.length > 0) {
        setWeaknesses(prev => {
          const updated = [...prev];
          for (const dw of detectedWeaknesses) {
            const existing = updated.find(w => w.topic === dw.topic);
            if (existing) {
              existing.count += 1;
              existing.lastSeenAt = Date.now();
            } else {
              updated.push(dw);
            }
          }
          saveToStorage('poly-weaknesses', updated);
          return updated;
        });
      }

      if (generatedNotes.length > 0) {
        setNotes(prev => {
          const updated = [...generatedNotes, ...prev];
          saveToStorage('poly-notes', updated);
          return updated;
        });
      }
    }, 600 + Math.random() * 800);
  }, [currentSession]);

  const loadSession = useCallback((session: ChatSession) => {
    setCurrentSession(session);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      saveToStorage('poly-sessions', next);
      return next;
    });
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      saveToStorage('poly-notes', next);
      return next;
    });
  }, []);

  const deleteWrongAnswer = useCallback((id: string) => {
    setWrongAnswers(prev => {
      const next = prev.filter(w => w.id !== id);
      saveToStorage('poly-wrong-answers', next);
      return next;
    });
  }, []);

  const clearAllNotes = useCallback(() => {
    persistNotes([]);
  }, []);

  const clearAllWrongAnswers = useCallback(() => {
    persistWrongAnswers([]);
  }, []);

  const generateQuizzes = useCallback((count: number) => {
    const questions = generateQuizQuestions(weaknesses, count);
    setQuizQuestions(questions);
  }, [weaknesses]);

  const answerQuiz = useCallback((quizId: string, userAnswer: number) => {
    const quiz = quizQuestions.find(q => q.id === quizId);
    if (!quiz) return;

    const isCorrect = quiz.correctIndex === userAnswer;
    const result: QuizResult = {
      id: `qr-${Date.now()}`,
      quizId,
      userAnswer,
      isCorrect,
      answeredAt: Date.now(),
    };

    persistQuizResults([...quizResults, result]);

    if (!isCorrect) {
      const wrong: WrongAnswer = {
        id: `wa-${Date.now()}`,
        quiz,
        userAnswer,
        answeredAt: Date.now(),
      };
      persistWrongAnswers([...wrongAnswers, wrong]);
    }
  }, [quizQuestions, quizResults, wrongAnswers]);

  const searchSessions = useCallback((query: string) => {
    const lower = query.toLowerCase();
    return sessions.filter(s =>
      s.title.toLowerCase().includes(lower) ||
      s.messages.some(m => m.content.toLowerCase().includes(lower))
    );
  }, [sessions]);

  const filterSessionsByCategory = useCallback((_category: string) => {
    return sessions;
  }, [sessions]);

  return (
    <ChatContext.Provider value={{
      sessions, currentSession, notes, weaknesses, quizQuestions,
      wrongAnswers, quizResults, isTyping,
      sendMessage, startNewSession, loadSession, deleteSession,
      deleteNote, deleteWrongAnswer, clearAllNotes, clearAllWrongAnswers,
      generateQuizzes, answerQuiz,
      searchSessions, filterSessionsByCategory,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
