
import React, { useEffect, useState, useMemo } from 'react';
import { Player, FilterState, SortField, SortDirection } from './types';
import { getProcessedPlayers } from './services/sheetService';
import DraftBoard from './components/DraftBoard';
import PlayerCard from './components/PlayerCard';
import CompareView from './components/CompareView';
import { Logo, LogoIcon } from './components/Brand';

type View = 'draft' | 'compare';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('draft');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);

  // Filtering & Sorting State
  const [filters, setFilters] = useState<FilterState>({
    minTier: 1,
    maxTier: 5,
    leagues: [],
    positions: [],
    searchQuery: '',
    minComposite: 0
  });
  const [sortField, setSortField] = useState<SortField>('AvgRank');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getProcessedPlayers();
      setPlayers(data);
      setLoading(false);
    };
    fetchData();

    // Listen for storage events to update tags/watchlist dynamically across tabs
    const handleStorageChange = () => {
        fetchData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // SYNC: Ensure selectedPlayer stays updated when global players list updates (e.g. after adding live stats)
  useEffect(() => {
    if (selectedPlayer) {
        const updated = players.find(p => p.Name === selectedPlayer.Name);
        if (updated) {
            setSelectedPlayer(updated);
        }
    }
  }, [players]);

  // Filter Logic
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      if (p.Tier < filters.minTier || p.Tier > filters.maxTier) return false;
      if (p.CompositeScore < filters.minComposite) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        // Complex query handling like "big defensemen" could go here
        // Simple search:
        const matchesName = p.Name.toLowerCase().includes(query);
        const matchesLeague = p.League.toLowerCase().includes(query);
        return matchesName || matchesLeague;
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      // Special handling for AvgRank: 0 (Unranked) goes to bottom always
      if (sortField === 'AvgRank') {
        const aIsZero = valA === 0;
        const bIsZero = valB === 0;
        
        if (aIsZero && bIsZero) return 0;
        if (aIsZero) return 1; // A (0) goes to bottom
        if (bIsZero) return -1; // B (0) goes to bottom
      }
      
      // Standard Sort
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, filters, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Smart Defaults: 
      // Ranks/Tier -> Ascending (1 is better than 10)
      // Stats -> Descending (100 is better than 10)
      if (field === 'AvgRank' || field === 'Tier') {
          setSortDir('asc');
      } else {
          setSortDir('desc');
      }
    }
  };

  const addToCompare = (player: Player) => {
    if (!compareList.includes(player.Name)) {
      if (compareList.length < 4) {
        setCompareList([...compareList, player.Name]);
      } else {
        // Shift check (FIFO)
        setCompareList([...compareList.slice(1), player.Name]);
      }
    }
    setCurrentView('compare');
    setSelectedPlayer(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Branding */}
              <div className="flex items-center shrink-0 cursor-pointer" onClick={() => setCurrentView('draft')}>
                {/* Mobile Icon */}
                <div className="md:hidden">
                   <LogoIcon className="h-8 w-8 text-indigo-500" />
                </div>
                {/* Desktop Logo */}
                <div className="hidden md:block">
                   <Logo className="h-9" />
                </div>
              </div>
              
              {/* Navigation Items - Visible on all screens */}
              <div className="flex items-center space-x-1 border-l border-slate-700 pl-6 h-8">
                <button 
                  onClick={() => setCurrentView('draft')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'draft' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  Draft Board
                </button>
                <button 
                  onClick={() => setCurrentView('compare')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'compare' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  Compare
                </button>
              </div>
            </div>
            
            {/* Quick Search - Desktop Only */}
            <div className="relative hidden md:block w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                 <svg className="w-4 h-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                 </svg>
              </div>
              <input 
                type="text"
                placeholder="Search player, league..."
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 flex-col gap-4">
             <LogoIcon className="h-12 w-12 text-slate-600 animate-pulse" />
             <div className="text-slate-500 font-medium">Loading Scouting Data...</div>
          </div>
        ) : (
          <>
            {currentView === 'draft' && (
              <div className="space-y-4">
                {/* Mobile Search */}
                <div className="md:hidden relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                       <svg className="w-4 h-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                       </svg>
                    </div>
                    <input 
                    type="text"
                    placeholder="Search players..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                    />
                </div>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Draft Board</h2>
                        <p className="text-slate-400 text-sm">Class of 2024 • {filteredPlayers.length} Prospects Found</p>
                    </div>
                    <div className="text-xs text-slate-600 hidden sm:block font-mono">
                        SRC: Players A-S | METRICS: T-W
                    </div>
                </div>
                <DraftBoard 
                  players={filteredPlayers} 
                  onSelectPlayer={setSelectedPlayer}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </div>
            )}

            {currentView === 'compare' && (
              <CompareView 
                allPlayers={players} 
                initialSelection={compareList} 
              />
            )}
          </>
        )}
      </main>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerCard 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
          onAddToCompare={addToCompare}
        />
      )}

    </div>
  );
};

export default App;
