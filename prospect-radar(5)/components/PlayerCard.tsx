
import React, { useState, useEffect } from 'react';
import { Player, SkillRatings, IntelResult } from '../types';
import { toggleWatchPlayer, addTagToPlayer, removeTagFromPlayer, savePlayerSkills, savePlayerStats, addPlayerNote, deletePlayerNote } from '../services/sheetService';
import { fetchPlayerIntel } from '../services/aiService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface PlayerCardProps {
  player: Player | null;
  onClose: () => void;
  onAddToCompare: (player: Player) => void;
}

const SKILL_KEYS: (keyof SkillRatings)[] = ['Skating', 'Shooting', 'Hands', 'Passing', 'IQ', 'Defense', 'Physicality', 'Compete'];

const getRatingColor = (val: number) => {
  if (val >= 65) return 'text-green-400';
  if (val >= 50) return 'text-blue-400';
  if (val >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClose, onAddToCompare }) => {
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  
  // Scouting Edit State
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [localSkills, setLocalSkills] = useState<SkillRatings | null>(null);

  // Notebook vs AI State
  const [activeTab, setActiveTab] = useState<'notes' | 'ai'>('notes');
  const [aiIntel, setAiIntel] = useState<IntelResult | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);

  // Sync local skills with player data on open
  useEffect(() => {
    if (player) {
      setLocalSkills(player.scouting?.skills || null);
      // Reset AI state when switching players
      setAiIntel(null);
      setLoadingIntel(false);
      setIntelError(null);
      setActiveTab('notes');
    }
  }, [player]);

  if (!player || !localSkills) return null;

  // --- Handlers ---
  
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      addTagToPlayer(player.Name, newTag.trim());
      setNewTag('');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      addPlayerNote(player.Name, newNote.trim());
      setNewNote('');
    }
  };

  const handleSaveSkills = () => {
    if (localSkills) {
      savePlayerSkills(player.Name, localSkills);
      setIsEditingSkills(false);
    }
  };

  const handleApplyAiSkills = () => {
    if (aiIntel?.suggestedSkills) {
      setLocalSkills(aiIntel.suggestedSkills);
      savePlayerSkills(player.Name, aiIntel.suggestedSkills);
    }
  };

  const handleApplyLiveStats = () => {
      if (aiIntel?.foundStats) {
          savePlayerStats(player.Name, aiIntel.foundStats);
          // Visual feedback can be handled by app re-sync
      }
  };

  const handleSkillChange = (key: keyof SkillRatings, val: string) => {
    const num = parseInt(val);
    setLocalSkills(prev => prev ? { ...prev, [key]: num } : null);
  };

  const handleFetchIntel = async () => {
    setLoadingIntel(true);
    setIntelError(null);
    try {
      const result = await fetchPlayerIntel(player.Name, player.League, player.Country);
      setAiIntel(result);
    } catch (e: any) {
      setIntelError(e.message || "Failed to fetch updated intel.");
    } finally {
      setLoadingIntel(false);
    }
  };

  const switchToAI = () => {
    setActiveTab('ai');
  };

  // --- Chart Data Preparation ---
  const radarData = SKILL_KEYS.map(key => ({
    subject: key,
    A: localSkills[key],
    B: aiIntel?.suggestedSkills ? aiIntel.suggestedSkills[key] : undefined, // Add ghost AI data if available
    fullMark: 80 
  }));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] h-full md:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 md:p-6 border-b border-slate-700 flex justify-between items-start shrink-0">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white">{player.Name}</h2>
              <span className="self-start md:self-auto px-2 py-0.5 rounded text-sm bg-slate-700 text-slate-300 border border-slate-600">
                {player.Position} / {player.Shoots}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              {player.League} ({player.Country}) • {player.Height} • {player.Weight} lbs • {player.Age} yrs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={switchToAI}
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-500/20 border border-blue-400/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ✨ AI Scout Report
            </button>
            <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Data & Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Rankings */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Consensus Rankings</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                    <div className="text-slate-400 text-[10px] uppercase">Avg Rank</div>
                    <div className="text-xl font-bold text-white">{player.AvgRank === 0 ? '-' : player.AvgRank}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                    <div className="text-slate-400 text-[10px] uppercase">Tier</div>
                    <div className="text-xl font-bold text-yellow-500">{player.Tier}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                    <div className="text-slate-400 text-[10px] uppercase">Comp. Score</div>
                    <div className="text-xl font-bold text-green-400">{player.CompositeScore}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                    <div className="text-slate-400 text-[10px] uppercase">Rank Score</div>
                    <div className="text-xl font-bold text-slate-300">{player.RankScore}</div>
                  </div>
                </div>
              </div>

              {/* Production */}
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Production</h3>
                    {player.hasLiveStats && (
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">LIVE</span>
                    )}
                 </div>
                 <div className={`bg-slate-800/50 p-4 rounded-lg border ${player.hasLiveStats ? 'border-red-500/30' : 'border-slate-700'}`}>
                  <div className="grid grid-cols-5 gap-2 text-center mb-4">
                    <div><div className="text-[10px] text-slate-500">GP</div><div className="font-bold text-white">{player.GP}</div></div>
                    <div><div className="text-[10px] text-slate-500">G</div><div className="font-bold text-white">{player.G}</div></div>
                    <div><div className="text-[10px] text-slate-500">A</div><div className="font-bold text-white">{player.A}</div></div>
                    <div><div className="text-[10px] text-slate-500">P</div><div className="font-bold text-white">{player.P}</div></div>
                    <div><div className="text-[10px] text-slate-500">PPG</div><div className="font-bold text-white">{player.PPG.toFixed(2)}</div></div>
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400 font-medium">NHLe (82g)</span>
                        <span className="text-xl font-bold text-blue-400">{player.NHLe}</span>
                     </div>
                     <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (player.NHLe / 100) * 100)}%` }}></div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                 <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tags</h3>
                 <div className="flex flex-wrap gap-2">
                   {player.tags.map(tag => (
                     <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                       {tag}
                       <button onClick={() => removeTagFromPlayer(player.Name, tag)} className="ml-1.5 hover:text-white">×</button>
                     </span>
                   ))}
                 </div>
                 <form onSubmit={handleAddTag} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="+ Tag"
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition-colors">Add</button>
                 </form>
              </div>

            </div>

            {/* MIDDLE COLUMN: Skill Analyzer (4 cols) */}
            <div className="lg:col-span-4 flex flex-col min-h-[400px] bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 relative">
              <div className="flex justify-between items-center mb-2 z-10 relative">
                 <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Skill Analyzer
                 </h3>
                 {!isEditingSkills ? (
                    <button onClick={() => setIsEditingSkills(true)} className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 px-2 py-1 rounded transition-colors">Edit</button>
                 ) : (
                    <div className="flex gap-2">
                       <button onClick={() => setIsEditingSkills(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                       <button onClick={handleSaveSkills} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500">Save</button>
                    </div>
                 )}
              </div>

              {!isEditingSkills ? (
                <div className="flex-1 min-h-[320px] relative -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[20, 80]} tick={false} axisLine={false} />
                      {/* Live AI Ghost Data */}
                      {aiIntel?.suggestedSkills && (
                         <Radar
                            name="AI Suggestion"
                            dataKey="B"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            fill="#3b82f6"
                            fillOpacity={0.1}
                         />
                      )}
                      <Radar
                        name={player.Name}
                        dataKey="A"
                        stroke="#818cf8"
                        strokeWidth={3}
                        fill="#818cf8"
                        fillOpacity={0.5}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
                        itemStyle={{ color: '#818cf8' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-2 right-2 text-[10px] text-slate-600">Scale: 20-80 (Avg: 50)</div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                   <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                   {SKILL_KEYS.map(key => (
                      <div key={key} className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                         <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-300 font-medium">{key}</span>
                            <span className={`font-bold ${getRatingColor(localSkills[key])}`}>{localSkills[key]}</span>
                         </div>
                         <input 
                           type="range" 
                           min="20" 
                           max="80" 
                           step="1"
                           value={localSkills[key]} 
                           onChange={(e) => handleSkillChange(key, e.target.value)}
                           className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                         />
                         <div className="flex justify-between text-[8px] text-slate-600 mt-1 uppercase tracking-wide">
                            <span>Poor</span>
                            <span>Avg</span>
                            <span>Elite</span>
                         </div>
                      </div>
                   ))}
                   </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Notebook & AI (4 cols) */}
            <div className="lg:col-span-4 flex flex-col h-full min-h-[300px]">
               {/* Tab Header */}
               <div className="flex items-center gap-1 mb-4 border-b border-slate-700">
                 <button 
                   onClick={() => setActiveTab('notes')}
                   className={`flex-1 md:flex-none px-3 py-2 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'notes' ? 'border-yellow-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    My Notes
                 </button>
                 <button 
                   onClick={() => setActiveTab('ai')}
                   className={`flex-1 md:flex-none px-3 py-2 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'ai' ? 'border-blue-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/></svg>
                    AI Intel
                 </button>
               </div>
               
               <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden relative">
                  
                  {activeTab === 'notes' ? (
                    <>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[400px]">
                        {player.scouting?.notes && player.scouting.notes.length > 0 ? (
                            player.scouting.notes.map(note => (
                              <div key={note.id} className="bg-slate-700/50 p-3 rounded text-sm group relative border border-slate-600/50">
                                  <p className="text-slate-200 whitespace-pre-wrap">{note.text}</p>
                                  <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
                                    <span>{note.date}</span>
                                    <button 
                                        onClick={() => deletePlayerNote(player.Name, note.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                    >
                                        Delete
                                    </button>
                                  </div>
                              </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                              <p className="italic text-sm">No notes added yet.</p>
                            </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-900 border-t border-slate-700">
                        <form onSubmit={handleAddNote}>
                            <textarea 
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Enter scouting observation..."
                              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-20"
                            />
                            <div className="flex justify-end mt-2">
                              <button 
                                  type="submit" 
                                  disabled={!newNote.trim()}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded"
                              >
                                  Save Note
                              </button>
                            </div>
                        </form>
                      </div>
                    </>
                  ) : (
                    // AI TAB CONTENT
                    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                      {!aiIntel && !loadingIntel && !intelError ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                           <div className="bg-blue-500/10 p-4 rounded-full">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>
                           </div>
                           <div className="space-y-1">
                             <h4 className="text-white font-medium">Scout with AI</h4>
                             <p className="text-sm text-slate-400 max-w-[200px] mx-auto">
                               Retrieve recent game logs, updated scouting reports, and news from the web.
                             </p>
                           </div>
                           <button 
                             onClick={handleFetchIntel}
                             className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
                           >
                             Find Latest Intel
                           </button>
                        </div>
                      ) : loadingIntel ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-3">
                           <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                           <p className="text-sm text-blue-300 animate-pulse">Searching Google...</p>
                        </div>
                      ) : intelError ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <p className="text-red-400 text-sm mb-4">{intelError}</p>
                          <button 
                             onClick={handleFetchIntel}
                             className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded"
                           >
                             Try Again
                           </button>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-fade-in">
                          
                          {/* 1. AUTO-SCOUT DASHBOARD */}
                          {(aiIntel?.foundStats || aiIntel?.suggestedSkills) && (
                              <div className="bg-slate-900/50 rounded-lg border border-blue-500/30 overflow-hidden">
                                  <div className="bg-blue-500/10 px-3 py-2 border-b border-blue-500/20 flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                     <span className="text-xs font-bold text-blue-300 uppercase">Live Data Found</span>
                                  </div>
                                  <div className="p-3 space-y-4">
                                      {/* Stats Comparison */}
                                      {aiIntel.foundStats && (
                                          <div>
                                              <div className="flex justify-between items-center mb-1">
                                                  <span className="text-[10px] uppercase text-slate-500">Production</span>
                                                  <button 
                                                    onClick={handleApplyLiveStats}
                                                    className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors shadow-sm"
                                                  >
                                                      Override Sheet
                                                  </button>
                                              </div>
                                              <div className="flex items-center justify-between bg-slate-800 p-2 rounded text-xs">
                                                  <div className="opacity-60">{player.GP}GP • {player.G}G • {player.A}A • {player.P}P</div>
                                                  <div className="text-slate-500">vs</div>
                                                  <div className="font-bold text-white">{aiIntel.foundStats.GP}GP • {aiIntel.foundStats.G}G • {aiIntel.foundStats.A}A • {aiIntel.foundStats.P}P</div>
                                              </div>
                                          </div>
                                      )}

                                      {/* Skills Comparison */}
                                      {aiIntel.suggestedSkills && (
                                          <div>
                                               <div className="flex justify-between items-center mb-2">
                                                  <span className="text-[10px] uppercase text-slate-500">Scouting Grades</span>
                                                  <button 
                                                    onClick={handleApplyAiSkills}
                                                    className="text-[10px] bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded transition-colors"
                                                  >
                                                      Apply AI Skills
                                                  </button>
                                               </div>
                                               <div className="grid grid-cols-4 gap-1">
                                                   {SKILL_KEYS.slice(0, 4).map(k => (
                                                       <div key={k} className="bg-slate-800 p-1.5 rounded text-center">
                                                           <div className="text-[9px] text-slate-400 mb-0.5">{k.slice(0,3)}</div>
                                                           <div className="flex justify-center gap-1 text-[10px]">
                                                               <span className="opacity-50">{localSkills[k]}</span>
                                                               <span className="text-blue-400 font-bold">{aiIntel.suggestedSkills![k]}</span>
                                                           </div>
                                                       </div>
                                                   ))}
                                               </div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                          {/* 2. TEXT SUMMARY */}
                          <div className="prose prose-invert prose-sm max-w-none">
                            <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                              {aiIntel?.text}
                            </div>
                          </div>
                          
                          {/* 3. SOURCES */}
                          {aiIntel?.sources && aiIntel.sources.length > 0 && (
                            <div className="pt-4 border-t border-slate-700/50">
                              <h5 className="text-[10px] font-bold uppercase text-slate-500 mb-2">Sources</h5>
                              <ul className="space-y-1.5">
                                {aiIntel.sources.slice(0, 3).map((source, i) => (
                                  <li key={i}>
                                    <a 
                                      href={source.uri} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 hover:underline truncate"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0"></span>
                                      <span className="truncate">{source.title}</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-slate-700 bg-slate-800 flex justify-between items-center shrink-0">
          <button 
             onClick={() => toggleWatchPlayer(player.Name)}
             className={`flex items-center gap-2 px-3 py-2 md:px-4 text-sm md:text-base rounded-lg border transition-colors ${
               player.isWatched 
                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' 
                : 'bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700'
             }`}
          >
             {player.isWatched ? '★ Watchlist' : '☆ Watch'}
          </button>

          <button 
            onClick={() => onAddToCompare(player)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 md:px-4 rounded-lg text-sm md:text-base font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Add to Compare
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
