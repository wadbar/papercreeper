import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { exec, spawn, execSync } from "child_process";
import fs from "fs";
import os from "os";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { manageBot, isBotConnected, sendBotMessage } from "./botService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração IA no Backend (Totalmente Automática no AI Studio)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIza_fallback",
});

// Robust Error Handling: Evita que erros como ESM imports e Promessas Rejeitadas desliguem o backend do Painel.
process.on('uncaughtException', (err) => {
    console.error('[CRÍTICO] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRÍTICO] Unhandled Rejection:', reason);
});

// Helper to reliably download files using native Node
async function downloadFile(url: string, dest: string, onLog?: (msg: string) => void): Promise<boolean> {
  try {
    if (onLog) onLog(`[DOWNLOAD] Fetching from: ${url}`);
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      if (onLog) onLog(`[ERROR] HTTP ${res.status} ${res.statusText}`);
      return false;
    }
    
    // Ler como arrayBuffer para memória (seguro para arquivos <500MB em VPS moderna e evita problemas de Readable stream compatibilidade)
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const partDest = dest + ".part";
    fs.writeFileSync(partDest, buffer);
    fs.renameSync(partDest, dest);
    return true;
  } catch (e: any) {
    if (onLog) onLog(`[ERROR] Download exception: ${e.message}`);
    return false;
  }
}

async function startServer() {
  const app = express();
  let currentPort = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  const SERVERS_ROOT = path.join(process.cwd(), "servers");
  if (!fs.existsSync(SERVERS_ROOT)) fs.mkdirSync(SERVERS_ROOT);

  // Migration logic
  const OLD_DIR = path.join(process.cwd(), "minecraft-server");
  if (fs.existsSync(OLD_DIR)) {
    const target = path.join(SERVERS_ROOT, "default");
    if (!fs.existsSync(target)) {
      fs.renameSync(OLD_DIR, target);
      const cfgP = path.join(target, "panel-config.json");
      if (fs.existsSync(cfgP)) {
        try {
          const c = JSON.parse(fs.readFileSync(cfgP, "utf-8"));
          fs.writeFileSync(
            cfgP,
            JSON.stringify({ ...c, name: "Principal" }, null, 2),
          );
        } catch (e) {}
      }
    }
  }

  const getServerDir = (id: string) => path.join(SERVERS_ROOT, id);
  const getSrvConfigPath = (id: string) =>
    path.join(getServerDir(id), "panel-config.json");
  const DEFAULT_CONFIG = {
    name: "Novo Servidor",
    ram: 4,
    minRam: 1,
    usePlayit: true,
    store: {
      name: "Loja Oficial",
      color: "#10b981",
      items: [
        {
          id: "vip-hero",
          name: "VIP Hero",
          description: "Rank VIP (1 Mês) + Kit Hero",
          price: 25.0,
          commands: [
            "lp user {player} parent add vip",
            "eco give {player} 5000",
            "say O jogador {player} acabou de adquirir o VIP Hero!",
          ],
        },
        {
          id: "money-10k",
          name: "10.000 Coins",
          description: "Adicione fundos na sua conta in-game",
          price: 10.0,
          commands: [
            "eco give {player} 10000",
            "msg {player} Obrigado por adquirir Coins!",
          ],
        },
        {
          id: "perk-fly",
          name: "Permissão /Fly",
          description: "Voe livremente pelo lobby/spawn",
          price: 15.0,
          commands: [
            "lp user {player} permission set essentials.fly true",
            "say {player} agora pode voar!",
          ],
        },
      ],
    },
  };

  const getSrvConfig = (id: string) => {
    try {
      const p = getSrvConfigPath(id);
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"));
    } catch (e) {}
    return { ...DEFAULT_CONFIG, name: id };
  };

  const saveSrvConfig = (id: string, config: any) => {
    const dir = getServerDir(id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getSrvConfigPath(id), JSON.stringify(config, null, 2));
  };

  // Multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const sId = (req.query.serverId as string) || "default";
      const folder = (req.query.folder as string) || "";
      const safeBase = getServerDir(sId);
      const tDir = path.join(safeBase, folder);

      if (!tDir.startsWith(safeBase)) {
        cb(new Error("Acesso negado fora da raiz do servidor!"), "");
        return;
      }

      if (!fs.existsSync(tDir)) fs.mkdirSync(tDir, { recursive: true });
      cb(null, tDir);
    },
    filename: (req, file, cb) => cb(null, file.originalname),
  });
  const upload = multer({ storage });

  // Global Playit variables
  let globalPlayitProcess: any = null;
  let globalPlayitClaimUrl: string | null = null;
  let globalPlayitClaimLastSeen: number = 0;
  let globalPlayitLogs: string[] = [];

  // State
  const serversState: Record<
    string,
    {
      status: "online" | "offline" | "starting" | "stopping";
      tunnelAddress: string | null;
      logs: string[];
      process?: any;
      activeJava?: string;
    }
  > = {};

  const ensureState = (id: string) => {
    if (!serversState[id]) {
      serversState[id] = {
        status: "offline",
        tunnelAddress: null,
        logs: ["Painel pronto!"],
      };
    }
  };

  const addLog = (id: string, msg: string) => {
    ensureState(id);
    const time = new Date().toLocaleTimeString([], { hour12: false });
    serversState[id].logs.push(`[${time}] ${msg}`);
    if (serversState[id].logs.length > 200) serversState[id].logs.shift();
  };

  const BIN_DIR = path.resolve(process.cwd(), "bin");
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

  // Java 21 path (Crucial for 1.21+)
  const JAVA_BIN = path.join(BIN_DIR, "java_runtime/bin/java");
  const PLAYIT_BIN = path.join(BIN_DIR, "playit");

  let JAVA_PATH = "java";
  let PLAYIT_PATH = "playit";

  // === DYNAMIC JAVA EXTRACTOR ===
  const getRequiredJavaMajor = (mcVersion: string) => {
    if (!mcVersion) return 21;
    const match = mcVersion.match(/1\.(\d+)(?:\.(\d+))?/);
    if (!match) return 21;
    const minor = parseInt(match[1], 10);
    const patch = match[2] ? parseInt(match[2], 10) : 0;
    if (minor <= 16) return 8; 
    if (minor < 20) return 17;
    if (minor === 20 && patch < 5) return 17;
    return 21;
  };

  const getJavaPath = (major: number) => {
    const javaDir = path.join(BIN_DIR, `java_runtime_${major}`);
    const osPlatform = os.platform();
    if (osPlatform === "win32") {
      return path.join(javaDir, "bin/java.exe");
    }
    return path.join(javaDir, "bin/java");
  };

  const scanInstalledJavas = () => {
    const javas: { version: string; path: string; type: "system" | "downloaded" }[] = [];
    const osPlatform = os.platform();

    // Check system Java
    try {
      const sysJava = osPlatform === "win32" ? "where java" : "which java";
      const sysPath = execSync(sysJava, { encoding: "utf-8" }).trim().split("\n")[0];
      if (sysPath) {
        const verOutput = execSync(`"${sysPath}" -version 2>&1`, { encoding: "utf-8" });
        const match = verOutput.match(/version "([^"]+)"/);
        javas.push({
          version: match ? match[1] : "Sistema",
          path: sysPath,
          type: "system",
        });
      }
    } catch (e) {}

    // Check our downloaded ones
    [8, 17, 21].forEach((major) => {
      const p = getJavaPath(major);
      if (fs.existsSync(p)) {
        try {
          const verOutput = execSync(`"${p}" -version 2>&1`, { encoding: "utf-8" });
          const match = verOutput.match(/version "([^"]+)"/);
          javas.push({
            version: match ? match[1] : `${major} (Compilado)`,
            path: p,
            type: "downloaded",
          });
        } catch (e) {}
      }
    });

    // MacOS / Linux common paths
    if (osPlatform !== "win32") {
      const commonPaths = [
        "/usr/lib/jvm",
        "/usr/lib64/jvm",
        "/Library/Java/JavaVirtualMachines",
      ];
      commonPaths.forEach((base) => {
        if (fs.existsSync(base)) {
          try {
            const dirs = fs.readdirSync(base);
            dirs.forEach((d) => {
              const jPath = path.join(base, d, "Contents/Home/bin/java");
              const jPathLinux = path.join(base, d, "bin/java");
              const final = fs.existsSync(jPath) ? jPath : (fs.existsSync(jPathLinux) ? jPathLinux : null);
              
              if (final) {
                const verOutput = execSync(`"${final}" -version 2>&1`, { encoding: "utf-8" });
                const match = verOutput.match(/version "([^"]+)"/);
                javas.push({
                  version: match ? match[1] : d,
                  path: final,
                  type: "system",
                });
              }
            });
          } catch (e) {}
        }
      });
    }

    return javas;
  };

  const downloadJavaIfNeeded = (major: number, onLog: (msg: string) => void): Promise<string> => {
    return new Promise((resolve) => {
      const javaExec = getJavaPath(major);
      try {
        if (fs.existsSync(javaExec)) {
          execSync(`"${javaExec}" -version`, { stdio: "ignore" });
          return resolve(javaExec);
        }
      } catch(e) {}
      
      const osPlatform = os.platform();
      let sysJava = osPlatform === "win32" ? "java.exe" : "java";
      try {
        const sysVer = execSync(`"${sysJava}" -version 2>&1`, { encoding: "utf-8" });
        const match = sysVer.match(/version "(\d+)\./);
        if (match && parseInt(match[1], 10) === major) {
          onLog(`[INFO] Usando Java ${major} do sistema.`);
          return resolve(sysJava);
        }
      } catch (e) {}

      const javaDir = path.join(BIN_DIR, `java_runtime_${major}`);
      onLog(`[INSTALLER] Instalando Java ${major} Otimizado para esta versao... aguarde.`);
      
      let file = "";
      const osArch = os.arch();
      if (major === 8) {
          if (osPlatform === "win32") file = "OpenJDK8U-jre_x64_windows_hotspot_8u442b06.zip";
          else if (osPlatform === "darwin") file = osArch === "arm64" ? "OpenJDK8U-jre_aarch64_mac_hotspot_8u442b06.tar.gz" : "OpenJDK8U-jre_x64_mac_hotspot_8u442b06.tar.gz";
          else file = osArch === "arm64" ? "OpenJDK8U-jre_aarch64_linux_hotspot_8u442b06.tar.gz" : "OpenJDK8U-jre_x64_linux_hotspot_8u442b06.tar.gz";
      } else if (major === 17) {
          if (osPlatform === "win32") file = "OpenJDK17U-jre_x64_windows_hotspot_17.0.14_7.zip";
          else if (osPlatform === "darwin") file = osArch === "arm64" ? "OpenJDK17U-jre_aarch64_mac_hotspot_17.0.14_7.tar.gz" : "OpenJDK17U-jre_x64_mac_hotspot_17.0.14_7.tar.gz";
          else file = osArch === "arm64" ? "OpenJDK17U-jre_aarch64_linux_hotspot_17.0.14_7.tar.gz" : "OpenJDK17U-jre_x64_linux_hotspot_17.0.14_7.tar.gz";
      } else if (major === 25) {
          if (osPlatform === "win32") file = "openjdk-25-ea+11_windows-x64_bin.zip";
          else if (osPlatform === "darwin") file = osArch === "arm64" ? "openjdk-25-ea+11_macos-aarch64_bin.tar.gz" : "openjdk-25-ea+11_macos-x64_bin.tar.gz";
          else file = osArch === "arm64" ? "openjdk-25-ea+11_linux-aarch64_bin.tar.gz" : "openjdk-25-ea+11_linux-x64_bin.tar.gz";
      } else {
          if (osPlatform === "win32") file = "OpenJDK21U-jre_x64_windows_hotspot_21.0.6_7.zip";
          else if (osPlatform === "darwin") file = osArch === "arm64" ? "OpenJDK21U-jre_aarch64_mac_hotspot_21.0.6_7.tar.gz" : "OpenJDK21U-jre_x64_mac_hotspot_21.0.6_7.tar.gz";
          else file = osArch === "arm64" ? "OpenJDK21U-jre_aarch64_linux_hotspot_21.0.6_7.tar.gz" : "OpenJDK21U-jre_x64_linux_hotspot_21.0.6_7.tar.gz";
      }

      let url = "";
      if (major === 8) url = `https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u442-b06/${file}`;
      else if (major === 17) url = `https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.14%2B7/${file}`;
      else if (major === 25) url = `https://download.java.net/java/early_access/jdk25/11/GPL/${file}`;
      else url = `https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/${file}`;

      const tempTar = path.join(BIN_DIR, file);

      try {
          if (fs.existsSync(javaDir)) fs.rmSync(javaDir, { recursive: true, force: true });
          fs.mkdirSync(javaDir, { recursive: true });

          downloadFile(url, tempTar, onLog).then((success) => {
             if (!success) {
                 return resolve("java");
             }
             try {
                if (file.endsWith(".zip")) {
                  execSync(`unzip -q -o "${tempTar}" -d "${javaDir}"`);
                  const items = fs.readdirSync(javaDir);
                  if (items.length === 1 && fs.lstatSync(path.join(javaDir, items[0])).isDirectory()) {
                     const inner = path.join(javaDir, items[0]);
                     fs.cpSync(inner, javaDir, { recursive: true });
                     fs.rmSync(inner, { recursive: true });
                  }
                } else {
                  execSync(`tar -xf "${tempTar}" -C "${javaDir}" --strip-components=1`);
                }
                fs.rmSync(tempTar, { force: true });
                if (osPlatform !== "win32") {
                  execSync(`chmod -R +x "${path.join(javaDir, "bin")}"`);
                }
                onLog(`[SUCCESS] Java ${major} instalado e pronto.`);
                resolve(getJavaPath(major));
             } catch(extErr: any) {
                onLog(`[ERROR] Falha ao extrair Java: ${extErr.message}`);
                resolve("java");
             }
          });
      } catch (e: any) {
          onLog(`[ERROR] Erro no script de Java: ${e.message}`);
          resolve("java");
      }
    });
  };

  const resolveBinaries = async () => {
    const osPlatform = os.platform();
    let playitFile = "playit-linux-amd64";
    if (osPlatform === "win32") playitFile = "playit-windows-x86_64.exe";
    else if (osPlatform === "darwin") playitFile = "playit-macos-aarch64";
    else {
      const osArch = os.arch();
      if (osArch === "arm64") playitFile = "playit-linux-aarch64";
      else if (osArch === "arm") playitFile = "playit-linux-armv7"; // fallback
    }

    PLAYIT_PATH = path.join(BIN_DIR, playitFile);

    if (fs.existsSync(PLAYIT_PATH)) {
      if (osPlatform !== "win32") {
        try {
          fs.chmodSync(PLAYIT_PATH, 0o755);
        } catch (e) {}
      }
    }
  };

  const downloadDependencies = async () => {
    await resolveBinaries();

    // Playit setup if missing
    if (!fs.existsSync(PLAYIT_PATH)) {
      addLog("system", " [SETUP] Playit não encontrado, baixando...");
      const playitUrl = `https://github.com/playit-cloud/playit-agent/releases/latest/download/${path.basename(PLAYIT_PATH)}`;
      const success = await downloadFile(playitUrl, PLAYIT_PATH);
      if (success) {
        if (os.platform() !== "win32") {
          try {
            fs.chmodSync(PLAYIT_PATH, 0o755);
          } catch (e) {}
        }
        addLog("system", " [SUCCESS] Playit.gg pronto!");
        exec(`"${PLAYIT_PATH}" version`, (vErr, vOut) => {
          if (!vErr) console.log("[PLAYIT VERSION]", vOut.trim());
        });
      } else {
        addLog("system", " [ERROR] Erro ao baixar Playit");
      }
    }
  };

  downloadDependencies();

  const startGlobalTunnel = () => {
    if (globalPlayitProcess) return;
    const runTunnel = () => {
      if (!fs.existsSync(PLAYIT_PATH)) {
        setTimeout(runTunnel, 5000);
        return;
      }
      try {
        const persistentConfig = path.join(process.cwd(), "playit.toml");

        const args = ["-s", "--platform_docker"];
        if (fs.existsSync(persistentConfig)) {
          args.push("--secret_path", persistentConfig);
        }
        args.push("start");

        globalPlayitProcess = spawn(PLAYIT_PATH, args, {
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env, RUST_LOG: "debug", RUST_BACKTRACE: "1" },
        });
      } catch (err) {
        console.error(`[Global Playit] Failed to spawn:`, err);
        return;
      }

      globalPlayitProcess.on("error", (err: any) => {
        console.error(`[Global Playit] process error:`, err);
      });

      const handleOutput = (data: Buffer, isErr: boolean) => {
        const msg = data
          .toString()
          .replace(/\x1b\[[0-9;]*m/g, "")
          .trim();
        if (msg) {
          globalPlayitLogs.push((isErr ? "[ERR] " : "[OUT] ") + msg);
          if (globalPlayitLogs.length > 20) globalPlayitLogs.shift();

          const claimMatch = msg.match(
            /(https:\/\/(?:www\.)?playit\.gg\/claim\/[a-zA-Z0-9_-]+)/i,
          );
          if (claimMatch) {
            globalPlayitClaimUrl = claimMatch[1];
            globalPlayitClaimLastSeen = Date.now();
          }
        }
      };

      globalPlayitProcess.stdout.on("data", (data: any) =>
        handleOutput(data, false),
      );
      globalPlayitProcess.stderr.on("data", (data: any) =>
        handleOutput(data, true),
      );

      globalPlayitProcess.on("close", () => {
        globalPlayitProcess = null;
        // Se algum servidor online estiver usando playit, reinicia o túnel
        const needsTunnel = Object.values(serversState).some(
          (s) => s.status === "online" || s.status === "starting",
        );
        if (needsTunnel) {
          setTimeout(startGlobalTunnel, 5000);
        }
      });
    };
    runTunnel();
  };

  // API Routes
  app.post("/api/config/env", (req, res) => {
    const { key } = req.body;
    if (key && key.length > 5) {
      process.env.UNIVERSAL_API_KEY = key;
      const envPath = path.join(process.cwd(), ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }
      if (envContent.includes("UNIVERSAL_API_KEY=")) {
        envContent = envContent.replace(
          /UNIVERSAL_API_KEY=.*/g,
          `UNIVERSAL_API_KEY=${key}`,
        );
      } else {
        envContent += `\nUNIVERSAL_API_KEY=${key}\n`;
      }
      fs.writeFileSync(envPath, envContent);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Chave inválida." });
    }
  });

  // --- API IA (UNIVERSAL) ---
  // --- Web Tools ---
  app.post("/api/ai/web/search", async (req, res) => {
    // Basic scrape or mock search using DuckDuckGo HTML
    try {
      const q = encodeURIComponent(req.body.query || "");
      const searchRes = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      const html = await searchRes.text();
      const texts = html.match(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g) || [];
      const urls = html.match(/<a class="result__url" href="([^"]+)">/g) || [];
      
      const results = [];
      for (let i = 0; i < Math.min(texts.length, 5); i++) {
         let txt = texts[i].replace(/<[^>]+>/g, '').trim();
         let url = "";
         if (urls[i]) {
            let u = urls[i].match(/href="([^"]+)"/)?.[1] || "";
            if (u.startsWith('//duckduckgo.com/l/?uddg=')) {
               u = decodeURIComponent(u.split('uddg=')[1].split('&')[0]);
            }
            url = u;
         }
         results.push(`Conteúdo: ${txt}\nFonte: ${url}`);
      }
      res.json({ results: results.join("\n\n") || "Sem resultados." });
    } catch (e: any) {
      res.json({ error: e.message });
    }
  });

  app.post("/api/ai/web/fetch", async (req, res) => {
    try {
      const fetchRes = await fetch(req.body.url);
      const htmlText = await fetchRes.text();
      // Remover scripts e styles primeiro, depois outras tags HTML
      let cleanText = htmlText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      cleanText = cleanText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      cleanText = cleanText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      
      res.json({ text: cleanText.substring(0, 8000) }); // Envia até 8000 caracteres de texto limpo
    } catch (e: any) {
      res.json({ error: e.message });
    }
  });

  // --- Memory Tools ---
  const MEMORY_FILE = path.join(process.cwd(), "data", "ai_memory.json");
  if (!fs.existsSync(MEMORY_FILE)) {
    if (!fs.existsSync(path.dirname(MEMORY_FILE))) fs.mkdirSync(path.dirname(MEMORY_FILE), { recursive: true });
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({}));
  }

  app.post("/api/ai/memory/save", (req, res) => {
    try {
      const data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
      data[req.body.key] = req.body.content;
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } catch(e) {
      res.json({ error: "Erro ao salvar memória" });
    }
  });

  app.post("/api/ai/memory/read", (req, res) => {
    try {
       const data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
       // Simple search
       const q = (req.body.query || "").toLowerCase();
       let found = [];
       for (const k in data) {
          if (k.toLowerCase().includes(q) || data[k].toLowerCase().includes(q)) {
             found.push(`[${k}]: ${data[k]}`);
          }
       }
       res.json({ results: found.length > 0 ? found.join("\n") : "Não me lembro de nada sobre isso." });
    } catch(e) {
       res.json({ error: "Erro ao ler memória" });
    }
  });

  // --- Mineflayer Bot API ---
  app.post("/api/bot/spawn", async (req, res) => {
    const { serverId, botName, apiKey } = req.body;
    try {
      ensureState(serverId);
      let p = 25565;
      const propsPath = path.join(getServerDir(serverId), "server.properties");
      if (fs.existsSync(propsPath)) {
        const props = fs.readFileSync(propsPath, "utf-8");
        const match = props.match(/server-port=(\d+)/);
        if (match) p = parseInt(match[1]);
      }

      await manageBot(serverId, "start", p, botName || "AjudanteIA", apiKey, (msg: string) => {
        addLog(serverId, msg);
      }, (cmd: string) => {
        const proc = serversState[serverId]?.process;
        if (proc) {
            proc.stdin.write(cmd + "\n");
        }
      });
      res.json({ success: true, message: `Bot processando spawn na porta ${p}` });
    } catch(e: any) {
      res.json({ error: e.message });
    }
  });

  // --- World Editor API ---
  app.post("/api/world/spawn", async (req, res) => {
    try {
      const { serverId, worldName } = req.body;
      const srvDir = getServerDir(serverId);
      const levelDatPath = path.join(srvDir, worldName || "world", "level.dat");
      if (!fs.existsSync(levelDatPath)) {
        return res.json({ error: "level.dat não encontrado" });
      }
      const nbt = await import("prismarine-nbt");
      const buffer = fs.readFileSync(levelDatPath);
      const parsed = await nbt.parse(buffer);
      const data = (parsed.parsed.value.Data as any).value;
      const x = data.SpawnX?.value || 0;
      const y = data.SpawnY?.value || 64;
      const z = data.SpawnZ?.value || 0;
      res.json({ x, y, z });
    } catch(e: any) {
      res.json({ error: e.message });
    }
  });

  app.post("/api/world/set-spawn", async (req, res) => {
    try {
      const { serverId, worldName, x, y, z } = req.body;
      const srvDir = getServerDir(serverId);
      const levelDatPath = path.join(srvDir, worldName || "world", "level.dat");
      if (!fs.existsSync(levelDatPath)) {
        return res.json({ error: "level.dat não encontrado" });
      }
      const nbt = await import("prismarine-nbt");
      const zlib = await import("zlib");
      const buffer = fs.readFileSync(levelDatPath);
      const parsed = await nbt.parse(buffer);
      const data = (parsed.parsed.value.Data as any).value;
      if (data.SpawnX) data.SpawnX.value = Math.floor(x);
      if (data.SpawnY) data.SpawnY.value = Math.floor(y);
      if (data.SpawnZ) data.SpawnZ.value = Math.floor(z);
      
      const newBuffer = nbt.writeUncompressed(parsed.parsed);
      const compressed = zlib.gzipSync(newBuffer);
      fs.writeFileSync(levelDatPath, compressed);
      
      res.json({ success: true });
    } catch(e: any) {
      res.json({ error: e.message });
    }
  });

  app.post("/api/world/export-schematic", async (req, res) => {
    try {
      const { serverId, blocks } = req.body;
      const srvDir = getServerDir(serverId);
      if (!fs.existsSync(srvDir)) return res.json({ error: "Servidor não encontrado" });
      if (!blocks || blocks.length === 0) return res.json({ error: "Nenhum bloco" });

      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

      for (const b of blocks) {
         minX = Math.min(minX, b.pos[0]);
         minY = Math.min(minY, b.pos[1]);
         minZ = Math.min(minZ, b.pos[2]);
         maxX = Math.max(maxX, b.pos[0]);
         maxY = Math.max(maxY, b.pos[1]);
         maxZ = Math.max(maxZ, b.pos[2]);
      }

      const Schematic = (await import("prismarine-schematic")).Schematic;
      const vec3 = (await import("vec3")).default;
      const BlockConstructor = (await import("prismarine-block")).default('1.16.4');
      const mcData = (await import("minecraft-data")).default('1.16.4');
      
      const width = maxX - minX + 1;
      const height = maxY - minY + 1;
      const depth = maxZ - minZ + 1;

      const schem = new Schematic('1.16.4', new vec3(width, height, depth), new vec3(0,0,0));
      for (const b of blocks) {
         const color = b.color;
         let blockId = 1; // stone
         
         const name = b.name;
         if (name && mcData.blocksByName[name]) {
            blockId = mcData.blocksByName[name].id;
         } else {
           if (color === 'dirt') blockId = 3;
           else if (color === 'grass' || color === 'grass_block') blockId = 2;
           else if (color === 'wood') blockId = 17;
           else if (color === 'leaves') blockId = 18;
           else if (color === 'water') blockId = 9;
         }
         
         const mcBlock = new BlockConstructor(blockId, 1, 0);
         schem.setBlock(new vec3(b.pos[0] - minX, b.pos[1] - minY, b.pos[2] - minZ), mcBlock);
      }
      const buffer = await schem.write();
      
      const plugsPath = path.join(srvDir, "plugins", "WorldEdit", "schematics");
      if (!fs.existsSync(plugsPath)) fs.mkdirSync(plugsPath, { recursive: true });
      const name = `mcedit_${Date.now()}`;
      const fpath = path.join(plugsPath, `${name}.schem`);
      fs.writeFileSync(fpath, buffer);
      
      res.json({ success: true, name, file: fpath });
    } catch(e: any) {
      res.json({ error: e.message });
    }
  });

  app.post("/api/world/list", (req, res) => {
    const { serverId } = req.body;
    try {
      const srvDir = getServerDir(serverId);
      if (!fs.existsSync(srvDir)) return res.json({ worlds: [] });
      const dirs = fs.readdirSync(srvDir, { withFileTypes: true });
      const worlds = [];
      for (const d of dirs) {
        if (d.isDirectory()) {
          const levelDat = path.join(srvDir, d.name, "level.dat");
          if (fs.existsSync(levelDat)) {
            worlds.push(d.name);
          }
        }
      }
      res.json({ worlds });
    } catch(e) {
      res.json({ worlds: [] });
    }
  });

  app.post("/api/server/seed", (req, res) => {
    const { serverId } = req.body;
    try {
       const srvDir = getServerDir(serverId);
       const propsPath = path.join(srvDir, "server.properties");
       let seed = "";
       if(fs.existsSync(propsPath)) {
         const match = fs.readFileSync(propsPath, "utf-8").match(/level-seed=(.*)/);
         if(match && match[1]) { seed = match[1].trim(); }
       }
       res.json({ seed });
    } catch(e) {
       res.json({ seed: "" });
    }
  });

  app.post("/api/world/load", async (req, res) => {
    const { serverId, worldName, x, y, z, size } = req.body;
    try {
      const srvDir = getServerDir(serverId);
      const worldPath = path.join(srvDir, worldName || "world");
      if (!fs.existsSync(worldPath)) return res.json({ error: "Mundo não encontrado ou servidor não gerou o world." });

      let AnvilPkg: any, ChunkPkg: any, registry: any;
      try {
        AnvilPkg = await import("prismarine-provider-anvil");
        ChunkPkg = await import("prismarine-chunk");
        const registryAll = await import("prismarine-registry");
        registry = registryAll.default ? registryAll.default("1.20.1") : (registryAll as any)("1.20.1");
      } catch (err: any) {
        return res.json({ error: "Módulos de mapa não encontrados. Certifique-se de instalar as dependências: npm install prismarine-provider-anvil prismarine-chunk prismarine-registry" });
      }

      const Anvil = AnvilPkg.default ? AnvilPkg.default.Anvil : AnvilPkg.Anvil;
      const AnvilWorld = Anvil("1.20.1");
      const worldProvider = new AnvilWorld(path.join(worldPath, "region"));

      const loadSize = Math.min(size || 16, 16); 
      const startX = Math.floor(x || 0);
      const startY = Math.floor(y || 64);
      const startZ = Math.floor(z || 0);

      const blocks = [];
      
      const chunkX = Math.floor(startX / 16);
      const chunkZ = Math.floor(startZ / 16);

      try {
        const chunkData = await worldProvider.load(chunkX, chunkZ);
        if (chunkData) {
           const PrisChunk = ChunkPkg.default ? ChunkPkg.default(registry) : ChunkPkg(registry);
           const chunk: any = new PrisChunk(null);
           if (chunk.loadLight) chunk.loadLight(chunkData.light);
           if (chunk.load) chunk.load(chunkData.chunk, chunkData.bitmaps);
           
           for (let dx = 0; dx < 16; dx++) { // loop full 16x16 chunk horizontally
              // Load bigger vertical segment centered around startY
              const loadHeight = 128;
              const searchStartY = Math.max(0, startY - 64);
              for (let dy = 0; dy < loadHeight; dy++) {
                for (let dz = 0; dz < 16; dz++) {
                  const by = searchStartY + dy;
                  if (by < 0 || by > 319) continue;
                  
                  const b = chunk.getBlockStateId({ x: dx, y: by, z: dz } as any);
                  if (b > 0) { // Not Air
                     // Visible culling optimization
                     let isVisible = false;
                     if (by < 319 && chunk.getBlockStateId({ x: dx, y: by + 1, z: dz } as any) === 0) isVisible = true;
                     else if (by > 0 && chunk.getBlockStateId({ x: dx, y: by - 1, z: dz } as any) === 0) isVisible = true;
                     else if (dx > 0 && chunk.getBlockStateId({ x: dx - 1, y: by, z: dz } as any) === 0) isVisible = true;
                     else if (dx < 15 && chunk.getBlockStateId({ x: dx + 1, y: by, z: dz } as any) === 0) isVisible = true;
                     else if (dz > 0 && chunk.getBlockStateId({ x: dx, y: by, z: dz - 1 } as any) === 0) isVisible = true;
                     else if (dz < 15 && chunk.getBlockStateId({ x: dx, y: by, z: dz + 1 } as any) === 0) isVisible = true;
                     else if (dx === 0 || dx === 15 || dz === 0 || dz === 15) isVisible = true;
                     
                     if (isVisible) {
                        // Color mapping roughly
                        let color = 'stone';
                        if (b === 2 || b === 9 || b === 10) color = 'grass';
                        else if (b === 3 || b === 11 || b === 12) color = 'dirt';
                        else if (b === 8 || b === 9) color = 'water';
                        else if (b === 12) color = 'sand';
                        else if (b === 17) color = 'wood';
                        else if (b === 18) color = 'leaves';
                        else if (b === 20) color = 'glass';
                        else color = 'stone';
                        
                        const absX = (chunkX * 16) + dx;
                        const absZ = (chunkZ * 16) + dz;
                        
                        const blockObj = chunk.getBlock(new (await import('vec3')).default(dx, by, dz));
                        blocks.push({ pos: [absX, by, absZ], color, stateId: b, name: blockObj?.name || 'stone' });
                     }
                  }
                }
              }
            }
        }
      } catch (e: any) {
        console.error("Chunk load error", e);
        if (e && e.code === 'ENOENT') {
           return res.json({ error: `Nenhum bloco encontrado na coordenada (${startX}, ${startZ}). O Minecraft cria os arquivos apenas quando o jogador passa ou constrói na área.` });
        }
      }

      res.json({ blocks, origin: [startX, startY, startZ] });
    } catch(e: any) {
      res.json({ error: e.message });
    }
  });

  app.post("/api/world/save", async (req, res) => {
    const { serverId, worldName, blocks } = req.body;
    try {
      const srvDir = getServerDir(serverId);
      const worldPath = path.join(srvDir, worldName || "world");
      if (!fs.existsSync(worldPath)) return res.json({ error: "Mundo não encontrado." });

      let AnvilPkg: any, ChunkPkg: any, registry: any;
      try {
        AnvilPkg = await import("prismarine-provider-anvil");
        ChunkPkg = await import("prismarine-chunk");
        const registryAll = await import("prismarine-registry");
        registry = registryAll.default ? registryAll.default("1.20.1") : (registryAll as any)("1.20.1");
      } catch (err: any) {
        return res.json({ error: "Dependências não encontradas." });
      }

      const Anvil = AnvilPkg.default ? AnvilPkg.default.Anvil : AnvilPkg.Anvil;
      const AnvilWorld = Anvil("1.20.1");
      const worldProvider = new AnvilWorld(path.join(worldPath, "region"));

      const PrisChunk = ChunkPkg.default ? ChunkPkg.default(registry) : ChunkPkg(registry);
      
      // Group blocks by chunk coordinates
      const chunksMap = new Map<string, Array<any>>();
      for (const b of (blocks || [])) {
         const bx = Math.floor(b.pos[0]);
         const by = Math.floor(b.pos[1]);
         const bz = Math.floor(b.pos[2]);
         
         const cx = Math.floor(bx / 16);
         const cz = Math.floor(bz / 16);
         const key = `${cx},${cz}`;
         if (!chunksMap.has(key)) chunksMap.set(key, []);
         chunksMap.get(key)!.push({ bx, by, bz, color: b.color });
      }

      for (const [key, chunkBlocks] of chunksMap.entries()) {
         const parts = key.split(",");
         const cx = parseInt(parts[0]);
         const cz = parseInt(parts[1]);
         
         const chunkData = await worldProvider.load(cx, cz);
         if (!chunkData) continue; // skip ungenerated

         const chunk: any = new PrisChunk(null);
         if (chunk.loadLight) chunk.loadLight(chunkData.light);
         if (chunk.load) chunk.load(chunkData.chunk, chunkData.bitmaps);

         for (const b of chunkBlocks) {
            const localX = b.bx % 16;
            const localZ = b.bz % 16;
            
            const lx = (localX < 0 ? localX + 16 : localX);
            const ly = b.by;
            const lz = (localZ < 0 ? localZ + 16 : localZ);

            let stId = 0; // Air
            if (b.color === 'stone') stId = 1;
            else if (b.color === 'grass') stId = 2; // Grass block
            else if (b.color === 'dirt') stId = 3;
            else if (b.color === 'wood') stId = 17; // Oak log
            else if (b.color === 'leaves') stId = 18; // Oak leaves
            else if (b.color === 'glass') stId = 20; // Glass
            else if (b.color === 'water') stId = 9; // Water
            else if (b.color === 'sand') stId = 12; // Sand
            else stId = 1; // Default
            
            chunk.setBlockStateId({ x: lx, y: ly, z: lz } as any, stId);
         }
         
         await worldProvider.save(cx, cz, {
             chunk: chunk.dump(),
             bitmaps: chunk.dumpBitmaps ? chunk.dumpBitmaps() : undefined,
             light: chunk.dumpLight ? chunk.dumpLight() : undefined
         });
      }
      
      res.json({ success: true });
    } catch(e: any) {
      console.error(e);
      res.json({ error: e.message });
    }
  });

  app.post("/api/ai/models", async (req, res) => {
    try {
      const { endpoint, apiKey } = req.body;
      if (!endpoint) return res.status(400).json({ error: "Endpoint não fornecido." });
      
      const url = new URL(endpoint);
      let modelsUrl = endpoint.replace("/chat/completions", "/models");
      if (modelsUrl === endpoint) {
          modelsUrl = url.origin + "/v1/models"; 
      }
      
      const headers: any = {};
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
      
      const response = await fetch(modelsUrl, { method: "GET", headers });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: `Erro na API: ${response.statusText}` });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      console.error("[AI Models API]", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai", async (req, res) => {
    try {
      const { prompt, context, serverId, provider, endpoint, history, modelName, apiKeys, options } = req.body;
      const sId = serverId || "default";

      let keysToTry = [];
      if (apiKeys && Array.isArray(apiKeys) && apiKeys.length > 0) {
        keysToTry = [...apiKeys];
      }
      
      const envKey = process.env.UNIVERSAL_API_KEY || process.env.GEMINI_API_KEY || "";
      if (envKey && envKey !== "AIza_fallback" && !keysToTry.includes(envKey)) {
         keysToTry.push(envKey);
      }

      if (provider !== "local" && keysToTry.length === 0) {
        throw new Error("Nenhuma API Key configurada. Configure no menu de IA ou nas Configurações.");
      }

      const currentKey = keysToTry.length > 0 ? keysToTry[0] : "";
      const isGeminiKey = currentKey && !currentKey.startsWith("gsk_") && !currentKey.startsWith("xai-") && !currentKey.startsWith("sk-") && !currentKey.startsWith("nvapi-");

      const opts = options || { ai_internet: true, ai_memory: true, ai_bot: true };

      // Instrução de sistema para manter a personalidade
      const systemInstruction = `
Você é o "PaperCreeper AI", o OPERADOR SUPREMO e ENGENHEIRO de servidores Minecraft.
Personalidade: Técnico, eficiente, prestativo e com um toque de humor "Minecrafter". Use emojis como ⛏️, 💎, 🔥, 🧨, 🛡️.

SUAS CAPACIDADES (Nomes das ferramentas suportadas):
- "startServer": Iniciar o servidor
- "stopServer": Parar o servidor
- "sendTerminalCommand": Executar comando in-game (args: { "command": "cmd" })
- "updateRAM": Ajustar RAM em GB (args: { "ram": 4 })
- "readFile": Ler arquivo (args: { "path": "server.properties" })
- "saveFile": Escrever arquivo (args: { "path": "arquivo", "content": "conteudo" })
- "listFiles": Listar pasta (args: { "folder": "plugins" })
- "executeTerminal": Shell linux no host (args: { "command": "ls" })
${opts.ai_internet ? `- "searchInternet": Busca na web para autoaprendizado/códigos (args: { "query": "..." })
- "fetchUrl": Lê um site da internet (args: { "url": "..." })` : ''}
${opts.ai_memory ? `- "saveMemory": Salva um fato ou informação importante no cérebro a longo prazo (args: { "key": "...", "content": "..." })
- "readMemory": Consulta sua memória de longo prazo (args: { "query": "..." })` : ''}
${opts.ai_bot ? `- "spawnBot": Cria um Bot In-Game virtual para jogar e ler chat (args: { "botName": "..." })` : ''}

FORMATO DE RESPOSTA OBRIGATÓRIO PARA AÇÕES:
MÉTODO 1 (Padrão JSON):
Quando decidir realizar uma ação técnica, inclua no final da sua resposta estritamente este bloco JSON:
[ACTION:{"name": "nomeDaFerramenta", "args": {"parametro": "valor"}}]
Exemplo: "Vou deixar de dia! [ACTION:{"name": "sendTerminalCommand", "args": {"command": "time set day"}}]"

MÉTODO 2 (Pesquisa Rápida na Web e Memória):
Você também pode usar diretamente as seguintes tags para acessar a internet ou a memória:
- Internet: <call:PESQUISAR>termo_de_busca</call>
- Memória local: <call:CONSULTAR>termo_de_busca</call>
Exemplo: "Deixe-me procurar isso: <call:PESQUISAR>mcMMO setup</call>"
      `;

      let text = "";

      if (provider === "local") {
        // Local AI (LM Studio, Ollama, etc) via OpenAI API compatible endpoint
        const targetEndpoint = endpoint || "http://127.0.0.1:11434/v1/chat/completions";
        const messages = [{ role: "system", content: systemInstruction }];
        if (context) messages.push({ role: "system", content: `CONTEXTO ATUAL DO SERVIDOR:\n${context}` });
        
        if (history && Array.isArray(history)) {
          history.forEach((msg: any) => messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.text }));
        }
        
        messages.push({ role: "user", content: prompt });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const fetchHeaders: any = { "Content-Type": "application/json" };
        if (keysToTry.length > 0) {
          fetchHeaders["Authorization"] = `Bearer ${keysToTry[0]}`;
        }

        const fetchPayload: any = { model: modelName || "llama3", messages, temperature: 0.7 };
        
        if (targetEndpoint.includes("nvidia.com") && typeof modelName === "string" && modelName.includes("deepseek")) {
          fetchPayload.chat_template_kwargs = { thinking: false };
        }

        const oaiRes = await fetch(targetEndpoint, {
          method: "POST",
          headers: fetchHeaders,
          body: JSON.stringify(fetchPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!oaiRes.ok) throw new Error(`Http error ${oaiRes.status}`);
        const oaiData: any = await oaiRes.json();
        text = oaiData.choices?.[0]?.message?.content || "";

      } else if (keysToTry.length > 0 && isGeminiKey) {
        // Assume all keys are Gemini keys
        const tryKey = async (key: string) => {
          const localAi = new GoogleGenAI({ apiKey: key });
          
          const formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text }]
          }));

          const chat = localAi.chats.create({
            model: "gemini-2.5-flash",
            config: {
              systemInstruction,
              temperature: 0.8,
              topP: 0.95,
              topK: 64,
            },
            history: formattedHistory
          });
          
          const result = await chat.sendMessage({ 
            message: `${context ? `CONTEXTO ATUAL DO SERVIDOR:\n${context}\n\n` : ""}${prompt}` 
          });
          return result.text;
        };

        for (let i = 0; i < keysToTry.length; i++) {
          try {
            text = await tryKey(keysToTry[i]);
            break; // Success
          } catch (e: any) {
            console.error(`[AI] Error with key ${i + 1}/${keysToTry.length}:`, e.message);
            if (e.message?.includes('429') && i < keysToTry.length - 1) {
              console.log("[AI] Quota exceeded, switching to next key...");
              continue;
            }
            if (i === keysToTry.length - 1) throw e;
          }
        }
      } else {
        // External OpenAI-compatible (Groq, xAI, OpenAI)
        let targetEndpoint = "https://api.openai.com/v1/chat/completions";
        let model = modelName || "gpt-4o-mini";
        const currentKey = keysToTry.length > 0 ? keysToTry[0] : "";

        if (currentKey.startsWith("gsk_")) {
          targetEndpoint = "https://api.groq.com/openai/v1/chat/completions";
          model = modelName || "llama-3.3-70b-versatile"; 
        } else if (currentKey.startsWith("xai-")) {
          targetEndpoint = "https://api.x.ai/v1/chat/completions";
          model = modelName || "grok-2-latest";
        } else if (currentKey.startsWith("nvapi-")) {
          targetEndpoint = "https://integrate.api.nvidia.com/v1/chat/completions";
          model = modelName || "deepseek-ai/deepseek-v4-pro"; // Default Nvidia model
        }

        const messages = [{ role: "system", content: systemInstruction }];
        if (context) messages.push({ role: "system", content: `CONTEXTO ATUAL DO SERVIDOR:\n${context}` });
        
        if (history && Array.isArray(history)) {
          history.forEach(msg => messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.text }));
        }

        messages.push({ role: "user", content: prompt });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const fetchPayload: any = { model, messages, temperature: 0.8 };
        
        if (targetEndpoint.includes("nvidia.com") && typeof model === "string" && model.includes("deepseek")) {
          fetchPayload.chat_template_kwargs = { thinking: false };
        }

        const oaiRes = await fetch(targetEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fetchPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!oaiRes.ok) {
          const errJson = await oaiRes.json().catch(() => ({}));
          throw new Error(
            errJson.error?.message || `Http error ${oaiRes.status}`,
          );
        }

        const oaiData: any = await oaiRes.json();
        text = oaiData.choices?.[0]?.message?.content || "";
      }

      // Tenta extrair ações do texto de forma resiliente
      let call = null;
      
      // Look for the user's Local AI tags <call:PESQUISAR>query</call>
      const pesquisarMatch = text.match(/<call:PESQUISAR>(.*?)<\/call>/i);
      if (pesquisarMatch) {
         call = { name: "searchInternet", args: { query: pesquisarMatch[1].trim() } };
         text = text.replace(pesquisarMatch[0], "").trim();
      } else {
         const consultarMatch = text.match(/<call:CONSULTAR>(.*?)<\/call>/i);
         if (consultarMatch) {
            call = { name: "readMemory", args: { query: consultarMatch[1].trim() } };
            text = text.replace(consultarMatch[0], "").trim();
         }
      }

      const actionRegex = /\[ACTION:\s*({[\s\S]+?})\s*]/i;
      const actionMatch = text.match(actionRegex);
      
      if (actionMatch) {
        let jsonStr = actionMatch[1].trim();
        // Remove possíveis wrappers de markdown gerados pela IA
        jsonStr = jsonStr.replace(/```json/gi, "").replace(/```/g, "").trim();
        try {
          call = JSON.parse(jsonStr);
          text = text.replace(actionMatch[0], "").trim();
        } catch(e) {
          console.log("Failed to parse action json", jsonStr);
        }
      }

      res.json({ text, call });
    } catch (error: any) {
      console.error("AI Server Error:", error);
      let message = error.message;
      if (
        message.includes("API key not valid") ||
        message.includes("403") ||
        message.includes("401")
      ) {
        message = "Chave API inválida ou não configurada.";
      }
      res.status(500).json({
        error: message,
        details: error.message,
      });
    }
  });

  // --- Public Store ---
  app.get("/s/:serverId", (req, res) => {
    const { serverId } = req.params;
    let config;
    try {
      config = getSrvConfig(serverId);
    } catch (e) {
      return res.status(404).send("Servidor não encontrado.");
    }

    // Serve a simple HTML page using Tailwind CSS via CDN for the store.
    const storeName = config.store?.name || config.name || "Loja do Servidor";
    const themeColor = config.store?.color || "#10b981"; // default emerald
    const items = config.store?.items || [];

    const state: any = serversState[serverId] || {};
    const serverIp = state.tunnelAddress || "Requer inicialização...";

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Loja - ${storeName}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { background-color: #09090b; color: #f4f4f5; font-family: sans-serif; }
        .theme-border { border-color: ${themeColor} !important; }
        .theme-bg { background-color: ${themeColor} !important; }
        .theme-text { color: ${themeColor} !important; }
      </style>
    </head>
    <body class="min-h-screen flex flex-col items-center py-12 px-4 space-y-12">
      <header class="text-center space-y-4">
        <h1 class="text-5xl font-black theme-text tracking-tighter">${storeName}</h1>
        <p class="text-zinc-400 font-medium">Jogue agora: <span class="bg-zinc-800 px-3 py-1 rounded-md text-white select-all border border-zinc-700">${serverIp}</span></p>
      </header>
      
      <main class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        ${items.length === 0 ? '<p class="text-zinc-500 text-center col-span-3 py-10">Nenhum pacote disponível na loja ainda.</p>' : ""}
        ${items
          .map(
            (i: any) => `
          <div class="bg-zinc-900 border-2 theme-border border-opacity-30 rounded-3xl p-6 flex flex-col space-y-4 shadow-2xl relative overflow-hidden">
             <div class="absolute top-0 right-0 p-4 opacity-10">
               <svg xmlns="http://www.w3.org/-svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${themeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
             </div>
             
             <h3 class="text-2xl font-bold z-10">${i.name}</h3>
             <p class="text-zinc-400 text-sm flex-grow z-10">${i.description || ""}</p>
             <div class="text-3xl font-black mt-4 z-10">R$ ${Number(i.price).toFixed(2)}</div>
             <button onclick="buy('${i.id}', '${i.name}')" class="w-full py-4 mt-2 rounded-xl theme-bg text-black font-black uppercase tracking-widest hover:opacity-90 transition-opacity z-10 shadow-lg cursor-pointer">
               Adquirir Pacote
             </button>
          </div>
        `,
          )
          .join("")}
      </main>
      
      <script>
        function buy(itemId, itemName) {
          const nick = prompt("Você está adquirindo: " + itemName + "\\nQual seu Nickname exato no servidor?");
          if (!nick) return;
          
          fetch('/api/public/store/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId: '${serverId}', itemId, player: nick })
          }).then(res => res.json()).then(data => {
            if (data.success) {
              alert("🎉 Pagamento simulado com sucesso!\\nO pacote foi entregue no servidor para o jogador " + nick + ".");
            } else {
              alert("❌ Erro: " + (data.error || "Servidor indisponível ou offline."));
            }
          }).catch(() => alert("❌ Erro ao conectar ao painel."));
        }
      </script>
    </body>
    </html>
    `;
    res.send(html);
  });

  app.post("/api/public/store/buy", (req, res) => {
    const { serverId, itemId, player } = req.body;
    if (!serverId || !itemId || !player)
      return res.status(400).json({ error: "Dados incompletos" });

    // Simulate payment success and run commands
    let config;
    try {
      config = getSrvConfig(serverId);
    } catch (e) {
      return res.status(404).json({ error: "Server config not found" });
    }

    const store = config.store || {};
    const items = store.items || [];
    const item = items.find((i: any) => i.id === itemId);

    if (!item) return res.status(404).json({ error: "Item não encontrado" });

    const srv = serversState[serverId];
    if (!srv || !srv.process || srv.status !== "online") {
      return res.status(400).json({
        error:
          "O servidor precisa estar Online (Ligado) para processar o pacote.",
      });
    }

    // Fire commands
    const cmds = item.commands || [];
    if (cmds.length === 0) {
      const defaultCmd = `say O jogador ${player} adquiriu ${item.name}! Muito obrigado pelo apoio!`;
      srv.process.stdin.write(defaultCmd + "\\n");
      addLog(serverId, `[STORE] Executado (Cmd Padrão): ${defaultCmd}`);
    } else {
      for (const rawCmd of cmds) {
        let runCmd = rawCmd
          .replace(/{player}/g, player)
          .replace(/{player}/gi, player);
        if (runCmd.startsWith("/")) runCmd = runCmd.substring(1);
        srv.process.stdin.write(runCmd + "\\n");
        addLog(serverId, `[STORE] Executado via Loja: ${runCmd}`);
      }
    }

    res.json({ success: true });
  });

  app.post("/api/public/store/auth", (req, res) => {
    const { username, password, serverId } = req.body;
    // Integração simulada: a loja consultaria o banco de dados do plugin AuthMe/nLogin ou enviaria comandos
    // para um proxy no servidor validando o hash.

    setTimeout(() => {
      // Simula delay de rede e hash check
      if (password === "demo123" || password === "admin") {
        res.json({
          success: true,
          user: {
            username,
            uuid: "mock-uuid-123",
            coins: 12500,
            rank: "VIP Lenda",
          },
        });
      } else if (password) {
        res.json({
          success: true,
          user: { username, uuid: "mock-uuid-456", coins: 150, rank: "Membro" },
        });
      } else {
        res.status(401).json({ error: "Credenciais inválidas." });
      }
    }, 600);
  });

  app.post("/api/server/store", (req, res) => {
    const { serverId, store } = req.body;
    if (!serverId)
      return res.status(400).json({ error: "Servidor não informado" });
    const config = getSrvConfig(serverId);
    config.store = store;
    saveSrvConfig(serverId, config);
    res.json({ success: true });
  });

  app.get("/api/servers", (req, res) => {
    if (!fs.existsSync(SERVERS_ROOT)) return res.json({ servers: [] });
    const servers = fs
      .readdirSync(SERVERS_ROOT)
      .filter((id) => fs.lstatSync(path.join(SERVERS_ROOT, id)).isDirectory());
    const data = servers.map((id) => {
      const config = getSrvConfig(id);
      ensureState(id);
      return {
        id,
        name: config.name,
        ram: config.ram,
        minRam: config.minRam,
        type: config.type,
        version: config.version,
        store: config.store || null,
        status: serversState[id].status,
      };
    });
    res.json({ servers: data });
  });

  app.post("/api/server/files/upload", upload.array("files"), (req, res) => {
    res.json({ success: true });
  });

  app.post("/api/servers/create", (req, res) => {
    const { name, ram, type, version, usePlayit } = req.body;
    const id =
      (name || "server")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") +
      "-" +
      Date.now().toString().slice(-4);
    const dir = getServerDir(id);
    fs.mkdirSync(dir, { recursive: true });

    // Ensure plugins folder exists immediately
    const pluginsDir = path.join(dir, "plugins");
    if (!fs.existsSync(pluginsDir))
      fs.mkdirSync(pluginsDir, { recursive: true });

    saveSrvConfig(id, {
      ...DEFAULT_CONFIG,
      name: name || "Novo Servidor",
      ram: Number(ram) || 4,
      type: type || "paper",
      version: version || "1.21.1",
      usePlayit: usePlayit !== undefined ? usePlayit : true,
    });
    res.json({ id });
  });

  const autoInjectAICore = async (serverId: string) => {
    const srvDir = getServerDir(serverId);
    const pluginsDir = path.join(srvDir, "plugins");
    if (!fs.existsSync(pluginsDir))
      fs.mkdirSync(pluginsDir, { recursive: true });

    const skriptUrl =
      "https://github.com/SkriptLang/Skript/releases/download/2.9.3/Skript.jar";
    const dest = path.join(pluginsDir, "Skript.jar");

    const finishInjection = () => {
      // Inject Skript Script
      const skDir = path.join(pluginsDir, "Skript", "scripts");
      if (!fs.existsSync(skDir)) fs.mkdirSync(skDir, { recursive: true });
      const skFile = path.join(skDir, "creeper-inject.sk");
      const skContent = `
# PaperCreeper AI - Inject Script
on load:
    send "[AI] PaperCreeper AI Inject ativado com sucesso! 💎" to console
    send "[AI] Motor de Inteligência Articulada pronto para ordens." to console

command /creeper-ai <text>:
    permission: op
    trigger:
        send "[AI] Executando comando cerebral: %arg-1%" to console
        execute console command arg-1
`;
      if (!fs.existsSync(skFile)) fs.writeFileSync(skFile, skContent);
    };

    if (!fs.existsSync(dest)) {
      addLog(serverId, "[AI] Injetando motor de poder (Skript)...");
      const success = await downloadFile(skriptUrl, dest);
      if (!success) {
        console.error(`[AI ERROR] Failed to auto-inject Skript to ${serverId}`);
      } else {
        addLog(serverId, "[AI] Motor de poder injetado com sucesso! 💎");
        finishInjection();
      }
    } else {
      finishInjection();
    }
  };

  app.post("/api/servers/rename", (req, res) => {
    const { serverId, name } = req.body;
    const config = getSrvConfig(serverId);
    saveSrvConfig(serverId, { ...config, name });
    res.json({ success: true });
  });

  app.post("/api/server/update-config", (req, res) => {
    const { serverId, name, ram, minRam, usePlayit, store, javaPath } = req.body;
    if (!serverId)
      return res.status(404).json({ error: "Servidor não encontrado" });

    ensureState(serverId);
    const configPath = path.join(getServerDir(serverId), "creeper.json");
    const config = getSrvConfig(serverId);

    const newConfig = {
      ...config,
      name: name || config.name,
      ram: ram !== undefined ? ram : config.ram,
      minRam: minRam !== undefined ? minRam : config.minRam,
      usePlayit: usePlayit !== undefined ? usePlayit : config.usePlayit,
      store: store !== undefined ? store : config.store,
      javaPath: javaPath !== undefined ? javaPath : config.javaPath,
    };

    saveSrvConfig(serverId, newConfig);

    res.json({ success: true });
  });

  app.get("/api/ai/test", async (req, res) => {
    try {
      const currentKey = process.env.GEMINI_API_KEY || "AIza_fallback";
      const localAi = new GoogleGenAI({ apiKey: currentKey });
      const result = await localAi.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Say hello",
      });
      res.json({ success: true, text: result.text });
    } catch (e: any) {
      res.status(500).json({
        error: e.message,
        envKeyType: typeof process.env.GEMINI_API_KEY,
        envKeyLen: process.env.GEMINI_API_KEY?.length,
      });
    }
  });

  app.post("/api/server/skript/reload", (req, res) => {
    const { serverId } = req.body;
    if (!serverId) return res.status(400).json({ error: "Server ID required" });
    const sId =
      serverId === "default"
        ? Object.keys(serversState)[0] || "default"
        : serverId;
    const proc = serversState[sId]?.process;
    if (proc) {
      proc.stdin.write("sk reload all\n");
    }
    res.json({ success: true });
  });

  app.post("/api/servers/status-multi", (req, res) => {
    const { trackers } = req.body; // { [serverId]: lastLogIdx }
    if (!trackers || typeof trackers !== "object") return res.json({ servers: {} });
    
    const result: Record<string, any> = {};
    for (const id of Object.keys(trackers)) {
      if (!fs.existsSync(getServerDir(id))) continue;
      ensureState(id);
      
      const lastLogIdx = parseInt(trackers[id]) || 0;
      const allLogs = serversState[id].logs;
      const newLogs = lastLogIdx > 0 ? allLogs.slice(lastLogIdx) : allLogs;
      
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const cpuLoad = os.loadavg()[0];

      result[id] = {
        status: serversState[id].status,
        tunnel: serversState[id].tunnelAddress,
        logs: newLogs,
        logCount: allLogs.length,
        stats: {
          cpu: `${(cpuLoad * 10).toFixed(1)}%`,
          ram: `${((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(1)} / ${(totalMem / 1024 / 1024 / 1024).toFixed(1)} GB`,
          ramPercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
        }
      };
    }
    res.json({ servers: result });
  });

  app.get("/api/server/status", (req, res) => {
    const id = (req.query.serverId as string) || "default";

    if (id !== "default" && !fs.existsSync(getServerDir(id))) {
      return res.status(404).json({ error: "Server deleted" });
    }

    const lastLogIdx = parseInt(req.query.lastLogIdx as string) || 0;
    ensureState(id);
    const config = getSrvConfig(id);
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const cpuLoad = os.loadavg()[0];

    const allLogs = serversState[id].logs;
    const newLogs = lastLogIdx > 0 ? allLogs.slice(lastLogIdx) : allLogs;

    res.json({
      status: serversState[id].status,
      tunnel: serversState[id].tunnelAddress,
      logs: newLogs,
      logCount: allLogs.length,
      config,
      stats: {
        cpu: `${(cpuLoad * 10).toFixed(1)}%`,
        ram: `${((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(1)} / ${(totalMem / 1024 / 1024 / 1024).toFixed(1)} GB`,
        ramPercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
      },
    });
  });

  app.post("/api/server/config", (req, res) => {
    const { serverId, ram, minRam } = req.body;
    ensureState(serverId);
    if (serversState[serverId].status !== "offline")
      return res.status(400).json({ error: "Desligue o servidor!" });
    const current = getSrvConfig(serverId);
    saveSrvConfig(serverId, {
      ...current,
      ram: Number(ram),
      minRam: Number(minRam || 1),
    });
    addLog(serverId, `[CONFIG] RAM: ${ram}GB.`);
    res.json({ message: "Salvo!" });
  });

  app.post("/api/server/config/ram", (req, res) => {
    const { serverId, ram } = req.body;
    const config = getSrvConfig(serverId);
    saveSrvConfig(serverId, { ...config, ram: Number(ram) });
    res.json({ success: true });
  });

  app.post("/api/server/execute", (req, res) => {
    const { serverId, command } = req.body;
    if (!command) return res.status(400).json({ error: "Comando vazio" });

    // ATENÇÃO: Executa comandos reais no SO! Use com cuidado.
    exec(
      command,
      { cwd: getServerDir(serverId || "default") },
      (err, stdout, stderr) => {
        if (err) return res.json({ success: false, output: stderr });
        res.json({ success: true, output: stdout });
      },
    );
  });

  app.post("/api/server/start", async (req, res) => {
    const { serverId } = req.body;
    if (!serverId) return res.status(400).json({ error: "No ID" });
    ensureState(serverId);
    if (serversState[serverId].status !== "offline")
      return res.status(400).json({ error: "Já rodando." });

    const srvDir = getServerDir(serverId);
    if (!fs.existsSync(srvDir))
      return res.status(404).json({ error: "Pasta não existe" });

    // Auto-EULA
    fs.writeFileSync(path.join(srvDir, "eula.txt"), "eula=true");

    const runShPath = path.join(srvDir, "run.sh");
    // Forge 1.17+ wrapper creates run.sh. If it exists, prioritize it.
    const jarFile = fs
      .readdirSync(srvDir)
      .filter((f) => f.endsWith(".jar") && !f.includes("installer"))
      .sort()[0];

    if (!fs.existsSync(runShPath) && !jarFile) {
      return res
        .status(400)
        .json({ error: "Instale um servidor (JAR ou run.sh) primeiro." });
    }

    const config = getSrvConfig(serverId);

    serversState[serverId].status = "starting";
    serversState[serverId].logs = []; // Limpa logs anteriores
    addLog(serverId, `🚀 Iniciando Minecraft...`);

    // DYNAMIC JAVA SELECTION
    let assumedVersion = config.mcVersion || "";
    if (!assumedVersion && jarFile) {
      const match = jarFile.match(/1\.\d+(?:\.\d+)?/);
      if (match) assumedVersion = match[0];
    }
    let reqMajor = getRequiredJavaMajor(assumedVersion);
    if (config.javaVersion) reqMajor = parseInt(config.javaVersion, 10);

    // Resolve dynamic java Path
    res.json({ message: "Iniciando..." }); // Envia resposta cedo para evitar timeout do front

    try {
      const resolveJava = async () => {
        // 1. Check manual path first
        if (config.javaPath && fs.existsSync(config.javaPath)) {
          addLog(serverId, `[JAVA] Usando caminho manual: ${config.javaPath}`);
          return config.javaPath;
        }
        // 2. Default to automated detection/download
        return await downloadJavaIfNeeded(reqMajor, (msg) => addLog(serverId, msg));
      };

      const dynamicJavaPath = await resolveJava();
      
      // Update activeJava tag
      try {
        const verOut = execSync(`"${dynamicJavaPath}" -version 2>&1`, { encoding: "utf-8" });
        const m = verOut.match(/version "([^"]+)"/);
        serversState[serverId].activeJava = m ? m[1] : "Java " + reqMajor;
      } catch(e) {
        serversState[serverId].activeJava = "Java " + reqMajor;
      }

      addLog(serverId, `⚙️ RAM: ${config.ram}GB | Java: ${dynamicJavaPath} | Server: ${assumedVersion}`);

      let command = dynamicJavaPath;
      const type = (config.type || "").toLowerCase();
      let args = [
        "-Xmx" + config.ram + "G",
        "-Xms" +
          (config.minRam || Math.max(1, Math.floor(config.ram / 2))) +
          "G",
      ];

      // --- SELEÇÃO DINÂMICA DE FLAGS (LINUX PRO OPTIMIZED) ---
      if (
        [
          "paper",
          "purpur",
          "spigot",
          "fabric",
          "mohist",
          "forge",
          "vanilla",
        ].includes(type)
      ) {
        // AIKAR'S FLAGS (O padrão ouro para Survival/Modded)
        args.push(
          "-XX:+UseG1GC",
          "-XX:+ParallelRefProcEnabled",
          "-XX:MaxGCPauseMillis=200",
          "-XX:+UnlockExperimentalVMOptions",
          "-XX:+DisableExplicitGC",
          "-XX:+AlwaysPreTouch",
          "-XX:G1NewSizePercent=30",
          "-XX:G1MaxNewSizePercent=40",
          "-XX:G1HeapRegionSize=8M",
          "-XX:G1ReservePercent=20",
          "-XX:G1HeapWastePercent=5",
          "-XX:G1MixedGCCountTarget=4",
          "-XX:InitiatingHeapOccupancyPercent=15",
          "-XX:G1MixedGCLiveThresholdPercent=90",
          "-XX:G1RSetUpdatingPauseTimePercent=5",
          "-XX:SurvivorRatio=32",
          "-XX:+PerfDisableSharedMem",
          "-XX:MaxTenuringThreshold=1",
        );
      } else if (["velocity", "waterfall", "bungeecord"].includes(type)) {
        // PROXY FLAGS (Focadas em latência e processamento de pacotes)
        args.push(
          "-XX:+UseG1GC",
          "-XX:MaxGCPauseMillis=50",
          "-XX:+UnlockExperimentalVMOptions",
          "-XX:+AlwaysPreTouch",
          "-XX:G1HeapRegionSize=4M",
          "-XX:InitiatingHeapOccupancyPercent=15",
          "-XX:G1MixedGCCountTarget=4",
        );
      } else if (type === "nukkit") {
        // NUKKIT FLAGS (Leveza total com ZGC se disponível no Linux)
        args.push(
          "-XX:+AlwaysPreTouch",
          "-XX:+DisableExplicitGC",
          "-XX:MaxGCPauseMillis=20",
        );
      }

      args.push("-Dfile.encoding=UTF-8");
      args.push("-Djline.terminal=jline.UnsupportedTerminal");

      if (fs.existsSync(runShPath)) {
        addLog(serverId, `[INFO] Usando script run.sh em vez de JAR direto...`);
        command = "sh";
        args = ["run.sh"];
      } else {
        const jarPath = path.resolve(srvDir, jarFile);
        args.push("-jar", jarPath, "nogui");
      }

      // Pre-startup: Check port from server.properties to prevent "Address already in use"
      try {
        let targetPort = 25565;
        const propsPath = path.join(srvDir, "server.properties");
        if (fs.existsSync(propsPath)) {
           const props = fs.readFileSync(propsPath, "utf-8");
           const match = props.match(/server-port=(\d+)/);
           if (match) targetPort = parseInt(match[1]);
        }
        // Force-kill any lingering process using this port (like a crashed node child)
        execSync(`fuser -k -9 ${targetPort}/tcp 2>/dev/null`);
        addLog(serverId, `[SISTEMA] Porta ${targetPort} verificada e liberada.`);
      } catch (e) {
        // Ignorar se não existir fuser ou ninguem usando
      }

      console.log(`[SPAWN] Executing: ${command} ${args.join(" ")}`);
      console.log(`[SPAWN] Working Directory: ${srvDir}`);

      if (command !== "sh" && command !== "java" && !fs.existsSync(command)) {
        throw new Error(`Comando de boot não encontrado em: ${command}`);
      }

      const env: NodeJS.ProcessEnv = { ...process.env, MALLOC_ARENA_MAX: "2" };
      if (dynamicJavaPath !== "java" && dynamicJavaPath !== "java.exe") {
        const javaBinDir = path.dirname(dynamicJavaPath);
        env.PATH = `${javaBinDir}${path.delimiter}${env.PATH || ""}`;
        env.JAVA_HOME = path.dirname(javaBinDir); // Set JAVA_HOME to the jdk root
      }

      const child = spawn(command, args, {
        cwd: srvDir,
        stdio: ["pipe", "pipe", "pipe"],
        env: env,
        shell: false,
      });

      child.on("error", (err) => {
        addLog(serverId, ` [ERROR] Erro ao iniciar processo: ${err.message}`);
        serversState[serverId].status = "offline";
      });

      child.stdout.on("data", (data) => {
        const msg = data.toString().trim();
        msg.split("\n").forEach((line) => {
          if (line.trim()) {
            addLog(serverId, line.trim());
            if (line.includes("Done") || line.includes("For help, type")) {
              serversState[serverId].status = "online";
            }

            // AI Error Listening
            if (/error|warn|exception|crash/i.test(line)) {
              const state = serversState[serverId] as any;
              if (!state.errorBuffer) state.errorBuffer = [];
              state.errorBuffer.push(line.trim());
              // Keep only the last 1000 lines to avoid RangeError: Invalid string length
              if (state.errorBuffer.length > 1000) {
                state.errorBuffer = state.errorBuffer.slice(-1000);
              }

              if (state.errorTimer) clearTimeout(state.errorTimer);
              state.errorTimer = setTimeout(async () => {
                const errors = state.errorBuffer.join("\n");
                state.errorBuffer = []; // clear

                const apiKey = process.env.GEMINI_API_KEY;
                if (apiKey && !apiKey.startsWith("AIza_fallback")) {
                  try {
                    const localAi = new GoogleGenAI({ apiKey });
                    const res = await localAi.models.generateContent({
                      model: "gemini-1.5-flash",
                      contents: `Como assistente técnico do Minecraft, o servidor encontrou os seguintes erros recentes nas logs:\n\n${errors}\n\nAnalise em 1 ou 2 frases curtas o que pode estar errado e dê a solução ou comando necessário. Você é um ajudante automático, responda com algo como "Problema detectado: [X]. Solução: [Y]". Dicas curtas são as melhores.`,
                    });
                    if (res.text) {
                      addLog(
                        serverId,
                        `[AI Auto-Fix] 💡 ${res.text.replace(/\n/g, " ")}`,
                      );
                    }
                  } catch (e) {}
                }
              }, 3000);
            }
          }
        });
      });

      child.stderr.on("data", (data) => {
        const msg = data.toString().trim();
        msg.split("\n").forEach((line) => {
          if (line.trim()) addLog(serverId, `[STDERR] ${line.trim()}`);
        });
      });

      child.on("close", (code) => {
        addLog(serverId, `Servidor parou (code ${code})`);
        serversState[serverId].status = "offline";
        delete serversState[serverId].process;
      });

      serversState[serverId].process = child;
      startGlobalTunnel();
    } catch (err: any) {
      addLog(serverId, ` [ERROR] Crash fatal: ${err.message}`);
      serversState[serverId].status = "offline";
    }
  });

  app.post("/api/server/stop", (req, res) => {
    const { serverId } = req.body;
    const srv = serversState[serverId];
    if (srv && srv.process) {
      srv.status = "stopping";
      srv.process.stdin.write("stop\n");
      // Fallback timeout
      setTimeout(() => {
        if (serversState[serverId]?.status === "stopping") {
          addLog(serverId, "[WARN] Parada demorada, enviando SIGTERM...");
          srv.process.kill();
        }
      }, 30000);
      res.json({ message: "Parando..." });
    } else res.status(400).json({ error: "Não está rodando." });
  });

  app.post("/api/server/kill", (req, res) => {
    const { serverId } = req.body;
    const srv = serversState[serverId];
    if (srv && srv.process) {
      srv.process.kill("SIGKILL");
      srv.status = "offline";
      addLog(serverId, "[DANGER] Processo finalizado forçadamente!");
      res.json({ message: "Killed" });
    } else res.status(400).json({ error: "Não encontrado." });
  });

  app.post("/api/server/clear-logs", (req, res) => {
    const { serverId } = req.body;
    if (serversState[serverId]) {
      serversState[serverId].logs = [];
    }
    res.json({ success: true });
  });

  app.post("/api/bot/control", async (req, res) => {
    const { serverId, action, port, apiKey } = req.body;
    ensureState(serverId);
    const resolvedPort = port || 25565;
    await manageBot(serverId, action, resolvedPort, "Ajudante_IA", apiKey, (msg: string) => {
        addLog(serverId, msg);
    }, (cmd: string) => {
       const proc = serversState[serverId]?.process;
       if (proc) {
           proc.stdin.write(cmd + "\n");
       }
    });
    res.json({ success: true, connected: isBotConnected(serverId) });
  });

  app.post("/api/bot/chat", (req, res) => {
      const { serverId, message } = req.body;
      const sent = sendBotMessage(serverId, message);
      res.json({ success: sent });
  });

  app.get("/api/server/backups", (req, res) => {
    const id = req.query.serverId as string;
    const backupDir = path.join(process.cwd(), "backups", id);
    if (!fs.existsSync(backupDir)) return res.json({ backups: [] });
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".tar.gz")).map(f => {
      const stats = fs.statSync(path.join(backupDir, f));
      return { name: f, size: stats.size, date: stats.mtime };
    });
    res.json({ backups: files });
  });

  app.get("/api/server/backup/download", (req, res) => {
    const { serverId, file } = req.query;
    if (!serverId || !file) return res.status(400).send("Bad request");
    // basic security check
    if ((file as string).includes("..") || (file as string).includes("/")) return res.status(403).send("Forbidden");
    const filepath = path.join(process.cwd(), "backups", serverId as string, file as string);
    if (!fs.existsSync(filepath)) return res.status(404).send("Not found");
    res.download(filepath);
  });

  app.post("/api/server/cloud-backup", (req, res) => {
    const { serverId } = req.body;
    ensureState(serverId);
    const srvDir = getServerDir(serverId);
    const backupDir = path.join(process.cwd(), "cloud_backups", serverId);
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipName = `cloud-backup-${timestamp}.tar.gz`;
    const dest = path.join(backupDir, zipName);

    addLog(serverId, `[CLOUD BACKUP] Preparando pacotes vitais (world, plugins, dados de jogadores)...`);
    
    const dirsToBackup = [];
    ["world", "world_nether", "world_the_end", "plugins", "usercache.json", "banned-players.json", "banned-ips.json", "ops.json", "whitelist.json"].forEach(item => {
        if (fs.existsSync(path.join(srvDir, item))) dirsToBackup.push(item);
    });
    
    if (dirsToBackup.length === 0) {
      addLog(serverId, `[CLOUD BACKUP] Nenhuma pasta essencial encontrada.`);
      return res.json({ success: false, message: "Nenhuma pasta essencial encontrada." });
    }

    // Windows requires slightly different syntax or bash support. Assume Linux environment per earlier implementations for tar
    const includes = dirsToBackup.map(d => `"${d}"`).join(" ");
    
    exec(`tar -czf "${dest}" -C "${srvDir}" ${includes}`, (err) => {
      if (err) addLog(serverId, `[ERROR] Cloud Backup falhou: ${err.message}`);
      else addLog(serverId, `[SUCCESS] Cloud Backup local processado: ${zipName}. (Pronto para Upload na Nuvem)`);
    });
    res.json({ message: "Cloud Backup em progresso" });
  });

  app.get("/api/server/cloud-backups", (req, res) => {
    const id = req.query.serverId as string;
    const backupDir = path.join(process.cwd(), "cloud_backups", id);
    if (!fs.existsSync(backupDir)) return res.json({ backups: [] });
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".tar.gz")).map(f => {
      const stats = fs.statSync(path.join(backupDir, f));
      return { name: f, size: stats.size, date: stats.mtime };
    });
    res.json({ backups: files });
  });

  app.get("/api/server/cloud-backup/download", (req, res) => {
    const { serverId, file } = req.query;
    if (!serverId || !file) return res.status(400).send("Bad request");
    if ((file as string).includes("..") || (file as string).includes("/")) return res.status(403).send("Forbidden");
    const filepath = path.join(process.cwd(), "cloud_backups", serverId as string, file as string);
    if (!fs.existsSync(filepath)) return res.status(404).send("Not found");
    res.download(filepath);
  });

  app.post("/api/server/backup", (req, res) => {
    const { serverId } = req.body;
    ensureState(serverId);
    const srvDir = getServerDir(serverId);
    const backupDir = path.join(process.cwd(), "backups", serverId);
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipName = `backup-${timestamp}.tar.gz`;
    const dest = path.join(backupDir, zipName);

    addLog(serverId, `[BACKUP] Iniciando compressão do mundo...`);
    exec(`tar -czf "${dest}" -C "${srvDir}" .`, (err) => {
      if (err) addLog(serverId, `[ERROR] Backup falhou: ${err.message}`);
      else addLog(serverId, `[SUCCESS] Backup concluído: ${zipName}`);
    });
    res.json({ message: "Backup em progresso" });
  });

  app.post("/api/server/command", (req, res) => {
    const { serverId, command } = req.body;
    const srv = serversState[serverId];
    if (srv && srv.process) {
      try {
        let cmd = command.trim();
        if (cmd.startsWith("/")) cmd = cmd.substring(1);
        srv.process.stdin.write(`${cmd}\n`);
        console.log(`[CONSOLE][${serverId}] Executed: ${cmd}`);
        res.json({ message: "Ok" });
      } catch (err: any) {
        addLog(serverId, `[ERROR] Falha ao enviar comando: ${err.message}`);
        res.status(500).json({ error: "Erro ao escrever no stdin." });
      }
    } else {
      res
        .status(400)
        .json({ error: "Servidor está offline. Ligue-o primeiro! (•◡•)" });
    }
  });

  app.post("/api/server/install", async (req, res) => {
    const { serverId, type, version, customUrl } = req.body;
    addLog(
      serverId,
      `[INSTALLER] Iniciando instalação de ${type === "custom" ? "Custom JAR" : type + " " + version}...`,
    );

    const getPaperUrl = async (project: string, ver: string) => {
      try {
        const vRes = await fetch(
          `https://api.papermc.io/v2/projects/${project}/versions/${ver}`,
        );
        const vData: any = await vRes.json();
        const latestBuild = vData.builds[vData.builds.length - 1];
        return `https://api.papermc.io/v2/projects/${project}/versions/${ver}/builds/${latestBuild}/downloads/${project}-${ver}-${latestBuild}.jar`;
      } catch (e) {
        return null;
      }
    };

    let url: string | null = "";
    let isFabric = type === "fabric";

    if (type === "paper") url = await getPaperUrl("paper", version);
    else if (type === "purpur")
      url = `https://api.purpurmc.org/v2/purpur/${version}/latest/download`;
    else if (type === "velocity") url = await getPaperUrl("velocity", version);
    else if (type === "waterfall")
      url = await getPaperUrl("waterfall", version);
    else if (isFabric) {
      try {
        const lRes = await fetch(
          "https://meta.fabricmc.net/v2/versions/loader",
        );
        const lData: any = await lRes.json();
        const latestLoader =
          lData.find((x: any) => x.stable)?.version || "0.16.5";
        url = `https://meta.fabricmc.net/v2/versions/loader/${version}/${latestLoader}/1.0.1/server/jar`;
      } catch (e) {
        url = `https://meta.fabricmc.net/v2/versions/loader/${version}/0.16.5/1.0.1/server/jar`;
      }
    } else if (type === "mohist") {
      try {
        const mRes = await fetch(
          `https://mohistmc.com/api/v2/projects/mohist/${version}/builds`,
        );
        const mData: any = await mRes.json();
        const latestBuild = mData.builds[mData.builds.length - 1];
        if (latestBuild && latestBuild.url) url = latestBuild.url;
      } catch (e) {
        url = null;
      }
    } else if (type === "forge") {
      try {
        const bRes = await fetch(
          `https://bmclapi2.bangbang93.com/forge/minecraft/${version}`,
        );
        const bData: any = await bRes.json();
        const sorted = bData.sort((a: any, b: any) => b.build - a.build);
        const forgeVer = sorted[0].version;
        url = `https://bmclapi2.bangbang93.com/forge/download?mcversion=${version}&version=${forgeVer}&category=installer&format=jar`;
      } catch (e) {
        url = null;
      }
    } else if (type === "vanilla") {
      try {
        const mRes = await fetch(
          "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json",
        );
        const mData: any = await mRes.json();
        const verEntry = mData.versions.find((v: any) => v.id === version);
        if (verEntry) {
          const vRes = await fetch(verEntry.url);
          const vData: any = await vRes.json();
          url = vData.downloads.server.url;
        }
      } catch (e) {
        url = null;
      }
    } else if (type === "spigot") {
      // Spigot doesn't have a direct official download API like others.
      // Use CDN from getbukkit
      url = `https://cdn.getbukkit.org/spigot/spigot-${version}.jar`;
    } else if (type === "bungeecord") {
      url =
        "https://ci.md-5.net/job/BungeeCord/lastStableBuild/artifact/bootstrap/target/BungeeCord.jar";
    } else if (type === "nukkit") {
      url =
        "https://ci.opencollab.dev/job/NukkitX/job/Nukkit/job/master/lastSuccessfulBuild/artifact/target/nukkit-1.0-SNAPSHOT.jar";
    } else if (type === "custom") url = customUrl;

    if (!url) {
      addLog(serverId, `[ERROR] URL não encontrada para ${type} ${version}`);
      return res.status(400).json({ error: "URL ou Software não suportado." });
    }

    const srvDir = getServerDir(serverId);
    const fileName =
      type === "custom"
        ? "server-custom.jar"
        : type === "forge"
          ? `forge-${version}-installer.jar`
          : type === "nukkit"
            ? `nukkit.jar`
            : `server-${type}-${version}.jar`;
    const dest = path.join(srvDir, fileName);

    try {
      if (fs.existsSync(srvDir)) {
        fs.readdirSync(srvDir).forEach((f) => {
          if (
            f.endsWith(".jar") ||
            f === "run.sh" ||
            f === "run.bat" ||
            f === "user_jvm_args.txt"
          )
            fs.unlinkSync(path.join(srvDir, f));
        });
      } else {
        fs.mkdirSync(srvDir, { recursive: true });
      }
    } catch (e) {}

    addLog(serverId, `[INSTALLER] Baixando de: ${url}`);

    downloadFile(url, dest, (msg) => addLog(serverId, msg)).then(async (success) => {
      if (!success) addLog(serverId, `[ERROR] Falha no download ou versão não encontrada.`);
      else {
        if (type === "forge") {
          addLog(
            serverId,
            `[INSTALLER] Executando Forge Installer (isso pode demorar minutos)...`,
          );
          
          let reqMajor = getRequiredJavaMajor(version);
          const javaForInstaller = await downloadJavaIfNeeded(reqMajor, (msg) => addLog(serverId, msg));

          exec(
            `cd "${srvDir}" && "${javaForInstaller}" -jar "${fileName}" --installServer`,
            (errInstall) => {
              if (fs.existsSync(dest)) fs.unlinkSync(dest); // Remove installer
              if (errInstall)
                addLog(
                  serverId,
                  `[ERROR] Forge Installer falhou: ${errInstall.message}`,
                );
              else {
                fs.writeFileSync(path.join(srvDir, "eula.txt"), "eula=true");
                addLog(
                  serverId,
                  `[SUCCESS] Forge ${version} instalado! Use START para ligar o servidor.`,
                );
              }
            },
          );
        } else {
          addLog(
            serverId,
            `[SUCCESS] ${type} ${version || ""} instalado com sucesso!`,
          );
          fs.writeFileSync(path.join(srvDir, "eula.txt"), "eula=true");
        }
      }
    });
    res.json({ message: "Download iniciado em segundo plano." });
  });

  const getAddonsFolder = (serverId: string) => {
    const config = getSrvConfig(serverId);
    const type = (config.type || "paper").toLowerCase();
    if (["fabric", "forge", "mohist"].includes(type)) {
      return "mods";
    }
    return "plugins";
  };

  app.post("/api/server/plugins/install", async (req, res) => {
    const { serverId, url, name } = req.body;
    if (!url || !serverId)
      return res.status(400).json({ error: "Dados inválidos." });

    const folderName = getAddonsFolder(serverId);
    const pluginsDir = path.join(getServerDir(serverId), folderName);
    if (!fs.existsSync(pluginsDir))
      fs.mkdirSync(pluginsDir, { recursive: true });

    const fileName = name || `add-on-${Date.now()}.jar`;
    const dest = path.join(pluginsDir, fileName);

    await downloadFile(url, dest, (msg) => addLog(serverId, msg));

    res.json({ message: "Download de adicionais concluído." });
  });

  app.post("/api/server/download", async (req, res) => {
    const { serverId, url, destPath } = req.body;
    if (!url || !serverId)
      return res.status(400).json({ error: "Faltam parâmetros" });

    const fullPath = path.join(getServerDir(serverId), destPath || "");
    const dir = path.extname(fullPath) ? path.dirname(fullPath) : fullPath;

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const targetFile = path.extname(fullPath)
      ? fullPath
      : path.join(fullPath, path.basename(url));

    addLog(serverId, `[WEB] Iniciando download de: ${url}`);

    await downloadFile(url, targetFile, (msg) => addLog(serverId, msg));

    res.json({ success: true, message: "Download concluído." });
  });

  app.post("/api/servers/import-github", (req, res) => {
    const { url, serverId } = req.body;
    if (!url || !serverId)
      return res.status(400).json({ error: "URL ou ID faltando" });

    // Try to convert github URL to tar.gz URL (usually more reliable than zip in linux)
    let tarUrl = url.replace(/\/$/, "");
    if (!tarUrl.endsWith(".tar.gz")) {
      tarUrl = `${tarUrl}/archive/refs/heads/main.tar.gz`;
    }

    const srvDir = getServerDir(serverId);
    if (!fs.existsSync(srvDir)) fs.mkdirSync(srvDir, { recursive: true });

    const tarDest = path.join(srvDir, "repo.tar.gz");
    addLog(serverId, `[GITHUB] Iniciando importação de: ${url}`);
    addLog(serverId, `[GITHUB] Baixando código fonte (.tar.gz)...`);

    downloadFile(tarUrl, tarDest, (msg) => addLog(serverId, msg)).then((success) => {
      if (!success) {
        // Fallback to master
        const fallbackUrl =
          url.replace(/\/$/, "") + "/archive/refs/heads/master.tar.gz";
        addLog(serverId, `[GITHUB] Falha na branch main, tentando master...`);
        downloadFile(fallbackUrl, tarDest, (msg) => addLog(serverId, msg)).then((success2) => {
          if (!success2) {
            addLog(
              serverId,
              `[ERROR] Falha ao baixar do GitHub`
            );
          } else {
            extractAndCleanup(serverId, srvDir, tarDest);
          }
        });
      } else {
        extractAndCleanup(serverId, srvDir, tarDest);
      }
    });

    function extractAndCleanup(id: string, dir: string, tarPath: string) {
      addLog(id, `[GITHUB] Extraindo arquivos...`);
      exec(
        `tar -xzf "${tarPath}" -C "${dir}" --strip-components=1 && rm "${tarPath}"`,
        (err) => {
          if (err) {
            addLog(id, `[ERROR] Erro na extração: ${err.message}`);
            // Se falhou o strip-components (talvez repositório vazio ou estrutura inesperada), tenta simples
            exec(
              `tar -xzf "${tarPath}" -C "${dir}" && rm "${tarPath}"`,
              () => {},
            );
          } else {
            saveSrvConfig(id, {
              ...DEFAULT_CONFIG,
              name: id.charAt(0).toUpperCase() + id.slice(1),
            });
            addLog(
              id,
              `[SUCCESS] Servidor "${id}" importado com sucesso! Verifique os arquivos.`,
            );
          }
        },
      );
    }

    res.json({ message: "Importação iniciada em segundo plano." });
  });

  app.get("/api/meta", async (req, res) => {
    let versions = ["1.21.1", "1.20.4", "1.19.4", "1.18.2", "1.12.2"];
    const type = (req.query.type as string) || "paper";

    try {
      if (["paper", "velocity", "waterfall"].includes(type)) {
        const pRes = await fetch(`https://api.papermc.io/v2/projects/${type}`);
        const pData: any = await pRes.json();
        if (pData.versions) versions = pData.versions.reverse().slice(0, 50);
      } else if (type === "purpur") {
        const pRes = await fetch("https://api.purpurmc.org/v2/purpur");
        const pData: any = await pRes.json();
        if (pData.versions)
          versions = pData.versions
            .filter((v: string) => v.startsWith("1."))
            .reverse()
            .slice(0, 50);
      } else if (type === "fabric") {
        const fRes = await fetch("https://meta.fabricmc.net/v2/versions/game");
        const fData: any = await fRes.json();
        if (Array.isArray(fData))
          versions = fData
            .filter((x: any) => x.stable)
            .map((x: any) => x.version)
            .slice(0, 50);
      } else if (type === "mohist") {
        const mRes = await fetch("https://mohistmc.com/api/v2/projects/mohist");
        const mData: any = await mRes.json();
        if (mData.versions) versions = mData.versions.reverse();
      } else if (type === "forge") {
        const bRes = await fetch(
          "https://bmclapi2.bangbang93.com/forge/minecraft",
        );
        const bData: any = await bRes.json();
        if (Array.isArray(bData)) versions = bData.slice().reverse();
      } else if (type === "vanilla" || type === "spigot") {
        const vRes = await fetch(
          "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json",
        );
        const vData: any = await vRes.json();
        if (vData.versions) {
          versions = vData.versions
            .filter((v: any) => v.type === "release")
            .map((v: any) => v.id)
            .slice(0, 40);
        }
      } else if (type === "bungeecord") {
        const bRes = await fetch(
          "https://ci.md-5.net/job/BungeeCord/lastStableBuild/api/json",
        );
        const bData: any = await bRes.json();
        if (bData.number) versions = ["lastStableBuild", `#${bData.number}`];
        else versions = ["latest"];
      } else if (type === "nukkit") {
        versions = ["latest"];
      }
    } catch (e) {}

    res.json({
      systemMaxRam: Math.floor(os.totalmem() / 1024 / 1024 / 1024),
      links: [
        { label: "Documentação", url: "https://docs.papermc.io" },
        { label: "Modrinth", url: "https://modrinth.com" },
        { label: "Playit.gg Status", url: "https://status.playit.gg/" },
      ],
      versions: versions,
    });
  });

  app.post("/api/ai/local", async (req, res) => {
    const { action } = req.body;
    try {
      if (action === "start") {
        console.log("[AI] Starting local AI (ollama)...");
        // Try systemctl first, then fallback to direct execution
        exec("systemctl restart ollama || ollama serve > /dev/null 2>&1 &", (err) => {
          if (err) console.error("[AI] Error starting local AI:", err);
        });
        res.json({ success: true });
      } else if (action === "stop") {
        console.log("[AI] Stopping local AI (ollama)...");
        exec("systemctl stop ollama || killall ollama", (err) => {
          if (err) console.error("[AI] Error stopping local AI:", err);
        });
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Invalid action" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/playit/status", async (req, res) => {
    let globalTunnel = null;

    // Playit prints the claim URL every 10 seconds while waiting.
    // If it hasn't printed it in the last 25 seconds, it means it successfully connected.
    if (
      globalPlayitClaimUrl &&
      Date.now() - globalPlayitClaimLastSeen > 25000
    ) {
      globalPlayitClaimUrl = null;
    }

    const persistentConfig = path.join(process.cwd(), "playit.toml");
    const isLinked = fs.existsSync(persistentConfig);

    if (isLinked) {
      try {
        const fileContent = fs.readFileSync(persistentConfig, "utf8");
        const match = fileContent.match(/secret_key\s*=\s*"(.*)"/);
        if (match) {
          const fetchRes = await fetch(
            "https://api.playit.gg/v1/tunnels/list",
            {
              method: "POST",
              headers: {
                Authorization: "Agent-Key " + match[1],
                "Content-Type": "application/json",
              },
              body: "{}",
            },
          );
          const data: any = await fetchRes.json();
          if (data?.data?.tunnels && data.data.tunnels.length > 0) {
            const tunnel = data.data.tunnels[0];

            let domain = "";
            let port = "";

            if (tunnel.alloc && tunnel.alloc.data) {
              const data = tunnel.alloc.data;
              if (data.port_start !== undefined)
                port = data.port_start.toString();
              
              // Prioritize SRV domain (e.g. .joinmc.link) because it doesn't need a port, it's prettier for Java Edition
              if (data.assigned_srv) domain = data.assigned_srv;
              else if (data.assigned_domain) domain = data.assigned_domain;
              else if (data.ip_hostname) domain = data.ip_hostname;
            }

            if (!domain && tunnel.domain && tunnel.domain.domain) {
              domain = tunnel.domain.domain;
            }
            if (!domain && tunnel.custom_domain) {
              domain = tunnel.custom_domain;
            }
            if (!domain && tunnel.assigned_domain) {
              domain = tunnel.assigned_domain;
            }

            if (
              !port &&
              tunnel.public_allocations &&
              tunnel.public_allocations.length > 0
            ) {
              const alloc = tunnel.public_allocations[0].details;
              if (alloc.port) port = alloc.port.toString();
              if (alloc.port_start) port = alloc.port_start.toString();
              if (!domain)
                domain = alloc.auto_domain || alloc.ip_hostname || "";
            }

            // Verifica se é um túnel Bedrock (geralmente UDP)
            const isBedrock =
              tunnel.tunnel_type?.name?.toLowerCase().includes("bedrock") ||
              tunnel.port_type === "udp" ||
              port === "19132" ||
              tunnel.tunnel_type === "minecraft-bedrock";

            if (isBedrock && domain && port) {
              if (domain.includes(".ply.gg")) {
                globalTunnel = `💎 Bedrock: [${domain}] Porta: [${port}]`;
              } else {
                globalTunnel = `💎 Bedrock: [${domain}]`;
              }
            } else if (domain) {
              if (domain.includes(".ply.gg") && port) {
                globalTunnel = `${domain}:${port}`;
              } else {
                // joinmc.link, custom domains, etc don't need port suffix usually, but we check if we should add it
                globalTunnel = domain;
              }
            }

            if (
              !globalTunnel &&
              tunnel.connect_addresses &&
              tunnel.connect_addresses.length > 0
            ) {
              const addr = tunnel.connect_addresses.find(
                (a: any) => a.type === "auto",
              );
              if (addr) globalTunnel = addr.value.address;
            }
          }
        }
      } catch (e) {
        console.error(`[Playit API] Failed to fetch tunnel API:`, e);
      }
    }

    if (!globalTunnel && globalPlayitLogs) {
      for (let i = globalPlayitLogs.length - 1; i >= 0; i--) {
        const addressMatch = globalPlayitLogs[i].match(
          /([\w\-.]+\.(?:ply\.gg|playit\.gg|joinmc\.link)(?::\d+)?)/i,
        );
        if (addressMatch) {
          globalTunnel = addressMatch[1];
          break;
        }
      }
    }

    if (globalTunnel) {
      globalPlayitClaimUrl = null;
    }

    res.json({
      claimUrl: globalPlayitClaimUrl,
      installed: fs.existsSync(PLAYIT_PATH),
      logs: globalPlayitLogs || [],
      linked: isLinked,
      tunnel: globalTunnel,
      running: !!globalPlayitProcess,
    });
  });

  app.post("/api/playit/start", (req, res) => {
    if (!globalPlayitProcess) {
      startGlobalTunnel();
    }
    res.json({ success: true });
  });

  app.post("/api/playit/install", async (req, res) => {
    if (!fs.existsSync(PLAYIT_PATH)) {
      const playitUrl = `https://github.com/playit-cloud/playit-agent/releases/latest/download/${path.basename(PLAYIT_PATH)}`;
      const success = await downloadFile(playitUrl, PLAYIT_PATH);
      if (success) {
        if (os.platform() !== "win32") {
          try {
            fs.chmodSync(PLAYIT_PATH, 0o755);
          } catch (e) {}
        }
        startGlobalTunnel();
        res.json({ success: true, message: "Baixado e instalado." });
      } else {
        res.status(500).json({ error: "Falha ao baixar." });
      }
    } else {
      startGlobalTunnel();
      res.json({ success: true });
    }
  });

  app.post("/api/playit/update", async (req, res) => {
    if (globalPlayitProcess) {
      try {
        globalPlayitProcess.kill();
      } catch (e) {}
      globalPlayitProcess = null;
    }
    try {
      if (fs.existsSync(PLAYIT_PATH)) fs.unlinkSync(PLAYIT_PATH);
    } catch (e) {}

    const playitUrl = `https://github.com/playit-cloud/playit-agent/releases/latest/download/${path.basename(PLAYIT_PATH)}`;
    const success = await downloadFile(playitUrl, PLAYIT_PATH);
    if (success) {
      if (os.platform() !== "win32") {
        try {
          fs.chmodSync(PLAYIT_PATH, 0o755);
        } catch (e) {}
      }
      startGlobalTunnel();
      res.json({ success: true, message: "Atualizado com sucesso." });
    } else {
      res.status(500).json({ error: "Falha ao baixar atualização." });
    }
  });

  app.post("/api/playit/uninstall", (req, res) => {
    if (globalPlayitProcess) {
      try {
        globalPlayitProcess.kill();
      } catch (e) {}
      globalPlayitProcess = null;
    }
    try {
      if (fs.existsSync(PLAYIT_PATH)) fs.unlinkSync(PLAYIT_PATH);
      const persistentConfig = path.join(process.cwd(), "playit.toml");
      if (fs.existsSync(persistentConfig)) fs.unlinkSync(persistentConfig);
    } catch (e) {}
    res.json({ success: true });
  });

  app.post("/api/playit/stop", (req, res) => {
    if (globalPlayitProcess) {
      try {
        globalPlayitProcess.kill();
      } catch (e) {}
      globalPlayitProcess = null;
    }
    res.json({ success: true });
  });

  app.post("/api/playit/reset", (req, res) => {
    if (globalPlayitProcess) {
      try {
        globalPlayitProcess.kill();
      } catch (e) {}
      globalPlayitProcess = null;
    }

    try {
      const persistentConfig = path.join(process.cwd(), "playit.toml");
      if (fs.existsSync(persistentConfig)) fs.unlinkSync(persistentConfig);
    } catch (e) {}

    const resetProc = spawn(PLAYIT_PATH, ["reset"], { cwd: process.cwd() });
    resetProc.on("close", () => {
      globalPlayitClaimUrl = null;
      if (globalPlayitLogs) globalPlayitLogs.splice(0, globalPlayitLogs.length);
      if (globalPlayitLogs)
        globalPlayitLogs.push("Playit resetado. Reiniciando...");

      startGlobalTunnel();
      res.json({ success: true });
    });
  });

  // Modrinth API Integration
  app.get("/api/modrinth/search", async (req, res) => {
    const q = (req.query.q as string) || "";
    try {
      const mRes = await fetch(
        `https://api.modrinth.com/v2/search?query=${encodeURIComponent(q)}&limit=20`,
      );
      const mData = await mRes.json();
      res.json(mData);
    } catch (e) {
      res.status(500).json({ error: "Modrinth Indisponível" });
    }
  });

  app.get("/api/modrinth/project/:id/versions", async (req, res) => {
    const id = req.params.id;
    try {
      const vRes = await fetch(`https://api.modrinth.com/v2/project/${id}/version`);
      const vData = await vRes.json();
      res.json(vData);
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar versões do Modrinth" });
    }
  });

  app.post("/api/server/modrinth/install", async (req, res) => {
    const { serverId, versionId, filename, url, folder } = req.body;
    if (!serverId) return res.status(400).json({ error: "No ID" });

    try {
      const folderArg = folder || "plugins";
      const targetDir = path.join(getServerDir(serverId), folderArg);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const destPath = path.join(targetDir, filename);
      await downloadFile(url, destPath, (msg) => addLog(serverId, msg));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro na instalação Modrinth" });
    }
  });

  app.get("/api/server/plugins", async (req, res) => {
    const serverId = (req.query.serverId as string) || "default";
    try {
      const folderName = getAddonsFolder(serverId);
      const pluginsDir = path.join(getServerDir(serverId), folderName);
      if (!fs.existsSync(pluginsDir)) return res.json({ plugins: [] });
      const files = fs
        .readdirSync(pluginsDir)
        .filter((f) => f.endsWith(".jar"));

      // Simple heuristic for versions: name-version.jar
      const plugins = files.map((filename) => {
        const match = filename.match(/^(.+)-([\d.]+)\.jar$/);
        return {
          filename,
          name: match ? match[1] : filename.replace(".jar", ""),
          version: match ? match[2] : "unknown",
          folder: folderName,
        };
      });

      res.json({ plugins });
    } catch (e) {
      res.status(500).json({ error: "Erro." });
    }
  });

  app.get("/api/server/plugins/check-updates", async (req, res) => {
    const serverId = (req.query.serverId as string) || "default";
    try {
      const folderName = getAddonsFolder(serverId);
      const pluginsDir = path.join(getServerDir(serverId), folderName);
      if (!fs.existsSync(pluginsDir)) return res.json({ updates: [] });
      const files = fs
        .readdirSync(pluginsDir)
        .filter((f) => f.endsWith(".jar"));

      const updates = [];
      for (const file of files) {
        const match = file.match(/^(.+)-([\d.]+)\.jar$/);
        const name = match ? match[1] : null;
        const currentVersion = match ? match[2] : null;

        if (name && currentVersion) {
          try {
            const hRes = await fetch(
              `https://hangar.papermc.io/api/v1/projects/${name}/versions?limit=1`,
            );
            const hData: any = await hRes.json();
            const latestVersion = hData.result?.[0]?.name;
            if (latestVersion && latestVersion !== currentVersion) {
              updates.push({ name, currentVersion, latestVersion, file });
            }
          } catch (e) {}
        }
      }
      res.json({ updates });
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar atualizações" });
    }
  });

  app.get("/api/server/files/list", (req, res) => {
    const serverId = (req.query.serverId as string) || "default";
    const folder = (req.query.folder as string) || "";
    const safeBase = getServerDir(serverId);
    const targetDir = path.join(safeBase, folder);
    console.log(
      "[FILE LIST API] folder:",
      folder,
      "targetDir:",
      targetDir,
      "safeBase:",
      safeBase,
    );

    // Security check
    if (!targetDir.startsWith(safeBase))
      return res.status(403).json({ error: "Acesso proibido." });

    if (!fs.existsSync(targetDir))
      return res.status(404).json({ error: "Pasta não encontrada." });
    try {
      const items = fs.readdirSync(targetDir).map((name) => {
        const stats = fs.statSync(path.join(targetDir, name));
        return { name, isDirectory: stats.isDirectory(), size: stats.size };
      });
      res.json({ items });
    } catch (e) {
      res.status(500).json({ error: "Erro." });
    }
  });

  app.get("/api/server/files/content", (req, res) => {
    const serverId = (req.query.serverId as string) || "default";
    const filePath = req.query.path as string;
    const safeBase = getServerDir(serverId);
    const fullPath = path.join(safeBase, filePath);

    if (!fullPath.startsWith(safeBase))
      return res.status(403).json({ error: "Acesso proibido." });

    try {
      res.json({ content: fs.readFileSync(fullPath, "utf-8") });
    } catch (e) {
      res.status(500).json({ error: "Erro." });
    }
  });

  app.get("/api/server/files/download", (req, res) => {
    const serverId = (req.query.serverId as string) || "default";
    const filePath = req.query.path as string;
    const safeBase = getServerDir(serverId);
    const fullPath = path.join(safeBase, filePath);

    if (!fullPath.startsWith(safeBase) || !fs.existsSync(fullPath))
      return res.status(403).json({ error: "Acesso proibido ou arquivo não localizado." });

    res.download(fullPath);
  });

  app.post("/api/server/files/save", (req, res) => {
    const { serverId, path: filePath, content } = req.body;
    const safeBase = getServerDir(serverId);
    const fullPath = path.join(safeBase, filePath);

    if (!fullPath.startsWith(safeBase))
      return res.status(403).json({ error: "Acesso proibido." });

    try {
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content);
      res.json({ success: true });
    } catch (e: any) {
      console.error("[FS] Erro ao salvar arquivo:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/server/files/mkdir", (req, res) => {
    const { serverId, path: folderPath } = req.body;
    const safeBase = getServerDir(serverId);
    const fullPath = path.join(safeBase, folderPath);

    if (!fullPath.startsWith(safeBase))
      return res.status(403).json({ error: "Acesso proibido." });

    try {
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao criar pasta." });
    }
  });

  app.delete("/api/server/files/delete", (req, res) => {
    const serverId = (req.query.serverId as string) || "default";
    const filePath = req.query.path as string;
    const safeBase = getServerDir(serverId);
    const fullPath = path.join(safeBase, filePath);

    if (!fullPath.startsWith(safeBase))
      return res.status(403).json({ error: "Acesso proibido." });

    try {
      if (fs.lstatSync(fullPath).isDirectory())
        fs.rmSync(fullPath, { recursive: true, force: true });
      else fs.unlinkSync(fullPath);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro." });
    }
  });

  app.post("/api/server/files/rename", (req, res) => {
    const { serverId, oldPath, newPath } = req.body;
    const safeBase = getServerDir(serverId);
    const fullOldPath = path.join(safeBase, oldPath);
    const fullNewPath = path.join(safeBase, newPath);

    if (!fullOldPath.startsWith(safeBase) || !fullNewPath.startsWith(safeBase))
      return res.status(403).json({ error: "Acesso proibido." });

    try {
      fs.renameSync(fullOldPath, fullNewPath);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao renomear." });
    }
  });

  app.post("/api/server/delete", (req, res) => {
    const { serverId } = req.body;
    if (!serverId) return res.status(400).json({ error: "No ID" });
    ensureState(serverId);
    if (serversState[serverId].status !== "offline")
      return res.status(400).json({ error: "Pare o servidor!" });
    try {
      fs.rmSync(getServerDir(serverId), { recursive: true, force: true });
      delete serversState[serverId];
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro." });
    }
  });

  // Vite middleware for development
  app.post("/api/app/evaluate", async (req, res) => {
    try {
      const { code } = req.body;
      const result = await eval(`(async () => { ${code} })()`);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/system/version", (req, res) => {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
      res.json({ version: pkg.version });
    } catch {
      res.json({ version: "Desconhecida" });
    }
  });

  app.post("/api/system/update", (req, res) => {
    try {
      res.json({ message: "Atualização iniciada. Reiniciando o servidor..." });

      const cmd =
        "(git fetch --all && git reset --hard origin/main || git reset --hard origin/master || echo '[System] Not a git repo, skipping pull') && npm install && npm run build";

      console.log("[System] Auto-update initiated...");

      exec(cmd, (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error("[System] Auto-update error:", error);
          console.error("[System] Stderr:", stderr);
          // Don't fail completely, try to restart anyway
        }
        console.log("[System] Auto-update complete:\n" + stdout);
        console.log("[System] Atualização concluída. Reiniciando...");
        process.exit(0); // Exiting process so it gets restarted by the environment/pm2
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/server/install-ai-core", (req, res) => {
    const { serverId } = req.body;
    const srvDir = getServerDir(serverId || "default");
    const pluginsDir = path.join(srvDir, "plugins");
    if (!fs.existsSync(pluginsDir))
      fs.mkdirSync(pluginsDir, { recursive: true });

    // We use skript 2.9.3 which is solid
    const skriptUrl =
      "https://github.com/SkriptLang/Skript/releases/download/2.9.3/Skript.jar";
    const dest = path.join(pluginsDir, "Skript.jar");
    addLog(serverId || "default", "[AI] Configurando superpoderes (Skript)...");

    downloadFile(skriptUrl, dest).then((success) => {
      if (!success) {
        addLog(
          serverId || "default",
          `[ERROR] Falha ao instalar AI Core`
        );
        res.status(500).json({ error: "Download failed" });
      } else {
        addLog(
          serverId || "default",
          `[SUCCESS] Superpoderes IA ativados (Skript instalado)! Se o server estiver online, use /reload ou reinicie.`,
        );
        res.json({ success: true });
      }
    });
  });

  app.get("/api/system/javas", (req, res) => {
    res.json(scanInstalledJavas());
  });

  app.post("/api/system/java/download", async (req, res) => {
    const { major } = req.body;
    const sId = "system";
    addLog(sId, `[SYS] Iniciando download manual do Java ${major}...`);
    try {
      const path = await downloadJavaIfNeeded(major, (msg) => addLog(sId, msg));
      res.json({ success: true, path });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const startServerOnPort = (port: number) => {
    const server = app.listen(port, "0.0.0.0", () => {
      const url = `http://localhost:${port}`;
      console.log(`[🚀] Servidor rodando em ${url}`);
      
      // Auto-open browser when running locally (not in AI Studio sandbox)
      if (!process.env.CLOUD_RUN_JOB && !process.env.HOSTNAME) {
        setTimeout(() => {
          const platform = os.platform();
          let command;
          
          try {
            // Check for WSL safely
            let isWslCheck = false;
            try {
               isWslCheck = fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
            } catch(e) {}

            if (isWslCheck) {
              command = `cmd.exe /C "start msedge --app=${url} || start chrome --app=${url} || start ${url}"`;
            } else if (platform === 'win32') {
              command = `cmd.exe /C "start msedge --app=${url} || start chrome --app=${url} || start ${url}"`;
            } else if (platform === 'darwin') {
              command = `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app=${url} || open ${url}`;
            } else {
              command = `google-chrome --app=${url} || xdg-open ${url}`;
            }
            exec(command, () => {});
          } catch (e) {
            // ignore
          }
        }, 1500); // 1.5s delay to assure the startup process ends without glitching
      }
    });

    server.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`[System] A porta ${port} está em uso, tentando a próxima (${port + 1})...`);
        setTimeout(() => {
          startServerOnPort(port + 1);
        }, 1000);
      } else {
        console.error(e);
      }
    });
  };

  startServerOnPort(currentPort);
}

startServer().catch(console.error);
