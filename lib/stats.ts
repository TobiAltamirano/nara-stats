import { InferSelectModel } from "drizzle-orm";
import { games } from "@/db/schema";

export type Game = InferSelectModel<typeof games>;

export interface DashboardStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  homeStats: { games: number; wins: number; losses: number; winRate: number };
  awayStats: { games: number; wins: number; losses: number; winRate: number };
  totals: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    turnovers: number;
    threePointers: number;
    twoPointers: number;
    freeThrows: number;
    rating: number;
  };
  averages: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    turnovers: number;
    threePointers: number;
    twoPointers: number;
    freeThrows: number;
    rating: number;
  };
  records: {
    maxPoints: number;
    maxRebounds: number;
    maxAssists: number;
  };
}

export interface GameStatsInput {
  teamScore: number;
  opponentScore: number;
  playerPoints?: number | null;
  rebounds?: number | null;
  assists?: number | null;
  steals?: number | null;
  turnovers?: number | null;
  threePointers?: number | null;
  twoPointers?: number | null;
  freeThrows?: number | null;
}

/**
 * Fórmula provisoria de valoración para el MVP.
 * Suma aportes positivos y resta pérdidas. Si los datos son NULL, se tratan como 0.
 */
export function calculateRating(game: GameStatsInput): number {
  const pts = game.playerPoints ?? 0;
  const reb = game.rebounds ?? 0;
  const ast = game.assists ?? 0;
  const stl = game.steals ?? 0;
  const tov = game.turnovers ?? 0;

  // Fórmula simplificada de Valoración FEB / FIBA
  return pts + reb + ast + stl - tov;
}

/**
 * Procesa una lista de partidos y devuelve el objeto completo de métricas acumuladas/derivadas.
 */
export function calculateStats(gameList: Game[]): DashboardStats {
  const gamesPlayed = gameList.length;

  if (gamesPlayed === 0) {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      homeStats: { games: 0, wins: 0, losses: 0, winRate: 0 },
      awayStats: { games: 0, wins: 0, losses: 0, winRate: 0 },
      totals: {
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        turnovers: 0,
        threePointers: 0,
        twoPointers: 0,
        freeThrows: 0,
        rating: 0,
      },
      averages: {
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        turnovers: 0,
        threePointers: 0,
        twoPointers: 0,
        freeThrows: 0,
        rating: 0,
      },
      records: { maxPoints: 0, maxRebounds: 0, maxAssists: 0 },
    };
  }

  let wins = 0;
  let homeGames = 0,
    homeWins = 0;
  let awayGames = 0,
    awayWins = 0;

  // Totales
  let totalPts = 0,
    totalReb = 0,
    totalAst = 0,
    totalStl = 0,
    totalTov = 0;
  let total3p = 0,
    total2p = 0,
    totalFt = 0;
  let totalRating = 0;

  // Contadores para promedios exactos (ignorando NULLs)
  let ptsCount = 0,
    rebCount = 0,
    astCount = 0,
    stlCount = 0,
    tovCount = 0;
  let threeCount = 0,
    twoCount = 0,
    ftCount = 0;

  // Récords
  let maxPoints = 0,
    maxRebounds = 0,
    maxAssists = 0;

  for (const g of gameList) {
    const isWin = g.teamScore > g.opponentScore;
    if (isWin) wins++;

    if (g.location === "home") {
      homeGames++;
      if (isWin) homeWins++;
    } else {
      awayGames++;
      if (isWin) awayWins++;
    }

    if (g.playerPoints !== null) {
      totalPts += g.playerPoints;
      ptsCount++;
      if (g.playerPoints > maxPoints) maxPoints = g.playerPoints;
    }
    if (g.rebounds !== null) {
      totalReb += g.rebounds;
      rebCount++;
      if (g.rebounds > maxRebounds) maxRebounds = g.rebounds;
    }
    if (g.assists !== null) {
      totalAst += g.assists;
      astCount++;
      if (g.assists > maxAssists) maxAssists = g.assists;
    }
    if (g.steals !== null) {
      totalStl += g.steals;
      stlCount++;
    }
    if (g.turnovers !== null) {
      totalTov += g.turnovers;
      tovCount++;
    }
    if (g.threePointers !== null) {
      total3p += g.threePointers;
      threeCount++;
    }
    if (g.twoPointers !== null) {
      total2p += g.twoPointers;
      twoCount++;
    }
    if (g.freeThrows !== null) {
      totalFt += g.freeThrows;
      ftCount++;
    }

    totalRating += calculateRating(g);
  }

  return {
    gamesPlayed,
    wins,
    losses: gamesPlayed - wins,
    winRate: Number(((wins / gamesPlayed) * 100).toFixed(1)),
    homeStats: {
      games: homeGames,
      wins: homeWins,
      losses: homeGames - homeWins,
      winRate:
        homeGames > 0 ? Number(((homeWins / homeGames) * 100).toFixed(1)) : 0,
    },
    awayStats: {
      games: awayGames,
      wins: awayWins,
      losses: awayGames - awayWins,
      winRate:
        awayGames > 0 ? Number(((awayWins / awayGames) * 100).toFixed(1)) : 0,
    },
    totals: {
      points: totalPts,
      rebounds: totalReb,
      assists: totalAst,
      steals: totalStl,
      turnovers: totalTov,
      threePointers: total3p,
      twoPointers: total2p,
      freeThrows: totalFt,
      rating: totalRating,
    },
    averages: {
      points: ptsCount > 0 ? Number((totalPts / ptsCount).toFixed(1)) : 0,
      rebounds: rebCount > 0 ? Number((totalReb / rebCount).toFixed(1)) : 0,
      assists: astCount > 0 ? Number((totalAst / astCount).toFixed(1)) : 0,
      steals: stlCount > 0 ? Number((totalStl / stlCount).toFixed(1)) : 0,
      turnovers: tovCount > 0 ? Number((totalTov / tovCount).toFixed(1)) : 0,
      threePointers:
        threeCount > 0 ? Number((total3p / threeCount).toFixed(1)) : 0,
      twoPointers: twoCount > 0 ? Number((total2p / twoCount).toFixed(1)) : 0,
      freeThrows: ftCount > 0 ? Number((totalFt / ftCount).toFixed(1)) : 0,
      rating: Number((totalRating / gamesPlayed).toFixed(1)),
    },
    records: {
      maxPoints,
      maxRebounds,
      maxAssists,
    },
  };
}
