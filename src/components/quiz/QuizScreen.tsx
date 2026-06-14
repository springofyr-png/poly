import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Trash2, CheckCircle, XCircle, RotateCcw, BookOpen, AlertTriangle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import type { QuizQuestion, WrongAnswer } from '../../types';

function QuizCard({
  quiz,
  onAnswer,
}: {
  quiz: QuizQuestion;
  onAnswer: (quizId: string, answer: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    onAnswer(quiz.id, idx);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-milky-100 rounded-xl px-4 py-4 mb-3 border border-milky-150"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-100 text-accent-500">
          {quiz.language === 'fr' ? '불어' : '영어'} · {quiz.category === 'grammar' ? '문법' : quiz.category === 'vocabulary' ? '어휘' : '표현'}
        </span>
      </div>
      <p className="text-sm font-medium text-milky-700 mb-3 whitespace-pre-wrap">{quiz.question}</p>
      <div className="flex flex-col gap-2">
        {quiz.options.map((opt, idx) => {
          let bgClass = 'bg-milky-150 border-milky-200 text-milky-700';
          if (answered) {
            if (idx === quiz.correctIndex) bgClass = 'bg-green-50 border-green-300 text-green-700';
            else if (idx === selected && idx !== quiz.correctIndex) bgClass = 'bg-red-50 border-red-300 text-red-700';
            else bgClass = 'bg-milky-100 border-milky-150 text-milky-400';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`text-sm px-4 py-2.5 rounded-xl border text-left transition-all ${bgClass} disabled:cursor-default`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 flex items-start gap-2"
        >
          {selected === quiz.correctIndex ? (
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-xs text-milky-500 leading-relaxed">{quiz.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function WrongAnswerCard({ wrong, onDelete }: { wrong: WrongAnswer; onDelete: (id: string) => void }) {
  return (
    <div className="bg-milky-100 rounded-xl px-4 py-3 mb-2 border border-milky-150">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={14} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-milky-700">{wrong.quiz.question}</p>
          <p className="text-xs text-red-400 mt-1">
            내 답: {wrong.quiz.options[wrong.userAnswer]}
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            정답: {wrong.quiz.options[wrong.quiz.correctIndex]}
          </p>
          <p className="text-xs text-milky-500 mt-1">{wrong.quiz.explanation}</p>
        </div>
        <button
          onClick={() => onDelete(wrong.id)}
          className="p-1.5 rounded-lg hover:bg-milky-200 transition-colors text-milky-400 hover:text-red-400 flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function QuizScreen() {
  const { quizQuestions, wrongAnswers, generateQuizzes, answerQuiz, deleteWrongAnswer, clearAllWrongAnswers } = useChat();
  const [tab, setTab] = useState<'quiz' | 'wrong'>('quiz');
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (quizStarted && quizQuestions.length === 0) {
      generateQuizzes(5);
    }
  }, [quizStarted, quizQuestions.length, generateQuizzes]);

  const handleAnswer = (quizId: string, answer: number) => {
    answerQuiz(quizId, answer);
  };

  const handleRestart = () => {
    setQuizStarted(true);
    generateQuizzes(5);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-medium text-milky-700 mb-3">퀴즈</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('quiz')}
            className={`text-xs px-4 py-1.5 rounded-full transition-colors ${
              tab === 'quiz' ? 'bg-accent-300 text-white' : 'bg-milky-150 text-milky-500'
            }`}
          >
            연습 퀴즈
          </button>
          <button
            onClick={() => setTab('wrong')}
            className={`text-xs px-4 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
              tab === 'wrong' ? 'bg-accent-300 text-white' : 'bg-milky-150 text-milky-500'
            }`}
          >
            오답 노트
            {wrongAnswers.length > 0 && (
              <span className="bg-red-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">{wrongAnswers.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        <AnimatePresence mode="wait">
          {tab === 'quiz' ? (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!quizStarted ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center mb-3">
                    <BookOpen size={28} className="text-accent-500" />
                  </div>
                  <p className="text-sm text-milky-500 mb-4">약점 분석 기반 맞춤 퀴즈!</p>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-2.5 bg-accent-400 text-white rounded-xl text-sm font-medium hover:bg-accent-500 transition-colors"
                  >
                    퀴즈 시작
                  </button>
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-milky-400">
                  <HelpCircle size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">퀴즈를 생성하는 중...</p>
                </div>
              ) : (
                <>
                  {quizQuestions.map(q => (
                    <QuizCard key={q.id} quiz={q} onAnswer={handleAnswer} />
                  ))}
                  <div className="flex justify-center mt-4 mb-2">
                    <button
                      onClick={handleRestart}
                      className="px-5 py-2 bg-milky-150 text-milky-600 rounded-xl text-sm flex items-center gap-2 hover:bg-milky-200 transition-colors"
                    >
                      <RotateCcw size={14} /> 새 퀴즈
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="wrong" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {wrongAnswers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-milky-400">
                  <CheckCircle size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">오답이 없어요! 잘하고 있어요 🎉</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={clearAllWrongAnswers}
                      className="text-xs px-3 py-1 rounded-lg bg-milky-150 text-milky-500 hover:bg-red-50 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> 전체 삭제
                    </button>
                  </div>
                  {wrongAnswers.map(w => (
                    <WrongAnswerCard key={w.id} wrong={w} onDelete={deleteWrongAnswer} />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
