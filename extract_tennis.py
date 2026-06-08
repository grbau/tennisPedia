#!/usr/bin/env python3
"""
Extrait les vainqueurs des grands tournois (Grand Chelem, Masters 1000, Tour Finals)
depuis les CSV de Jeff Sackmann (tennis_atp / tennis_wta) et produit un JSON
directement exploitable pour un site / une app, avec fiches joueurs détaillées.

Usage :
    python extract_tennis.py ./tennis_atp atp  > non utilisé : voir main()
"""

import csv
import glob
import json
import os
from pathlib import Path
from collections import defaultdict

# Niveaux de tournois extraits :
# G = Grand Chelem
# M = Masters 1000
# F = Tour Finals (Masters)
# A = Tournois ATP/WTA (500, 250)
LEVELS = {"G": "Grand Chelem", "M": "Masters 1000", "F": "Finals", "A": "Tournoi ATP/WTA"}


def load_players(repo_dir, tour):
    """Charge le fichier joueurs et renvoie un dict {player_id: fiche}."""
    players = {}
    path = os.path.join(repo_dir, f"{tour}_players.csv")
    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            pid = row["player_id"]
            dob = row.get("dob", "")
            players[pid] = {
                "id": pid,
                "first_name": row.get("name_first", ""),
                "last_name": row.get("name_last", ""),
                "full_name": f"{row.get('name_first','')} {row.get('name_last','')}".strip(),
                "hand": row.get("hand", ""),          # R / L / U
                "birth_date": (f"{dob[:4]}-{dob[4:6]}-{dob[6:8]}" if len(dob) == 8 else None),
                "country": row.get("ioc", ""),         # code CIO (ex. ESP)
                "height_cm": (int(row["height"]) if row.get("height", "").isdigit() else None),
                "wikidata_id": row.get("wikidata_id", "") or None,
                # rempli plus bas :
                "titles": [],
            }
    return players


def extract_matches_and_finals(repo_dir, tour):
    """Parcourt tous les fichiers de matchs annuels et renvoie la liste de tous les matches
    ainsi que les finales seules pour les tournois majeurs."""
    finals = []
    all_matches = []
    seen_players = set()
    pattern = os.path.join(repo_dir, f"{tour}_matches_[0-9]" + "[0-9]" * 3 + ".csv")
    for path in sorted(glob.glob(pattern)):
        with open(path, encoding="utf-8") as f:
            for m in csv.DictReader(f):
                # On garde une trace de tous les joueurs ayant joué à ce niveau
                if m.get("tourney_level") in LEVELS:
                    seen_players.add(m.get("winner_id"))
                    seen_players.add(m.get("loser_id"))

                    d = m.get("tourney_date", "")
                    match_data = {
                        "year": int(d[:4]) if d[:4].isdigit() else None,
                        "date": (f"{d[:4]}-{d[4:6]}-{d[6:8]}" if len(d) == 8 else None),
                        "tournament": m.get("tourney_name", ""),
                        "level": LEVELS[m["tourney_level"]],
                        "surface": m.get("surface", ""),
                        "round": m.get("round", ""),
                        "winner_id": m.get("winner_id", ""),
                        "winner_name": m.get("winner_name", ""),
                        "loser_id": m.get("loser_id", ""),
                        "loser_name": m.get("loser_name", ""),
                        "runner_up_id": m.get("loser_id", ""), # Alias pour compatibilité
                        "runner_up_name": m.get("loser_name", ""), # Alias pour compatibilité
                        "score": m.get("score", ""),
                    }
                    all_matches.append(match_data)
                    if m.get("round") == "F":
                        finals.append(match_data)
    return all_matches, finals, seen_players


def main(repo_dir, tour):
    players = load_players(repo_dir, tour)
    all_matches, finals, seen_players = extract_matches_and_finals(repo_dir, tour)

    # Rattache chaque titre à la fiche du vainqueur
    for fin in finals:
        wid = fin["winner_id"]
        if wid in players:
            players[wid]["titles"].append({
                "year": fin["year"],
                "tournament": fin["tournament"],
                "level": fin["level"],
                "surface": fin["surface"],
                "defeated": fin["runner_up_name"],
                "score": fin["score"],
            })

    # On garde les joueurs qui ont au moins gagné un titre OU qui ont été actifs au haut niveau
    # Cela permet d'avoir les fiches de joueurs célèbres sans titres majeurs (Monfils, etc.)
    relevant_players = {pid: p for pid, p in players.items() if pid in seen_players}
    for p in relevant_players.values():
        p["total_titles"] = len(p["titles"])
        p["grand_slams"] = sum(1 for t in p["titles"] if t["level"] == "Grand Chelem")

    finals.sort(key=lambda x: (x["date"] or ""), reverse=True)

    out_prefix = tour.upper()
    # On s'assure que le chemin est relatif à la racine du projet vers src/data
    out_dir = Path(__file__).parent / "src" / "api"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Initialisation sécurisée pour éviter les erreurs d'import dans Astro
    for f_name in [f"{out_prefix}_finals.json", f"{out_prefix}_matches.json", f"{out_prefix}_players.json"]:
        target = out_dir / f_name
        if not target.exists():
            with open(target, "w", encoding="utf-8") as f:
                json.dump([], f)

    with open(out_dir / f"{out_prefix}_finals.json", "w", encoding="utf-8") as f:
        json.dump(finals, f, ensure_ascii=False, indent=2)

    with open(out_dir / f"{out_prefix}_matches.json", "w", encoding="utf-8") as f:
        json.dump(all_matches, f, ensure_ascii=False, indent=2)

    # Tri intelligent : d'abord les Grands Chelems, puis le total des titres, puis le nom
    sorted_players = sorted(
        relevant_players.values(),
        key=lambda p: (-p.get("grand_slams", 0), -p.get("total_titles", 0), p.get("full_name", ""))
    )

    with open(out_dir / f"{out_prefix}_players.json", "w", encoding="utf-8") as f:
        json.dump(sorted_players, f, ensure_ascii=False, indent=2)

    print(f"[{out_prefix}] {len(finals)} finales majeures, "
          f"{len(relevant_players)} joueurs actifs -> "
          f"{out_prefix}_finals.json + {out_prefix}_players.json")


if __name__ == "__main__":
    # On définit le chemin de base comme étant le dossier contenant ce script
    script_dir = Path(__file__).parent.resolve()
    
    for repo_name, tour in [("tennis_atp", "atp"), ("tennis_wta", "wta")]:
        repo_path = script_dir / repo_name
        if repo_path.is_dir():
            main(str(repo_path), tour)
        else:
            print(f"⚠️ Dossier source '{repo_name}' introuvable dans : {script_dir}")
            print(f"   -> Pour inclure tous les joueurs (Monfils, etc.), vous devez télécharger les CSV de Jeff Sackmann.")
