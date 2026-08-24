import { db } from "./index"; // Tu instancia de Drizzle DB
import { players, opponents, games } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // 1. Crear o recuperar la jugadora principal (Nara Diaz)
  let [player] = await db
    .select()
    .from(players)
    .where(eq(players.name, "Nara Diaz"))
    .limit(1);

  if (!player) {
    [player] = await db
      .insert(players)
      .values({
        name: "Nara Diaz", // 👈 Quitamos 'team' porque no existe en la tabla players
      })
      .returning();
    console.log("✅ Jugadora creada: Nara Diaz");
  }

  // 2. Crear Rivales
  const opponentNames = [
    "Obras Sanitarias",
    "Lanús",
    "Gimnasia (LP)",
    "Berazategui",
    "Unión Florida",
  ];

  const opponentMap = new Map<string, string>();

  for (const name of opponentNames) {
    let [opp] = await db
      .select()
      .from(opponents)
      .where(eq(opponents.name, name))
      .limit(1);

    if (!opp) {
      [opp] = await db.insert(opponents).values({ name }).returning();
    }
    opponentMap.set(name, opp.id);
  }
  console.log("✅ Rivales cargados");

  // 3. Cargar Lista de Partidos de Prueba (Temporada 2026)
  const mockGames = [
    {
      opponentName: "Obras Sanitarias",
      date: "2026-08-02",
      location: "home" as const,
      teamScore: 68,
      opponentScore: 61,
      playerPoints: 16,
      rebounds: 6,
      assists: 4,
      steals: 2,
      turnovers: 1,
      threePointers: 2,
      twoPointers: 4,
      freeThrows: 2,
      notes: "Gran efectividad desde el perímetro en el último cuarto.",
    },
    {
      opponentName: "Lanús",
      date: "2026-08-08",
      location: "away" as const,
      teamScore: 54,
      opponentScore: 59,
      playerPoints: 10,
      rebounds: 4,
      assists: 2,
      steals: 1,
      turnovers: 3,
      threePointers: 1,
      twoPointers: 3,
      freeThrows: 1,
      notes: "Partido muy físico, problemas de faltas en el 3er cuarto.",
    },
    {
      opponentName: "Gimnasia (LP)",
      date: "2026-08-12",
      location: "home" as const,
      teamScore: 75,
      opponentScore: 62,
      playerPoints: 22,
      rebounds: 8,
      assists: 5,
      steals: 3,
      turnovers: 2,
      threePointers: 4,
      twoPointers: 3,
      freeThrows: 4,
      notes: "Récord personal de puntos en la temporada 🔥",
    },
    {
      opponentName: "Berazategui",
      date: "2026-08-16",
      location: "away" as const,
      teamScore: 60,
      opponentScore: 64,
      playerPoints: 12,
      rebounds: 5,
      assists: 3,
      steals: 0,
      turnovers: 2,
      threePointers: 1,
      twoPointers: 4,
      freeThrows: 1,
      notes: "Cierre ajustado que se definió en los últimos segundos.",
    },
    {
      opponentName: "Unión Florida",
      date: "2026-08-20",
      location: "home" as const,
      teamScore: 70,
      opponentScore: 55,
      playerPoints: 18,
      rebounds: 7,
      assists: 6,
      steals: 2,
      turnovers: 1,
      threePointers: 3,
      twoPointers: 3,
      freeThrows: 3,
      notes: "Muy buena distribución de juego y control del ritmo.",
    },
  ];

  for (const gameData of mockGames) {
    const opponentId = opponentMap.get(gameData.opponentName);
    if (!opponentId) continue;

    await db.insert(games).values({
      playerId: player.id,
      opponentId,
      date: gameData.date,
      location: gameData.location,
      teamScore: gameData.teamScore,
      opponentScore: gameData.opponentScore,
      playerPoints: gameData.playerPoints,
      rebounds: gameData.rebounds,
      assists: gameData.assists,
      steals: gameData.steals,
      turnovers: gameData.turnovers,
      threePointers: gameData.threePointers,
      twoPointers: gameData.twoPointers,
      freeThrows: gameData.freeThrows,
      notes: gameData.notes,
    });
  }

  console.log("🏀 ¡Seed completado con éxito! Partidos de prueba insertados.");
}

seed()
  .catch((e) => {
    console.error("❌ Error en la ejecución del seed:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
