import atpPlayers from './ATP_players.json';
import wtaPlayers from './WTA_players.json';
import atpFinals from './ATP_finals.json';
import wtaFinals from './WTA_finals.json';

export interface Player {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  full_name: string;
  country: string;
  birth_date: string | null;
  height_cm: number | null;
  grand_slams: number;
  total_titles: number;
  hand: string;
  titles: any[];
  wikidata_id: string | null;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD') // Sépare les accents des lettres
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace tout ce qui n'est pas alphanumérique par -
    .replace(/^-+|-+$/g, ''); // Nettoie les tirets au début et à la fin
};

export const getAllPlayers = (): Player[] => {
  const players = [
    ...(atpPlayers as Player[]),
    ...(wtaPlayers as Player[])
  ];
  // Déduplication par ID au cas où
  const uniquePlayers = Array.from(new Map(players.map(p => [p.id, p])).values());
  return uniquePlayers.map(p => ({ ...p, slug: slugify(p.full_name) }));
};

export const getAllFinals = () => {
  const allFinals = [...(atpFinals as any[]), ...(wtaFinals as any[])];
  return allFinals.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
};

export const getLatestFinals = (limit = 6) => {
  const allFinals = [...(atpFinals as any[]), ...(wtaFinals as any[])];
  return allFinals
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, limit);
};

export const getStats = () => {
  const players = getAllPlayers();
  return {
    totalPlayers: players.length,
    totalGrandSlams: players.reduce((acc, p) => acc + (p.grand_slams || 0), 0)
  };
};