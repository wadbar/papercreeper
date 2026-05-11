async function run() {
  try {
    const AnvilPkg = await import("prismarine-provider-anvil");
    const ChunkPkg = await import("prismarine-chunk");
    const registryAll = await import("prismarine-registry");
    const registry = registryAll.default ? registryAll.default("1.20.1") : registryAll("1.20.1");

    const Anvil = AnvilPkg.default ? AnvilPkg.default.Anvil : AnvilPkg.Anvil;
    console.log(Anvil);
  } catch (e) {
    console.error(e);
  }
}
run();
