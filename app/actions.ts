"use server";

import { db } from "@/db";
import { games, opponents, players } from "@/db/schema";
import { calculateStats } from "@/lib/stats";
import { eq, desc, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Interface para el payload de creación de un partido
export interface CreateGameInput {
  opponentName: string; // Nombre del rival (se buscará o creará)
  date: string; // Formato YYYY-MM-DD
  location: "home" | "away";
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
  notes?: string | null;
}

/**
 * 1. Obtener la jugadora principal (Nara)
 */
export async function getPrimaryPlayer() {
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.name, "Nara Diaz"))
    .limit(1);

  if (!player) {
    throw new Error(
      "No se encontró a la jugadora 'Nara Diaz'. Corre 'npm run db:seed' primero.",
    );
  }

  return player;
}

/**
 * 2. Registrar un nuevo partido (Maneja auto-creación del rival)
 */
export async function createGame(input: CreateGameInput) {
  const player = await getPrimaryPlayer();

  // A. Normalizar nombre del rival y buscar si existe
  const cleanOpponentName = input.opponentName.trim();

  let [opponent] = await db
    .select()
    .from(opponents)
    .where(ilike(opponents.name, cleanOpponentName))
    .limit(1);

  // Si el rival no existe, lo creamos automáticamente
  if (!opponent) {
    [opponent] = await db
      .insert(opponents)
      .values({ name: cleanOpponentName })
      .returning();
  }

  // B. Insertar el partido
  const [newGame] = await db
    .insert(games)
    .values({
      playerId: player.id,
      opponentId: opponent.id,
      date: input.date,
      location: input.location,
      teamScore: input.teamScore,
      opponentScore: input.opponentScore,
      playerPoints: input.playerPoints ?? null,
      rebounds: input.rebounds ?? null,
      assists: input.assists ?? null,
      steals: input.steals ?? null,
      turnovers: input.turnovers ?? null,
      threePointers: input.threePointers ?? null,
      twoPointers: input.twoPointers ?? null,
      freeThrows: input.freeThrows ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  // Revalidar el cache de Next.js en las vistas principales
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/opponents");

  return newGame;
}

export async function getDashboardData() {
  const player = await getPrimaryPlayer();

  // Consultar partidos haciendo JOIN con la tabla opponents
  const rawGames = await db
    .select({
      game: games,
      opponent: opponents,
    })
    .from(games)
    .innerJoin(opponents, eq(games.opponentId, opponents.id))
    .where(eq(games.playerId, player.id))
    .orderBy(desc(games.date));

  // Formateamos para que cada partido incluya la propiedad 'opponent'
  const gameListWithOpponents = rawGames.map(({ game, opponent }) => ({
    ...game,
    opponent,
  }));

  // Procesar métricas pasándole la lista de partidos
  const stats = calculateStats(gameListWithOpponents);

  return {
    player,
    stats,
    recentGames: gameListWithOpponents.slice(0, 5), // Últimos 5 partidos con rival incluido
    allGames: gameListWithOpponents, // Lista completa (desc por fecha) para filtros de tendencia en el dashboard
  };
}

/**
 * 4. Obtener lista de rivales para autocompletado en la carga
 */
export async function getOpponentsList() {
  return await db.select().from(opponents).orderBy(opponents.name);
}

/**
 * 4b. Obtener rivales junto con su balance histórico (G-P) contra el equipo
 */
export async function getOpponentsWithRecord() {
  const player = await getPrimaryPlayer();

  const opponentsList = await db
    .select()
    .from(opponents)
    .orderBy(opponents.name);

  const playerGames = await db
    .select({
      opponentId: games.opponentId,
      teamScore: games.teamScore,
      opponentScore: games.opponentScore,
    })
    .from(games)
    .where(eq(games.playerId, player.id));

  const recordByOpponent = new Map<string, { wins: number; losses: number }>();
  for (const g of playerGames) {
    const record = recordByOpponent.get(g.opponentId) ?? {
      wins: 0,
      losses: 0,
    };
    if (g.teamScore > g.opponentScore) record.wins++;
    else if (g.teamScore < g.opponentScore) record.losses++;
    recordByOpponent.set(g.opponentId, record);
  }

  return opponentsList.map((opp) => {
    const record = recordByOpponent.get(opp.id) ?? { wins: 0, losses: 0 };
    return {
      ...opp,
      wins: record.wins,
      losses: record.losses,
      diff: record.wins - record.losses,
    };
  });
}

/**
 * 5. Obtener historial de un rival específico con sus estadísticas agregadas
 */
export async function getOpponentDetail(opponentId: string) {
  const player = await getPrimaryPlayer();

  // Datos del rival
  const [opponent] = await db
    .select()
    .from(opponents)
    .where(eq(opponents.id, opponentId))
    .limit(1);

  if (!opponent) {
    throw new Error("Rival no encontrado.");
  }

  // Partidos únicamente contra este rival
  const gameList = await db
    .select()
    .from(games)
    .where(eq(games.opponentId, opponentId))
    .orderBy(desc(games.date));

  const stats = calculateStats(gameList);

  return {
    opponent,
    stats,
    games: gameList,
  };
}

// --- ABM DE OPONENTES ---

// Crear un oponente
export async function createOpponent(name: string) {
  if (!name || !name.trim()) throw new Error("El nombre es obligatorio.");

  const [existing] = await db
    .select()
    .from(opponents)
    .where(ilike(opponents.name, name.trim()))
    .limit(1);

  if (existing) {
    throw new Error("Ya existe un rival con ese nombre.");
  }

  await db.insert(opponents).values({ name: name.trim() });
  revalidatePath("/opponents");
  revalidatePath("/new-game");
}

// Editar un oponente
export async function updateOpponent(id: string, name: string) {
  if (!name || !name.trim()) throw new Error("El nombre es obligatorio.");

  await db
    .update(opponents)
    .set({ name: name.trim() })
    .where(eq(opponents.id, id));

  revalidatePath("/opponents");
  revalidatePath("/new-game");
}

// Eliminar un oponente
export async function deleteOpponent(id: string) {
  // Verificar si tiene partidos asociados
  const gamesCount = await db
    .select()
    .from(games)
    .where(eq(games.opponentId, id));

  if (gamesCount.length > 0) {
    throw new Error(
      `No se puede eliminar: tiene ${gamesCount.length} partido(s) registrado(s).`,
    );
  }

  await db.delete(opponents).where(eq(opponents.id, id));

  revalidatePath("/opponents");
  revalidatePath("/new-game");
}

// --- EDICIÓN Y ELIMINACIÓN DE PARTIDOS ---

// Eliminar un partido
export async function deleteGame(id: string) {
  if (!id) throw new Error("ID de partido requerido.");

  await db.delete(games).where(eq(games.id, id));

  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/opponents");
}

// Obtener partido por ID para editar
export async function getGameById(id: string) {
  const [game] = await db
    .select({
      id: games.id,
      date: games.date,
      location: games.location,
      teamScore: games.teamScore,
      opponentScore: games.opponentScore,
      playerPoints: games.playerPoints,
      rebounds: games.rebounds,
      assists: games.assists,
      steals: games.steals,
      turnovers: games.turnovers,
      threePointers: games.threePointers,
      twoPointers: games.twoPointers,
      freeThrows: games.freeThrows,
      notes: games.notes,
      opponentId: games.opponentId,
      opponentName: opponents.name,
    })
    .from(games)
    .innerJoin(opponents, eq(games.opponentId, opponents.id))
    .where(eq(games.id, id))
    .limit(1);

  if (!game) throw new Error("Partido no encontrado.");
  return game;
}

// Actualizar partido existente
export async function updateGame(
  id: string,
  data: {
    opponentName: string;
    date: string;
    location: "home" | "away";
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
    notes?: string | null;
  },
) {
  if (!id) throw new Error("ID de partido requerido.");

  // 1. Buscar o crear rival si cambió el nombre
  let [opponent] = await db
    .select()
    .from(opponents)
    .where(ilike(opponents.name, data.opponentName.trim()))
    .limit(1);

  if (!opponent) {
    [opponent] = await db
      .insert(opponents)
      .values({ name: data.opponentName.trim() })
      .returning();
  }

  // 2. Actualizar partido
  await db
    .update(games)
    .set({
      opponentId: opponent.id,
      date: data.date,
      location: data.location,
      teamScore: data.teamScore,
      opponentScore: data.opponentScore,
      playerPoints: data.playerPoints ?? null,
      rebounds: data.rebounds ?? null,
      assists: data.assists ?? null,
      steals: data.steals ?? null,
      turnovers: data.turnovers ?? null,
      threePointers: data.threePointers ?? null,
      twoPointers: data.twoPointers ?? null,
      freeThrows: data.freeThrows ?? null,
      notes: data.notes ?? null,
    })
    .where(eq(games.id, id));

  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/opponents");
}

/**
 * Obtener listado completo de todos los partidos ordenados por fecha
 */
export async function getGamesList() {
  const player = await getPrimaryPlayer();

  const rawGames = await db
    .select({
      id: games.id,
      date: games.date,
      location: games.location,
      teamScore: games.teamScore,
      opponentScore: games.opponentScore,
      playerPoints: games.playerPoints,
      rebounds: games.rebounds,
      assists: games.assists,
      steals: games.steals,
      turnovers: games.turnovers,
      threePointers: games.threePointers,
      twoPointers: games.twoPointers,
      freeThrows: games.freeThrows,
      notes: games.notes,
      opponentName: opponents.name,
    })
    .from(games)
    .innerJoin(opponents, eq(games.opponentId, opponents.id))
    .where(eq(games.playerId, player.id))
    .orderBy(desc(games.date));

  return rawGames;
}
