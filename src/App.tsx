/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  GitBranch,
  Beaker,
  Award,
  BookMarked,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Timer,
  Plus,
  Trash2,
  FileText,
  Bookmark,
  Share2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Flame,
  Award as Trophy,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  Bot,
  Sparkles
} from 'lucide-react';
import { chaptersData } from './data/chaptersData';
import { Question, QuestionLevel, UserNote } from './types';
import ChapterIllustration from './components/ChapterIllustration';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'map' | 'connect' | 'simulator' | 'bank' | 'notebook'>('map');

  // Chapter Selection State
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const activeChapter = chaptersData.find(c => c.id === selectedChapterId) || chaptersData[0];

  // Derived Chapter Data
  const conceptNodes = activeChapter.conceptNodes;
  const crossLinks = activeChapter.crossLinks;
  const ironReactions = activeChapter.reactions || [];
  const questions = activeChapter.questions;

  // Concept Map Selection State
  const [selectedNodeId, setSelectedNodeId] = useState<string>(chaptersData[0].conceptNodes[0].id);
  const selectedNode = conceptNodes.find(n => n.id === selectedNodeId) || conceptNodes[0] || chaptersData[0].conceptNodes[0];

  // Cross-Chapter Connect Selection State
  const [selectedLinkId, setSelectedLinkId] = useState<string>(chaptersData[0].crossLinks[0].id);
  const selectedLink = crossLinks.find(l => l.id === selectedLinkId) || crossLinks[0] || chaptersData[0].crossLinks[0];

  // Iron Simulator State
  const [simulatorReactant, setSimulatorReactant] = useState<string>('Fe');
  // Get valid reactions for the selected reactant
  const availableReactions = ironReactions.filter(r => r.reactant === simulatorReactant);
  const [selectedReactionId, setSelectedReactionId] = useState<string>(availableReactions[0]?.id || '');

  // Update selected reaction when reactant changes
  useEffect(() => {
    const reactions = ironReactions.filter(r => r.reactant === simulatorReactant);
    if (reactions.length > 0) {
      setSelectedReactionId(reactions[0].id);
    } else {
      setSelectedReactionId('');
    }
  }, [simulatorReactant, ironReactions]);

  const activeReaction = ironReactions.find(r => r.id === selectedReactionId);

  // Question Bank State
  const [filterLevel, setFilterLevel] = useState<'all' | QuestionLevel>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [essayInputs, setEssayInputs] = useState<{ [key: string]: string }>({});
  const [revealedExplanations, setRevealedExplanations] = useState<{ [key: string]: boolean }>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);

  // Filtered Questions list
  const filteredQuestions = questions.filter(q => {
    const matchesLevel = filterLevel === 'all' || q.level === filterLevel;
    const matchesSection = filterSection === 'all' || q.section === filterSection;
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.explanation.learningOutcome && q.explanation.learningOutcome.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesSection && matchesSearch;
  });

  // Safe navigation inside filtered questions
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [filterLevel, filterSection, searchQuery]);

  // Synchronize selection states on chapter change
  useEffect(() => {
    if (conceptNodes.length > 0) {
      setSelectedNodeId(conceptNodes[0].id);
    }
    if (crossLinks.length > 0) {
      setSelectedLinkId(crossLinks[0].id);
    }
    setCurrentQuestionIndex(0);
    setFilterSection('all');
  }, [selectedChapterId, conceptNodes, crossLinks]);

  const activeQuestion = filteredQuestions[currentQuestionIndex] || null;

  // Study Notebook & Timer State
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(1500); // 25 minutes default
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
    return [
      { role: 'model', text: 'أهلاً بك يا بطل! 🧪 أنا الأستاذ مستشارك الكيميائي الذكي ومساعدك الشخصي للثانوية العامة لعام 2026.\n\nيمكنك سؤالي عن أي معادلة كيميائية، أو قاعدة في المنهج (مثل قاعدة لوشاتيليه أو السلسلة الكهرومائية)، أو اطلب مني تريكات الباب الأول والثاني، وسأجيبك بأسهل طريقة ممكنة مع توضيح "استبعاد البدائل"!' }
    ];
  });
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatOpen]);

  const handleSendChatMessage = async (customMessage?: string) => {
    const textToSend = customMessage || chatMessage;
    if (!textToSend.trim() || chatLoading) return;

    const newUserMsg = { role: 'user' as const, text: textToSend };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    if (!customMessage) {
      setChatMessage('');
    }
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error('فشلت عملية الاتصال بالخادم.');
      }

      const data = await response.json();
      setChatHistory([...updatedHistory, { role: 'model', text: data.text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory([...updatedHistory, { 
        role: 'model', 
        text: 'عذراً يا بطل، واجهت صعوبة في الاتصال بمستشار الكيمياء الذكي. يرجى التحقق من الخادم أو المحاولة لاحقاً.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Load notes and bookmarks from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('thanaweya_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // Seed initial helper note
      const seedNote: UserNote = {
        id: 'seed-1',
        content: 'ملاحظة هامة: تسخين كبريتات الحديد الثنائية يعطي دائماً أكسيد الحديد الثلاثي الأحمر (وليس الثنائي)، لأن الكبريتات الثلاثية المتكونة تتفكك وتتصاعد غازات SO2 و SO3 التي تؤكسد FeO مباشرة.',
        timestamp: new Date().toLocaleString('ar-EG')
      };
      setNotes([seedNote]);
      localStorage.setItem('thanaweya_notes', JSON.stringify([seedNote]));
    }

    const savedBookmarks = localStorage.getItem('thanaweya_bookmarks');
    if (savedBookmarks) {
      setBookmarkedQuestions(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save notes helper
  const saveNotes = (updatedNotes: UserNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('thanaweya_notes', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: UserNote = {
      id: Date.now().toString(),
      content: newNoteText,
      timestamp: new Date().toLocaleString('ar-EG')
    };
    const updated = [newNote, ...notes];
    saveNotes(updated);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  // Bookmark Toggle Helper
  const toggleBookmark = (qId: string) => {
    let updated: string[];
    if (bookmarkedQuestions.includes(qId)) {
      updated = bookmarkedQuestions.filter(id => id !== qId);
    } else {
      updated = [...bookmarkedQuestions, qId];
    }
    setBookmarkedQuestions(updated);
    localStorage.setItem('thanaweya_bookmarks', JSON.stringify(updated));
  };

  // Timer Tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Sound or vibration could be triggered, switch modes
            const nextMode = timerMode === 'study' ? 'break' : 'study';
            setTimerMode(nextMode);
            setTimerRunning(false);
            return nextMode === 'study' ? 1500 : 300; // 25m study or 5m break
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerMode]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerMode === 'study' ? 1500 : 300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Score Calculations (Active Chapter Specific)
  const solvedQuestionsCount = Object.keys(userAnswers).filter(qId => questions.some(q => q.id === qId)).length;
  const correctQuestionsCount = Object.keys(userAnswers).reduce((acc, qId) => {
    const q = questions.find(question => question.id === qId);
    if (q && q.correctOption === userAnswers[qId]) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const totalPossibleMcqs = questions.filter(q => q.type === 'mcq').length;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Upper Status Ribbon / Ministerial theme decoration */}
      <div className="bg-sky-950 text-white text-xs py-2 px-4 flex flex-wrap justify-between items-center border-b border-sky-900 select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>وزارة التربية والتعليم المصرية - نظام التقييم الحديث (نواتج التعلم)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>المستشار التربوي الأول لمادة الكيمياء</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">المراجعة النهائية الشاملة لعام 2026</span>
        </div>
      </div>

      {/* Main Premium Banner */}
      <header className="bg-white border-b border-slate-200 py-6 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-600 text-white rounded-xl shadow-md shadow-sky-100">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                كورس المراجعة النهائية الذكي في الكيمياء
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                <span className="font-semibold text-sky-600">{activeChapter.title}</span> • {activeChapter.subtitle}
              </p>
            </div>
          </div>


          {/* Quick Stats Summary */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg px-4 py-2 text-right">
              <div className="text-[10px] font-medium text-emerald-800">أسئلة الامتحانات المحلولة</div>
              <div className="text-lg font-bold text-emerald-700">{solvedQuestionsCount} / {questions.length}</div>
            </div>
            <div className="bg-sky-50/70 border border-sky-100 rounded-lg px-4 py-2 text-right">
              <div className="text-[10px] font-medium text-sky-800">معدل الإجابة الصحيحة</div>
              <div className="text-lg font-bold text-sky-700">
                {solvedQuestionsCount > 0 ? `${Math.round((correctQuestionsCount / solvedQuestionsCount) * 100)}%` : '0%'}
              </div>
            </div>
            <button
              onClick={() => {
                setUserAnswers({});
                setEssayInputs({});
                setRevealedExplanations({});
                alert('تم تصفير تقدمك بنجاح للبدء من جديد!');
              }}
              title="إعادة تعيين التقدم والحلول"
              className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 transition-all cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chapter Selection Panel */}
      <div className="bg-slate-100 border-b border-slate-200 py-4 px-6 select-none">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-sky-700" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">اختر الباب الدراسي للمراجعة الشاملة:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {chaptersData.map((chap) => {
              const isSelected = selectedChapterId === chap.id;
              return (
                <button
                  key={chap.id}
                  onClick={() => setSelectedChapterId(chap.id)}
                  className={`text-right p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                    isSelected
                      ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-100'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`text-[9px] font-bold ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>الباب {chap.id}</span>
                  <span className="text-xs font-extrabold truncate leading-tight">{chap.title.split(': ')[1]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <nav className="bg-slate-100 border-b border-slate-200 px-4 select-none">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-2 py-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-100'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            الخريطة الذهنية والمفاهيم
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-100'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            مفاتيح الربط المتداخلة
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-100'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Beaker className="w-4 h-4" />
            محاكي تفاعلات الحديد
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-100'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            بنك الأسئلة والامتحانات
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'notebook'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-100'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            مفكرة الطالب المؤقت الذكي
            {notes.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-sans animate-pulse">
                {notes.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        
        {/* TAB 1: CONCEPT MAPPING */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 fade-in-up">
            
            {/* Sidebar List of Concepts */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">مواضيع {activeChapter.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  اختر موضوعاً لاستعراض ملخص نواتج التعلم والروابط الهامة المرتبطة به.
                </p>
                <div className="flex flex-col gap-2">
                  {conceptNodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full text-right p-3 rounded-lg text-xs font-semibold transition-all flex items-start gap-2 border cursor-pointer ${
                        selectedNodeId === node.id
                          ? 'bg-sky-50 text-sky-950 border-sky-300'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${selectedNodeId === node.id ? 'bg-sky-600' : 'bg-slate-300'}`}></span>
                      <span className="leading-normal">{node.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* High Yield Advice Card */}
              <div className="bg-sky-950 text-white p-5 rounded-xl border border-sky-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 translate-x-[-15%] translate-y-[-15%] w-32 h-32 rounded-full bg-sky-800/10"></div>
                <div className="relative z-10 flex items-start gap-3">
                  <div className="p-1.5 bg-sky-800 text-sky-200 rounded-lg mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-200 uppercase mb-1">توجيه المستشار لمادة الكيمياء</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      امتحانات الوزارة تعتمد بالأساس على <strong className="text-white">الفهم العميق واستبعاد البدائل الخاطئة</strong>. 
                      عند الحل، ركّز على ناتج التعلم لكل سؤال، واستخدم مفاتيح الربط لتفسير التحولات المعقدة، ودوّن تريكاتك بمفكرتك الذكية!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Concept Details Area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Cinematic explanation and intro script */}
              <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-[20%] translate-y-[20%] w-64 h-64 rounded-full bg-sky-800/10 blur-3xl"></div>
                <div className="relative z-10 space-y-4 text-right">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      مقدمة المستشار التعليمي 🎙️
                    </span>
                    <h3 className="text-sm font-extrabold text-sky-300">الشرح البيداغوجي الموجه - منهج {activeChapter.title}</h3>
                  </div>
                  <div className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {activeChapter.voiceoverIntro.split('\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('[توجيه')) {
                        return (
                          <div key={pIdx} className="my-3 p-3.5 bg-sky-900/40 border border-sky-800/60 rounded-xl text-[11px] text-amber-200 flex items-center gap-2">
                            <span className="text-base">🎨</span>
                            <span className="font-bold">{paragraph}</span>
                          </div>
                        );
                      }
                      return <p key={pIdx} className="mb-2">{paragraph}</p>;
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Pedagogical Diagrams & Illustrations */}
              <ChapterIllustration 
                chapterId={activeChapter.id} 
                simulatorReactant={simulatorReactant}
                activeReaction={activeReaction}
              />

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative">
                <div className="absolute top-0 right-1/4 left-1/4 h-1 bg-gradient-to-r from-transparent via-sky-600 to-transparent"></div>
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">{selectedNode.title}</h2>
                  <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    نواتج التعلم والمفاهيم
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium border-r-2 border-sky-500 pr-3 py-1">
                  {selectedNode.summary}
                </p>

                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">تحليل الأفكار الجوهرية (Focus Points)</h3>
                <div className="space-y-4">
                  {selectedNode.details.map((detail, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl transition-all flex items-start gap-3"
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CROSS-CHAPTER CONNECTIVITY */}
        {activeTab === 'connect' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 fade-in-up">
            
            {/* Sidebar of links */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">مفاتيح الربط التكاملي</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  امتحانات الوزارة الحديثة لا تعزل الأبواب عن بعضها. إليك أهم نقاط الربط بين الباب الأول وبقية الأبواب:
                </p>
                <div className="flex flex-col gap-2">
                  {crossLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => setSelectedLinkId(link.id)}
                      className={`w-full text-right p-3.5 rounded-lg text-xs font-semibold transition-all flex flex-col gap-1 border cursor-pointer ${
                        selectedLinkId === link.id
                          ? 'bg-sky-50 text-sky-950 border-sky-300'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="font-bold text-slate-900 leading-normal">{link.title}</span>
                      <span className="text-[10px] text-sky-600">{link.targetChapter}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning/Exam Alert for Multi-chapter links */}
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 mb-1">انتبه جيداً لمفاتيح نواتج التعلم!</h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      الأسئلة التي تدمج الباب الأول (العناصر الانتقالية) بالباب الثاني (الترسيب والكواشف) والباب الخامس (العضوية مثل الأوكسالات) تشكل ما يقرب من 40% من درجات أسئلة الباب الأول في امتحانات آخر العام!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Link details */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedLink.title}</h2>
                    <span className="text-xs text-slate-500 mt-1 block">
                      مسار الربط: <span className="font-medium text-slate-700">{selectedLink.sourceChapter}</span> ➔ <span className="font-semibold text-sky-600">{selectedLink.targetChapter}</span>
                    </span>
                  </div>
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-wider">
                    فكرة ربط فكري عميق
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Explanation Narrative */}
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">الفكرة العلمية وقناة الاتصال (Concept Bridge)</h3>
                    <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-100 text-sm text-slate-700 leading-relaxed font-normal">
                      {selectedLink.conceptConnection}
                    </div>
                  </div>

                  {/* Scientific Explanation */}
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">التفسير والتحليل الأكاديمي الشامل (Academic Analysis)</h3>
                    <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line font-normal">
                      {selectedLink.scientificExplanation}
                    </div>
                  </div>

                  {/* Practical Example / Sample question */}
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      مثال تطبيقي ذو معامل صعوبة مرتفع (High-Yield Practice)
                    </h3>
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {selectedLink.practicalExample}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: IRON REACTION SIMULATOR */}
        {activeTab === 'simulator' && (
          ironReactions.length === 0 ? (
            <div className="lg:col-span-12 w-full bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4 shadow-xs">
              <Beaker className="w-16 h-16 text-sky-600 animate-pulse" />
              <h3 className="text-base font-extrabold text-slate-900">مختبر المحاكاة الافتراضي متاح للباب الأول</h3>
              <p className="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed font-normal">
                مختبر التفاعلات التفاعلي والمحاكاة الفورية مصممان خصيصاً لمخططات الحديد وأكاسيده المعقدة والتحويلات الحرارية في الباب الأول. 
                <br />
                أما الباب الحالي ({activeChapter.title})، فيرتكز على المسائل الرياضية، وقوانين الاتزان، وجهود الأقطاب الكهربية، والتشاكل الأيزوميري العضوي، وكلها مغطاة ومفصلة بالكامل في تبويبات <span className="text-sky-600 font-bold">الخريطة الذهنية</span> و<span className="text-sky-600 font-bold">مفاتيح الربط</span> و<span className="text-sky-600 font-bold">بنك الأسئلة الشامل</span>!
              </p>
              <button
                onClick={() => {
                  setSelectedChapterId(1);
                  setActiveTab('simulator');
                }}
                className="px-5 py-2.5 bg-sky-600 text-white hover:bg-sky-700 transition-all font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                انتقل لمختبر تفاعلات الحديد (الباب الأول) 🧪
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 fade-in-up">
              
              {/* Control Panel */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <Beaker className="w-5 h-5 text-sky-600" />
                    <h3 className="text-sm font-bold text-slate-900">محاكي مختبر كيمياء الحديد</h3>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    الكثير من تريكات امتحانات الثانوية تدور حول تحويلات الحديد. حدد المادة الابتدائية ثم ظروف التفاعل لاستعراض التفاعل المتوازن ومكامن الخدعة الامتحانية.
                  </p>

                  {/* Step 1: Select Reactant */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">1. المادة الابتدائية (Starting Compound)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'Fe', name: 'حديد (Fe)' },
                        { val: 'FeC2O4 (أوكسالات الحديد II)', name: 'أوكسالات الحديد (II)' },
                        { val: 'FeSO4', name: 'كبريتات الحديد (II)' },
                        { val: 'Fe3O4 (أكسيد مغناطيسي)', name: 'أكسيد مغناطيسي (Fe3O4)' },
                        { val: 'Fe2O3', name: 'أكسيد الحديد III (Fe2O3)' }
                      ].map((comp) => (
                        <button
                          key={comp.val}
                          onClick={() => setSimulatorReactant(comp.val)}
                          className={`text-right p-2.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                            simulatorReactant === comp.val
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-100'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {comp.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Reagent / Conditions */}
                  {availableReactions.length > 0 ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">2. الكاشف أو ظروف التفاعل المتاحة (Reagent / Condition)</label>
                      <div className="space-y-2">
                        {availableReactions.map((reaction) => (
                          <button
                            key={reaction.id}
                            onClick={() => setSelectedReactionId(reaction.id)}
                            className={`w-full text-right p-3 rounded-lg text-xs font-semibold transition-all border flex items-center justify-between cursor-pointer ${
                              selectedReactionId === reaction.id
                                ? 'bg-sky-50 text-sky-950 border-sky-300'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="leading-normal">{reaction.reagent}</span>
                            <ChevronLeft className={`w-4 h-4 transition-transform ${selectedReactionId === reaction.id ? 'translate-x-[-4px]' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-100">
                      <AlertCircle className="w-4 h-4" />
                      <span>لا توجد تفاعلات مضافة حالياً لهذه المادة. جرب مادة أخرى.</span>
                    </div>
                  )}
                </div>

                {/* General Reactant Summary Table */}
                <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-extrabold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-sky-400" />
                    قواعد درجات الحرارة لاختزال أكاسيد الحديد (بالغة الأهمية)
                  </h4>
                  <ul className="text-xs space-y-2 leading-relaxed">
                    <li className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-amber-400 font-semibold font-mono">230°C - 300°C</span>
                      <span>يعطي أكسيد حديد مغناطيسي <span className="font-mono text-white text-[11px]">Fe3O4</span></span>
                    </li>
                    <li className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-amber-400 font-semibold font-mono">400°C - 700°C</span>
                      <span>يعطي أكسيد حديد ثنائي <span className="font-mono text-white text-[11px]">FeO</span></span>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span className="text-emerald-400 font-semibold font-mono">&gt; 700°C</span>
                      <span>يعطي فلز الحديد الحر <span className="font-mono text-white text-[11px]">Fe</span> (الأفران)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Simulation Results Screen */}
              <div className="lg:col-span-7">
                {activeReaction ? (
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase">الناتج الكيميائي المسجل</h2>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">{activeReaction.products}</p>
                      </div>
                      <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-sky-100 font-mono">
                        {activeReaction.reactant} ➔ {activeReaction.products.split(' + ')[0]}
                      </span>
                    </div>

                    {/* Balanced Equation Block */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">المعادلة الكيميائية الموزونة والمستقرة</h3>
                      <div className="p-4 bg-slate-950 text-emerald-400 rounded-xl border border-slate-900 font-mono text-sm md:text-base text-center font-bold tracking-wide">
                        {activeReaction.balancedEquation}
                      </div>
                    </div>

                    {/* Visual Observations */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        الملاحظات المرئية والتأثيرات (Observations)
                      </h3>
                      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
                        {activeReaction.observations}
                      </div>
                    </div>

                    {/* Exam Trick Alert - Highlighted */}
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl">
                      <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        تريكة الامتحان الكامنة (The Trick & Pitfall)
                      </h3>
                      <p className="text-xs md:text-sm text-amber-800 leading-relaxed font-normal">
                        {activeReaction.examTrick}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
                    <Beaker className="w-12 h-12 text-slate-300 animate-bounce" />
                    <p className="text-slate-500 font-semibold text-xs">برجاء تحديد مادة ابتدائية وظرف تفاعل لعرض المحاكاة الفورية.</p>
                  </div>
                )}
              </div>

            </div>
          )
        )}

        {/* TAB 4: INTERACTIVE QUESTION BANK */}
        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 fade-in-up">
            
            {/* Filters panel */}
            <div className="lg:col-span-12 flex flex-col md:flex-row flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الناتج المستهدف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-10 py-1.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 font-semibold">مستوى المعرفة:</span>
                </div>
                
                {/* Level buttons */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 select-none">
                  {[
                    { val: 'all', name: 'الكل' },
                    { val: 'past_exam', name: 'امتحانات سابقة' },
                    { val: 'medium', name: 'تطبيق وفهم' },
                    { val: 'advanced', name: 'خدع متقدمة' }
                  ].map((level) => (
                    <button
                      key={level.val}
                      onClick={() => setFilterLevel(level.val as any)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        filterLevel === level.val
                          ? 'bg-white text-sky-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>

                {/* Section selection */}
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-lg p-1 px-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="all">كل الأقسام</option>
                  <option value="الأهمية الاقتصادية">الأهمية الاقتصادية</option>
                  <option value="الخواص العامة">الخواص العامة</option>
                  <option value="استخلاص الحديد من خاماته والسبائك">استخلاص وتصنيع السبائك</option>
                  <option value="تفاعلات الحديد وأكاسيده">تفاعلات الحديد والأكاسيد</option>
                </select>
              </div>

              {/* Bookmarked Questions Counter */}
              <div className="text-xs text-slate-500 font-semibold">
                المسجلة بالمفضلة: <span className="font-bold text-sky-600">{bookmarkedQuestions.length}</span>
              </div>
            </div>

            {/* Questions area */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {filteredQuestions.length > 0 && activeQuestion ? (
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
                  
                  {/* Question Header */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md">
                        سؤال {currentQuestionIndex + 1} من {filteredQuestions.length}
                      </span>
                      {activeQuestion.level === 'past_exam' && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          امتحان رسمي • {activeQuestion.yearAndSession}
                        </span>
                      )}
                      {activeQuestion.level === 'medium' && (
                        <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold px-2 py-1 rounded-md">
                          مستوى تطبيق متوسط
                        </span>
                      )}
                      {activeQuestion.level === 'advanced' && (
                        <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          مستوى متميز (تريكة متقدمة)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBookmark(activeQuestion.id)}
                        className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                          bookmarkedQuestions.includes(activeQuestion.id)
                            ? 'bg-amber-50 border-amber-300 text-amber-500'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title="أضف السؤال للمفضلة للمراجعة لاحقاً"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
                    {activeQuestion.text}
                  </div>

                  {/* MCQ Options */}
                  {activeQuestion.type === 'mcq' && activeQuestion.options && (
                    <div className="grid grid-cols-1 gap-3 mt-2 select-none">
                      {(Object.keys(activeQuestion.options) as ('A' | 'B' | 'C' | 'D')[]).map((optionKey) => {
                        const isSelected = userAnswers[activeQuestion.id] === optionKey;
                        const isCorrect = activeQuestion.correctOption === optionKey;
                        const hasAnswered = userAnswers[activeQuestion.id] !== undefined;

                        let btnStyle = 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700';
                        if (isSelected) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
                          } else {
                            btnStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                          }
                        } else if (hasAnswered && isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50/50 text-emerald-950';
                        }

                        return (
                          <button
                            key={optionKey}
                            disabled={hasAnswered}
                            onClick={() => {
                              setUserAnswers(prev => ({ ...prev, [activeQuestion.id]: optionKey }));
                              setRevealedExplanations(prev => ({ ...prev, [activeQuestion.id]: true }));
                            }}
                            className={`w-full text-right p-4 rounded-xl border text-xs md:text-sm font-semibold transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-extrabold ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {optionKey}
                            </span>
                            <span className="leading-normal pt-0.5">{activeQuestion.options[optionKey]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay Short Input */}
                  {activeQuestion.type === 'essay' && (
                    <div className="mt-2 space-y-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase">صندوق إجابتك المقترحة ومسار الحل:</label>
                      <textarea
                        value={essayInputs[activeQuestion.id] || ''}
                        onChange={(e) => setEssayInputs(prev => ({ ...prev, [activeQuestion.id]: e.target.value }))}
                        placeholder="اكتب خطوات تفكيرك ومعادلتك الرياضية/الكيميائية لمقارنتها مع الحل النموذجي المفصل للمستشار..."
                        rows={4}
                        className="w-full p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white text-xs md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans leading-relaxed resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => setRevealedExplanations(prev => ({ ...prev, [activeQuestion.id]: true }))}
                          className="px-5 py-2.5 bg-sky-600 text-white hover:bg-sky-700 transition-all font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          عرض الحل المفسر والتعويض الرياضي فوراً
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DEEP SCIENTIFIC EXPLANATION PANEL */}
                  {revealedExplanations[activeQuestion.id] && (
                    <div className="mt-4 border-t border-slate-100 pt-5 space-y-4 fade-in-up">
                      
                      {/* Standard Rationale Header */}
                      <div className="flex items-start gap-2 bg-slate-50 border border-slate-200/60 rounded-xl p-4">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 mb-1">التفسير الأكاديمي الحاسم والحل النموذجي:</h4>
                          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                            {activeQuestion.explanation.rationale}
                          </p>
                        </div>
                      </div>

                      {/* EXCLUSIONS (The direct request of user to train on option exclusions) */}
                      {activeQuestion.type === 'mcq' && activeQuestion.explanation.alternatives && (
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">تحليل استبعاد البدائل الخاطئة (طريقة الاستبعاد الذكي):</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(Object.keys(activeQuestion.explanation.alternatives) as ('A' | 'B' | 'C' | 'D')[]).map((altKey) => (
                              <div
                                key={altKey}
                                className={`p-3 rounded-lg border text-[11px] leading-relaxed font-normal ${
                                  activeQuestion.correctOption === altKey
                                    ? 'bg-emerald-50/30 border-emerald-100 text-emerald-800'
                                    : 'bg-slate-50/50 border-slate-200/50 text-slate-600'
                                }`}
                              >
                                <span className="font-bold">{altKey}:</span> {activeQuestion.explanation.alternatives[altKey]}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Learning Outcome Block */}
                      <div className="p-3 bg-sky-50 text-sky-800 border border-sky-100 rounded-xl text-xs flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        <span className="font-medium">
                          <strong className="font-extrabold">ناتج التعلم المستهدف:</strong> {activeQuestion.explanation.learningOutcome}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Navigation Footer for Question */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                      السابق
                    </button>
                    <span className="text-xs font-bold text-slate-500">
                      مجموعة تصفية الفرز: {filteredQuestions.length} سؤال
                    </span>
                    <button
                      disabled={currentQuestionIndex === filteredQuestions.length - 1}
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
                  <HelpCircle className="w-12 h-12 text-slate-300 animate-pulse" />
                  <p className="text-slate-500 font-semibold text-xs">لا توجد أسئلة تطابق الفلاتر المحددة حالياً. حاول تغيير التصفية.</p>
                </div>
              )}
            </div>

            {/* Performance Sidebar & Mini stats */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Score card / Progress dashboard */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">أدائك في المراجعة الحالية</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">الامتحانات المحلولة</div>
                    <div className="text-2xl font-black text-sky-950 mt-1">{solvedQuestionsCount}</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">الحلول الصحيحة</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{correctQuestionsCount}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>نسبة الإجابة على الأسئلة</span>
                    <span>{Math.round((solvedQuestionsCount / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-sky-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(solvedQuestionsCount / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Learning Outcomes advice based on answers */}
                <p className="text-xs text-slate-500 leading-relaxed font-normal bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                  {solvedQuestionsCount > 0
                    ? `لقد أجبت بنجاح على ${correctQuestionsCount} من إجمالي ${solvedQuestionsCount} سؤال. استمر في التدرب واستخدم زر المفضلة للاحتفاظ بالأفكار الالتفافية!`
                    : 'ابدأ حل أسئلة البنك والامتحانات لتقييم مستواك الفعلي في نواتج تعلم عناصر السلسلة الأولى.'}
                </p>
              </div>

              {/* Bookmarked Questions Quick-list */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
                  <h3 className="text-sm font-bold text-slate-900">الأسئلة المحفوظة ({bookmarkedQuestions.length})</h3>
                </div>

                {bookmarkedQuestions.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {bookmarkedQuestions.map((qId, idx) => {
                      const q = questions.find(question => question.id === qId);
                      if (!q) return null;
                      return (
                        <button
                          key={qId}
                          onClick={() => {
                            // Find index of this question in filtered questions, or switch filters to view it
                            setFilterLevel('all');
                            setFilterSection('all');
                            const qIdxInFullList = questions.findIndex(x => x.id === qId);
                            if (qIdxInFullList !== -1) {
                              setCurrentQuestionIndex(qIdxInFullList);
                            }
                          }}
                          className="w-full text-right p-2.5 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all block truncate font-medium text-slate-700 cursor-pointer"
                        >
                          {idx + 1}. {q.text}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-normal text-center py-4">لا توجد أسئلة في المفضلة حالياً.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: STUDY DECK & TIMER */}
        {activeTab === 'notebook' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 fade-in-up">
            
            {/* Interactive Pomodoro Timer Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
                
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 w-full justify-center mb-4">
                  <Timer className="w-5 h-5 text-sky-600 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900">مؤقت المذاكرة الذكي (Thanaweya Timer)</h3>
                </div>

                {/* Mode indicators */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 mb-6 w-full max-w-xs">
                  <button
                    disabled={timerRunning}
                    onClick={() => {
                      setTimerMode('study');
                      setTimeLeft(1500);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      timerMode === 'study' ? 'bg-sky-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    جلسة تركيز (25 د)
                  </button>
                  <button
                    disabled={timerRunning}
                    onClick={() => {
                      setTimerMode('break');
                      setTimeLeft(300);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      timerMode === 'break' ? 'bg-sky-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    استراحة قصيرة (5 د)
                  </button>
                </div>

                {/* Clockface display */}
                <div className="w-44 h-44 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50 shadow-inner relative mb-6">
                  {/* Progress arc (simulated border with absolute ring or simple pulse) */}
                  <div className={`absolute inset-0 rounded-full border-2 border-sky-600/20 ${timerRunning ? 'animate-ping' : ''}`}></div>
                  
                  <div className="text-3xl font-black font-mono text-slate-800 relative z-10">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 relative z-10">
                    {timerMode === 'study' ? 'وقت التركيز والربط' : 'استراحة مستحقة'}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2 w-full justify-center">
                  <button
                    onClick={toggleTimer}
                    className={`px-6 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all text-white cursor-pointer ${
                      timerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {timerRunning ? 'إيقاف مؤقت' : 'ابدأ الجلسة الآن'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-4 py-2.5 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                  >
                    إعادة ضبط
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mt-4">
                  *يقترح المستشار مذاكرة 25 دقيقة لحفظ الأفكار المتداخلة تليها 5 دقائق ترفيه ذهني لترسيخ الذاكرة طويلة المدى.
                </p>
              </div>
            </div>

            {/* Notebook / Memo deck */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-slate-900">مذكرة الكيميائي المتميز الخاصة بك</h2>
                    <p className="text-xs text-slate-500 mt-1">سجّل خلاصة تحليلاتك الشخصية وملاحظات المستشار التي استنبطتها اليوم.</p>
                  </div>
                  <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-3 py-1 rounded-full">
                    مستند الحفظ المحلي الذاتي
                  </span>
                </div>

                {/* Add Note Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase">ملاحظة جديدة (تثبت في متصفحك):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="مثال: تسخين برادة الحديد مع الكبريت يعطي FeS بينما مع الكلور يعطي FeCl3 لأن الكلور مؤكسد أقوى..."
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white text-xs md:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNote();
                      }}
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 bg-sky-600 text-white hover:bg-sky-700 transition-all font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة الملاحظة
                    </button>
                  </div>
                </div>

                {/* Notes list */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">مذكراتك النشطة ({notes.length})</h3>
                  {notes.length > 0 ? (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group hover:bg-slate-100/50 transition-all"
                        >
                          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium pl-8">
                            {note.content}
                          </p>
                          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 border-t border-slate-200/50 pt-2">
                            <span>تاريخ التدوين: {note.timestamp}</span>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-500 hover:text-red-700 transition-all font-bold cursor-pointer"
                              title="حذف هذه الملاحظة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 leading-normal text-center py-6">مذكرتك فارغة حالياً. اكتب فكرة أو معادلة لتثبيتها!</p>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-right">
            <div className="font-bold text-slate-100 text-sm">أكاديمية الكيمياء للثانوية العامة المصرية</div>
            <p className="text-slate-500 mt-1">تطوير مستمر للأدوات الرقمية المعتمدة لتمكين الطالب من الفهم العميق ونواتج التعلم.</p>
          </div>
          <div className="flex items-center gap-4">
            <span>جميع الحقوق محفوظة © 2026</span>
            <span>•</span>
            <span className="text-sky-400 font-semibold cursor-pointer" onClick={() => setActiveTab('map')}>رابط العودة للخريطة</span>
          </div>
        </div>
      </footer>

      {/* FLOATING AI CHEMISTRY ASSISTANT (CHATBOT) */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end gap-3 text-right">
        {/* Chat Dialog Window */}
        {isChatOpen && (
          <div className="w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <button 
                onClick={() => {
                  setChatHistory([
                    { role: 'model', text: 'أهلاً بك يا بطل! 🧪 أنا الأستاذ مستشارك الكيميائي الذكي ومساعدك الشخصي للثانوية العامة لعام 2026.\n\nيمكنك سؤالي عن أي معادلة كيميائية، أو قاعدة في المنهج (مثل قاعدة لوشاتيليه أو السلسلة الكهرومائية)، أو اطلب مني تريكات الباب الأول والثاني، وسأجيبك بأسهل طريقة ممكنة مع توضيح "استبعاد البدائل"!' }
                  ]);
                }}
                className="text-[10px] text-red-400 hover:text-red-300 bg-red-950/20 px-2 py-1 rounded border border-red-900/30 cursor-pointer"
                title="إعادة ضبط المحادثة"
              >
                مسح السجل
              </button>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <h4 className="text-xs font-black text-white flex items-center gap-1 justify-end">
                    الأستاذ في الكيمياء <Bot className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold block">مستشارك الذكي لمنهج 2026 🎓</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/70 scrollbar-thin scrollbar-thumb-slate-800">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div 
                    className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-amber-500 text-slate-950 rounded-tl-xs font-semibold' 
                        : 'bg-slate-900 text-slate-100 border border-slate-800/60 rounded-tr-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-600 mt-0.5 px-1 font-mono">
                    {msg.role === 'user' ? 'أنت' : 'الأستاذ'}
                  </span>
                </div>
              ))}
              
              {chatLoading && (
                <div className="self-start flex flex-col items-start max-w-[85%]">
                  <div className="p-3 bg-slate-900 text-slate-400 border border-slate-800/60 rounded-2xl rounded-tr-xs text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] text-slate-500 font-semibold mr-1">المستشار يفكّر...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Chips Row */}
            <div className="bg-slate-950 px-3 py-2 border-t border-slate-800 flex gap-1.5 overflow-x-auto whitespace-nowrap select-none scrollbar-none">
              {[
                'تريكة كبريتات الحديد II',
                'تمييز الكربونات والبيكربونات',
                'شرح استبعاد البدائل',
                'قاعدة لوشاتيليه'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendChatMessage(chip)}
                  disabled={chatLoading}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-amber-400 border border-slate-800 rounded-full transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChatMessage();
                }}
                disabled={chatLoading}
                placeholder="اسأل الأستاذ في الكيمياء..."
                className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-500/50 transition-all text-right"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={chatLoading || !chatMessage.trim()}
                className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Circular Floating Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all text-slate-950 hover:shadow-orange-500/20 duration-300 relative border border-amber-400/30 cursor-pointer"
          title="اسأل الأستاذ في الكيمياء"
        >
          <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping -z-10" />
          {isChatOpen ? (
            <X className="w-6 h-6 text-slate-950" />
          ) : (
            <MessageSquare className="w-6 h-6 text-slate-950" />
          )}
        </button>
      </div>
    </div>
  );
}
