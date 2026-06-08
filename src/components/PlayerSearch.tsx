import { useState, useMemo } from 'preact/hooks';
import type { Player } from '../api/data';

export default function PlayerSearch({ players }: { players: Player[] }) {
  const [search, setSearch] = useState('');
  const [minGS, setMinGS] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('');

  const countries = useMemo(() => {
    const list = Array.from(new Set(players.map(p => p.country))).filter(Boolean).sort();
    return list;
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => 
        p.full_name.toLowerCase().includes(search.toLowerCase()) &&
        p.grand_slams >= minGS &&
        (selectedCountry === '' || p.country === selectedCountry)
      )
      .slice(0, 40);
  }, [search, minGS, selectedCountry, players]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Trouver une légende..."
            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none min-w-[140px]"
            onChange={(e) => setSelectedCountry((e.target as HTMLSelectElement).value)}
          >
            <option value="">Tous les pays</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none"
            onChange={(e) => setMinGS(Number((e.target as HTMLSelectElement).value))}
          >
            <option value="0">Toutes victoires</option>
            {[1, 5, 10, 20].map(n => <option key={n} value={n}>{n}+ Grands Chelems</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPlayers.map(player => (
          <a 
            key={player.id}
            href={`/players/${player.slug}`}
            className="group relative bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:border-emerald-500/40 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{player.country}</span>
              {player.grand_slams > 0 && (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                   {player.grand_slams} GS
                </span>
              )}
            </div>
            <h3 className="font-bold text-xl group-hover:text-emerald-400 transition-colors leading-tight tracking-tight italic uppercase">
              {player.full_name}
            </h3>
          </a>
        ))}
        {filteredPlayers.length === 0 && (
          <p className="col-span-full text-center py-10 text-slate-500 italic">Aucun joueur trouvé...</p>
        )}
      </div>
    </div>
  );
}