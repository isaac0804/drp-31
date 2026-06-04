import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, RotateCcw, ChevronRight, Zap, Trophy, ArrowLeft } from 'lucide-react';
import { SkillLevel, Sport, SKILL_LEVEL_LABELS } from '../types';

interface Question {
  id: string;
  question: string;
  subtitle: string;
  options: { label: string; score: number }[];
}

// ── Sport-specific question banks (7 questions each) ──────────────────────────

const SPORT_QUESTIONS: Record<Sport, Question[]> = {
  Badminton: [
    {
      id: 'experience',
      question: 'How long have you been playing badminton?',
      subtitle: "Count any time you've picked up a racket regularly.",
      options: [
        { label: "Brand new — I've never played", score: 1 },
        { label: 'Less than 1 year', score: 3 },
        { label: '1–3 years', score: 5 },
        { label: '3–7 years', score: 7 },
        { label: '7+ years', score: 9 },
      ],
    },
    {
      id: 'frequency',
      question: 'How often do you play or train?',
      subtitle: 'On average, over the past few months.',
      options: [
        { label: 'Rarely or not at all', score: 1 },
        { label: 'Once or twice a month', score: 3 },
        { label: 'About once a week', score: 5 },
        { label: '2–4 times a week', score: 7 },
        { label: 'Almost every day', score: 9 },
      ],
    },
    {
      id: 'rally',
      question: 'How would you describe your rally ability?',
      subtitle: 'Think about your last few games.',
      options: [
        { label: 'Still learning to hit the shuttle cleanly', score: 1 },
        { label: 'I can sustain short rallies', score: 3 },
        { label: 'I rally well and direct shots deliberately', score: 5 },
        { label: 'I use drops, smashes and spins tactically', score: 7 },
        { label: 'I dominate with full court control', score: 9 },
      ],
    },
    {
      id: 'serve',
      question: 'How would you describe your serve?',
      subtitle: 'Serving is often where rallies are won or lost.',
      options: [
        { label: 'I can only do a basic underarm clear', score: 1 },
        { label: 'I can vary between high and low serves', score: 3 },
        { label: 'I use push and flick serves situationally', score: 5 },
        { label: 'I use deceptive serves to win cheap points', score: 7 },
        { label: 'My serve is a weapon — varied, disguised and precise', score: 9 },
      ],
    },
    {
      id: 'tactics',
      question: 'How tactical is your game?',
      subtitle: 'Do you play with intent or just react?',
      options: [
        { label: 'I just try to get the shuttle back', score: 1 },
        { label: 'I sometimes aim for gaps', score: 3 },
        { label: 'I consistently vary pace and placement', score: 5 },
        { label: 'I read my opponent and exploit weaknesses', score: 7 },
        { label: 'I control the entire tempo and geometry of the rally', score: 9 },
      ],
    },
    {
      id: 'competition',
      question: 'What is your competitive experience?',
      subtitle: 'Organised matches, leagues or tournaments.',
      options: [
        { label: "I've never competed", score: 1 },
        { label: 'Casual club or league play', score: 3 },
        { label: 'Local tournaments', score: 5 },
        { label: 'Regional competitions', score: 7 },
        { label: 'National or international level', score: 9 },
      ],
    },
    {
      id: 'footwork',
      question: 'How would you rate your court movement?',
      subtitle: 'Footwork is the foundation of every shot.',
      options: [
        { label: 'I mostly reach for shots from one spot', score: 1 },
        { label: 'I move to most shots but feel slow', score: 3 },
        { label: 'I cover the court reasonably well', score: 5 },
        { label: 'My footwork is quick and deliberate', score: 7 },
        { label: 'Elite movement — always in position', score: 9 },
      ],
    },
  ],

  'Table Tennis': [
    {
      id: 'experience',
      question: 'How long have you been playing table tennis?',
      subtitle: "Count any time you've played regularly, not just casually.",
      options: [
        { label: "Brand new — I've barely played", score: 1 },
        { label: 'Less than 1 year', score: 3 },
        { label: '1–3 years', score: 5 },
        { label: '3–7 years', score: 7 },
        { label: '7+ years', score: 9 },
      ],
    },
    {
      id: 'frequency',
      question: 'How often do you play or train?',
      subtitle: 'On average, over the past few months.',
      options: [
        { label: 'Rarely or not at all', score: 1 },
        { label: 'Once or twice a month', score: 3 },
        { label: 'About once a week', score: 5 },
        { label: '2–4 times a week', score: 7 },
        { label: 'Almost every day', score: 9 },
      ],
    },
    {
      id: 'spin',
      question: 'How would you describe your spin and shot variety?',
      subtitle: 'Spin control separates recreational from competitive players.',
      options: [
        { label: 'Still learning to make contact consistently', score: 1 },
        { label: 'I can rally but have little spin control', score: 3 },
        { label: 'I use topspin and backspin with some consistency', score: 5 },
        { label: 'I loop, counter-loop and vary spin deliberately', score: 7 },
        { label: 'I dominate with advanced spin tactics and serves', score: 9 },
      ],
    },
    {
      id: 'serve',
      question: 'How would you describe your serve?',
      subtitle: 'A strong serve can win points outright at higher levels.',
      options: [
        { label: 'I just try to get it over the net', score: 1 },
        { label: 'I can vary short and long consistently', score: 3 },
        { label: 'I use side-spin and vary the speed', score: 5 },
        { label: 'I disguise the spin direction to force errors', score: 7 },
        { label: 'My serves are weapons — varied, deceptive and precise', score: 9 },
      ],
    },
    {
      id: 'reading',
      question: 'How well do you read and anticipate your opponent?',
      subtitle: 'Mental sharpness is as important as technique at higher levels.',
      options: [
        { label: 'I just react to wherever the ball goes', score: 1 },
        { label: 'I sometimes anticipate obvious shots', score: 3 },
        { label: 'I read patterns and adjust my positioning', score: 5 },
        { label: 'I actively disrupt my opponent\'s rhythm and patterns', score: 7 },
        { label: 'I control the entire tactical flow of the game', score: 9 },
      ],
    },
    {
      id: 'competition',
      question: 'What is your competitive experience?',
      subtitle: 'Organised matches, leagues or tournaments.',
      options: [
        { label: "I've never competed", score: 1 },
        { label: 'Casual club or league play', score: 3 },
        { label: 'Local tournaments', score: 5 },
        { label: 'Regional competitions', score: 7 },
        { label: 'National or international level', score: 9 },
      ],
    },
    {
      id: 'reaction',
      question: 'How would you rate your reaction speed and table coverage?',
      subtitle: 'Fast reflexes and footwork are crucial at higher levels.',
      options: [
        { label: 'I often miss fast shots entirely', score: 1 },
        { label: 'I return most slow to medium shots', score: 3 },
        { label: 'I react well and cover the table comfortably', score: 5 },
        { label: 'My reactions and movement are sharp and consistent', score: 7 },
        { label: 'Elite-level reflexes — I anticipate and dictate play', score: 9 },
      ],
    },
  ],

  Football: [
    {
      id: 'experience',
      question: 'How long have you been playing football?',
      subtitle: 'Include any regular recreational or organised play.',
      options: [
        { label: "Brand new — I've just started", score: 1 },
        { label: 'Less than 1 year', score: 3 },
        { label: '1–3 years', score: 5 },
        { label: '3–7 years', score: 7 },
        { label: '7+ years', score: 9 },
      ],
    },
    {
      id: 'frequency',
      question: 'How often do you play or train?',
      subtitle: 'On average, over the past few months.',
      options: [
        { label: 'Rarely or not at all', score: 1 },
        { label: 'Once or twice a month', score: 3 },
        { label: 'About once a week', score: 5 },
        { label: '2–4 times a week', score: 7 },
        { label: 'Almost every day', score: 9 },
      ],
    },
    {
      id: 'technical',
      question: 'How would you describe your technical ability?',
      subtitle: 'Ball control, passing, and dribbling under pressure.',
      options: [
        { label: 'Still getting comfortable with basic ball control', score: 1 },
        { label: 'I can pass and receive in open space', score: 3 },
        { label: 'I control the ball well and make consistent passes', score: 5 },
        { label: 'I dribble confidently and read the game well', score: 7 },
        { label: 'Elite touch, vision, and execution under pressure', score: 9 },
      ],
    },
    {
      id: 'defending',
      question: 'How would you rate your defensive ability?',
      subtitle: 'Winning the ball back is as important as scoring.',
      options: [
        { label: "I struggle to get near the ball defensively", score: 1 },
        { label: 'I can make basic tackles in open space', score: 3 },
        { label: 'I position well and win the ball regularly', score: 5 },
        { label: 'I read the play and intercept effectively', score: 7 },
        { label: 'Elite defensive instincts and clean tackling', score: 9 },
      ],
    },
    {
      id: 'team',
      question: 'How well do you understand team shape and movement?',
      subtitle: 'Football is a team sport — structure wins games.',
      options: [
        { label: 'I mostly chase the ball wherever it goes', score: 1 },
        { label: 'I hold my position most of the time', score: 3 },
        { label: 'I make intelligent runs and support teammates', score: 5 },
        { label: 'I understand pressing triggers, shape and transitions', score: 7 },
        { label: 'I orchestrate team movements and defensive lines', score: 9 },
      ],
    },
    {
      id: 'competition',
      question: 'What is your competitive experience?',
      subtitle: 'Organised matches, leagues or tournaments.',
      options: [
        { label: "I've never played in organised football", score: 1 },
        { label: 'Casual 5-a-side or recreational leagues', score: 3 },
        { label: 'Local club or amateur league', score: 5 },
        { label: 'Regional or semi-professional level', score: 7 },
        { label: 'Professional or national level', score: 9 },
      ],
    },
    {
      id: 'fitness',
      question: 'How would you rate your physical conditioning?',
      subtitle: 'Endurance and explosive movement matter throughout a match.',
      options: [
        { label: 'I tire quickly and struggle to keep up', score: 1 },
        { label: 'I can get through a short game but fade', score: 3 },
        { label: 'I maintain decent fitness for most of a match', score: 5 },
        { label: 'I have strong endurance and explosive pace', score: 7 },
        { label: 'Peak athletic condition — I set the tempo', score: 9 },
      ],
    },
  ],

  Pickleball: [
    {
      id: 'experience',
      question: 'How long have you been playing pickleball?',
      subtitle: "Count any time you've played regularly.",
      options: [
        { label: "Brand new — I've never played", score: 1 },
        { label: 'Less than 1 year', score: 3 },
        { label: '1–3 years', score: 5 },
        { label: '3–7 years', score: 7 },
        { label: '7+ years', score: 9 },
      ],
    },
    {
      id: 'frequency',
      question: 'How often do you play or train?',
      subtitle: 'On average, over the past few months.',
      options: [
        { label: 'Rarely or not at all', score: 1 },
        { label: 'Once or twice a month', score: 3 },
        { label: 'About once a week', score: 5 },
        { label: '2–4 times a week', score: 7 },
        { label: 'Almost every day', score: 9 },
      ],
    },
    {
      id: 'shots',
      question: 'How would you describe your shot-making ability?',
      subtitle: 'Dinking, drives, and overhead smashes are key.',
      options: [
        { label: 'Still learning to keep the ball in play', score: 1 },
        { label: 'I can dink and drive with some consistency', score: 3 },
        { label: 'I use a range of shots and hold my own at the kitchen', score: 5 },
        { label: 'I finish points with speed, drops, and smart placement', score: 7 },
        { label: 'Elite shot selection and execution in all situations', score: 9 },
      ],
    },
    {
      id: 'third-shot',
      question: 'How do you handle the third shot?',
      subtitle: 'The third-shot decision often defines who wins the point.',
      options: [
        { label: "I don't think about it — I just hit it back", score: 1 },
        { label: 'I usually drive regardless of the situation', score: 3 },
        { label: 'I choose between drive and drop depending on position', score: 5 },
        { label: 'I consistently execute drops to reach the kitchen line', score: 7 },
        { label: 'I use disguise and placement to win the transition battle', score: 9 },
      ],
    },
    {
      id: 'positioning',
      question: 'How would you rate your court positioning and strategy?',
      subtitle: 'Winning pickleball is as much about position as shots.',
      options: [
        { label: 'I react to the ball without much thought for position', score: 1 },
        { label: 'I understand the kitchen line but struggle to hold it', score: 3 },
        { label: 'I control the kitchen and stack plays with a partner', score: 5 },
        { label: 'I dictate positioning and disrupt opponents tactically', score: 7 },
        { label: 'Elite court IQ — I control the pace and geometry of every rally', score: 9 },
      ],
    },
    {
      id: 'competition',
      question: 'What is your competitive experience?',
      subtitle: 'Organised matches, leagues or tournaments.',
      options: [
        { label: "I've never competed", score: 1 },
        { label: 'Casual open play or recreational games', score: 3 },
        { label: 'Local tournaments', score: 5 },
        { label: 'Regional competitions', score: 7 },
        { label: 'National or pro-level play', score: 9 },
      ],
    },
    {
      id: 'coordination',
      question: 'How well do you coordinate with your partner?',
      subtitle: 'Doubles pickleball rewards teamwork as much as individual skill.',
      options: [
        { label: 'I play mostly independently', score: 1 },
        { label: 'We communicate occasionally during points', score: 3 },
        { label: 'We cover each other and switch positions when needed', score: 5 },
        { label: 'We signal, stack, and move as a unit', score: 7 },
        { label: 'Seamless — our movement and decisions are fully in sync', score: 9 },
      ],
    },
  ],
};

// ── Scoring ────────────────────────────────────────────────────────────────────

function computeSkillLevel(answers: number[]): SkillLevel {
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  if (avg <= 3.0) return 'beginner';
  if (avg <= 5.0) return 'lower-intermediate';
  if (avg <= 6.5) return 'upper-intermediate';
  if (avg <= 7.8) return 'advanced';
  return 'pro';
}

// ── Legend ─────────────────────────────────────────────────────────────────────

const TIER_LEGEND: { level: SkillLevel; description: string }[] = [
  { level: 'beginner',          description: 'Learning the basics and fundamental technique. Perfect for fun, social sessions.' },
  { level: 'lower-intermediate', description: 'Fundamentals in place but still building consistency. Regular recreational play.' },
  { level: 'upper-intermediate', description: 'Consistent player with real intent. Comfortable in semi-competitive settings.' },
  { level: 'advanced',          description: 'Technically strong with good tactical understanding. Competes in club or local events.' },
  { level: 'pro',               description: 'Elite mastery. Regional, national, or international competitive experience.' },
];

const SPORTS: Sport[] = ['Badminton', 'Table Tennis', 'Football', 'Pickleball'];

// ── Component ──────────────────────────────────────────────────────────────────

interface SkillAssessmentScreenProps {
  onComplete: (sport: Sport, skillLevel: SkillLevel) => void;
  onClose: () => void;
}

type Phase = 'sport-select' | 'quiz' | 'result';

export default function SkillAssessmentScreen({ onComplete, onClose }: SkillAssessmentScreenProps) {
  const [phase, setPhase] = useState<Phase>('sport-select');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [finalLevel, setFinalLevel] = useState<SkillLevel>('beginner');

  const questions = selectedSport ? SPORT_QUESTIONS[selectedSport] : [];
  const totalSteps = questions.length;
  const current = questions[step];

  const handleStartQuiz = (sport: Sport) => {
    setSelectedSport(sport);
    setStep(0);
    setAnswers([]);
    setSelectedOption(null);
    setDirection(1);
    setPhase('quiz');
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    if (step < totalSteps - 1) {
      setDirection(1);
      setAnswers(newAnswers);
      setSelectedOption(null);
      setStep((s) => s + 1);
    } else {
      setFinalLevel(computeSkillLevel(newAnswers));
      setAnswers(newAnswers);
      setPhase('result');
    }
  };

  const handleBack = () => {
    if (phase === 'sport-select') { onClose(); return; }
    if (phase === 'result') {
      setSelectedOption(answers[answers.length - 1]);
      setStep(totalSteps - 1);
      setDirection(-1);
      setPhase('quiz');
      return;
    }
    if (step === 0) { setPhase('sport-select'); setAnswers([]); setSelectedOption(null); return; }
    setDirection(-1);
    setSelectedOption(answers[answers.length - 1]);
    setAnswers((a) => a.slice(0, -1));
    setStep((s) => s - 1);
  };

  const handleRetake = () => {
    setPhase('sport-select');
    setSelectedSport(null);
    setStep(0);
    setAnswers([]);
    setSelectedOption(null);
    setDirection(1);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {/* ── Sport Selection ── */}
        {phase === 'sport-select' && (
          <motion.section key="sport-select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }} className="w-full">
            <div className="flex items-center mb-6">
              <button onClick={onClose} className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
            </div>
            <div className="mb-6 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                  <Target className="w-4 h-4 stroke-[2.5px]" />
                </div>
                <p className="font-mono text-xs text-primary-fixed uppercase tracking-[0.25em]">Skill Assessment</p>
              </div>
              <h1 className="font-sans font-black text-2xl text-white tracking-tight leading-tight">Which sport are you assessing?</h1>
              <p className="text-sm text-on-surface-variant/70">We'll ask you 7 questions tailored to that sport.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SPORTS.map((sport) => (
                <button key={sport} type="button" onClick={() => handleStartQuiz(sport)}
                  className="bg-surface-container-high border border-outline-variant/20 hover:border-primary-fixed/60 hover:bg-primary-fixed/5 rounded-2xl p-5 text-left transition-all active:scale-[0.97] cursor-pointer group">
                  <p className="font-sans font-black text-base text-white group-hover:text-primary-fixed transition-colors leading-snug">{sport}</p>
                  <p className="text-[11px] text-on-surface-variant/60 mt-1 font-mono uppercase tracking-wider">7 questions</p>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Quiz ── */}
        {phase === 'quiz' && current && (
          <motion.section key="quiz" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }} className="w-full">
            <div className="flex items-center mb-5">
              <button onClick={handleBack} className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
            </div>
            <div className="mb-5 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                  <Target className="w-4 h-4 stroke-[2.5px]" />
                </div>
                <p className="font-mono text-xs text-primary-fixed uppercase tracking-[0.25em]">{selectedSport} · Skill Assessment</p>
              </div>
              <h1 className="font-sans font-black text-2xl text-white tracking-tight leading-tight">Let's calibrate your level.</h1>
            </div>
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Question {step + 1} of {totalSteps}</span>
                <span className="font-mono text-[10px] text-primary-fixed uppercase tracking-widest">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-surface-container-highest overflow-hidden">
                <motion.div className="h-full rounded-full bg-primary-fixed" animate={{ width: `${((step + 1) / totalSteps) * 100}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} />
              </div>
            </div>
            <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
              <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary-fixed/8 blur-3xl pointer-events-none" />
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} initial={{ opacity: 0, x: direction * 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -32 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="font-sans font-black text-lg text-white leading-snug">{current.question}</h2>
                    <p className="text-xs text-on-surface-variant/75">{current.subtitle}</p>
                  </div>
                  <div className="space-y-2">
                    {current.options.map((opt) => {
                      const isSelected = selectedOption === opt.score;
                      return (
                        <button key={opt.score} type="button" onClick={() => setSelectedOption(opt.score)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer active:scale-[0.98] ${isSelected ? 'bg-primary-fixed/12 border-primary-fixed text-primary-fixed font-bold' : 'border-outline-variant/40 bg-surface-variant/40 text-on-surface hover:bg-surface-bright hover:border-outline-variant/80'}`}>
                          <span className="flex items-center gap-3">
                            <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-primary-fixed bg-primary-fixed' : 'border-outline-variant/60'}`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-on-primary-fixed" />}
                            </span>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" onClick={handleNext} disabled={selectedOption === null}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-sans font-extrabold text-xs uppercase tracking-widest transition-all active:scale-95 ${selectedOption !== null ? 'bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed shadow-[0_4px_16px_rgba(202,243,0,0.2)] cursor-pointer' : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed'}`}>
                    {step < totalSteps - 1 ? <><span>Next</span><ChevronRight className="w-4 h-4 stroke-[3px]" /></> : <><Zap className="w-4 h-4 stroke-[2.5px]" /><span>Get My Rating</span></>}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* ── Result ── */}
        {phase === 'result' && (
          <motion.section key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.28 }} className="w-full">
            <div className="flex items-center mb-6">
              <button onClick={handleBack} className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
            </div>

            <div className="space-y-5">
              {/* Result card */}
              <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative space-y-6">
                <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-primary-fixed/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-primary-fixed/5 blur-3xl pointer-events-none" />

                <div className="relative space-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                      <Trophy className="w-4 h-4 stroke-[2.5px]" />
                    </div>
                    <p className="font-mono text-xs text-primary-fixed uppercase tracking-[0.25em]">{selectedSport} · Assessment Complete</p>
                  </div>
                  <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight leading-tight">Your skill rating is in.</h2>
                </div>

                <div className="relative flex items-center gap-5 bg-surface-container-low border border-outline-variant/15 rounded-2xl p-5">
                  <div className="absolute inset-0 rounded-2xl bg-primary-fixed/3 pointer-events-none" />
                  <div className="relative shrink-0 w-20 h-20 rounded-2xl bg-primary-fixed/10 border-2 border-primary-fixed/30 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary-fixed" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-primary-fixed/10 border border-primary-fixed/20">
                      <span className="font-mono text-[11px] font-bold text-primary-fixed uppercase tracking-widest">{SKILL_LEVEL_LABELS[finalLevel]}</span>
                    </span>
                    <p className="font-sans font-extrabold text-lg text-white leading-tight">{TIER_LEGEND.find(t => t.level === finalLevel)?.description}</p>
                  </div>
                </div>

                <div className="space-y-3 relative">
                  <button type="button" onClick={() => onComplete(selectedSport!, finalLevel)}
                    className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-sans font-extrabold text-sm uppercase tracking-widest py-4 px-6 rounded-full shadow-[0_4px_16px_rgba(202,243,0,0.25)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                    <Zap className="w-4 h-4 stroke-[2.5px]" />Accept & Explore Sessions
                  </button>
                  <button type="button" onClick={handleRetake}
                    className="w-full border border-outline-variant/50 bg-surface-variant/30 hover:bg-surface-bright text-on-surface-variant font-sans font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                    <RotateCcw className="w-3.5 h-3.5" />Retake Assessment
                  </button>
                </div>
              </div>

              {/* Tier legend */}
              <div className="bg-surface-container-high border border-outline-variant/15 rounded-2xl p-5 space-y-3">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Skill Tier Reference</p>
                <div className="space-y-2">
                  {TIER_LEGEND.map(({ level, description }) => (
                    <div key={level} className={`flex gap-3 items-start p-3 rounded-xl transition-all ${level === finalLevel ? 'bg-primary-fixed/8 border border-primary-fixed/25' : 'border border-transparent'}`}>
                      <span className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase font-mono border mt-0.5 ${level === finalLevel ? 'bg-primary-fixed/15 border-primary-fixed/30 text-primary-fixed' : 'bg-surface-container-highest border-outline-variant/20 text-on-surface-variant'}`}>
                        {SKILL_LEVEL_LABELS[level]}
                      </span>
                      <p className={`text-xs leading-relaxed ${level === finalLevel ? 'text-on-surface' : 'text-on-surface-variant/70'}`}>{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

      </AnimatePresence>
    </div>
  );
}
