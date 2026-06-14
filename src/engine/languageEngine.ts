import type { GrammarRule, Message, Note, QuizQuestion, Weakness } from '../types';
import { frenchGrammar } from '../data/frenchGrammar';
import { englishGrammar } from '../data/englishGrammar';

const allGrammar: GrammarRule[] = [...frenchGrammar, ...englishGrammar];

const SYSTEM_PROMPT = `당신은 친절하고 분석적인 언어 멘토 "Poly"입니다. 당신은 영어와 불어를 전문으로 가르치는 개인 AI 튜터입니다.

핵심 원칙:
1. 대화처럼 자연스럽게 응답하세요. 로봇 같은 목록 형식을 피하세요.
2. 학습자의 질문을 정확히 파악하고, 헷갈리는 부분의 핵심 차이를 짚어주세요.
3. 예시를 구체적으로 들어주세요. 특히 학습자가 헷갈리는 두 가지를 비교할 때는 각각 언제 쓰는지 명확히 나눠서 설명하세요.
4. 한국어로 대화하세요 (학습자가 다른 언어로 물어봐도 설명은 한국어로).
5. 틀린 부분이 있으면 부드럽게 교정하고, 왜 틀렸는지 이유를 알려주세요.
6. 비유나 일상적인 상황으로 설명하면 더 좋습니다.
7. 간결하지만 충분히 설명하세요. 한 번에 너무 많은 정보를 주지 마세요.
8. 학습자의 수준에 맞춰서 설명하세요. 전문 용어는 피하거나 설명과 함께 쓰세요.
9. 공부 팁이나 암기 팁도 자연스럽게 섞어주세요.
10. 격려하는 톤을 유지하세요.`;

function findMatchingRules(input: string): GrammarRule[] {
  const lower = input.toLowerCase();
  const scored = allGrammar.map(rule => {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) score += 3;
    }
    if (lower.includes(rule.titleKo.toLowerCase())) score += 5;
    if (lower.includes(rule.category.toLowerCase())) score += 2;
    for (const ex of rule.examples) {
      if (lower.includes(ex.sentence.toLowerCase())) score += 2;
    }
    for (const m of rule.commonMistakes) {
      if (lower.includes(m.wrong.toLowerCase()) || lower.includes(m.correct.toLowerCase())) score += 4;
    }
    if (rule.id === 'fr-faire-du-vs-au') {
      if (lower.includes('faire du') || lower.includes('faire au') || lower.includes('faire de la')) score += 10;
    }
    if (rule.id === 'fr-sports-instruments') {
      if (lower.includes('jouer au') || lower.includes('jouer du')) score += 10;
    }
    return { rule, score };
  });
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.rule);
}

function detectLanguage(input: string): 'fr' | 'en' | 'mixed' {
  const frWords = ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'les', 'des', 'une', 'du', 'au', 'aux', 'fait', 'faire', 'jouer', 'avons', 'suis', 'est', 'sont', 'pas', 'mais', 'avec', 'pour', 'dans', 'sur', 'chez', 'bonjour', 'merci', 'salut', 'oui', 'non', 'franç', 'le'];
  const enWords = ['the', 'is', 'are', 'was', 'were', 'have', 'has', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'going', 'been', 'being'];
  let frCount = 0;
  let enCount = 0;
  const words = input.toLowerCase().split(/\s+/);
  for (const w of words) {
    if (frWords.includes(w)) frCount++;
    if (enWords.includes(w)) enCount++;
  }
  if (frCount > enCount + 2) return 'fr';
  if (enCount > frCount + 2) return 'en';
  if (frCount > 0 && enCount > 0) return 'mixed';
  const lower = input.toLowerCase();
  if (lower.includes('프랑스') || lower.includes('불어') || lower.includes('불어') || lower.includes('프랑스어') || lower.includes('french') || lower.includes('faire') || lower.includes('fran')) return 'fr';
  if (lower.includes('영어') || lower.includes('english') || lower.includes('앵글로') || lower.includes('present perfect') || lower.includes('gerund')) return 'en';
  return 'mixed';
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildResponse(input: string, rules: GrammarRule[], _context: Message[]): string {
  const lower = input.toLowerCase();
  const lang = detectLanguage(input);

  // Specific fare-du-vs-au handling
  if (lower.includes('faire du') || lower.includes('faire au') || lower.includes('faire de la') ||
      lower.includes('faire') && (lower.includes('du') || lower.includes('au') || lower.includes('de la'))) {
    const faireRule = allGrammar.find(r => r.id === 'fr-faire-du-vs-au');
    const jouerRule = allGrammar.find(r => r.id === 'fr-sports-instruments');
    if (faireRule) {
      let resp = `좋은 질문이에요! faire 뒤에 du와 au(de la)가 헷갈리는 건 정말 많은 학습자들이 겪는 어려움이에요. 😊\n\n`;
      resp += `핵심은 이거예요:\n\n`;
      resp += `**faire du / faire de la / faire de l'** → 어떤 **활동이나 운동, 악기를 "하는" 것**\n`;
      resp += `→ 예: Je fais du piano (피아노를 쳐요), Je fais du tennis (테니스를 쳐요), Je fais de la natation (수영을 해요)\n\n`;
      resp += `**aller au / aller à la** → 어떤 **장소에 "가는" 것**\n`;
      resp += `→ 예: Je vais au stade (경기장에 가요), Je vais à la piscine (수영장에 가요)\n\n`;
      resp += `그래서 "faire au"라는 조합은 사실상 쓰지 않아요! faire은 활동을 하는 거고, au는 장소에 갈 때 쓰는 거니까요.\n\n`;
      if (jouerRule) {
        resp += `비슷하게 헷갈리기 쉬운 **jouer au vs jouer du**도 있어요:\n`;
        resp += `→ **스포츠**에는 jouer **au** (jouer au foot)\n`;
        resp += `→ **악기**에는 jouer **du** (jouer du piano)\n\n`;
      }
      resp += `기억 팁: **faire du = 활동을 하다**, **aller au = 장소에 가다**, **jouer au = 스포츠**, **jouer du = 악기**! 💡`;
      return resp;
    }
  }

  // jouer au vs jouer du
  if (lower.includes('jouer au') || lower.includes('jouer du') || (lower.includes('jouer') && (lower.includes('스포츠') || lower.includes('악기') || lower.includes('sport') || lower.includes('instrument')))) {
    const rule = allGrammar.find(r => r.id === 'fr-sports-instruments');
    if (rule) {
      let resp = `아, jouer au랑 jouer du! 이것도 프랑스어에서 진짜 헷갈리는 부분이죠. 😄\n\n`;
      resp += `아주 쉽게 정리하면:\n\n`;
      resp += `**jouer au** → **스포츠**를 할 때\n`;
      resp += `예: jouer au football (축구하다), jouer au basket (농구하다), jouer au tennis (테니스치다)\n\n`;
      resp += `**jouer du** → **악기**를 연주할 때\n`;
      resp += `예: jouer du piano (피아노치다), jouer de la guitare (기타치다), jouer du violon (바이올린켜다)\n\n`;
      resp += `왜 그러냐면, 스포츠는 **~에 참여한다**의 의미라서 전치사 à가 쓰이고(à + le = au), 악기는 **~를 다룬다**의 의미라서 전치사 de가 쓰이는(de + le = du) 거예요.\n\n`;
      resp += `암기 팁: **au = 스포츠 경기장에서**, **du = 악기로 소리를 내** 라고 연상해보세요! 🎵⚽`;
      return resp;
    }
  }

  // General greeting
  if (lower.match(/^(안녕|하이|헬로|hello|hi|salut|bonjour|반가)/)) {
    return `안녕! 👋 나는 Poly야, 네 언어 학습 멘토! 영어랑 불어에 대해 궁금한 게 있으면 뭐든 물어봐. 문법, 어휘, 표현... 뭐든 도와줄게! 오늘 뭐부터 공부하고 싶어?`;
  }

  // If rules found, build contextual response
  if (rules.length > 0) {
    const rule = rules[0];
    let resp = '';

    if (lang === 'fr' || lower.includes('불어') || lower.includes('프랑스') || lower.includes('french')) {
      resp += `좋은 질문이에요! `;
    } else if (lang === 'en' || lower.includes('영어') || lower.includes('english')) {
      resp += `좋은 질문! `;
    } else {
      resp += `오, 좋은 질문이에요! `;
    }

    resp += `${rule.explanationKo}\n\n`;

    if (rule.examples.length > 0) {
      resp += `예시를 볼게요:\n`;
      const examples = pickRandom(rule.examples, Math.min(3, rule.examples.length));
      for (const ex of examples) {
        resp += `→ ${ex.sentence}\n  (${ex.translation})\n`;
      }
      resp += '\n';
    }

    if (rule.commonMistakes.length > 0) {
      resp += `여기서 많이 틀리는 부분이 있는데:\n`;
      for (const m of rule.commonMistakes.slice(0, 2)) {
        resp += `❌ ${m.wrong} → ⭕ ${m.correct}\n  💡 ${m.note}\n`;
      }
      resp += '\n';
    }

    if (rule.relatedConcepts.length > 0) {
      const related = rule.relatedConcepts
        .map(id => allGrammar.find(r => r.id === id))
        .filter(Boolean)
        .slice(0, 2);
      if (related.length > 0) {
        resp += `관련해서도 알아두면 좋은 것: ${related.map(r => r!.titleKo).join(', ')} — 이것도 궁금하면 물어봐! 😉`;
      }
    }

    return resp;
  }

  // Fallback for when no grammar rule matches
  const fallbacks = [
    `흠, 구체적으로 어떤 부분이 헷갈려? 조금 더 알려주면 더 정확하게 도와줄 수 있어! 예를 들어 어떤 문법이나 표현이 궁금한지 말해주면 좋겠어. 😊`,
    `그 부분에 대해 좀 더 자세히 알려줄 수 있어? 어떤 상황에서 헷갈리는지 예문을 보여주면 내가 더 잘 설명할 수 있어!`,
    `좋아, 그 주제에 대해 이야기해보자! 혹시 구체적으로 어떤 점이 어려워? 문법 규칙, 단어 선택, 아니면 표현? 더 알려주면 맞춤으로 설명해줄게! 💡`,
    `그건 많은 학습자들이 어려워하는 부분이야. 구체적으로 어떤 예문이나 상황에서 헷갈리는지 알려주면, 비교하면서 쉽게 설명해줄게!`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export function generateResponse(input: string, context: Message[]): {
  response: string;
  detectedWeaknesses: Weakness[];
  generatedNotes: Note[];
} {
  const rules = findMatchingRules(input);
  const response = buildResponse(input, rules, context);

  const detectedWeaknesses: Weakness[] = [];
  const generatedNotes: Note[] = [];

  // Detect weaknesses from common mistakes in matched rules
  for (const rule of rules.slice(0, 2)) {
    const lower = input.toLowerCase();
    for (const mistake of rule.commonMistakes) {
      if (lower.includes(mistake.wrong.toLowerCase()) || lower.includes(mistake.correct.toLowerCase())) {
        detectedWeaknesses.push({
          id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          topic: rule.titleKo,
          description: `${mistake.wrong} → ${mistake.correct}: ${mistake.note}`,
          language: rule.language,
          count: 1,
          lastSeenAt: Date.now(),
        });
      }
    }
  }

  // Generate notes for significant grammar explanations
  if (rules.length > 0) {
    const rule = rules[0];
    generatedNotes.push({
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: rule.titleKo,
      content: rule.explanationKo + '\n\n예시:\n' + rule.examples.slice(0, 2).map(e => `${e.sentence} (${e.translation})`).join('\n'),
      category: 'grammar',
      createdAt: Date.now(),
    });
  }

  return { response, detectedWeaknesses, generatedNotes };
}

export function generateQuizQuestions(weaknesses: Weakness[], count: number): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Generate from weaknesses first
  for (const w of weaknesses.slice(0, count)) {
    const relatedRules = allGrammar.filter(r => r.titleKo === w.topic || r.keywords.some(k => w.topic.includes(k)));
    for (const rule of relatedRules) {
      for (const mistake of rule.commonMistakes) {
        const correctOption = mistake.correct;
        const wrongOption = mistake.wrong;
        const otherOptions = rule.examples.slice(0, 2).map(e => {
          const parts = e.sentence.split(' ');
          return parts.length > 3 ? parts.slice(0, 2).join(' ') + ' ___' : e.sentence;
        });
        const allOptions = [correctOption, wrongOption, ...otherOptions.slice(0, 2)].slice(0, 4);
        const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
        const correctIdx = shuffled.indexOf(correctOption);

        questions.push({
          id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          question: `다음 중 올바른 표현은? (${rule.titleKo})`,
          options: shuffled,
          correctIndex: correctIdx >= 0 ? correctIdx : 0,
          explanation: mistake.note,
          category: 'grammar',
          language: rule.language,
          difficulty: 'medium',
        });
      }
    }
  }

  // Fill remaining with random grammar questions
  if (questions.length < count) {
    const remaining = count - questions.length;
    const randomRules = pickRandom(allGrammar, remaining);
    for (const rule of randomRules) {
      if (rule.commonMistakes.length > 0) {
        const mistake = rule.commonMistakes[0];
        const options = [mistake.correct, mistake.wrong, ...rule.examples.slice(0, 2).map(e => e.sentence.split(' ').pop() || e.sentence)];
        const unique = [...new Set(options)].slice(0, 4);
        while (unique.length < 4) unique.push(`(다른 보기)`);
        const shuffled = [...unique].sort(() => Math.random() - 0.5);
        const correctIdx = shuffled.indexOf(mistake.correct);

        questions.push({
          id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          question: `빈칸에 들어갈 알맞은 것은? (${rule.titleKo})\n"${mistake.wrong}" vs "${mistake.correct}"`,
          options: shuffled,
          correctIndex: correctIdx >= 0 ? correctIdx : 0,
          explanation: mistake.note,
          category: 'grammar',
          language: rule.language,
          difficulty: 'easy',
        });
      }
    }
  }

  return questions.slice(0, count);
}

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}
