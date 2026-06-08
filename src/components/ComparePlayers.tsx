import { useState, useMemo, useEffect } from 'preact/hooks';
import type { Player } from '../api/data';
import PlayerImage from './PlayerImage';

// On sort le composant Selector ici pour qu'il soit stable et ne provoque pas de perte de focus
const Selector = ({ search, setSearch, filtered, setPlayerId, label }: any) => (
  <div className="relative group">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{label}</p>
    <input
      type="text"
      value={search}
      onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
      placeholder="Chercher un joueur..."
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-bold uppercase italic text-sm"
    />
    {filtered.length > 0 && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
        {filtered.map((p: Player) => (
          <button
            key={p.id}
            onClick={() => { setPlayerId(p.id); setSearch(p.full_name); }}
            className="w-full px-6 py-4 text-left hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border-b border-white/5 last:border-0 text-sm font-bold uppercase italic"
          >
            {p.full_name} <span className="text-[10px] text-slate-500 ml-2">({p.country})</span>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default function ComparePlayers({ players, allMatches }: { players: Player[], allMatches: any[] }) {
  const [p1Id, setP1Id] = useState<string | null>(null);
  const [p2Id, setP2Id] = useState<string | null>(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  
  // États pour les termes de recherche "debounced"
  const [debouncedSearch1, setDebouncedSearch1] = useState('');
  const [debouncedSearch2, setDebouncedSearch2] = useState('');

  // Effet pour débouncer search1
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch1(search1);
    }, 300); // Délai de 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [search1]); // Se déclenche quand search1 change

  // Effet pour débouncer search2
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch2(search2);
    }, 300); // Délai de 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [search2]); // Se déclenche quand search2 change

  const p1 = useMemo(() => players.find(p => p.id === p1Id), [p1Id, players]);
  const p2 = useMemo(() => players.find(p => p.id === p2Id), [p2Id, players]);

  const filtered1 = useMemo(() => { // Utilise debouncedSearch1
    if (!debouncedSearch1 || (p1 && debouncedSearch1 === p1.full_name)) return [];
    return debouncedSearch1.length > 1 ? players.filter(p => p.full_name.toLowerCase().includes(debouncedSearch1.toLowerCase())).slice(0, 5) : [];
  }, [debouncedSearch1, players, p1]);

  const filtered2 = useMemo(() => { // Utilise debouncedSearch2
    if (!debouncedSearch2 || (p2 && debouncedSearch2 === p2.full_name)) return [];
    return debouncedSearch2.length > 1 ? players.filter(p => p.full_name.toLowerCase().includes(debouncedSearch2.toLowerCase())).slice(0, 5) : [];
  }, [debouncedSearch2, players, p2]);

  const h2h = useMemo(() => {
    if (!p1Id || !p2Id) return null;
    const matches = allMatches.filter(f => 
      (f.winner_id === p1Id && f.loser_id === p2Id) ||
      (f.winner_id === p2Id && f.loser_id === p1Id)
    );
    return {
      total: matches.length,
      p1Wins: matches.filter(m => m.winner_id === p1Id).length,
      p2Wins: matches.filter(m => m.winner_id === p2Id).length,
      matches
    };
  }, [p1Id, p2Id, allMatches]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black italic text-white/5 pointer-events-none uppercase">VS</div>
        <Selector search={search1} setSearch={setSearch1} filtered={filtered1} setPlayerId={setP1Id} label="Joueur 1" />
        <Selector search={search2} setSearch={setSearch2} filtered={filtered2} setPlayerId={setP2Id} label="Joueur 2" />
      </div>

      {p1 && p2 && (
        <div className="transition-all duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-16">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <PlayerImage wikidataId={p1.wikidata_id} playerName={p1.full_name} />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">{p1.full_name}</h2>
              <div className="text-5xl font-black text-emerald-500">{h2h?.p1Wins}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Victoires H2H</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center backdrop-blur-sm self-stretch flex flex-col justify-center">
               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Confrontations Totales</p>
                    <p className="text-6xl font-black tracking-tighter">{h2h?.total}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">GS Gagnés</p>
                      <p className="text-xl font-black text-amber-500">{p1.grand_slams} vs {p2.grand_slams}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Titres</p>
                      <p className="text-xl font-black text-blue-400">{p1.total_titles} vs {p2.total_titles}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <PlayerImage wikidataId={p2.wikidata_id} playerName={p2.full_name} />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">{p2.full_name}</h2>
              <div className="text-5xl font-black text-emerald-500">{h2h?.p2Wins}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Victoires H2H</p>
            </div>
          </div>

          {h2h && h2h.matches.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter border-l-4 border-emerald-500 pl-4">Historique des Confrontations</h3>
              <div className="grid gap-4">
                {h2h.matches.map((m: any, i: number) => (
                  <div key={i} className="group flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-6 mb-4 sm:mb-0">
                      <span className="text-xl font-black text-slate-700 italic">{m.year}</span>
                      <div>
                        <p className="font-bold text-slate-200 uppercase tracking-tight italic">{m.tournament} <span className="ml-2 text-emerald-500/50 text-xs">[{m.round}]</span></p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.surface} • {m.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className={`font-black uppercase italic text-sm ${m.winner_id === p1Id ? 'text-emerald-400' : 'text-slate-500'}`}>{m.winner_name} 🏆</p>
                        <p className="text-xs font-mono text-slate-400">{m.score}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}