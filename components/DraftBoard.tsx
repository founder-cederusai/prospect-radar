import React from 'react';
import { Player, SortField, SortDirection } from '../types';

interface DraftBoardProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  sortField: SortField;
  sortDir: SortDirection;
  onSort: (field: SortField) => void;
}

const DraftBoard: React.FC<DraftBoardProps> = ({ 
  players, 
  onSelectPlayer, 
  sortField, 
  sortDir, 
  onSort 
}) => {
  
  const handleSort = (field: SortField) => {
    onSort(field);
  };

  const Arrow = () => (
    <span className="ml-1 text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400">
          <tr>
            <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('AvgRank')}>
              Avg Rank {sortField === 'AvgRank' && <Arrow />}
            </th>
            <th scope="col" className="px-6 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('Tier')}>
              Tier {sortField === 'Tier' && <Arrow />}
            </th>
            <th scope="col" className="px-6 py-3">Player</th>
            <th scope="col" className="px-6 py-3">Pos</th>
            <th scope="col" className="px-6 py-3">League</th>
            <th scope="col" className="px-6 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('PPG')}>
              PPG {sortField === 'PPG' && <Arrow />}
            </th>
            <th scope="col" className="px-6 py-3 text-right cursor-pointer hover:text-white text-blue-400" onClick={() => handleSort('NHLe')}>
              NHLe {sortField === 'NHLe' && <Arrow />}
            </th>
            <th scope="col" className="px-6 py-3 text-right cursor-pointer hover:text-white text-green-400" onClick={() => handleSort('CompositeScore')}>
              Comp. Score {sortField === 'CompositeScore' && <Arrow />}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {players.map((player) => (
            <tr 
              key={player.Name} 
              onClick={() => onSelectPlayer(player)}
              className="cursor-pointer hover:bg-slate-700 transition-colors"
            >
              <td className="px-6 py-4 font-mono">{player.AvgRank === 0 ? '-' : player.AvgRank}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  player.Tier === 1 ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20' :
                  player.Tier === 2 ? 'bg-gray-400/10 text-gray-400 ring-gray-400/20' :
                  'bg-slate-400/10 text-slate-400 ring-slate-400/20'
                }`}>
                  Tier {player.Tier}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-white">
                <div>{player.Name}</div>
                <div className="text-xs text-slate-500">{player.Height} / {player.Weight}lbs</div>
              </td>
              <td className="px-6 py-4">{player.Position} ({player.Shoots})</td>
              <td className="px-6 py-4">{player.League} <span className="text-slate-500 text-xs">({player.Country})</span></td>
              <td className="px-6 py-4 text-right">{player.PPG.toFixed(2)}</td>
              <td className="px-6 py-4 text-right font-bold text-blue-300">{player.NHLe}</td>
              <td className="px-6 py-4 text-right font-bold text-green-300">{player.CompositeScore}</td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                No players match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DraftBoard;