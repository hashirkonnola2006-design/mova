import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, Volume2, Video, CheckCircle2,
  Award, Sparkles, ArrowRight, HelpCircle, RotateCcw
} from 'lucide-react';
import './LearnSignsPage.css';

const ISL_LESSONS = [
  {
    id: 'hello',
    en: 'Hello',
    ml: 'നമസ്കാരം',
    category: 'Greetings',
    level: 'Beginner',
    icon: '👋',
    instruction: 'Raise your dominant hand to temple level with open palm facing outward, and wave smoothly from side to side.',
    culturalTip: 'Standard polite greeting in Indian culture and ISL.',
  },
  {
    id: 'good_morning',
    en: 'Good Morning',
    ml: 'സുപ്രഭാതം',
    category: 'Greetings',
    level: 'Beginner',
    icon: '🌅',
    instruction: 'Rest closed fingers near heart, then open palms upward while rising like the morning sun with a friendly nod.',
    culturalTip: 'Compound sign: combining the gesture for "Good" with "Sunrise".',
  },
  {
    id: 'thank_you',
    en: 'Thank You',
    ml: 'നന്ദി',
    category: 'Courtesies',
    level: 'Beginner',
    icon: '🙏',
    instruction: 'Touch fingertips of your dominant hand to your chin/lips, then extend your hand smoothly forward toward the person.',
    culturalTip: 'Shows deep respect and appreciation in ISL conversations.',
  },
  {
    id: 'good',
    en: 'Good',
    ml: 'നല്ലത്',
    category: 'Expressions',
    level: 'Beginner',
    icon: '👍',
    instruction: 'Place flat hand under chin and move it forward into a confident thumbs-up gesture.',
    culturalTip: 'Used frequently as agreement or approval.',
  },
  {
    id: 'i',
    en: 'I / Me',
    ml: 'ഞാൻ',
    category: 'Pronouns',
    level: 'Beginner',
    icon: '👤',
    instruction: 'Point index finger lightly toward the center of your chest with fingers curled.',
    culturalTip: 'Direct personal reference used in building sentences.',
  },
  {
    id: 'father',
    en: 'Father',
    ml: 'അച്ഛൻ',
    category: 'Family',
    level: 'Intermediate',
    icon: '👨',
    instruction: 'Form a gentle fist with index knuckle tapping the side of the upper lip or cheek where a mustache traditionally sits.',
    culturalTip: 'Culturally rooted gesture denoting male elders.',
  },
  {
    id: 'boy',
    en: 'Boy',
    ml: 'ആൺകുട്ടി',
    category: 'People',
    level: 'Intermediate',
    icon: '👦',
    instruction: 'Grasp the imaginary brim of a cap near your forehead and pull outward twice.',
    culturalTip: 'Refers to the traditional cap or visor silhouette.',
  },
  {
    id: 'girl',
    en: 'Girl',
    ml: 'പെൺകുട്ടി',
    category: 'People',
    level: 'Intermediate',
    icon: '👧',
    instruction: 'Trace your thumb tip along your jawline down toward the chin, representing a bonnet ribbon or earring.',
    culturalTip: 'Traditional ISL sign for young females.',
  },
  {
    id: 'bank',
    en: 'Bank',
    ml: 'ബാങ്ക്',
    category: 'Places',
    level: 'Intermediate',
    icon: '🏦',
    instruction: 'Make a counting gesture with thumb and fingers of dominant hand over a flat open non-dominant palm.',
    culturalTip: 'Represents monetary exchange and accounting.',
  },
  {
    id: 'time',
    en: 'Time',
    ml: 'സമയം',
    category: 'Daily Life',
    level: 'Beginner',
    icon: '⏱️',
    instruction: 'Tap the index finger of your dominant hand twice onto the wrist of your non-dominant arm as if pointing to a watch.',
    culturalTip: 'Universally recognized temporal question or statement.',
  },
];

const CATEGORIES = ['All', 'Greetings', 'Courtesies', 'Family', 'People', 'Places', 'Daily Life'];

const QUIZ_QUESTIONS = [
  {
    question: "What is the Malayalam translation for 'Thank You' in ISL?",
    options: ['നന്ദി', 'നമസ്കാരം', 'സുപ്രഭാതം', 'നല്ലത്'],
    correct: 0,
    hint: 'Fingertips to chin moving forward.'
  },
  {
    question: "Which gesture is signed by tapping your wrist twice?",
    options: ['Bank (ബാങ്ക്)', 'Time (സമയം)', 'Father (അച്ഛൻ)', 'Hello (ഹലോ)'],
    correct: 1,
    hint: 'Pointing to a watch on your wrist.'
  },
  {
    question: "What does the sign 'സുപ്രഭാതം' signify?",
    options: ['Good Night', 'Good Morning', 'Good Afternoon', 'Goodbye'],
    correct: 1,
    hint: 'A morning greeting as the sun rises.'
  }
];

export default function LearnSignsPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLesson, setActiveLesson] = useState(ISL_LESSONS[0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Filter lessons
  const filtered = ISL_LESSONS.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchQuery = !searchQuery ||
      item.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ml.includes(searchQuery) ||
      item.instruction.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  // Speak Malayalam text
  const speakText = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ml-IN';
      window.speechSynthesis.speak(utter);
    }
  };

  const handleAnswer = (optionIdx) => {
    if (quizAnswered) return;
    setSelectedAnswer(optionIdx);
    setQuizAnswered(true);
    if (optionIdx === QUIZ_QUESTIONS[quizIndex].correct) {
      setQuizScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setQuizAnswered(false);
    setQuizIndex((quizIndex + 1) % QUIZ_QUESTIONS.length);
  };

  return (
    <div className="learn-root">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="learn-header">
        <div>
          <div className="learn-badge">
            <BookOpen size={14} />
            <span>MOVA INTERACTIVE ACADEMY</span>
          </div>
          <h1 className="learn-title">Indian Sign Language Dictionary &amp; Practice</h1>
          <p className="learn-sub">
            Learn core ISL gestures with Malayalam and English meanings, step-by-step hand posture guides, and audio pronunciations.
          </p>
        </div>

        <button
          className="learn-btn-practice"
          onClick={() => navigate('/app/sign-to-text')}
        >
          <Video size={16} />
          <span>Launch Camera Practice</span>
        </button>
      </div>

      {/* ── Featured Study View & Quiz Split ────────────────── */}
      <div className="learn-hero-split">
        {/* Active Selected Sign Detailed Guide */}
        <div className="learn-detail-card">
          <div className="learn-detail-top">
            <div className="learn-detail-icon-wrap">
              <span className="learn-detail-emoji">{activeLesson.icon}</span>
            </div>
            <div className="learn-detail-headings">
              <div className="learn-detail-category">{activeLesson.category} • {activeLesson.level}</div>
              <div className="learn-detail-ml">{activeLesson.ml}</div>
              <div className="learn-detail-en">"{activeLesson.en}"</div>
            </div>
            <button
              className="learn-detail-speak"
              onClick={() => speakText(activeLesson.ml)}
              title="Pronounce in Malayalam"
            >
              <Volume2 size={20} />
            </button>
          </div>

          <div className="learn-guide-box">
            <h4 className="learn-guide-title">
              <CheckCircle2 size={16} className="text-blue" />
              How to perform this gesture:
            </h4>
            <p className="learn-guide-text">{activeLesson.instruction}</p>

            <div className="learn-tip-box">
              <strong>💡 Cultural Context: </strong>
              <span>{activeLesson.culturalTip}</span>
            </div>
          </div>

          <div className="learn-detail-footer">
            <span className="learn-detail-status">Ready to test?</span>
            <button
              className="learn-btn-try-camera"
              onClick={() => navigate('/app/sign-to-text')}
            >
              <span>Practice "{activeLesson.en}" on camera</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Quick Quiz Card */}
        <div className="learn-quiz-card">
          <div className="learn-quiz-top">
            <div className="learn-quiz-badge">
              <Award size={14} />
              <span>KNOWLEDGE CHECK</span>
            </div>
            <span className="learn-quiz-score">Score: {quizScore}</span>
          </div>

          <h3 className="learn-quiz-q">
            {QUIZ_QUESTIONS[quizIndex].question}
          </h3>

          <div className="learn-quiz-options">
            {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
              let btnClass = 'learn-quiz-opt';
              if (quizAnswered) {
                if (idx === QUIZ_QUESTIONS[quizIndex].correct) btnClass += ' correct';
                else if (idx === selectedAnswer) btnClass += ' wrong';
              }
              return (
                <button
                  key={opt}
                  className={btnClass}
                  onClick={() => handleAnswer(idx)}
                >
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="learn-quiz-result">
              <div className="learn-quiz-hint">
                💡 {QUIZ_QUESTIONS[quizIndex].hint}
              </div>
              <button className="learn-quiz-next" onClick={nextQuestion}>
                Next Question →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────── */}
      <div className="learn-filter-bar">
        <div className="learn-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`learn-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="learn-search-wrap">
          <Search size={15} className="learn-search-icon" />
          <input
            type="search"
            placeholder="Search signs by name or gesture…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="learn-search-input"
          />
        </div>
      </div>

      {/* ── Vocabulary Cards Grid ───────────────────────────── */}
      <div className="learn-grid">
        {filtered.map(item => {
          const isSelected = activeLesson.id === item.id;
          return (
            <div
              key={item.id}
              className={`learn-card ${isSelected ? 'learn-card--active' : ''}`}
              onClick={() => setActiveLesson(item)}
              role="button"
              tabIndex={0}
            >
              <div className="learn-card-top">
                <span className="learn-card-icon">{item.icon}</span>
                <span className="learn-card-pill">{item.category}</span>
              </div>

              <div className="learn-card-main">
                <div className="learn-card-ml">{item.ml}</div>
                <div className="learn-card-en">{item.en}</div>
              </div>

              <p className="learn-card-desc">{item.instruction}</p>

              <div className="learn-card-bottom">
                <button
                  className="learn-card-audio-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(item.ml);
                  }}
                  title="Speak in Malayalam"
                >
                  <Volume2 size={15} />
                  <span>Audio</span>
                </button>
                <span className="learn-card-select-label">
                  {isSelected ? 'Viewing' : 'Inspect →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
