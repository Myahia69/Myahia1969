import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Flame, Lightbulb, AlertTriangle, Info, Pipette, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { ironReactions } from '../data/chapter1Data';

interface ChapterIllustrationProps {
  chapterId: number;
  simulatorReactant?: string;
  activeReaction?: any;
}

export default function ChapterIllustration({ chapterId, simulatorReactant, activeReaction }: ChapterIllustrationProps) {
  // Sub-tab for Chapter 1 (orbitals vs reaction flow chart)
  const [c1ActiveSubTab, setC1ActiveSubTab] = useState<'reactions' | 'orbitals'>('reactions');
  
  // Local state for iron reactions flow in case viewed from mental map
  const [localReactant, setLocalReactant] = useState<string>('Fe');
  const [localReactionId, setLocalReactionId] = useState<string>('reac_1');

  // Sync with simulator props if provided
  useEffect(() => {
    if (simulatorReactant) {
      setLocalReactant(simulatorReactant);
      // Pick first reaction for this reactant
      const relevant = ironReactions.filter(r => r.reactant === simulatorReactant);
      if (relevant.length > 0) {
        setLocalReactionId(relevant[0].id);
      }
    }
  }, [simulatorReactant]);

  useEffect(() => {
    if (activeReaction) {
      setLocalReactionId(activeReaction.id);
      setLocalReactant(activeReaction.reactant);
    }
  }, [activeReaction]);

  // 1. Chapter 1 States (Chromium vs Copper orbital jump)
  const [c1Metal, setC1Metal] = useState<'Cr' | 'Cu'>('Cr');
  const [c1Jumped, setC1Jumped] = useState<boolean>(false);
  const [c1IsAnimating, setC1IsAnimating] = useState<boolean>(false);

  // 2. Chapter 2 States (Precipitates & Gas)
  const [c2SelectedTest, setC2SelectedTest] = useState<'CO3' | 'Fe2' | 'Fe3' | 'Al3'>('CO3');
  const [c2AddedReagent, setC2AddedReagent] = useState<boolean>(false);
  const [c2ExcessAdded, setC2ExcessAdded] = useState<boolean>(false);
  const [c2IsDropping, setC2IsDropping] = useState<boolean>(false);

  // 3. Chapter 3 States (Le Chatelier balance)
  const [c3ReactantConc, setC3ReactantConc] = useState<number>(50); // 50 is normal
  const [c3Temp, setC3Temp] = useState<'normal' | 'heating' | 'cooling'>('normal');
  const [c3Pressure, setC3Pressure] = useState<'normal' | 'high' | 'low'>('normal');
  const [c3ShiftDirection, setC3ShiftDirection] = useState<'none' | 'forward' | 'backward'>('none');

  // 4. Chapter 4 States (Electrochemistry cell choice)
  const [c4CellType, setC4CellType] = useState<'galvanic' | 'electrolytic'>('galvanic');

  // 5. Chapter 5 States (Hydrocarbons Tree)
  const [c5SelectedNode, setC5SelectedNode] = useState<string>('alkanes');

  // Reset states when changing chapter
  useEffect(() => {
    setC1Jumped(false);
    setC1IsAnimating(false);
    setC2AddedReagent(false);
    setC2ExcessAdded(false);
    setC2IsDropping(false);
    setC3ReactantConc(50);
    setC3Temp('normal');
    setC3Pressure('normal');
    setC3ShiftDirection('none');
    setC5SelectedNode('alkanes');
  }, [chapterId]);

  // Handle Le Chatelier shifts calculation
  // Reaction: N2(g) + 3H2(g) <==> 2NH3(g) + Heat (Exothermic)
  useEffect(() => {
    let shift: 'none' | 'forward' | 'backward' = 'none';

    // Reactant concentration check
    if (c3ReactantConc > 60) {
      shift = 'forward'; // Adding reactants shifts right
    } else if (c3ReactantConc < 40) {
      shift = 'backward'; // Removing reactants shifts left
    }

    // Temperature check (Exothermic reaction: heat is on the right/products side)
    if (c3Temp === 'heating') {
      shift = shift === 'forward' ? 'none' : 'backward'; // Heating shifts to reactants
    } else if (c3Temp === 'cooling') {
      shift = shift === 'backward' ? 'none' : 'forward'; // Cooling shifts to products
    }

    // Pressure check (increasing pressure shifts to fewer gas moles - products/right side)
    if (c3Pressure === 'high') {
      shift = shift === 'backward' ? 'none' : 'forward';
    } else if (c3Pressure === 'low') {
      shift = shift === 'forward' ? 'none' : 'backward';
    }

    setC3ShiftDirection(shift);
  }, [c3ReactantConc, c3Temp, c3Pressure]);

  const triggerC1Jump = () => {
    if (c1IsAnimating) return;
    setC1IsAnimating(true);
    setTimeout(() => {
      setC1Jumped(!c1Jumped);
      setC1IsAnimating(false);
    }, 1200);
  };

  const handleC2Reagent = () => {
    if (c2IsDropping) return;
    setC2IsDropping(true);
    setTimeout(() => {
      setC2AddedReagent(true);
      setC2IsDropping(false);
    }, 1000);
  };

  const handleC2Excess = () => {
    if (c2IsDropping) return;
    setC2IsDropping(true);
    setTimeout(() => {
      setC2ExcessAdded(true);
      setC2IsDropping(false);
    }, 1000);
  };

  const resetC2 = () => {
    setC2AddedReagent(false);
    setC2ExcessAdded(false);
    setC2IsDropping(false);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl relative text-right overflow-hidden">
      {/* GLOWING AMBIENCE OVERLAYS */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* EMBEDDED HIGH-FIDELITY CSS ANIMATIONS */}
      <style>{`
        @keyframes fallDrop {
          0% { transform: translateY(0) scaleY(1); opacity: 0; }
          10% { opacity: 1; }
          90% { transform: translateY(110px) scaleY(1.2); opacity: 1; }
          100% { transform: translateY(115px) scaleY(0.8); opacity: 0; }
        }
        @keyframes floatBubble {
          0% { transform: translateY(100%) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-10%) translateX(var(--bubble-sway)); opacity: 0; }
        }
        @keyframes bloomPrecipitate {
          0% { height: 0%; opacity: 0; transform: scaleX(0.7); }
          50% { opacity: 0.8; }
          100% { height: 75%; opacity: 0.95; transform: scaleX(1); }
        }
        @keyframes electronPath {
          0% { stroke-dashoffset: 240; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes rippleHeat {
          0% { transform: translateY(0) scaleY(1); opacity: 0.1; }
          50% { transform: translateY(-4px) scaleY(1.08); opacity: 0.4; }
          100% { transform: translateY(0) scaleY(1); opacity: 0.1; }
        }
        @keyframes flowElectron {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        .anim-drop {
          animation: fallDrop 1s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        .anim-bubble {
          animation: floatBubble var(--bubble-duration) ease-in-out infinite;
        }
        .anim-bloom {
          animation: bloomPrecipitate 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        .anim-heat {
          animation: rippleHeat 2s ease-in-out infinite;
        }
        @keyframes flowPath {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        .active-flow {
          stroke-dasharray: 6, 4;
          animation: flowPath 1.2s linear infinite;
        }
        @keyframes pulseNode {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.95; }
        }
        .pulse-node-active {
          animation: pulseNode 2s infinite ease-in-out;
          transform-origin: center;
        }
      `}</style>

      {/* COMPONENT HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          المختبر الافتراضي والمستشار التفاعلي المذهل 🧪
        </span>
        <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
          محاكاة كيميائية عالية الدقة ثلاثية الأبعاد
        </h3>
      </div>

      {/* ======================================================= */}
      {/* CHAPTER 1: ORBITAL JUMP JUXTAPOSITION */}
      {/* ======================================================= */}
      {chapterId === 1 && (
        <div className="space-y-6">
          {/* Sub-tab selection */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 self-center justify-center max-w-md mx-auto">
            <button
              onClick={() => setC1ActiveSubTab('reactions')}
              className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                c1ActiveSubTab === 'reactions'
                  ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مخطط تفاعلات الحديد التفاعلي 🧪
            </button>
            <button
              onClick={() => setC1ActiveSubTab('orbitals')}
              className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                c1ActiveSubTab === 'orbitals'
                  ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              شذوذ التوزيع الإلكتروني ⚛️
            </button>
          </div>

          {/* SUB-TAB 1: IRON REACTIONS INTERACTIVE SVG FLOW CHART */}
          {c1ActiveSubTab === 'reactions' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">المخطط الانسيابي المتحرك لتفاعلات الحديد وأكاسيده</h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  تفاعلات الحديد وأكاسيده تمثل عصب أسئلة الفهم والتحويلات بالباب الأول. اضغط على أي مركب كيميائي في المخطط بالأسفل لتحديده كمادة ابتدائية، أو اختر كاشفاً لاستعراض المسار الكيميائي ونقاط التفاعل المتسلسلة فورياً:
                </p>

                {/* Local controller inside mental map tab */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Step 1 Selector */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-bold mb-2">1. حدد المركب الابتدائي:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Fe', 'FeC2O4 (أوكسالات الحديد II)', 'FeSO4', 'Fe3O4 (أكسيد مغناطيسي)', 'Fe2O3'].map((item) => {
                        const val = item.startsWith('FeC2O4') ? 'FeC2O4 (أوكسالات الحديد II)' : 
                                    item.startsWith('Fe3O4') ? 'Fe3O4 (أكسيد مغناطيسي)' : item;
                        const label = item.split(' ')[0];
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              setLocalReactant(val);
                              const relevant = ironReactions.filter(r => r.reactant === val);
                              if (relevant.length > 0) setLocalReactionId(relevant[0].id);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                              localReactant === val
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2 Selector */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-bold mb-2">2. اختر التفاعل / ظروف التجربة:</span>
                    <div className="flex flex-col gap-1">
                      {ironReactions.filter(r => r.reactant === localReactant).map((reac) => (
                        <button
                          key={reac.id}
                          onClick={() => setLocalReactionId(reac.id)}
                          className={`text-right p-1.5 rounded text-[11px] font-semibold transition-all border flex items-center justify-between cursor-pointer ${
                            localReactionId === reac.id
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900/40 text-slate-400 border-transparent hover:bg-slate-800/50'
                          }`}
                        >
                          <span>{reac.reagent}</span>
                          <span className="font-mono text-[9px] text-slate-500">➔ {reac.products.split(' + ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SVG Visualizer */}
                {(() => {
                  const nodePositions: { [key: string]: { x: number; y: number; label: string; formula: string; color: string; bg: string } } = {
                    'Fe': { x: 300, y: 320, label: 'فلز الحديد الحر', formula: 'Fe', color: '#38bdf8', bg: '#082f49' },
                    'FeC2O4 (أوكسالات الحديد II)': { x: 80, y: 240, label: 'أوكسالات الحديد II', formula: 'FeC₂O₄', color: '#c084fc', bg: '#3b0764' },
                    'FeSO4': { x: 300, y: 60, label: 'كبريتات حديد II', formula: 'FeSO₄', color: '#34d399', bg: '#022c22' },
                    'FeO': { x: 140, y: 150, label: 'أكسيد حديد ثنائي', formula: 'FeO', color: '#fb7185', bg: '#4c0519' },
                    'Fe3O4 (أكسيد مغناطيسي)': { x: 460, y: 150, label: 'أكسيد مغناطيسي', formula: 'Fe₃O₄', color: '#fbbf24', bg: '#451a03' },
                    'Fe2O3': { x: 520, y: 240, label: 'أكسيد حديد ثلاثي', formula: 'Fe₂O₃', color: '#f87171', bg: '#7f1d1d' },
                    'FeCl2': { x: 180, y: 320, label: 'كلوريد حديد ثنائي', formula: 'FeCl₂', color: '#60a5fa', bg: '#172554' },
                    'FeCl3': { x: 100, y: 60, label: 'كلوريد حديد ثلاثي', formula: 'FeCl₃', color: '#f97316', bg: '#7c2d12' }
                  };

                  const paths = [
                    { id: 'reac_1', from: 'Fe', to: 'FeCl2', d: 'M 300 320 Q 240 330 180 320' },
                    { id: 'reac_2', from: 'Fe', to: 'FeCl3', d: 'M 300 320 Q 180 190 100 60' },
                    { id: 'reac_3', from: 'Fe', to: 'FeSO4', d: 'M 300 320 Q 270 190 300 60' },
                    { id: 'reac_4', from: 'FeC2O4 (أوكسالات الحديد II)', to: 'FeO', d: 'M 80 240 Q 110 190 140 150' },
                    { id: 'reac_5', from: 'FeSO4', to: 'Fe2O3', d: 'M 300 60 Q 420 120 520 240' },
                    { id: 'reac_6', from: 'Fe3O4 (أكسيد مغناطيسي)', to: 'FeSO4', d: 'M 460 150 Q 370 95 300 60' },
                    { id: 'reac_7', from: 'Fe2O3', to: 'Fe3O4 (أكسيد مغناطيسي)', d: 'M 520 240 Q 480 190 460 150' }
                  ];

                  const currentReactionObj = ironReactions.find(r => r.id === localReactionId);

                  return (
                    <div className="bg-slate-950 p-2 md:p-4 rounded-2xl border border-slate-800 flex flex-col items-center gap-4 relative overflow-hidden" dir="ltr">
                      <div className="absolute top-2 left-2 text-[8px] text-slate-700 font-mono select-none">Vector_Field_Flow_V2.0</div>
                      
                      <svg className="w-full h-auto max-w-xl pointer-events-auto overflow-visible" viewBox="-40 -20 680 410" dir="ltr">
                        <defs>
                          <marker id="arrow-ch1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1e293b" />
                          </marker>
                          <marker id="arrow-ch1-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                          </marker>
                        </defs>

                        {/* Draw all standard static paths */}
                        {paths.map((p) => (
                          <path
                            key={`underlay-${p.id}`}
                            d={p.d}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="2.5"
                            markerEnd="url(#arrow-ch1)"
                          />
                        ))}

                        {/* Draw highlighted active path */}
                        {paths.map((p) => {
                          if (p.id !== localReactionId) return null;
                          return (
                            <g key={`active-group-${p.id}`}>
                              {/* Glowing background flow path */}
                              <path
                                d={p.d}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="4.5"
                                className="active-flow filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                                markerEnd="url(#arrow-ch1-active)"
                              />
                              {/* Glowing moving particle */}
                              <circle r="7" fill="#f59e0b" className="filter drop-shadow-[0_0_10px_#f59e0b]">
                                <animateMotion dur="2.4s" repeatCount="indefinite" path={p.d} key={localReactionId} />
                              </circle>
                            </g>
                          );
                        })}

                        {/* Draw compound Nodes */}
                        {Object.entries(nodePositions).map(([key, node]) => {
                          const isReactantOfActive = currentReactionObj?.reactant === key;
                          const isProductOfActive = currentReactionObj?.products.includes(node.formula);
                          const isSelected = localReactant === key;
                          
                          let strokeColor = "#1e293b";
                          let borderWidth = 2;
                          let pulseClass = "";
                          
                          if (isSelected) {
                            strokeColor = "#38bdf8";
                            borderWidth = 3;
                            pulseClass = "pulse-node-active";
                          } else if (isReactantOfActive) {
                            strokeColor = "#f59e0b";
                            borderWidth = 3;
                            pulseClass = "pulse-node-active";
                          } else if (isProductOfActive) {
                            strokeColor = "#10b981";
                            borderWidth = 2.5;
                          }

                          return (
                            <g
                              key={key}
                              transform={`translate(${node.x}, ${node.y})`}
                              className={`${pulseClass} cursor-pointer hover:scale-[1.03] transition-transform select-none`}
                              onClick={() => {
                                setLocalReactant(key);
                                const relevant = ironReactions.filter(r => r.reactant === key);
                                if (relevant.length > 0) {
                                  setLocalReactionId(relevant[0].id);
                                }
                              }}
                            >
                              <rect
                                x="-65"
                                y="-22"
                                width="130"
                                height="44"
                                rx="10"
                                fill={node.bg}
                                stroke={strokeColor}
                                strokeWidth={borderWidth}
                                className="transition-all duration-300"
                              />
                              {/* Chemical formula */}
                              <text
                                y="-4"
                                textAnchor="middle"
                                fill="#ffffff"
                                className="font-mono text-xs font-black tracking-wide"
                              >
                                {node.formula}
                              </text>
                              {/* Arabic name */}
                              <text
                                y="12"
                                textAnchor="middle"
                                fill="#94a3b8"
                                className="text-[9px] font-bold"
                              >
                                {node.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Chemical transition metadata card */}
                      {currentReactionObj && (
                        <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 mt-2 text-right">
                          <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                            <span className="bg-amber-400/10 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/20">
                              {currentReactionObj.reagent}
                            </span>
                            <span className="text-xs font-black text-white">التحول الكيميائي النشط</span>
                          </div>

                          <div className="p-3 bg-slate-950 font-mono text-emerald-400 text-xs md:text-sm text-center font-bold rounded-lg border border-slate-900">
                            {currentReactionObj.balancedEquation}
                          </div>

                          <div className="text-xs leading-relaxed space-y-2">
                            <div>
                              <strong className="text-amber-400 flex items-center gap-1 justify-end">الملاحظات والظواهر: <Flame className="w-3.5 h-3.5" /></strong>
                              <p className="text-slate-300 mt-0.5">{currentReactionObj.observations}</p>
                            </div>
                            <div className="bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30">
                              <strong className="text-red-400 flex items-center gap-1 justify-end">خدعة الامتحان الكامنة: <AlertTriangle className="w-3.5 h-3.5" /></strong>
                              <p className="text-slate-300 mt-1">{currentReactionObj.examTrick}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            </div>
          )}

          {/* SUB-TAB 2: ORIGINAL HIGH-QUALITY QUANTUM ORBITAL JUMP */}
          {c1ActiveSubTab === 'orbitals' && (
            <div className="bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">شذوذ التوزيع الإلكتروني وانتقال المستويات</h4>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                تصل ذرات النحاس والكروم إلى الحد الأقصى من الاستقرار الكوانتي عندما يكون المستوى <code className="font-mono text-amber-400 px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-xs font-bold">3d</code> نصف ممتلئ أو تام الامتلاء. اختر العنصر وشاهد القفزة الإلكترونية الفائقة:
              </p>

              <div className="flex justify-center gap-3 mb-6">
                <button
                  onClick={() => { setC1Metal('Cr'); setC1Jumped(false); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    c1Metal === 'Cr'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  الكروم ₂₄Cr (شبه ممتلئ d⁵)
                </button>
                <button
                  onClick={() => { setC1Metal('Cu'); setC1Jumped(false); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    c1Metal === 'Cu'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  النحاس ₂₉Cu (تام الامتلاء d¹⁰)
                </button>
              </div>

              {/* Orbitals Visualizer Stage */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center gap-6 relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[9px] text-slate-600 font-mono">Sim_V1.2_Quantum</div>
                
                <div className="text-center z-10">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">التوزيع المستهدف</span>
                  <h5 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mt-1">
                    {c1Metal === 'Cr' ? 'الكروم Chromium [₁₈Ar]' : 'النحاس Copper [₁₈Ar]'}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1">
                    الحالة المستقرة الملاحظة:{' '}
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                      {c1Metal === 'Cr' 
                        ? (c1Jumped ? '4s¹ 3d⁵ (مستقر للغاية)' : '4s² 3d⁴ (غير مستقر - افتراضي)') 
                        : (c1Jumped ? '4s¹ 3d¹⁰ (مستقر للغاية)' : '4s² 3d⁹ (غير مستقر - افتراضي)')}
                    </span>
                  </p>
                </div>

                {/* Orbital Drawing Container */}
                <div className="w-full max-w-xl flex flex-col lg:flex-row items-center justify-center gap-8 py-6 z-10">
                  
                  {/* 4s Orbital Box */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-sky-400 font-mono">المدار الفرعي 4s</span>
                    <div className="w-16 h-16 bg-slate-900 border-2 border-sky-500/60 rounded-xl flex items-center justify-center gap-2 relative shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                      {/* Electron 1 */}
                      <div className="flex flex-col items-center text-amber-400 font-black animate-pulse">
                        <span className="text-2xl">↑</span>
                        <span className="text-[8px] -mt-1 text-amber-500 font-sans font-normal">e⁻₁</span>
                      </div>

                      {/* Electron 2 (Jumping) */}
                      {!c1Jumped && (
                        <div className={`flex flex-col items-center text-sky-400 font-black ${
                          c1IsAnimating ? 'translate-x-12 opacity-0 scale-50 rotate-90 transition-all duration-1000' : 'translate-x-0'
                        }`}>
                          <span className="text-2xl">↓</span>
                          <span className="text-[8px] -mt-1 text-sky-500 font-sans font-normal">e⁻₂</span>
                        </div>
                      )}

                      {c1Jumped && (
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">نصف فارغ</span>
                      )}
                    </div>
                  </div>

                  {/* SVG Jump Path */}
                  <div className="h-16 w-32 flex items-center justify-center relative">
                    <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 120 60">
                      <path
                        d="M 10 30 Q 60 -10 110 30"
                        fill="none"
                        stroke={c1IsAnimating ? '#10b981' : '#334155'}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className={c1IsAnimating ? 'animate-pulse' : ''}
                      />
                      {c1IsAnimating && (
                        <circle r="4" fill="#10b981" className="shadow-lg">
                          <animateMotion dur="1.2s" repeatCount="1" path="M 10 30 Q 60 -10 110 30" fill="freeze" />
                        </circle>
                      )}
                    </svg>
                    {c1IsAnimating ? (
                      <span className="text-[10px] text-emerald-400 font-black animate-bounce bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/30">
                        قفزة كوانتية! ⚡
                      </span>
                    ) : c1Jumped ? (
                      <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/20">
                        تم الانتقال بنجاح
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">مستعد للقفز</span>
                    )}
                  </div>

                  {/* 3d Orbital (5 boxes side by side) */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-orange-400 font-mono">المدار الفرعي 3d (خمس غرف كوانتية)</span>
                    <div className="flex border-2 border-orange-500/60 rounded-xl bg-slate-900 overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                      {[1, 2, 3, 4, 5].map((boxNum) => {
                        let upArrow = true;
                        let downArrow = false;

                        if (c1Metal === 'Cr') {
                          if (boxNum === 5 && !c1Jumped) {
                            upArrow = false;
                          }
                        } else {
                          downArrow = true;
                          if (boxNum === 5 && !c1Jumped) {
                            downArrow = false;
                          }
                        }

                        return (
                          <div key={boxNum} className="w-12 h-12 border-r border-orange-500/30 last:border-0 flex items-center justify-center gap-1.5 relative bg-slate-950/80">
                            {upArrow && (
                              <span className="text-lg text-amber-400 font-black drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">↑</span>
                            )}
                            {downArrow && (
                              <span className={`text-lg text-sky-400 font-black drop-shadow-[0_0_5px_rgba(14,165,233,0.5)] ${
                                boxNum === 5 && c1Jumped ? 'animate-bounce' : ''
                              }`}>↓</span>
                            )}
                            {boxNum === 5 && c1Metal === 'Cr' && c1Jumped && (
                              <span className="text-lg text-emerald-400 font-black animate-bounce drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]">↑</span>
                            )}
                            <span className="absolute bottom-0.5 right-1 text-[8px] text-slate-700 font-mono">d{boxNum}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Action Button to trigger orbital jump */}
                <button
                  onClick={triggerC1Jump}
                  disabled={c1IsAnimating}
                  className={`px-6 py-3 rounded-2xl text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg z-10 ${
                    c1Jumped
                      ? 'bg-red-950/80 text-red-200 border border-red-800/40 hover:bg-red-900'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:shadow-emerald-500/20 hover:scale-[1.03]'
                  }`}
                >
                  <RotateCcw className={`w-4 h-4 ${c1IsAnimating ? 'animate-spin' : ''}`} />
                  {c1Jumped ? 'إعادة ضبط التوزيع للوضع الافتراضي' : 'إطلاق القفزة الاستقرائية الفائقة للمستوى d ⚡'}
                </button>
              </div>

              {/* Academic Commentary */}
              <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-2 leading-relaxed">
                <div className="font-extrabold text-amber-400 flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  المستشار البيداغوجي الموجه:
                </div>
                {c1Metal === 'Cr' ? (
                  <p>
                    في الكروم <strong>₂₄Cr</strong>، يتم ترحيل إلكترون من <strong>4s</strong> ليصبح التوزيع الملاحظ <strong>[₁₈Ar] 4s¹ 3d⁵</strong>. هكذا تصبح المدارات الفرعية الخمسة للـ d نصف ممتلئة بإلكترونات مفردة متوازية المغزل، مما يقلل قوى التنافر الإلكتروني الكولومي ويرفع من تماثل وتناسق السحابة الإلكترونية، معلناً ذرة غاية في الثبات والاستقرار.
                  </p>
                ) : (
                  <p>
                    في النحاس <strong>₂₉Cu</strong>، يعبر الإلكترون من <strong>4s</strong> إلى <strong>3d</strong> لينتج التوزيع الحقيقي <strong>[₁₈Ar] 4s¹ 3d¹⁰</strong>. هذا يضمن امتلاءً تاماً للمستوى d، وتام الامتلاء الكوانتي يقلل طاقة الذرة الكلية لأدنى درجة ممكنة، واضعاً الفلز في حالة الاستقرار الفضلى.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* CHAPTER 2: ANALYTICAL TEST FLOWCHART (REBUILT SPECTACULAR) */}
      {/* ======================================================= */}
      {chapterId === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">الكشف الكيفي التجريبي للكاتيونات والأنيونات المتداخلة</h4>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              اختر الملح المطلوب للكشف، ثم اضغط على زر <strong>"إضافة الكاشف قطرة بقطرة"</strong> لمشاهدة تأثير قطرات Pipette والتفاعلات الترسيبية وظاهرة تداخل الألومنيوم المتردد (Amphoteric):
            </p>

            {/* Selector Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
              <button
                onClick={() => { setC2SelectedTest('CO3'); resetC2(); }}
                className={`p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                  c2SelectedTest === 'CO3' 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                أنيون الكربونات (CO₃²⁻) + HCl
              </button>
              <button
                onClick={() => { setC2SelectedTest('Fe2'); resetC2(); }}
                className={`p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                  c2SelectedTest === 'Fe2' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                حديد ثنائي (Fe²⁺) + NaOH
              </button>
              <button
                onClick={() => { setC2SelectedTest('Fe3'); resetC2(); }}
                className={`p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                  c2SelectedTest === 'Fe3' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                حديد ثلاثي (Fe³⁺) + NaOH
              </button>
              <button
                onClick={() => { setC2SelectedTest('Al3'); resetC2(); }}
                className={`p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                  c2SelectedTest === 'Al3' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ألومنيوم متردد (Al³⁺) + NaOH
              </button>
            </div>

            {/* Test Tube Lab Rack Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 items-stretch relative">
              
              {/* Visual Test Tubes (Left 5 Columns) */}
              <div className="lg:col-span-5 flex items-center justify-around bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 relative overflow-hidden min-h-[300px]">
                
                {/* 1. Dropper / Pipette animation */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <Pipette className={`w-8 h-8 ${
                    c2IsDropping ? 'text-amber-400 scale-110' : 'text-slate-500'
                  } transition-all`} />
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">
                    {c2SelectedTest === 'CO3' ? 'إضافة HCl' : 'إضافة NaOH'}
                  </div>
                  {/* Glowing fluid drop */}
                  {c2IsDropping && (
                    <div className={`w-2.5 h-4 rounded-full anim-drop absolute top-8 ${
                      c2SelectedTest === 'CO3' ? 'bg-sky-400' :
                      c2SelectedTest === 'Fe2' ? 'bg-emerald-300' :
                      c2SelectedTest === 'Fe3' ? 'bg-amber-700' : 'bg-slate-200'
                    }`} />
                  )}
                </div>

                {/* Main Glass Test Tube */}
                <div className="flex flex-col items-center gap-2 relative mt-12">
                  <span className="text-[10px] text-slate-400 font-bold">أنبوب الاختبار الأساسي</span>
                  
                  {/* Glass shell */}
                  <div className="w-14 h-48 border-[3px] border-slate-400/80 rounded-b-full relative overflow-hidden flex flex-col justify-end shadow-inner bg-slate-950/40">
                    <div className="absolute top-0 left-0 right-0 h-4 border-b border-slate-500/20 bg-slate-400/10" />
                    
                    {/* Liquid Area */}
                    {c2AddedReagent ? (
                      c2SelectedTest === 'CO3' ? (
                        /* CO3 Anion: Acid gas evolution with sloshing */
                        <div className="w-full h-24 bg-sky-500/20 relative">
                          <div className="absolute inset-0 bg-sky-500/30 animate-pulse" />
                          {/* Bubbles */}
                          <div className="anim-bubble absolute bottom-2 left-2 w-2 h-2 bg-white/80 rounded-full" style={{'--bubble-sway': '8px', '--bubble-duration': '1.2s'} as React.CSSProperties} />
                          <div className="anim-bubble absolute bottom-6 left-5 w-1.5 h-1.5 bg-white/60 rounded-full" style={{'--bubble-sway': '-5px', '--bubble-duration': '0.9s'} as React.CSSProperties} />
                          <div className="anim-bubble absolute bottom-4 left-8 w-1 h-1 bg-white/70 rounded-full" style={{'--bubble-sway': '4px', '--bubble-duration': '1.5s'} as React.CSSProperties} />
                          <div className="anim-bubble absolute bottom-10 left-3 w-2 h-2 bg-white/50 rounded-full" style={{'--bubble-sway': '-8px', '--bubble-duration': '1.1s'} as React.CSSProperties} />
                          {/* Floating Gas escaping */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center text-[10px] font-mono text-slate-300 font-bold animate-[bounce_2s_infinite]">
                            CO₂↑
                          </div>
                        </div>
                      ) : c2SelectedTest === 'Fe2' ? (
                        /* Fe2+ white green precipitate */
                        <div className="w-full h-32 bg-teal-950/40 relative">
                          <div className="w-full h-full bg-teal-900/10 absolute inset-0" />
                          {/* Blooming cloud precipitate */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-200/90 to-teal-100/40 anim-bloom flex flex-col justify-end filter blur-[0.5px]">
                            <div className="h-6 w-full bg-emerald-500/20 animate-pulse" />
                          </div>
                        </div>
                      ) : c2SelectedTest === 'Fe3' ? (
                        /* Fe3+ reddish brown gelatinous precipitate */
                        <div className="w-full h-32 bg-amber-950/30 relative">
                          <div className="w-full h-full bg-amber-900/10 absolute inset-0" />
                          {/* Blooming cloud precipitate */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-800/95 to-amber-700/50 anim-bloom flex flex-col justify-end filter blur-[0.5px]">
                            <div className="h-6 w-full bg-red-900/30 animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        /* Al3+ Amphoteric precipitate & dissolution */
                        <div className="w-full h-32 bg-slate-900/50 relative">
                          {c2ExcessAdded ? (
                            /* Soluble Sodium meta-aluminate */
                            <div className="w-full h-full bg-sky-400/10 animate-pulse flex flex-col justify-center items-center">
                              <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
                              <span className="text-[8px] text-sky-400 font-bold mt-1 leading-none text-center">ذوبان تام<br/>NaAlO₂</span>
                            </div>
                          ) : (
                            /* White gelatinous precipitate */
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-100/95 to-slate-200/30 anim-bloom flex flex-col justify-end filter blur-[0.5px]">
                              <div className="h-4 w-full bg-slate-300/20 animate-pulse" />
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      /* Clear solution */
                      <div className="w-full h-20 bg-slate-800/20" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {c2SelectedTest === 'CO3' ? 'Na₂CO₃' :
                     c2SelectedTest === 'Fe2' ? 'FeSO₄' :
                     c2SelectedTest === 'Fe3' ? 'FeCl₃' : 'Al₂(SO₄)₃'}
                  </span>
                </div>

                {/* 2. Side Tube for CO3: Limewater turbid test */}
                {c2SelectedTest === 'CO3' && c2AddedReagent && (
                  <div className="flex flex-col items-center gap-2 relative mt-16 animate-[fade-in_0.5s_ease-out]">
                    <span className="text-[10px] text-amber-400 font-bold">ماء جير رائق</span>
                    {/* Glass tubing representation */}
                    <div className="absolute -left-12 top-[-20px] w-14 h-8 border-t-2 border-r-2 border-slate-600 rounded-tr-lg pointer-events-none" />
                    
                    {/* Limewater tube */}
                    <div className="w-10 h-36 border-2 border-slate-400/80 rounded-b-full relative overflow-hidden flex flex-col justify-end bg-slate-950/20">
                      {/* Turbidity transition white CaCO3 */}
                      <div className="w-full h-20 bg-slate-200/90 relative animate-pulse">
                        <span className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"></span>
                        <span className="absolute bottom-6 left-3 w-1 h-1 bg-white/70 rounded-full animate-ping"></span>
                        <div className="absolute inset-0 bg-slate-100/40 filter blur-[1px]" />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono text-center leading-tight">تعكر سريع (ST)<br/>CaCO₃↓</span>
                  </div>
                )}
              </div>

              {/* Controls & Scientific formulas (Right 7 Columns) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                {/* Dynamic Chemical Formula Panel */}
                <div>
                  <h5 className="text-xs font-bold text-slate-400 mb-2">المعادلة الكيميائية الدقيقة:</h5>
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 select-all leading-relaxed text-left">
                    {c2SelectedTest === 'CO3' ? (
                      <>
                        <span className="text-amber-400 font-bold">// التفاعل الأساسي وتصاعد الغاز:</span><br/>
                        Na₂CO₃ + 2HCl ➔ 2NaCl + H₂O + <span className="text-sky-300 font-bold">CO₂↑</span><br/>
                        <span className="text-amber-400 font-bold">// تعكير ماء الجير لفترة قصيرة (ST):</span><br/>
                        CO₂ + Ca(OH)₂ ➔ <span className="text-slate-200 font-boldUnderline">CaCO₃↓</span> (تعكير) + H₂O<br/>
                        <span className="text-red-400 font-bold">// زوال التعكير بالمرور لفترة طويلة (LT):</span><br/>
                        CaCO₃ + H₂O + CO₂ ➔ <span className="text-teal-300 font-bold">Ca(HCO₃)₂</span> (ذائب)
                      </>
                    ) : c2SelectedTest === 'Fe2' ? (
                      <>
                        <span className="text-emerald-400 font-bold">// الكشف عن كاتيون الحديد الثنائي:</span><br/>
                        FeSO₄ + 2NaOH ➔ <span className="text-teal-200 font-bold">Fe(OH)₂↓</span> (راسب أبيض مخضر) + Na₂SO₄
                      </>
                    ) : c2SelectedTest === 'Fe3' ? (
                      <>
                        <span className="text-red-400 font-bold">// الكشف عن كاتيون الحديد الثلاثي:</span><br/>
                        FeCl₃ + 3NaOH ➔ <span className="text-amber-700 font-bold">Fe(OH)₃↓</span> (راسب بني محمر) + 3NaCl
                      </>
                    ) : (
                      <>
                        <span className="text-sky-400 font-bold">// الترسيب الجيلاتيني للألومنيوم:</span><br/>
                        Al₂(SO₄)₃ + 6NaOH ➔ 2<span className="text-slate-200 font-bold">Al(OH)₃↓</span> (جيلاتيني أبيض) + 3Na₂SO₄<br/>
                        {c2ExcessAdded ? (
                          <>
                            <span className="text-emerald-400 font-bold">// الذوبان بالزيادة والوفرة من الصودا الكاوية:</span><br/>
                            Al(OH)₃ + NaOH ➔ <span className="text-sky-400 font-bold">NaAlO₂</span> (ميتالومينات صوديوم ذائبة) + 2H₂O
                          </>
                        ) : (
                          <span className="text-slate-500 font-bold">// اضغط على زر الوفرة لمشاهدة الانحلال...</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Test Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleC2Reagent}
                    disabled={c2AddedReagent || c2IsDropping}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      c2AddedReagent 
                        ? 'bg-slate-900 text-slate-500 border border-slate-800' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:scale-[1.02]'
                    }`}
                  >
                    <Pipette className="w-4 h-4" />
                    {c2IsDropping ? 'جاري التنقيط...' : 'إضافة قطرات الكاشف قطرة بقطرة 🧪'}
                  </button>

                  {/* Excess button ONLY for Aluminium */}
                  {c2SelectedTest === 'Al3' && c2AddedReagent && (
                    <button
                      onClick={handleC2Excess}
                      disabled={c2ExcessAdded || c2IsDropping}
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        c2ExcessAdded
                          ? 'bg-slate-900 text-slate-500 border border-slate-800'
                          : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:scale-[1.02]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 animate-spin" />
                      إضافة وفرة من القلوي (Excess NaOH) 💫
                    </button>
                  )}

                  <button
                    onClick={resetC2}
                    className="px-4 py-3 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 cursor-pointer"
                  >
                    إعادة غسيل وتفريغ الأنبوب
                  </button>
                </div>

                {/* Academic Commentary on Interferences */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                    عقدة الطالب وتريكات الامتحانات:
                  </span>
                  <p className="leading-relaxed mt-1.5">
                    {c2SelectedTest === 'CO3' 
                      ? 'مفتاح الامتحان هنا يركز على زمن إمرار غاز CO₂؛ فالإمرار القصير (Short Time) يعطي راسباً أبيض متعكراً من كربونات الكالسيوم. أما الإمرار الطويل (Long Time) يحول الراسب لبيكربونات الكالسيوم الذائبة فيختفي التعكير تماماً! هذه الفكرة هي السحابة المفضلة في أسئلة استبعاد البدائل.' 
                      : c2SelectedTest === 'Fe2'
                      ? 'هيدروكسيد الحديد الثنائي Fe(OH)₂ يتأكسد بسرعة بالهواء الجوي ليتحول تدريجياً لـ Fe(OH)₃ البني المحمر. يذوب بسهولة في الأحماض المخففة، وهو مركب قاعدي بحت لا يذوب في هيدروكسيد الصوديوم.'
                      : c2SelectedTest === 'Fe3'
                      ? 'هيدروكسيد الحديد الثلاثي Fe(OH)₃ ذو اللون البني المحمر الجيلاتيني ينتج أيضاً بتفاعل FeCl₃ مع هيدروكسيد الأمونيوم. عند تسخينه بشدة عند درجة حرارة أعلى من 200°م يحدث له انحلال حراري ليعطي أكسيد الحديد الثلاثي Fe₂O₃ المكون الأساسي للهيماتيت.'
                      : 'الألومنيوم Al³⁺ يملك سراً متردداً (Amphoteric): يترسب أولاً كـ Al(OH)₃ وهو راسب أبيض جيلاتيني، ولكنه يذوب في وفرة من هيدروكسيد الصوديوم لتكون ميتالومينات الصوديوم الذائبة، بينما لا يذوب في وفرة هيدروكسيد الأمونيوم NH₄OH! تذكر هذا الفارق الحاسم لاستبعاد البدائل.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* CHAPTER 3: LE CHATELIER SCALE BALANCE */}
      {/* ======================================================= */}
      {chapterId === 3 && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">ميزان اتزان لو شاتيليه التفاعلي ثلاثي الأبعاد</h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              تحكم في تركيز المتفاعلات والحرارة والضغط لترى انزياح كفتي ميزان التفاعل الانعكاسي الطارد للحرارة (تحضير غاز النشادر - Haber-Bosch Process):
            </p>

            {/* Reaction display */}
            <div className="bg-slate-950 text-white p-4 rounded-xl border border-slate-800 text-center font-mono text-xs md:text-sm mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-red-500/5 pointer-events-none" />
              N₂(g) + 3H₂(g) <code className="text-amber-400 font-bold">⇌</code> 2NH₃(g) + <span className="text-red-400 font-bold animate-pulse">Heat (الحرارة)</span>
            </div>

            {/* Controllers row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {/* Reactant concentration */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-300 block mb-2">تركيز المتفاعلات (N₂ & H₂):</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">سحب</span>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={c3ReactantConc}
                    onChange={(e) => setC3ReactantConc(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[10px] text-slate-500">إضافة</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">
                    {c3ReactantConc > 60 ? 'زيادة كبيرة للتركيز ➔' : c3ReactantConc < 40 ? 'تقليل حاد للتركيز ☁️' : 'تركيز متزن طبيعي'}
                  </span>
                </div>
              </div>

              {/* Temperature Selector */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-300 block mb-2">تأثير درجة الحرارة:</span>
                <div className="flex justify-center gap-1.5">
                  <button
                    onClick={() => setC3Temp('heating')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      c3Temp === 'heating' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    تسخين 🔥
                  </button>
                  <button
                    onClick={() => setC3Temp('normal')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      c3Temp === 'normal' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    حرارة معتدلة
                  </button>
                  <button
                    onClick={() => setC3Temp('cooling')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      c3Temp === 'cooling' ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    تبريد ❄️
                  </button>
                </div>
              </div>

              {/* Pressure Selector */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-300 block mb-2">تأثير حجم الوعاء (الضغط):</span>
                <div className="flex justify-center gap-1.5">
                  <button
                    onClick={() => setC3Pressure('high')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      c3Pressure === 'high' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    زيادة الضغط ⬇️
                  </button>
                  <button
                    onClick={() => setC3Pressure('normal')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      c3Pressure === 'normal' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    ضغط معتاد
                  </button>
                  <button
                    onClick={() => setC3Pressure('low')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      c3Pressure === 'low' ? 'bg-orange-600 text-white border-orange-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    تقليل الضغط ⬆️
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Scale Chamber Stage */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-6 text-white min-h-[240px] justify-center relative overflow-hidden">
              
              {/* Fire/Frost Ambient rippling background effect */}
              {c3Temp === 'heating' && <div className="absolute inset-0 bg-red-500/5 anim-heat pointer-events-none" />}
              {c3Temp === 'cooling' && <div className="absolute inset-0 bg-sky-500/5 animate-pulse pointer-events-none" />}

              {/* Dynamic shift indicators */}
              <div className="absolute top-3 flex items-center justify-center gap-6 z-10">
                <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  c3ShiftDirection === 'backward' 
                    ? 'bg-orange-950/80 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-600'
                }`}>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>عكسي (نحو المتفاعلات N₂, H₂)</span>
                </div>

                <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  c3ShiftDirection === 'forward' 
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-600'
                }`}>
                  <span>طردي (نحو غاز النشادر NH₃)</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* SVG Balance Scale representation */}
              <div className="w-full max-w-[320px] mt-8 z-10">
                <svg viewBox="0 0 200 120" className="w-full h-auto transition-transform duration-500">
                  {/* Base Stand */}
                  <path d="M 95,95 L 105,95 L 105,30 L 95,30 Z" fill="#475569" />
                  <path d="M 70,95 L 130,95 L 120,110 L 80,110 Z" fill="#334155" />
                  
                  {/* Balance Beam (tilting) */}
                  <g style={{
                    transform: c3ShiftDirection === 'forward' 
                      ? 'rotate(7deg)' 
                      : c3ShiftDirection === 'backward' 
                      ? 'rotate(-7deg)' 
                      : 'rotate(0deg)',
                    transformOrigin: '100px 30px',
                    transition: 'transform 0.5s ease-in-out'
                  }}>
                    {/* Beam Line */}
                    <line x1="40" y1="30" x2="160" y2="30" stroke="#94a3b8" strokeWidth="4" />
                    {/* Center Pin */}
                    <circle cx="100" cy="30" r="5" fill="#f59e0b" />
                    
                    {/* Left Cup Support (Reactants) */}
                    <line x1="40" y1="30" x2="40" y2="60" stroke="#64748b" strokeWidth="2" />
                    <path d="M 20,60 L 60,60 L 50,75 L 30,75 Z" fill={c3ShiftDirection === 'backward' ? '#38bdf8' : '#1e293b'} stroke="#64748b" strokeWidth="2" />
                    <text x="40" y="70" fill={c3ShiftDirection === 'backward' ? '#ffffff' : '#94a3b8'} fontSize="8" fontWeight="bold" textAnchor="middle" style={{direction: 'rtl'}}>المتفاعلات</text>

                    {/* Right Cup Support (Products) */}
                    <line x1="160" y1="30" x2="160" y2="60" stroke="#64748b" strokeWidth="2" />
                    <path d="M 140,60 L 180,60 L 170,75 L 150,75 Z" fill={c3ShiftDirection === 'forward' ? '#10b981' : '#1e293b'} stroke="#64748b" strokeWidth="2" />
                    <text x="160" y="70" fill={c3ShiftDirection === 'forward' ? '#ffffff' : '#94a3b8'} fontSize="8" fontWeight="bold" textAnchor="middle" style={{direction: 'rtl'}}>النواتج</text>
                  </g>
                </svg>
              </div>

              {/* Dynamic summary analysis output */}
              <div className="text-center bg-slate-900/60 p-4 rounded-xl border border-slate-800 w-full z-10">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">أثر انزياح لو شاتيليه المباشر</span>
                <p className="text-xs font-black text-amber-300 mt-1">
                  {c3ShiftDirection === 'forward' 
                    ? 'نشاط طردي (Forward Shift) لإنتاج المزيد من غاز النشادر وزيادة كفاءة التحضير.' 
                    : c3ShiftDirection === 'backward' 
                    ? 'نشاط عكسي (Backward Shift) لتفكك النشادر وزيادة تركيز غازي النيتروجين والهيدروجين.' 
                    : 'النظام في حالة اتزان ديناميكي مثالي، وسرعة التفاعلين متساوية.'}
                </p>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  {c3ShiftDirection === 'forward' 
                    ? 'التفسير العلمي: قمت بتهيئة الظروف لزيادة المتفاعلات أو سحب الحرارة بالتبريد أو زيادة الضغط (الذي يدفع التفاعل نحو الحجم الأقل 2 مول بدلاً من 4 مول غازية في المتفاعلات) مما ينشط التفاعل طردياً.' 
                    : c3ShiftDirection === 'backward'
                    ? 'التفسير العلمي: قمت بالتسخين (الذي يزيح التفاعل الطارد للحرارة نحو اليسار للتخلص من الحرارة المضافة)، أو قمت بخفض الضغط (تحول نحو عدد المولات الغازية الأكبر 4 مول) مما ينشط التفاعل عكسياً.'
                    : 'قم بضبط أي عامل من عوامل التحكم العلوية لرصد موضع الاتزان اللحظي بذكاء.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* CHAPTER 4: GALVANIC VS ELECTROLYTIC CELL */}
      {/* ======================================================= */}
      {chapterId === 4 && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">الخلايا الكهرومغناطيسية والتحليل الكهربي التلقائي</h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              تصفح الفوارق الأساسية والتفاعلية الدقيقة بين الخلايا الجلفانية (تفاعل تلقائي يولد طاقة كهربائية) والخلايا الإلكتروليتية (تحليل غير تلقائي):
            </p>

            {/* Toggle tabs for cell type */}
            <div className="flex justify-center gap-2 mb-5">
              <button
                onClick={() => setC4CellType('galvanic')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  c4CellType === 'galvanic' 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-lg' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                الخلية الجلفانية (تلقائية - Daniel Cell)
              </button>
              <button
                onClick={() => setC4CellType('electrolytic')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  c4CellType === 'electrolytic' 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-lg' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                الخلية الإلكتروليتية (غير تلقائية - التحليلية)
              </button>
            </div>

            {/* Interactive Cell Graphic display */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Graphic container (Left 5 Columns) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative min-h-[220px] overflow-hidden">
                
                {/* Flow of electrons running path */}
                <div className="absolute top-2 flex items-center justify-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-bold">انتقال الإلكترونات e⁻</span>
                  <div className="flex gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping"></span>
                    <span className="text-sky-400 text-xs font-bold">➔</span>
                  </div>
                </div>

                {/* SVG Cell Diagram */}
                <svg viewBox="0 0 200 120" className="w-full max-w-[220px] h-auto mt-4">
                  {c4CellType === 'galvanic' ? (
                    <>
                      {/* Left Beaker (Zn) */}
                      <rect x="20" y="50" width="60" height="50" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                      <rect x="35" y="35" width="10" height="50" fill="#94a3b8" /> {/* Zn Anode */}
                      <text x="40" y="30" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Zn (-)</text>
                      
                      {/* Salt Bridge */}
                      <path d="M 65,55 L 65,40 L 135,40 L 135,55" fill="none" stroke="#f1f5f9" strokeWidth="5" strokeLinecap="round" />
                      
                      {/* Right Beaker (Cu) */}
                      <rect x="120" y="50" width="60" height="50" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                      <rect x="145" y="35" width="10" height="50" fill="#ea580c" /> {/* Cu Cathode */}
                      <text x="150" y="30" fill="#ea580c" fontSize="8" fontWeight="bold" textAnchor="middle">Cu (+)</text>

                      {/* Connection Wire with pulsing electrons */}
                      <path d="M 40,35 L 40,15 L 150,15 L 150,35" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,5" className="anim-heat" />
                      
                      {/* Glowing Lightbulb */}
                      <circle cx="95" cy="15" r="7" fill="#fbbf24" className="animate-pulse" />
                      <path d="M 91,22 L 99,22" stroke="#334155" strokeWidth="1.5" />
                    </>
                  ) : (
                    <>
                      {/* Single Beaker for electrolysis */}
                      <rect x="45" y="45" width="110" height="60" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                      
                      {/* Left Electrode Anode */}
                      <rect x="65" y="30" width="10" height="60" fill="#475569" />
                      <text x="70" y="25" fill="#f8fafc" fontSize="7" fontWeight="bold" textAnchor="middle">Anode (+)</text>
                      
                      {/* Right Electrode Cathode */}
                      <rect x="125" y="30" width="10" height="60" fill="#94a3b8" />
                      <text x="130" y="25" fill="#f8fafc" fontSize="7" fontWeight="bold" textAnchor="middle">Cathode (-)</text>

                      {/* Power supply wires */}
                      <path d="M 70,30 L 70,10 L 130,10 L 130,30" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                      {/* Power DC symbol */}
                      <rect x="92" y="2" width="16" height="16" fill="#2563eb" rx="2" />
                      <text x="100" y="13" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">DC</text>
                    </>
                  )}
                </svg>

                <div className="text-center mt-3">
                  <span className="text-[10px] text-slate-500 block">المحصلة الكهروكيميائية للخلية:</span>
                  <p className={`text-xs font-black ${c4CellType === 'galvanic' ? 'text-amber-400' : 'text-sky-400'}`}>
                    {c4CellType === 'galvanic' ? 'توليد قوة دافعة كهربائية E° = +1.10 V' : 'استهلاك مستمر لطاقة خارجية لإتمام الترسيب'}
                  </p>
                </div>
              </div>

              {/* Text Comparison (Right 7 Columns) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-2 overflow-x-auto">
                  <h5 className="text-xs font-bold text-slate-400">مقارنة الخواص الفنية للأبواب الكهروكيميائية:</h5>
                  <table className="w-full text-[11px] border border-slate-800 text-slate-300">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-bold">
                        <th className="p-2 border border-slate-800 text-center">الخاصية</th>
                        <th className="p-2 border border-slate-800 text-center">الخلية الجلفانية</th>
                        <th className="p-2 border border-slate-800 text-center">الخلية التحليلية</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-slate-800 font-bold text-center">تلقائية التفاعل</td>
                        <td className="p-2 border border-slate-800 text-emerald-400 text-center font-bold">{"تلقائي (ΔG < 0)"}</td>
                        <td className="p-2 border border-slate-800 text-red-400 text-center font-bold">{"غير تلقائي (ΔG > 0)"}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 font-bold text-center">الأنود (المصعد)</td>
                        <td className="p-2 border border-slate-800 text-center text-red-400">شحنة سالبة (-) أكسدة</td>
                        <td className="p-2 border border-slate-800 text-center text-emerald-400">شحنة موجبة (+) أكسدة</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-800 font-bold text-center">الكاثود (المهبط)</td>
                        <td className="p-2 border border-slate-800 text-center text-emerald-400 font-bold">شحنة موجبة (+) اختزال</td>
                        <td className="p-2 border border-slate-800 text-center text-red-400 font-bold">شحنة سالبة (-) اختزال</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    انتبه جيداً يا دكتور للخدعة المفضلة:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">
                    على الرغم من اختلاف شحنات الأقطاب التام بين الخليتين، إلا أن هناك قانوناً كونياً ثابتاً: <strong>الأكسدة دائماً تحدث عند الأنود (المصعد)</strong>، و<strong>الاختزال دائماً يحدث عند الكاثود (المهبط)</strong>! لا توجد خلايا كيميائية تخالف هذه القاعدة.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* CHAPTER 5: ORGANIC HYDROCARBON TREE */}
      {/* ======================================================= */}
      {chapterId === 5 && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">عائلات الهيدروكربونات العضوية والروابط الهندسية</h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              تصفح تصنيف الهيدروكربونات العضوية، ولاحظ الفارق الجوهري بين روابط سيجما (σ) القوية وروابط باي (π) الضعيفة سهلة الكسر:
            </p>

            {/* Tree Navigation Row */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-5">
              <button
                onClick={() => setC5SelectedNode('alkanes')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  c5SelectedNode === 'alkanes' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                الألكانات (Alkanes)
              </button>
              <button
                onClick={() => setC5SelectedNode('alkenes')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  c5SelectedNode === 'alkenes' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                الألكينات (Alkenes)
              </button>
              <button
                onClick={() => setC5SelectedNode('alkynes')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  c5SelectedNode === 'alkynes' 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                الألكاينات (Alkynes)
              </button>
              <button
                onClick={() => setC5SelectedNode('cyclic')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  c5SelectedNode === 'cyclic' 
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                حلقية مشبعة (Cycloalkanes)
              </button>
              <button
                onClick={() => setC5SelectedNode('aromatic')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  c5SelectedNode === 'aromatic' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                أروماتية عطرية (Aromatics)
              </button>
            </div>

            {/* Chemical Visualizers Box */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-white grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Formula and Description (Left 7 Columns) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    c5SelectedNode === 'alkanes' ? 'bg-emerald-950 text-emerald-400' :
                    c5SelectedNode === 'alkenes' ? 'bg-sky-950 text-sky-400' :
                    c5SelectedNode === 'alkynes' ? 'bg-amber-950 text-amber-400' :
                    c5SelectedNode === 'cyclic' ? 'bg-purple-950 text-purple-400' :
                    'bg-red-950 text-red-400'
                  }`}>
                    {c5SelectedNode === 'alkanes' ? 'سلسلة أليفاتية مشبعة' :
                     c5SelectedNode === 'alkenes' ? 'سلسلة أليفاتية غير مشبعة (رابطة ثنائية)' :
                     c5SelectedNode === 'alkynes' ? 'سلسلة أليفاتية غير مشبعة (رابطة ثلاثية)' :
                     c5SelectedNode === 'cyclic' ? 'أليفاتية حلقية مشبعة' :
                     'حلقية عطرية غير مشبعة'}
                  </span>
                </div>

                <h5 className="text-base font-black text-amber-400">
                  {c5SelectedNode === 'alkanes' ? 'عائلة الألكانات (الميثان والبارافينات)' :
                   c5SelectedNode === 'alkenes' ? 'عائلة الألكينات (الأوليفينات)' :
                   c5SelectedNode === 'alkynes' ? 'عائلة الألكاينات (الأسيتيلينات)' :
                   c5SelectedNode === 'cyclic' ? 'الألكانات الحلقية (سيكلو ألكان)' :
                   'الهيدروكربونات الأروماتية (البنزين العطري)'}
                </h5>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 text-left">
                  الصيغة العامة:{' '}
                  <strong className="text-amber-400">
                    {c5SelectedNode === 'alkanes' ? 'C_n H_{2n+2}' :
                     c5SelectedNode === 'alkenes' ? 'C_n H_{2n}' :
                     c5SelectedNode === 'alkynes' ? 'C_n H_{2n-2}' :
                     c5SelectedNode === 'cyclic' ? 'C_n H_{2n} (حلقي)' :
                     'C_n H_{2n-6} (للبنزين العطري)'}
                  </strong>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {c5SelectedNode === 'alkanes' ? 'جميع روابط الألكانات من النوع سيجما (σ) القوية صعبة الكسر المتكونة بالتدخل بالرأس بين الأوربيتالات المهجنة، مما يجعلها خاملة كيميائياً وتتفاعل فقط بالاستبدال (الإحلال) تحت شروط خاصة كالأشعة فوق البنفسجية UV عند 400°م.' :
                   c5SelectedNode === 'alkenes' ? 'تحتوي على رابطة واحدة مزدوجة فيها واحدة من النوع سيجما والأخرى من النوع باي (π) الضعيفة سهلة الكسر المتكونة بالتدخل بالجنب، مما يمنحها نشاطاً كيميائياً عالياً وتتفاعل بالإضافة كالهدرجة والهلجنة.' :
                   c5SelectedNode === 'alkynes' ? 'تحتوي على رابطة ثلاثية تضم رابطة واحدة سيجما ورابطتين ضعيفتين من النوع باي (π). هذا يمنحها نشاطاً كيميائياً فائقاً يجعلها تتفاعل بالإضافة على مرحلتين متتاليتين.' :
                   c5SelectedNode === 'cyclic' ? 'حلقات مشبعة وروابط أحادية سيجما. زوايا الترابط بين الأوربيتالات تحدد النشاط الكيميائي؛ البروبان الحلقي (الزاوية 60) نشط جداً وقابل للانفجار مقارنة بالبنتان والكسان الحلقي المستقرين (الزاوية تقترب من 109.5).' :
                   'تتميز بروابط تبادلية رنينية (Resonance) مستقرة للغاية؛ حيث تتحرك إلكترونات الرابطة باي الستة باستمرار داخل حلقة البنزين السداسية، مما يجعل البنزين يجمع بين تفاعلات الإضافة والاستبدال.'}
                </p>
              </div>

              {/* Graphical chemical structure rendering (Right 5 Columns) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 min-h-[200px] overflow-hidden">
                <span className="text-[10px] text-slate-500 mb-3 block">رسم هندسي للروابط والتداخل المهجن:</span>
                
                {c5SelectedNode === 'alkanes' && (
                  <div className="font-mono text-xs text-emerald-400 text-center space-y-1 select-all animate-pulse">
                    <div>      H      </div>
                    <div>      |      </div>
                    <div>  H - C - H  </div>
                    <div>      |      </div>
                    <div>      H      </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-sans">الميثان Methane (CH₄)</div>
                  </div>
                )}

                {c5SelectedNode === 'alkenes' && (
                  <div className="font-mono text-xs text-sky-400 text-center space-y-1 select-all animate-pulse">
                    <div>  H       H  </div>
                    <div>   \     /   </div>
                    <div>    C = C    </div>
                    <div>   /     \   </div>
                    <div>  H       H  </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-sans">الإيثين Ethene (C₂H₄)</div>
                  </div>
                )}

                {c5SelectedNode === 'alkynes' && (
                  <div className="font-mono text-xs text-amber-400 text-center space-y-1 select-all animate-pulse">
                    <div>  H - C ≡ C - H  </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-sans">الإيثاين Ethyne (C₂H₂)</div>
                  </div>
                )}

                {c5SelectedNode === 'cyclic' && (
                  <div className="font-mono text-xs text-purple-400 text-center space-y-1 select-all animate-pulse">
                    <div>      CH₂      </div>
                    <div>     /   \     </div>
                    <div>    /     \    </div>
                    <div>  CH₂ --- CH₂  </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-sans">البروبان الحلقي Cyclopropane (C₃H₆)</div>
                  </div>
                )}

                {c5SelectedNode === 'aromatic' && (
                  <div className="font-mono text-xs text-red-400 text-center space-y-0 select-all animate-pulse">
                    <div>    / \    </div>
                    <div>   |  O |   </div>
                    <div>    \ /    </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-sans">البنزين العطري Benzene (C₆H₆)</div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
