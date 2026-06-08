import { useState, useMemo } from 'preact/hooks';

interface Final {
  year: number;
  date: string;
  tournament: string;
  level: string;
  surface: string;
  winner_name: string;
  runner_up_name: string;
  score: string;
}

export default function TournamentFilter({ finals }: { finals: Final[] }) {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTournamentName, setSelectedTournamentName] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const years = useMemo(() => {
    return Array.from(new Set(finals.map(f => f.year.toString()))).sort((a, b) => b.localeCompare(a));
  }, [finals]);

  const tournamentNames = useMemo(() => {
    return Array.from(new Set(finals.map(f => f.tournament))).sort();
  }, [finals]);

  const filteredFinals = useMemo(() => {
    const filtered = finals.filter(f => {
      const matchYear = selectedYear === '' || f.year.toString() === selectedYear;
      const matchTournament = selectedTournamentName === '' || f.tournament === selectedTournamentName;
      return matchYear && matchTournament;
    });
    return [...filtered].sort((a, b) => sortOrder === 'desc' ? b.year - a.year : a.year - b.year);
  }, [finals, selectedYear, selectedTournamentName, sortOrder]);

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tight">
            Historique des <span className="text-emerald-500">Finales</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            {filteredFinals.length} Finale{filteredFinals.length > 1 ? 's' : ''} affichée{filteredFinals.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none transition-all hover:border-emerald-500/30 min-w-[170px]"
            value={selectedYear}
            onChange={(e) => setSelectedYear((e.target as HTMLSelectElement).value)}
          >
            <option value="">Toutes les années</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select 
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none transition-all hover:border-emerald-500/30"
            value={selectedTournamentName}
            onChange={(e) => setSelectedTournamentName((e.target as HTMLSelectElement).value)}
          >
            <option value="">Tous les tournois</option>
            {tournamentNames.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button 
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-slate-400 hover:border-emerald-500/30 transition-all focus:ring-2 focus:ring-emerald-500/50 group"
            title={sortOrder === 'desc' ? "Trier du plus ancien au plus récent" : "Trier du plus récent au plus ancien"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFinals.map((f: Final) => (
          <div key={`${f.year}-${f.tournament}-${f.winner_name}`} className="group relative overflow-hidden rounded-[2rem] bg-white/5 p-7 border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl font-black">{f.year}</span>
            </div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${f.level === 'Grand Chelem' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                {f.level}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold mb-1 group-hover:text-emerald-400 transition-colors leading-tight">{f.tournament}</h3>
            <p className="text-slate-500 text-[10px] mb-8 uppercase font-black tracking-widest">{f.surface}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="font-bold text-sm flex items-center gap-3">🏆 <span className="text-slate-200">{f.winner_name}</span></span>
              </div>
              <div className="flex justify-between items-center px-3 text-xs text-slate-400 italic">
                <span className="opacity-50">🥈 {f.runner_up_name}</span>
                <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">{f.score}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredFinals.length === 0 && (
          <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center col-span-full">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Aucune finale trouvée pour cette sélection</p>
          </div>
        )}
      </div>
    </div>
  );
}