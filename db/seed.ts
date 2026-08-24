import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Carga las variables de .env.local

import { db } from "./index";
import { players } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Ejecutando seed...");

  const existingPlayer = await db
    .select()
    .from(players)
    .where(eq(players.name, "Nara"));

  if (existingPlayer.length === 0) {
    const [nara] = await db
      .insert(players)
      .values({
        name: "Nara Diaz",
      })
      .returning();

    console.log("✅ Jugadora 'Nara Diaz' creada con ID:", nara.id);
  } else {
    console.log("ℹ️ 'Nara Diaz' ya existe en la base de datos.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
