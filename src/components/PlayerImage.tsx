import { useState, useEffect } from 'preact/hooks';

interface Props {
  wikidataId: string | null;
  playerName: string;
}

export default function PlayerImage({ wikidataId, playerName }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wikidataId) {
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        // 1. On interroge Wikidata pour obtenir le nom du fichier image (propriété P18)
        const res = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&format=json&props=claims&origin=*`
        );
        const data = await res.json();
        const claims = data.entities[wikidataId]?.claims;
        const imageFile = claims?.P18?.[0]?.mainsnak?.datavalue?.value;

        if (imageFile) {
          // 2. On récupère l'URL directe du fichier via l'API Wikimedia Commons
          const infoRes = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
              imageFile
            )}&prop=imageinfo&iiprop=url&format=json&origin=*`
          );
          const infoData = await infoRes.json();
          const pages = infoData.query.pages;
          const pageId = Object.keys(pages)[0];
          const url = pages[pageId]?.imageinfo?.[0]?.url;
          setImageUrl(url);
        }
      } catch (e) {
        console.error("Erreur lors de la récupération de l'image:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [wikidataId]);

  // Fallback avec les initiales si pas d'image
  const initials = playerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  if (loading) {
    return (
      <div className="w-48 h-48 bg-slate-900 rounded-[3rem] animate-pulse border-4 border-white/5 shadow-2xl shadow-emerald-500/10" />
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-48 h-48 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-[3rem] flex items-center justify-center text-6xl font-black shadow-2xl shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-white/5">
        <span className="drop-shadow-2xl text-white">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={playerName}
      className="w-48 h-48 object-cover rounded-[3rem] shadow-2xl shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-white/5 bg-slate-900"
    />
  );
}