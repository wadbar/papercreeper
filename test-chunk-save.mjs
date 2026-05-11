import fs from 'fs';
import path from 'path';

async function run() {
  const worldPath = path.join(process.cwd(), 'server', 'world');
  try {
    const AnvilPkg = await import("prismarine-provider-anvil");
    const ChunkPkg = await import("prismarine-chunk");
    const registryAll = await import("prismarine-registry");
    const registry = registryAll.default ? registryAll.default("1.20.1") : registryAll("1.20.1");

    const Anvil = AnvilPkg.default ? AnvilPkg.default.Anvil : AnvilPkg.Anvil;
    const AnvilWorld = Anvil("1.20.1");
    const worldProvider = new AnvilWorld(path.join(worldPath, "region"));

    let chunkData;
    try {
       chunkData = await worldProvider.load(0, 0);
    } catch(e) {
       console.log("worldProvider.load threw error", e.code);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
