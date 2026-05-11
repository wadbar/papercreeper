import fs from 'fs';
import path from 'path';

async function run() {
  const worldPath = path.join(process.cwd(), 'world');
  if(!fs.existsSync(worldPath)) fs.mkdirSync(worldPath);
  if(!fs.existsSync(path.join(worldPath, "region"))) fs.mkdirSync(path.join(worldPath, "region"));
  try {
    const AnvilPkg = await import("prismarine-provider-anvil");
    const ChunkPkg = await import("prismarine-chunk");
    const registryAll = await import("prismarine-registry");
    const registry = registryAll.default ? registryAll.default("1.20.1") : registryAll("1.20.1");

    const Anvil = AnvilPkg.default ? AnvilPkg.default.Anvil : AnvilPkg.Anvil;
    const AnvilWorld = Anvil("1.20.1");
    const worldProvider = new AnvilWorld(path.join(worldPath, "region"));
    
    // Test creating a chunk
    const PrisChunk = ChunkPkg.default ? ChunkPkg.default(registry) : ChunkPkg(registry);
    const chunk = new PrisChunk();
    chunk.setBlockStateId({x:0, y:-60, z:0}, 1);
    
    // In later prismarine-provider-anvil versions, we just pass the chunk object?
    await worldProvider.save(0, 0, chunk);
    console.log("saved!");
    
    // Does load return a complete Chunk object, or dump?
    const chunkData = await worldProvider.load(0, 0);
    console.log("load keys", Object.keys(chunkData), typeof chunkData.getBlock);

    const chunk2 = new PrisChunk();
    chunk2.load(chunkData.chunk, chunkData.bitmaps);
  } catch(e) {
    console.error(e);
  }
}
run();
