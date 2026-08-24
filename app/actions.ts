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
  };
}

/**
 * 4. Obtener lista de rivales para autocompletado en la carga
 */
export async function getOpponentsList() {
  return await db.select().from(opponents).orderBy(opponents.name);
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
