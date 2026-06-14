import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Settings, Brain, BookOpen, GraduationCap, Sparkles, Bot, MessageCircle, Languages, Mic, Palette, Type, Globe } from 'lucide-react';
import { useTheme, THEME_PRESETS, AI_ICONS } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import type { TabType } from '../../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Brain, BookOpen, GraduationCap, Sparkles, Bot, MessageCircle, Languages, Mic,
};

interface ProfileScreenProps {
  onTabChange: (tab: TabType) => void;
}

export default function ProfileScreen({ onTabChange }: ProfileScreenProps) {
  const { settings, updateSettings, applyPreset } = useTheme();
  const { sessions, notes, quizResults, wrongAnswers } = useChat();
  const [showSettings, setShowSettings] = useState(false);

  const totalQuizzes = quizResults.length;
  const correctQuizzes = quizResults.filter(r => r.isCorrect).length;
  const accuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  if (showSettings) {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowSettings(false)}
              className="text-sm text-accent-400 hover:text-accent-500 transition-colors"
            >
              ← 돌아가기
            </button>
            <h2 className="text-lg font-medium text-milky-700">설정</h2>
          </div>

          {/* Color Theme */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-accent-400" />
              <h3 className="text-sm font-medium text-milky-600">색상 테마</h3>
            </div>

            {/* Hue Rainbow Slider — base color */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-milky-500">기본 색상</label>
                <span className="text-xs text-milky-400">{settings.milkyH}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={settings.milkyH}
                onChange={e => updateSettings({ milkyH: Number(e.target.value) })}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, hsl(0,70%,70%), hsl(60,70%,70%), hsl(120,70%,70%), hsl(180,70%,70%), hsl(240,70%,70%), hsl(300,70%,70%), hsl(360,70%,70%))',
                }}
              />
            </div>

            {/* Hue Rainbow Slider — accent color */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-milky-500">강조 색상</label>
                <span className="text-xs text-milky-400">{settings.accentH}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={settings.accentH}
                onChange={e => updateSettings({ accentH: Number(e.target.value) })}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, hsl(0,80%,60%), hsl(60,80%,60%), hsl(120,80%,60%), hsl(180,80%,60%), hsl(240,80%,60%), hsl(300,80%,60%), hsl(360,80%,60%))',
                }}
              />
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {THEME_PRESETS.map(preset => {
                const isActive = settings.milkyH === preset.milkyH && settings.milkyS === preset.milkyS && settings.accentH === preset.accentH;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all text-[11px] ${
                      isActive ? 'border-accent-400 shadow-sm font-medium' : 'border-milky-200'
                    }`}
                    style={{ backgroundColor: `hsl(${preset.milkyH}, ${preset.milkyS}%, 94%)` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${preset.accentH}, ${preset.accentS}%, 50%)` }}
                    />
                    <span className="text-milky-700">{preset.nameKo}</span>
                  </button>
                );
              })}
            </div>

            {/* Saturation Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-milky-500">채도 (Saturation)</label>
                <span className="text-xs text-milky-400">{settings.milkyS}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="70"
                value={settings.milkyS}
                onChange={e => updateSettings({ milkyS: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${settings.milkyH}, 5%, 85%), hsl(${settings.milkyH}, 70%, 50%))`,
                }}
              />
              <div className="flex justify-between text-[10px] text-milky-400 mt-1">
                <span>부드럽게</span>
                <span>진하게</span>
              </div>
            </div>

            {/* Accent Saturation Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-milky-500">강조 색 채도</label>
                <span className="text-xs text-milky-400">{settings.accentS}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={settings.accentS}
                onChange={e => updateSettings({ accentS: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${settings.accentH}, 10%, 85%), hsl(${settings.accentH}, 90%, 50%))`,
                }}
              />
            </div>

            {/* Preview */}
            <div className="rounded-xl p-4 border border-milky-200 mb-4"
              style={{ backgroundColor: `hsl(${settings.milkyH}, ${settings.milkyS}%, 94%)` }}
            >
              <p className="text-xs text-milky-400 mb-2">미리보기</p>
              <div className="flex gap-2">
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ backgroundColor: `hsl(${settings.milkyH}, ${settings.milkyS}%, 87%)` }}
                />
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ backgroundColor: `hsl(${settings.accentH}, ${settings.accentS}%, 50%)` }}
                />
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ backgroundColor: `hsl(${settings.accentH}, ${settings.accentS}%, 72%)` }}
                />
              </div>
            </div>
          </div>

          {/* AI Icon Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-accent-400" />
              <h3 className="text-sm font-medium text-milky-600">AI 아이콘</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AI_ICONS.map(iconName => {
                const Icon = ICON_MAP[iconName];
                if (!Icon) return null;
                const isActive = settings.aiIcon === iconName;
                return (
                  <button
                    key={iconName}
                    onClick={() => updateSettings({ aiIcon: iconName })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      isActive ? 'border-accent-400 bg-accent-50' : 'border-milky-200 bg-milky-100'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-accent-500' : 'text-milky-500'} />
                    <span className="text-[10px] text-milky-500">{iconName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Type size={16} className="text-accent-400" />
              <h3 className="text-sm font-medium text-milky-600">글자 크기</h3>
            </div>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => updateSettings({ fontSize: size })}
                  className={`flex-1 py-2 rounded-xl text-sm border-2 transition-all ${
                    settings.fontSize === size
                      ? 'border-accent-400 bg-accent-50 text-accent-500'
                      : 'border-milky-200 bg-milky-100 text-milky-500'
                  }`}
                >
                  {size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-accent-400" />
              <h3 className="text-sm font-medium text-milky-600">학습 언어</h3>
            </div>
            <div className="flex gap-2">
              {([
                { code: 'en' as const, label: '영어', sublabel: 'English' },
                { code: 'fr' as const, label: '불어', sublabel: 'Français' },
              ]).map(lang => {
                const isActive = settings.languages.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      const next = isActive
                        ? settings.languages.filter(l => l !== lang.code)
                        : [...settings.languages, lang.code];
                      if (next.length > 0) updateSettings({ languages: next });
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-sm border-2 transition-all ${
                      isActive
                        ? 'border-accent-400 bg-accent-50 text-accent-500'
                        : 'border-milky-200 bg-milky-100 text-milky-400'
                    }`}
                  >
                    <span className="font-medium">{lang.label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-60">{lang.sublabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main profile view
  const CurrentIcon = ICON_MAP[settings.aiIcon] || Brain;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-milky-700">프로필</h2>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-xl bg-milky-100 flex items-center justify-center hover:bg-milky-200 transition-colors border border-milky-200"
          >
            <Settings size={18} className="text-milky-500" />
          </button>
        </div>

        {/* AI Identity */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-accent-200 flex items-center justify-center mb-3">
            <CurrentIcon size={40} className="text-accent-600" />
          </div>
          <h3 className="text-2xl font-medium text-milky-800">Poly</h3>
          <p className="text-xs text-milky-400 mt-1">너의 언어 학습 멘토</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-milky-100 rounded-xl p-3 text-center border border-milky-150">
            <p className="text-lg font-medium text-accent-500">{sessions.length}</p>
            <p className="text-[10px] text-milky-400">대화</p>
          </div>
          <div className="bg-milky-100 rounded-xl p-3 text-center border border-milky-150">
            <p className="text-lg font-medium text-accent-500">{notes.length}</p>
            <p className="text-[10px] text-milky-400">노트</p>
          </div>
          <div className="bg-milky-100 rounded-xl p-3 text-center border border-milky-150">
            <p className="text-lg font-medium text-accent-500">{accuracy}%</p>
            <p className="text-[10px] text-milky-400">퀴즈 정답률</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-milky-100 rounded-xl px-4 py-3 border border-milky-150">
            <span className="text-sm text-milky-500">퀴즈 완료</span>
            <span className="text-sm font-medium text-milky-700">{totalQuizzes}</span>
          </div>
          <div className="flex items-center justify-between bg-milky-100 rounded-xl px-4 py-3 border border-milky-150">
            <span className="text-sm text-milky-500">오답</span>
            <span className="text-sm font-medium text-milky-700">{wrongAnswers.length}</span>
          </div>
          <div className="flex items-center justify-between bg-milky-100 rounded-xl px-4 py-3 border border-milky-150">
            <span className="text-sm text-milky-500">학습 언어</span>
            <span className="text-sm font-medium text-milky-700">
              {settings.languages.map(l => l === 'en' ? '영어' : '불어').join(' · ')}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pb-8">
          <button
            onClick={() => onTabChange('chat')}
            className="w-full py-3 bg-accent-400 text-white rounded-xl text-sm font-medium hover:bg-accent-500 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} /> Poly와 대화하기
          </button>
        </div>
      </div>
    </div>
  );
}
