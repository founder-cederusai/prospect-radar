import React, { useState } from 'react';
import { Player, SkillRatings } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface CompareViewProps {
  allPlayers: Player[];
  initialSelection: string[];
}

const SKILL_KEYS: (keyof SkillRatings)[] = ['Skating', 'Shooting', 'Hands', 'Passing', 'IQ', 'Defense', 'Physicality', 'Compete'];

const CompareView: React.FC<CompareViewProps> = ({ allPlayers, initialSelection }) => {
  // Slots 1-4
  const [selectedNames, setSelectedNames] = useState<string[]>(() => {
    // Pad with empty strings if less than 4
    const initial = [...initialSelection];
    while(initial.length < 4) initial.push('');
    return initial.slice(0, 4);
  });

  const [chartMode, setChartMode] = useState<'stats' | 'skills'>('stats');

  const updateSlot = (index: number, name: string) => {
    const newSlots = [...selectedNames];
    newSlots[index] = name;
    setSelectedNames(newSlots);
  };

  // Get full player objects
  const activePlayers = selectedNames
    .map(name => allPlayers.find(p => p.Name === name))
    .filter((p): p is Player => !!p);

  // --- Chart Data Preparation ---

  // 1. Stats Profile (Normalized 0-100 for viz)
  const statsRadarData = [
    { subject: 'NHLe', fullMark: 100 },
    { subject: 'PPG', fullMark: 2.0 },
    { subject: 'CompScore', fullMark: 100 },
    { subject: 'StatsScore', fullMark: 100 },
    { subject: 'RankScore', fullMark: 100 },
    { subject: 'GP', fullMark: 70 },
  ].map(metric => {
    const dataPoint: any = { subject: metric.subject };
    activePlayers.forEach(p => {
        let val = 0;
        if (metric.subject === 'NHLe') val = (p.NHLe / 100) * 100;
        else if (metric.subject === 'PPG') val = (p.PPG / 2.0) * 100;
        else if (metric.subject === 'CompScore') val = p.CompositeScore;
        else if (metric.subject === 'StatsScore') val = p.StatsScore;
        else if (metric.subject === 'RankScore') val = p.RankScore;
        else if (metric.subject === 'GP') val = (p.GP / 70) * 100;
        
        dataPoint[p.Name] = Math.min(100, Math.max(0, val));
    });
    return dataPoint;
  });

  // 2. Skills Profile (Raw 20-80 scale)
  const skillsRadarData = SKILL_KEYS.map(key => {
    const dataPoint: any = { subject: key };
    activePlayers.forEach(p => {
      // Default to 50 (Average) if undefined
      const val = p.scouting?.skills ? p.scouting.skills[key] : 50;
      dataPoint[p.Name] = val;
    });
    return dataPoint;
  });

  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#eab308'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Player Comparison</h2>
        
        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           {[0, 1, 2, 3].map((idx) => (
             <div key={idx} className="relative">
               <label className="block text-xs font-medium text-slate-400 mb-1">Slot {idx + 1}</label>
               <select 
                 className="w-full bg-slate-900 border border-slate-700 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 value={selectedNames[idx]}
                 onChange={(e) => updateSlot(idx, e.target.value)}
               >
                 <option value="">-- Empty --</option>
                 {allPlayers.map(p => (
                   <option key={p.Name} value={p.Name}>{p.Name}</option>
                 ))}
               </select>
               <div className={`h-1 w-full mt-2 rounded-full`} style={{backgroundColor: selectedNames[idx] ? colors[idx] : 'transparent'}}></div>
             </div>
           ))}
        </div>

        {activePlayers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Select players above to begin comparison.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Section */}
            <div className="lg:col-span-1 flex flex-col">
              {/* Toggle Switch */}
              <div className="flex bg-slate-900 p-1 rounded-lg mb-4 self-center w-full max-w-[240px] border border-slate-700">
                 <button 
                    onClick={() => setChartMode('stats')}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-all ${chartMode === 'stats' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                    Stats Profile
                 </button>
                 <button 
                    onClick={() => setChartMode('skills')}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-all ${chartMode === 'skills' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                    Skillset
                 </button>
              </div>

              <div className="h-80 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartMode === 'stats' ? statsRadarData : skillsRadarData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={chartMode === 'stats' ? [0, 100] : [20, 80]} 
                        tick={false} 
                        axisLine={false} 
                    />
                    {activePlayers.map((player, i) => (
                      <Radar
                        key={player.Name}
                        name={player.Name}
                        dataKey={player.Name}
                        stroke={colors[selectedNames.indexOf(player.Name)]}
                        fill={colors[selectedNames.indexOf(player.Name)]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                {chartMode === 'skills' && (
                    <div className="absolute bottom-0 right-0 text-[10px] text-slate-600">Scale: 20-80</div>
                )}
              </div>
            </div>

            {/* Metrics Table */}
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900">
                  <tr>
                    <th className="px-4 py-3">Metric</th>
                    {activePlayers.map((p, i) => (
                      <th key={p.Name} className="px-4 py-3" style={{ color: colors[selectedNames.indexOf(p.Name)] }}>
                        {p.Name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {/* General Stats */}
                  <tr className="bg-slate-800/30"><td colSpan={1 + activePlayers.length} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Production & Rank</td></tr>
                  <tr><td className="px-4 py-3 font-medium">Composite Score</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3 font-bold">{p.CompositeScore}</td>)}</tr>
                  <tr><td className="px-4 py-3 font-medium">NHLe</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3 text-blue-300">{p.NHLe}</td>)}</tr>
                  <tr><td className="px-4 py-3">Tier</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3">{p.Tier}</td>)}</tr>
                  <tr><td className="px-4 py-3">Avg Rank</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3">{p.AvgRank}</td>)}</tr>
                  <tr><td className="px-4 py-3">League</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3">{p.League}</td>)}</tr>
                  <tr><td className="px-4 py-3">Position</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3">{p.Position}</td>)}</tr>
                  <tr><td className="px-4 py-3">Height/Weight</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3">{p.Height} / {p.Weight}</td>)}</tr>
                  <tr><td className="px-4 py-3">GP</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3">{p.GP}</td>)}</tr>
                  <tr><td className="px-4 py-3">PPG</td>{activePlayers.map(p => <td key={p.Name} className="px-4 py-3">{p.PPG.toFixed(2)}</td>)}</tr>

                  {/* Skill Breakdown */}
                  <tr className="bg-slate-800/30"><td colSpan={1 + activePlayers.length} className="px-4 py-2 text-xs font-bold text-indigo-400/70 uppercase tracking-wider">Scouting Grades (20-80)</td></tr>
                  {SKILL_KEYS.map(skill => (
                      <tr key={skill}>
                          <td className="px-4 py-2 text-slate-400">{skill}</td>
                          {activePlayers.map(p => {
                              const val = p.scouting?.skills ? p.scouting.skills[skill] : 50;
                              return <td key={p.Name} className={`px-4 py-2 font-mono ${val >= 60 ? 'text-green-400' : val <= 40 ? 'text-red-400' : 'text-slate-300'}`}>{val}</td>
                          })}
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CompareView;