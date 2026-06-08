import { useState, useMemo } from 'preact/hooks';

interface Title {
  year: number;
  tournament: string;
  level: string;
  surface: string;
  defeated: string;
  score: string;
}

export default function PlayerTitles({ titles }: { titles: Title[] }) {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const years = useMemo(() => {
    return Array.from(new Set(titles.map(t => t.year.toString()))).sort((a, b) => b.localeCompare(a));
  }, [titles]);

  const tournaments = useMemo(() => {
    return Array.from(new Set(titles.map(t => t.tournament))).sort();
  }, [titles]);

  const filteredTitles = useMemo(() => {
    const filtered = titles.filter(t => {
      const matchYear = selectedYear === '' || t.year.toString() === selectedYear;
      const matchTournament = selectedTournament === '' || t.tournament === selectedTournament;
      return matchYear && matchTournament;
    });
    return [...filtered].sort((a, b) => sortOrder === 'desc' ? b.year - a.year : a.year - b.year);
  }, [titles, selectedYear, selectedTournament, sortOrder]);

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tight">
            Palmarès <span className="text-emerald-500">Détaillé</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            {filteredTitles.length} Titre{filteredTitles.length > 1 ? 's' : ''} affiché{filteredTitles.length > 1 ? 's' : ''}
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
            value={selectedTournament}
            onChange={(e) => setSelectedTournament((e.target as HTMLSelectElement).value)}
          >
            <option value="">Tous les tournois</option>
            {tournaments.map(t => <option key={t} value={t}>{t}</option>)}
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

      <div className="absolute -left-4 top-24 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 to-transparent hidden md:block"></div>
      
      <div className="grid gap-4">
        {filteredTitles.map((t, index) => (
          <div key={`${t.year}-${t.tournament}-${index}`} className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <span className="text-2xl font-black text-slate-700 group-hover:text-emerald-500/30 transition-colors">{t.year}</span>
              <div>
                <h4 className="text-lg font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{t.tournament}</h4>
                <p className="text-xs text-slate-400 font-medium">
                  🏆 Bat <span className="text-slate-200">{t.defeated}</span> <span className="ml-2 font-mono text-slate-500">({t.score})</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-white/10 text-slate-500 uppercase tracking-widest">{t.surface}</span>
               <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${t.level === 'Grand Chelem' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{t.level}</span>
            </div>
          </div>
        ))}
        {filteredTitles.length === 0 && (
          <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Aucun titre trouvé pour cette sélection</p>
          </div>
        )}
      </div>
    </div>
  );
}