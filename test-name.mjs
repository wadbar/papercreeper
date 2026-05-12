import ChunkPkg from "prismarine-chunk";
import registryAll from "prismarine-registry";
import vec3 from "vec3";

const registry = registryAll("1.20.1");
const PrisChunk = ChunkPkg(registry);
const chunk = new PrisChunk();
chunk.setBlockStateId(new vec3(0,0,0), 1);
const b = chunk.getBlock(new vec3(0,0,0));
console.log("b name", b.name, b.type, b.stateId);
