import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Play,
  Square,
  Terminal,
  Settings,
  Server,
  Users,
  Cpu,
  HardDrive,
  Star,
  Copy,
  Sparkles,
  Cloud,
  Flower2,
  Database,
  Moon,
  Folder,
  FileText,
  ChevronLeft,
  Upload,
  Trash2,
  X,
  Download,
  Check,
  Globe,
  Search,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  FastForward,
  Waves,
  Package,
  ChevronDown,
  Bot,
  Send,
  Languages,
  Sun,
  Palette,
  Power,
  Store,
  ExternalLink,
  Info,
  CheckCircle2,
  Map,
  Shield,
  Hammer,
  Skull,
  Hand,
  UploadCloud,
  Edit2,
  Code,
  Save,
  Box,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { askAI } from "../services/geminiService";
import MapEditor3D from "../components/MapEditor3D";

const translations: any = {
  en: {
    menu_magic: "MAGIC MENU",
    servers: "Servers",
    terminal: "Terminal",
    ai_assistant: "AI Assistant",
    map_editor: "Map Editor",
    internal_store: "In-Game Store UI",
    settings: "Settings",
    useful_links: "Useful Links",
    playit_title: "Playit.gg",
    playit_claim: "LINK ACCOUNT",
    playit_linked: "Account Linked!",
    playit_ip: "View IP on Playit",
    dashboard_title: "Servers",
    create_server: "CREATE NEW SERVER",
    hibernation_title: "Panel Resting...",
    hibernation_desc: "Move to wake up!",
    server_online: "ONLINE",
    server_offline: "OFFLINE",
    server_starting: "STARTING",
    server_stopping: "STOPPING",
    config_tab_general: "GENERAL",
    config_tab_plugins: "PLUGINS",
    config_tab_theme: "THEME",
    config_tab_lang: "LANGUAGE",
    theme_light: "LIGHT",
    theme_dark: "DARK",
    new_adventure: "A new adventure awaits!",
    panel_active: "Active Control Panel",
    ai_assistant_sub: "Creeper Intelligence",
    ask_ai_placeholder: "Ask anything about your server...",
    terminal_sub: "Connected to the Cube",
    files_title: "Files",
    files_sub: "Server Root",
    upload: "UPLOAD",
    backup: "BACKUP FULL",
    cloud_backup: "CLOUD BACKUP (MAP/PLUGINS)",
    download_url: "DOWNLOAD URL",
    paste_hint: "DICE: DRAG OR PASTE (CTRL+V) FILES HERE",
    empty_folder: "Empty folder...",
    drag_hint: "Drag files here!",
    settings_title: "Settings",
    settings_sub: "Customize your experience",
    select_lang: "Select Language",
    select_theme: "Select Theme",
    performance_mode: "Performance Mode",
    vps_linux_optimized: "High-Performance Cycles for Linux VPS",
    playit_reset: "Reset",
    playit_reset_title: "Reset Playit Agent",
    playit_waiting: "Waiting for Playit.gg... (Refresh if it takes too long)",
    playit_running: "Installed and running!",
    playit_claim_desc: "Link your account to configure the tunnel:",
    playit_claim_btn: "LINK ACCOUNT",
    playit_linked_status: "Account Linked!",
    playit_waiting_ip: "Waiting for IP / Claim Link...",
    ai_api_key_title: "AI API (Universal)",
    ai_api_key_sub:
      "Supports Gemini (AIza...), OpenAI (sk-...), Groq (gsk_...) and xAI (xai-...)",
    ai_api_key_btn: "Configure",
    ai_api_key_save: "Save",
    ai_api_key_placeholder: "Paste your API KEY...",
    ai_api_key_success: "✅ Key saved locally! AI Assistant is now online.",
    ai_api_key_error: "Error saving key on local machine.",
    ai_api_key_invalid: "❌ Invalid key format.",
    system_update_title: "System Update",
    system_update_desc: "Pull latest updates from GitHub",
    system_update_btn: "Check & Update",
    system_update_running: "Updating...",
    server_default_name: "Server",
    select_server_hint: "Select...",
    developed_for: "Developed for",
    doc_label: "Documentation",
    modrinth_label: "Modrinth",
    hangar_label: "Hangar",
    playit_status_label: "Playit.gg Status",
    panel_waking: "( ੭•͈ω•͈)੭ Panel waking up! Ready to mine?",
    clear_logs: "Clear Logs",
    waiting_vitals: "Waiting for vital signs...",
    editor_title: "Editor",
    cancel: "CANCEL",
    save: "SAVE",
    direct_download: "Direct Download",
    download_now: "DOWNLOAD NOW",
    download_hint: "Paste direct file link here (.jar, .zip, etc)",
    delete_file: "Delete File",
    edit_server: "Edit Server",
    server_name: "Server Name",
    ram_allocation: "RAM Allocation",
    max_memory: "Max Memory",
    mods_store: "Mods/Plugins Store",
    search_placeholder: "Search plugins and mods...",
    search_btn: "SEARCH",
    install_btn: "Install",
    searching: "Searching in",
    developed_by: "Developed by",
    select_version: "Select Version",
    modrinth_versions_title: "Available Versions",
    game_versions: "Minecraft",
    loaders: "Softwares",
    vps_hosting: "VPS Optimization",
    current_server: "(Current Server)",
    disable: "Disable",
    enable: "Enable",
    playit_disabled_desc:
      "Playit.gg is disabled for this server. Only recommended for panels hosted on VPS machines with dedicated IPs and open ports.",
    playit_tunnel_public: "Playit.gg Tunnel (Public)",
    playit_tunnel_desc: "Disable if using VPS with a dedicated IP.",
    map_editor_title: "Spawn/Region Manager",
    map_editor_desc:
      "Create and protect important areas like Lobbies, Spawns, and Stores. Requires WorldGuard & WorldEdit plugins.",
    map_upload_btn: "Upload Map or Schematic (.zip / .schem)",
    map_protector_title: "Quick Protector (WorldGuard)",
    map_region_label: "Select target",
    map_region_tip:
      "Tip: Type `/wand` in-game, select the corners, and type `/rg define {mapRegion}` before applying the permissions below!",
    map_no_pvp: "NO PVP",
    map_no_build: "NO BUILD",
    map_no_mobs: "NO MOBS",
    map_immortal: "IMMORTAL",
    map_allow_interact: "ALLOW INTERACTION (CHESTS/DOORS)",
    map_upload_zip: "Upload Schematic/Zip",
    map_download_web: "Download from Web",
    map_view_schematics: "View Schematics (Server)",
    map_view_worlds: "View Worlds (Server)",
    store_editor_title: "Store Manager",
    store_editor_desc: "Create your own 100% custom Script store or manage native NPC/GUI store plugins.",
    store_generate_skript: "Generate In-Game Script Store (AI)",
    store_npc_shopkeepers: "NPC Shop (Shopkeepers)",
    store_gui_economy: "Ready GUI Store (EconomyShopGUI)",
    store_npc_commands: "NPC Commands (Citizens)",
    store_status_help: "Status / Help",
    script_builder_title: "Script Builder",
    script_builder_desc: "AI SCRIPT AUTOMATION (•◡•)",
    script_builder_input_label: "Describe the Script Idea",
    script_builder_btn_loading: "Generating...",
    script_builder_btn_generate: "Create Auto Script",
    script_builder_status_success: "Script generated! Save to apply.",
    script_builder_status_error: "Error generating script. Check AI Key or Local Server.",
    script_builder_status_save_error: "Error saving script.",
    script_builder_status_saving: "Plugin Saved! Restarting scripts...",
    script_builder_save_btn: "SAVE SCRIPT (.SK)",
    java_settings: "Java Configuration",
    java_path_label: "Custom Java Execution Path (.exe / bin/java)",
    java_detect_btn: "SCAN SYSTEM",
    java_download_btn: "DOWNLOAD JRE",
    java_found_list: "Found on this machine:",
    java_active_tag: "Runtime",
    java_path_desc: "Manual path for older versions (Java 8) or newer (Java 25+). Leave blank for default auto-detection.",
  },
  pt: {
    menu_magic: "MENU MÁGICO",
    servers: "Servidores",
    terminal: "Terminal",
    ai_assistant: "Assistente IA",
    map_editor: "Mapa / MCEdit",
    internal_store: "Loja In-Game",
    settings: "Configurações",
    useful_links: "Links Úteis",
    playit_title: "Playit.gg",
    playit_claim: "VINCULAR CONTA",
    playit_linked: "Conta Vinculada!",
    playit_ip: "Ver IP no Playit",
    dashboard_title: "Servidores",
    create_server: "CRIAR NOVO SERVIDOR",
    hibernation_title: "Painel em Repouso...",
    hibernation_desc: "Mexa para acordar!",
    server_online: "ONLINE",
    server_offline: "OFFLINE",
    server_starting: "INICIANDO",
    server_stopping: "PARANDO",
    config_tab_general: "GERAL",
    config_tab_plugins: "PLUGINS",
    config_tab_theme: "TEMA",
    config_tab_lang: "IDIOMA",
    theme_light: "CLARO",
    theme_dark: "ESCURO",
    new_adventure: "Uma nova aventura te espera!",
    panel_active: "Painel de Controle Ativo",
    ai_assistant_sub: "Inteligência Creeper",
    ask_ai_placeholder: "Pergunte qualquer coisa sobre seu servidor...",
    terminal_sub: "Conectado ao Cubo",
    files_title: "Arquivos",
    files_sub: "Raiz do Servidor",
    upload: "UPLOAD",
    backup: "BACKUP COMPLETO",
    cloud_backup: "BACKUP NUVEM (MAPA/PLUGINS)",
    download_url: "BAIXAR URL",
    paste_hint: "DICA: ARRASTE OU COLE (CTRL+V) ARQUIVOS AQUI",
    empty_folder: "Pasta vazia...",
    drag_hint: "Arraste arquivos aqui!",
    settings_title: "Configurações",
    settings_sub: "Personalize sua experiência",
    select_lang: "Selecionar Idioma",
    select_theme: "Selecionar Tema",
    performance_mode: "Modo Performance",
    vps_linux_optimized: "Ciclos de Alta Performance para VPS Linux",
    playit_reset: "Reset",
    playit_reset_title: "Resetar Agente Playit",
    playit_waiting:
      "Aguardando leitura do Playit.gg... (Atualize a página se demorar)",
    playit_running: "Instalado e rodando!",
    playit_claim_desc: "Vincule sua conta para configurar o túnel:",
    playit_claim_btn: "VINCULAR CONTA",
    playit_linked_status: "Conta Vinculada!",
    playit_waiting_ip: "Aguardando IP / Claim Link...",
    ai_api_key_title: "API IA (Universal)",
    ai_api_key_sub:
      "Suporta Gemini (AIza...), OpenAI (sk-...), Groq (gsk_...) e xAI (xai-...)",
    ai_api_key_btn: "Configurar",
    ai_api_key_save: "Salvar",
    ai_api_key_placeholder: "Cole sua API KEY...",
    ai_api_key_success:
      "✅ Chave salva na máquina local! O Assistente IA está online.",
    ai_api_key_error: "Erro ao salvar a chave na máquina.",
    ai_api_key_invalid: "❌ Formato de chave inválido.",
    system_update_title: "Atualização do Sistema",
    system_update_desc: "Baixar últimas atualizações do GitHub",
    system_update_btn: "Verificar & Atualizar",
    system_update_running: "Atualizando...",
    server_default_name: "Servidor",
    select_server_hint: "Selecionar...",
    developed_for: "Desenvolvido para",
    doc_label: "Documentação",
    modrinth_label: "Modrinth",
    hangar_label: "Hangar",
    playit_status_label: "Status do Playit.gg",
    panel_waking: "( ੭•͈ω•͈)੭ Painel acordando! Pronto para minerar?",
    clear_logs: "Limpar Logs",
    waiting_vitals: "Aguardando sinais vitais...",
    editor_title: "Editor",
    cancel: "CANCELAR",
    save: "SALVAR",
    direct_download: "Download Direto",
    download_now: "BAIXAR AGORA",
    download_hint: "Cole aqui o link direto do arquivo (.jar, .zip, etc)",
    delete_file: "Deletar Arquivo",
    edit_server: "Editar Servidor",
    server_name: "Nome do Servidor",
    ram_allocation: "Alocação de RAM",
    max_memory: "Memória Máxima",
    mods_store: "Loja de Mods/Plugins",
    search_placeholder: "Buscar plugins e mods...",
    search_btn: "BUSCAR",
    install_btn: "Instalar",
    searching: "Buscando no",
    developed_by: "Desenvolvido por",
    select_version: "Selecionar Versão",
    modrinth_versions_title: "Versões Disponíveis",
    game_versions: "Minecraft",
    loaders: "Softwares",
    vps_hosting: "Otimização VPS",
    current_server: "(Servidor Atual)",
    disable: "Desligar",
    enable: "Ligar",
    playit_disabled_desc:
      "Playit.gg está desativado para este servidor. Recomendado apenas para painéis hospedados em máquinas VPS que possuam IPs dedicados e portas livres.",
    playit_tunnel_public: "Túnel Playit.gg (Público)",
    playit_tunnel_desc: "Desative se usar VPS com IP Dedicado.",
    map_editor_title: "Gerenciador de Spawns/Regiões",
    map_editor_desc:
      "Crie e proteja áreas importantes como Lobbies, Spawns e Lojas. É obrigatório ter o plugin WorldGuard & WorldEdit instalado.",
    map_upload_btn: "Upload Mapa ou Schematic (.zip / .schem)",
    map_protector_title: "Protetor Rápido (WorldGuard)",
    map_region_label: "Selecione o alvo",
    map_region_tip:
      "Dica: Digite `/wand` no jogo, selecione os cantos e digite `/rg define {mapRegion}` antes de aplicar as permissões abaixo!",
    map_no_pvp: "SEM PVP",
    map_no_build: "SEM CONSTRUIR",
    map_no_mobs: "SEM MOBS",
    map_immortal: "IMORTAL",
    map_allow_interact: "PERMITIR INTERAÇÃO (BAÚS/PORTAS)",
    map_upload_zip: "Upload Schematic/Zip",
    map_download_web: "Baixar da Web",
    map_view_schematics: "Ver Schematics no SV",
    map_view_worlds: "Ver Mundos do SV",
    store_editor_title: "Gerenciador de Lojas",
    store_editor_desc: "Crie sua própria loja via Skript 100% customizada ou gerencie plugins de Lojas NPC / GUI nativos.",
    store_generate_skript: "Gerar Loja via Skript In-Game (IA)",
    store_npc_shopkeepers: "Loja de NPCs (Shopkeepers)",
    store_gui_economy: "Loja GUI Pronta (EconomyShopGUI)",
    store_npc_commands: "Comandos em NPCs (Citizens)",
    store_status_help: "Status / Ajuda",
    script_builder_title: "Fábrica de Scripts",
    script_builder_desc: "I.A. SKRIPT BUILDER (•◡•)",
    script_builder_input_label: "Descreva a ideia do Script",
    script_builder_btn_loading: "Gerando...",
    script_builder_btn_generate: "Criar Script Automático",
    script_builder_status_success: "Script gerado com sucesso! Salve para aplicar.",
    script_builder_status_error: "Erro ao gerar script. Verifique a API Key ou o servidor Local AI.",
    script_builder_status_save_error: "Erro ao salvar script.",
    script_builder_status_saving: "Script Injetado e Salvo com Sucesso!",
    script_builder_save_btn: "SALVAR SCRIPT (.SK)",
  },
};

type ServerStatus = "online" | "offline" | "starting" | "stopping";

interface ServerState {
  status: ServerStatus;
  logs: string[];
  tunnel?: string | null;
  activeJava?: string;
  config?: any;
  stats?: {
    cpu: string;
    ram: string;
    ramPercent: number;
  };
}

const CreeperPaper = ({ className = "" }: { className?: string }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      scale: [1, 1.02, 1],
    }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    className={`absolute pointer-events-none select-none opacity-30 -z-10 ${className}`}
  >
    <div className="w-10 h-10 bg-emerald-500 rounded-sm relative shadow-[4px_4px_0_0_#064e3b]">
      {/* Face */}
      <div className="absolute top-4 left-3 w-3 h-3 bg-black" />
      <div className="absolute top-4 right-3 w-3 h-3 bg-black" />
      <div className="absolute top-6 left-6 w-4 h-6 bg-black" />
      <div className="absolute top-10 left-4 w-2 h-4 bg-black" />
      <div className="absolute top-10 right-4 w-2 h-4 bg-black" />
      {/* Paper Fold Texture */}
      <div className="absolute inset-0 border-t border-l border-emerald-400/30" />
    </div>
  </motion.div>
);

export default function App({
  appConfig,
  setAppConfig,
}: {
  appConfig?: any;
  setAppConfig?: any;
}) {
  const [language, setLanguage] = useState<"en" | "pt">(
    () => (localStorage.getItem("creeper_lang") as "en" | "pt") || "en",
  );
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("creeper_theme") as "dark" | "light") || "dark",
  );
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [isSystemUpdating, setIsSystemUpdating] = useState(false);
  const [appVersion, setAppVersion] = useState("Carregando versão...");
  const t = (key: string) => translations[language][key] || key;

  useEffect(() => {
    fetch("/api/system/version")
      .then((res) => res.json())
      .then((data) => setAppVersion(data.version))
      .catch(() => setAppVersion("Desconhecida"));
  }, []);

  const [serverState, setServerState] = useState<ServerState>({
    status: "offline",
    logs: [t("panel_waking")],
    stats: { cpu: "0%", ram: "0 / 0 GB", ramPercent: 0 }
  });
  const [multiTerminals, setMultiTerminals] = useState<string[]>([]);
  const [multiServerStates, setMultiServerStates] = useState<Record<string, ServerState>>({});
  const multiLogCounts = useRef<Record<string, number>>({});
  
  const [servers, setServers] = useState<
    {
      id: string;
      name: string;
      ram?: number;
      minRam?: number;
      type?: string;
      version?: string;
      store?: any;
      status?: string;
      port?: number;
    }[]
  >([]);
  const [currentServerId, setCurrentServerId] = useState<string>("");
  const [javas, setJavas] = useState<{ version: string; path: string; type: string }[]>([]);
  const [scanningJavas, setScanningJavas] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("servers");

  useEffect(() => {
    localStorage.setItem("creeper_lang", language);
    localStorage.setItem("creeper_theme", theme);
    document.documentElement.className = theme;
  }, [language, theme]);

  const [aiChat, setAiChat] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiProvider, setAiProvider] = useState<"remote" | "local" | "off">(
    () => {
      const saved = localStorage.getItem("creeper_ai_provider");
      return (saved as "remote" | "local" | "off") || "remote";
    }
  );
  const [aiKeysList, setAiKeysList] = useState<string>(
    () => localStorage.getItem("creeper_ai_keys_list") || ""
  );
  const [aiEndpoint, setAiEndpoint] = useState<string>(
    () => localStorage.getItem("creeper_ai_endpoint") || "http://127.0.0.1:11434/v1/chat/completions"
  );
  const [aiLocalModel, setAiLocalModel] = useState<string>(
    () => localStorage.getItem("creeper_ai_local_model") || "llama3"
  );
  
  const [pluginDescription, setPluginDescription] = useState("");
  const [isGeneratingPlugin, setIsGeneratingPlugin] = useState(false);
  const [pluginCode, setPluginCode] = useState("");
  const [pluginGenStatus, setPluginGenStatus] = useState("Aguardando ideia...");
  
  useEffect(() => {
    localStorage.setItem("creeper_ai_provider", aiProvider);
    localStorage.setItem("creeper_ai_endpoint", aiEndpoint);
    localStorage.setItem("creeper_ai_local_model", aiLocalModel);
  }, [aiProvider, aiEndpoint, aiLocalModel]);

  const [isVpsOptimized, setIsVpsOptimized] = useState(true);
  const [storeSearch, setStoreSearch] = useState("");
  const [showBlueMap, setShowBlueMap] = useState(false);
  const [showEditor3D, setShowEditor3D] = useState(false);
  const [storeResults, setStoreResults] = useState<any[]>([]);
  const [isSearchingStore, setIsSearchingStore] = useState(false);
  const [storeFolder, setStoreFolder] = useState<"plugins" | "mods">("plugins");
  const [installingStoreItem, setInstallingStoreItem] = useState<string | null>(
    null,
  );
  const [modrinthVersions, setModrinthVersions] = useState<any[]>([]);
  const [selectedModrinthProject, setSelectedModrinthProject] = useState<any>(null);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [storeGameVersion, setStoreGameVersion] = useState<string>("");
  const [storeLoader, setStoreLoader] = useState<string>("");

  const searchStore = async (q: string) => {
    if (!q) {
      setStoreResults([]);
      return;
    }
    setIsSearchingStore(true);
    try {
      const res = await fetch(`/api/modrinth/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setStoreResults(data.hits || []);
    } catch (e) {}
    setIsSearchingStore(false);
  };

  const openModrinthPicker = async (project: any) => {
    setSelectedModrinthProject(project);
    setModrinthVersions([]);
    setShowVersionsModal(true);
    try {
      const res = await fetch(`/api/modrinth/project/${project.project_id || project.id}/versions`);
      const data = await res.json();
      setModrinthVersions(data);
    } catch (e) {}
  };

  const installModrinthVersion = async (version: any) => {
    if (!currentServerId) return;
    setInstallingStoreItem(version.id);
    try {
      const file = version.files.find((f: any) => f.primary) || version.files[0];
      if (!file) return;

      const res = await fetch("/api/server/modrinth/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: currentServerId,
          versionId: version.id,
          filename: file.filename,
          url: file.url,
          folder: storeFolder,
        }),
      });
      if (res.ok) {
        fetchPlugins();
        setShowVersionsModal(false);
      }
    } catch (e) {}
    setInstallingStoreItem(null);
  };
  const [isHibernating, setIsHibernating] = useState(false);
  const [command, setCommand] = useState("");
  const [installSoftware, setInstallSoftware] = useState({
    type: "paper",
    version: "1.21.1",
    customUrl: "",
  });
  const [pluginUrl, setPluginUrl] = useState("");
  const [pluginName, setPluginName] = useState("");
  const [ramConfig, setRamConfig] = useState({ ram: 2, minRam: 1 });
  const [backups, setBackups] = useState<any[]>([]);
  const [cloudBackups, setCloudBackups] = useState<any[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [isSyncingRam, setIsSyncingRam] = useState(true);
  const [modules, setModules] = useState<{
    map: boolean;
    store: boolean;
    ai: boolean;
    ai_internet: boolean;
    ai_memory: boolean;
    ai_bot: boolean;
    server_hibernation: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem("ppc_modules");
      if (saved) {
         const parsed = JSON.parse(saved);
         return {
            map: parsed.map ?? true,
            store: parsed.store ?? true,
            ai: parsed.ai ?? true,
            ai_internet: parsed.ai_internet ?? true,
            ai_memory: parsed.ai_memory ?? true,
            ai_bot: parsed.ai_bot ?? true,
            server_hibernation: parsed.server_hibernation ?? false
         };
      }
    } catch (e) {}
    return { map: true, store: true, ai: true, ai_internet: true, ai_memory: true, ai_bot: true, server_hibernation: false };
  });

  useEffect(() => {
    localStorage.setItem("ppc_modules", JSON.stringify(modules));
  }, [modules]);

  const [plugins, setPlugins] = useState<
    { name: string; version: string; filename: string }[]
  >([]);
  const [pluginUpdates, setPluginUpdates] = useState<
    {
      name: string;
      currentVersion: string;
      latestVersion: string;
      file: string;
    }[]
  >([]);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [editingFile, setEditingFile] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [showDownloadInput, setShowDownloadInput] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<
    {
      id: string;
      name: string;
      progress: number;
      status: "pending" | "uploading" | "done" | "error";
    }[]
  >([]);
  const [metadata, setMetadata] = useState<{
    links: { label: string; url: string }[];
    versions: string[];
    systemMaxRam?: number;
  }>({ links: [], versions: [] });
  const [playitStatus, setPlayitStatus] = useState<{
    claimUrl: string | null;
    installed: boolean;
    logs: string[];
    linked?: boolean;
    tunnel?: string | null;
    running?: boolean;
  }>({
    claimUrl: null,
    installed: false,
    logs: [],
    linked: false,
    tunnel: null,
    running: false,
  });
  const [playitLoading, setPlayitLoading] = useState<
    "install" | "uninstall" | "start" | "stop" | "reset" | "update" | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newServerConfig, setNewServerConfig] = useState({
    name: "",
    type: "paper",
    version: "1.21.1",
    ram: 4,
    minRam: 1,
    url: "", // for custom or github
    usePlayit: true,
  });

  const [editingServer, setEditingServer] = useState<{
    id: string;
    name: string;
    ram?: number;
    minRam?: number;
    store?: any;
    javaPath?: string;
  } | null>(null);
  const [editTab, setEditTab] = useState<"general" | "plugins" | "store">(
    "general",
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [mapRegion, setMapRegion] = useState("spawn");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showHibernationModal, setShowHibernationModal] = useState(false);
  
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const lastActivity = useRef(Date.now());

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/servers");
      const data = await res.json();
      setServers(data.servers || []);
      const srvs = data.servers || [];

      let firstId = currentServerId;
      if (!firstId && srvs.length > 0) {
        firstId = srvs[0].id;
        setCurrentServerId(firstId);
      }

      const activeIds = srvs
        .filter((s:any) => (s.status === "online" || s.status === "starting") && s.id !== firstId)
        .map((s:any) => s.id);

      if (activeIds.length > 0) {
         setMultiTerminals(prev => {
           const set = new Set([...prev, ...activeIds]);
           return Array.from(set);
         });
      }
    } catch (e) {}
  };

  const lastLogCount = useRef<number>(0);

  const fetchStatus = async () => {
    if (!currentServerId) return;
    try {
      const trackers: Record<string, number> = {};
      trackers[currentServerId] = lastLogCount.current;
      multiTerminals.forEach(id => trackers[id] = multiLogCounts.current[id] || 0);

      const res = await fetch("/api/servers/status-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackers })
      });
      if (!res.ok) {
        if (res.status === 404) setCurrentServerId("");
        return;
      }
      
      const resData = await res.json();
      if (!resData.servers) return;

      Object.entries(resData.servers).forEach(([id, data]: [string, any]) => {
        if (id === currentServerId) {
          setServerState((prev) => {
            const newLogs = lastLogCount.current === 0 ? data.logs : [...prev.logs, ...data.logs];
            const maxLogs = isHibernating ? 50 : 300;
            const trimmedLogs = newLogs.length > maxLogs ? newLogs.slice(-maxLogs) : newLogs;
            return { ...data, logs: trimmedLogs };
          });
          lastLogCount.current = data.logCount;
          if (data.config && isSyncingRam) setRamConfig(data.config);
        }
        
        if (multiTerminals.includes(id)) {
           setMultiServerStates(prev => {
             const prevLogs = prev[id]?.logs || [];
             const idx = multiLogCounts.current[id] || 0;
             const newLogs = idx === 0 ? data.logs : [...prevLogs, ...data.logs];
             const trimmedLogs = newLogs.length > 300 ? newLogs.slice(-300) : newLogs;
             return { ...prev, [id]: { ...data, logs: trimmedLogs } };
           });
           multiLogCounts.current[id] = data.logCount;
        }
      });
    } catch (error) {
      // server probably down or restarting
    }
  };

  useEffect(() => {
    // Reset status and logs when switching servers to avoid UI flickering with old data
    lastLogCount.current = 0;
    setServerState({
      status: "offline",
      logs: [],
      tunnel: null,
      stats: { cpu: "0%", ram: "0 / 0 GB", ramPercent: 0 },
    });
    fetchStatus();
  }, [currentServerId]);

  const scanJavas = async () => {
    setScanningJavas(true);
    try {
      const res = await fetch("/api/system/javas");
      const data = await res.json();
      setJavas(data);
    } catch (e) {}
    setScanningJavas(false);
  };

  useEffect(() => {
    scanJavas();
  }, []);

  const handleCreateServer = async () => {
    if (!newServerConfig.name.trim()) {
      alert("Nome do servidor é obrigatório! (｡•́︿•̀｡)");
      return;
    }
    setIsInstalling(true);
    try {
      // 1. Create the server
      const res = await fetch("/api/servers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newServerConfig.name,
          ram: newServerConfig.ram,
          type: newServerConfig.type,
          version: newServerConfig.version,
          usePlayit: newServerConfig.usePlayit,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const serverId = data.id;

        // 2. Install Software
        await fetch("/api/server/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serverId,
            type: newServerConfig.type,
            version: newServerConfig.version,
            customUrl:
              newServerConfig.type === "custom"
                ? newServerConfig.url
                : undefined,
          }),
        });

        setNewServerConfig({
          name: "",
          type: "paper",
          version: "1.21.1",
          ram: 4,
          minRam: 1,
          url: "",
          usePlayit: true,
        });
        setShowCreateModal(false);
        await fetchServers();
        setCurrentServerId(serverId);
        setActiveTab("console");
        alert("Servidor criado e instalação iniciada! (•◡•)");
      }
    } catch (e) {
      alert("Erro ao criar servidor. 🔌");
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdateServerConfig = async () => {
    if (!editingServer) return;
    try {
      const res = await fetch("/api/server/update-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: editingServer.id,
          name: editingServer.name,
          ram: editingServer.ram,
          minRam: editingServer.minRam,
          store: editingServer.store,
          javaPath: editingServer.javaPath,
        }),
      });
      if (res.ok) {
        setEditingServer(null);
        await fetchServers();
        await fetchStatus();
      }
    } catch (e) {}
  };

  const handleDeleteServer = async () => {
    if (!currentServerId) return;
    try {
      const res = await fetch("/api/server/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: currentServerId }),
      });
      if (res.ok) {
        setShowDeleteConfirm(false);
        const nextServers = servers.filter((s) => s.id !== currentServerId);
        setServers(nextServers);
        setCurrentServerId(nextServers[0]?.id || "");
        alert("Servidor excluído! ✨");
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      alert("Erro ao excluir servidor.");
    }
  };

  const handleSaveConfig = async () => {
    if (!currentServerId) return;
    try {
      const res = await fetch("/api/server/update-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: currentServerId,
          ram: ramConfig.ram,
          minRam: ramConfig.minRam,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
      } else {
        alert("Configuração salva! (｡♥‿♥｡)");
        setIsSyncingRam(true);
      }
    } catch (e) {
      alert("Erro ao salvar config.");
    }
  };

  const fetchBackups = async () => {
    if (!currentServerId) return;
    try {
      const res = await fetch(`/api/server/backups?serverId=${currentServerId}`);
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
      const resCloud = await fetch(`/api/server/cloud-backups?serverId=${currentServerId}`);
      if (resCloud.ok) {
        const data = await resCloud.json();
        setCloudBackups(data.backups || []);
      }
    } catch(e) {}
  };

  const handleBackup = async () => {
    if (!currentServerId) return;
    try {
      const res = await fetch("/api/server/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: currentServerId }),
      });
      if (res.ok) {
        alert("Backup iniciado! Verifique os logs. (•◡•)");
        setActiveTab("console");
      }
    } catch (e) {
      alert("Erro ao fazer backup.");
    }
  };

  const handleCloudBackup = async () => {
    if (!currentServerId) return;
    try {
      const res = await fetch("/api/server/cloud-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: currentServerId }),
      });
      if (res.ok) {
        alert("Cloud Backup iniciado! Verifique o terminal para progresso.");
        setActiveTab("console");
      }
    } catch (e) {
      alert("Erro ao fazer cloud backup.");
    }
  };

  const fetchPlugins = async () => {
    if (!currentServerId) return;
    try {
      const res = await fetch(
        `/api/server/plugins?serverId=${currentServerId}`,
      );
      const data = await res.json();
      setPlugins(data.plugins || []);
    } catch (e) {}
  };

  const handleGeneralDownload = async () => {
    if (!currentServerId || !downloadUrl) return;
    try {
      const res = await fetch("/api/server/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: currentServerId,
          url: downloadUrl,
          destPath: currentFolder,
        }),
      });
      if (res.ok) {
        setDownloadUrl("");
        setShowDownloadInput(false);
        setActiveTab("console");
        alert("Download solicitado! Verifique o console. (•◡•)");
      }
    } catch (e) {}
  };

  const checkPluginUpdates = async () => {
    if (!currentServerId) return;
    setIsCheckingUpdates(true);
    try {
      const res = await fetch(
        `/api/server/plugins/check-updates?serverId=${currentServerId}`,
      );
      const data = await res.json();
      setPluginUpdates(data.updates || []);
    } catch (e) {}
    setIsCheckingUpdates(false);
  };

  const fetchMeta = async (type: string = "paper") => {
    try {
      const res = await fetch(`/api/meta?type=${type}`);
      const data = await res.json();
      setMetadata(data);
      if (
        data.versions &&
        data.versions.length > 0
      ) {
        setNewServerConfig((prev) => {
          if (!data.versions.includes(prev.version)) {
            return { ...prev, version: data.versions[0] };
          }
          return prev;
        });
      }
    } catch (e) {}
  };

  // Re-fetch meta when server config type changes, but we want it in a useEffect so let's separate it
  useEffect(() => {
    if (activeTab === "settings") {
      fetch(`/api/meta?type=${installSoftware.type}`)
        .then((r) => r.json())
        .then((d) => {
          setMetadata(d);
          if (
            d.versions &&
            d.versions.length > 0 &&
            !d.versions.includes(installSoftware.version)
          ) {
            setInstallSoftware((prev) => ({ ...prev, version: d.versions[0] }));
          }
        });
    }
  }, [installSoftware.type, activeTab]);

  useEffect(() => {
    if (showCreateModal && newServerConfig.type !== "custom") {
      fetchMeta(newServerConfig.type);
    }
  }, [newServerConfig.type, showCreateModal]);

  const handleInstallPlugin = async () => {
    if (!currentServerId || !pluginUrl) return;
    setInstallingStoreItem("manual");
    try {
      const res = await fetch("/api/server/plugins/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: pluginUrl,
          serverId: currentServerId,
          name: pluginName,
        }),
      });
      if (res.ok) {
        setPluginUrl("");
        setPluginName("");
        fetchPlugins();
      }
    } catch (e) {}
    setInstallingStoreItem(null);
  };

  const handleInstall = async () => {
    if (!currentServerId) {
      alert("Crie ou selecione um servidor primeiro! (•◡•)");
      return;
    }
    try {
      const res = await fetch("/api/server/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...installSoftware, serverId: currentServerId }),
      });
      if (!res.ok) alert("Puxa, deu erro no download... (｡•́︿•̀｡)");
      else setActiveTab("console");
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserActivity = () => {
    lastActivity.current = Date.now();
    if (isHibernating) {
      setIsHibernating(false);
      fetchStatus();
    }
  };

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((name) =>
      document.addEventListener(name, handleUserActivity),
    );

    const checkHibernation = setInterval(() => {
      const now = Date.now();
      if (
        (now - lastActivity.current > 60000 || document.hidden) &&
        !isHibernating
      ) {
        setIsHibernating(true);
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsHibernating(true);
      } else {
        handleUserActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((name) =>
        document.removeEventListener(name, handleUserActivity),
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(checkHibernation);
    };
  }, [isHibernating]);

  useEffect(() => {
    fetchServers();
    fetchMeta();
  }, []);

  useEffect(() => {
    if (isHibernating || !currentServerId) return;

    const getInterval = () => {
      if (serverState.status === "online") return 1000;
      if (
        serverState.status === "starting" ||
        serverState.status === "stopping"
      )
        return 2000;
      return 5000;
    };

    const interval = setInterval(() => {
      fetchStatus();
    }, getInterval());
    fetchStatus(); // immediate check

    return () => clearInterval(interval);
  }, [isHibernating, currentServerId, serverState.status, activeTab]);

  useEffect(() => {
    if (isHibernating || activeTab !== "playit") return;

    const fetchPlayitStatus = async () => {
      try {
        const res = await fetch(`/api/playit/status`);
        if (res.ok) setPlayitStatus(await res.json());
      } catch (e) {}
    };

    const playitInterval = setInterval(fetchPlayitStatus, 2000);
    fetchPlayitStatus();

    return () => clearInterval(playitInterval);
  }, [isHibernating, activeTab]);

  useEffect(() => {
    if (activeTab === "files") fetchFiles(currentFolder);
  }, [activeTab, currentFolder, currentServerId]);

  const fetchFiles = async (folder: string) => {
    if (!currentServerId) return;
    try {
      const res = await fetch(
        `/api/server/files/list?serverId=${currentServerId}&folder=${encodeURIComponent(folder)}&_t=${Date.now()}`,
      );
      if (!res.ok) {
        throw new Error("Erro ao buscar arquivos (" + res.status + ")");
      }
      const data = await res.json();
      setFileList(data.items || []);
    } catch (e) {
      console.error("fetchFiles error:", e);
      // Mantém a lista anterior em caso de erro para não "sumir" com os arquivos da tela
      // Só limpa se realmente não houver nada e o erro persistir
      if (fileList.length === 0) {
        setFileList([]);
      }
    }
  };

  const openFile = async (path: string) => {
    if (!currentServerId) return;

    const extMatch = path.match(/\.([^.]+)$/);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase();
      if (['dat', 'mca', 'nbt', 'schem', 'schematic', 'png', 'jpg', 'jpeg', 'jar', 'zip', 'gz', 'tar', 'sqlite', 'db'].includes(ext)) {
        if (ext === "dat" || ext === "mca") {
          alert("⚠️ Aviso de Performance: Este é um arquivo de mapa 3D bruto!\n\n💡 VISUALIZAR: Instale o plugin 'BlueMap' na Loja para navegar pelo mundo 3D no navegador.\n\n🛠️ EDITAR: Um editor completo estilo 'MCEdit' faria o navegador explodir (muito pesado). Para editar montanhas ou schemas, FAÇA O DOWNLOAD do mundo e use o 'Amulet Editor' no PC, ou use 'WorldEdit' de dentro do próprio jogo.");
          setActiveTab("map");
          return;
        } else if (ext === "schem" || ext === "schematic") {
           alert("Este é um Schematic (construção 3D). Para colá-lo no mapa, use //schem load e //paste com o WorldEdit, diretamente de dentro do jogo!");
           setActiveTab("map");
           return;
        } else if (ext === "jar" || ext === "zip") {
           alert("Esse é um arquivo compilado ou compactado. Faça o download para acessar o conteúdo na sua máquina.");
           return;
        } else {
           alert(`O formato .${ext} é binário e não pode ser editado como texto.`);
           return;
        }
      }
    }

    try {
      const res = await fetch(
        `/api/server/files/content?serverId=${currentServerId}&path=${encodeURIComponent(path)}`,
      );
      const data = await res.json();
      setEditingFile({ path, content: data.content });
    } catch (e) {
      alert("Erro ao ler arquivo.");
    }
  };

  const saveFile = async () => {
    if (!editingFile || !currentServerId) return;
    try {
      const res = await fetch("/api/server/files/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingFile, serverId: currentServerId }),
      });
      if (res.ok) {
        setEditingFile(null);
      } else {
        alert("Erro ao salvar.");
      }
    } catch (e) {
      alert("Erro ao salvar.");
    }
  };

  const deleteFile = async (path: string) => {
    if (!currentServerId || !confirm(`Certeza que quer deletar ${path}?`))
      return;
    try {
      const res = await fetch(
        `/api/server/files/delete?serverId=${currentServerId}&path=${encodeURIComponent(path)}`,
        { method: "DELETE" },
      );
      if (res.ok) fetchFiles(currentFolder);
    } catch (e) {}
  };

  const renameFile = async (oldPath: string) => {
    if (!currentServerId) return;
    const newName = prompt(`Digite o novo nome para ${oldPath.split('/').pop()}:`);
    if (!newName) return;
    
    // Extrai o caminho sem o arquivo
    const parts = oldPath.split('/');
    parts.pop(); // Remove o antigo nome
    const basePath = parts.join('/');
    const newPath = basePath ? `${basePath}/${newName}` : newName;

    try {
      const res = await fetch("/api/server/files/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: currentServerId, oldPath, newPath }),
      });
      if (res.ok) fetchFiles(currentFolder);
      else alert("Erro ao renomear arquivo.");
    } catch (e) {}
  };

  const createFolder = async () => {
    if (!currentServerId) return;
    const folderName = prompt(`Digite o nome da nova pasta:`);
    if (!folderName) return;

    const newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;

    try {
      const res = await fetch("/api/server/files/mkdir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: currentServerId, path: newPath }),
      });
      if (res.ok) fetchFiles(currentFolder);
      else alert("Erro ao criar pasta.");
    } catch (e) {}
  };

  const uploadMultipleFiles = async (
    files: FileList | File[],
    serverId: string,
    folder: string,
  ) => {
    setIsUploading(true);
    const fileArray = Array.from(files);

    const newTasks = fileArray.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      progress: 0,
      status: "pending" as const,
    }));

    setUploadQueue((prev) => [...prev, ...newTasks]);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const task = newTasks[i];

        setUploadQueue((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "uploading" } : t,
          ),
        );

        try {
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(
              "POST",
              `/api/server/files/upload?serverId=${serverId}&folder=${encodeURIComponent(folder)}`,
            );

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploadQueue((prev) =>
                  prev.map((t) =>
                    t.id === task.id ? { ...t, progress: percent } : t,
                  ),
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploadQueue((prev) =>
                  prev.map((t) =>
                    t.id === task.id
                      ? { ...t, progress: 100, status: "done" }
                      : t,
                  ),
                );
                resolve(xhr.response);
              } else {
                setUploadQueue((prev) =>
                  prev.map((t) =>
                    t.id === task.id ? { ...t, status: "error" } : t,
                  ),
                );
                reject(new Error(xhr.statusText));
              }
            };

            xhr.onerror = () => {
              setUploadQueue((prev) =>
                prev.map((t) =>
                  t.id === task.id ? { ...t, status: "error" } : t,
                ),
              );
              reject(new Error("Network Error"));
            };

            const formData = new FormData();
            formData.append("files", file);
            xhr.send(formData);
          });
        } catch (fileError) {
          console.error(`Erro ao subir arquivo ${file.name}:`, fileError);
          // Continue with next file
        }
      }
      fetchFiles(folder);
    } catch (e) {
      console.error("Erro no processo de upload:", e);
    } finally {
      setIsUploading(false);
      // Clear completed/error tasks after 10 seconds to give time for the user to see results
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((t) => t.status === "uploading"));
      }, 10000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentServerId) return;

    await uploadMultipleFiles(files, currentServerId, currentFolder);
    e.target.value = "";
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // Don't intercept paste if user is typing in an input or textarea
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;

    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0 && currentServerId) {
      e.preventDefault();
      await uploadMultipleFiles(files, currentServerId, currentFolder);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0 || !currentServerId) return;

    await uploadMultipleFiles(files, currentServerId, currentFolder);
  };

  const clearLogs = async () => {
    if (!currentServerId) return;
    try {
      await fetch("/api/server/clear-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: currentServerId }),
      });
      // also clear locally instantly
      setServerState((prev) => ({ ...prev, logs: [] }));
      lastLogCount.current = 0;
    } catch (e) {}
  };

  useEffect(() => {
    setAutoScroll(true);
  }, [activeTab]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [serverState.logs, aiChat, activeTab, autoScroll]);

  const handleAction = async (action: "start" | "stop" | "kill") => {
    if (!currentServerId) return;

    if (action === "start") {
      setActiveTab("console");
    } else if (action === "stop" || action === "kill") {
      setActiveTab("servers");
    }

    // Optimistic UI update
    setServerState((prev) => ({
      ...prev,
      status:
        action === "start"
          ? "starting"
          : action === "kill"
            ? "offline"
            : "stopping",
    }));

    try {
      const res = await fetch(`/api/server/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: currentServerId }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Algo não deu certo... (´• ᵕ •`)");
        return;
      }
      fetchStatus();
    } catch (error) {
      console.error(`Erro ao ${action}:`, error);
    }
  };

  const executeAITool = async (call: any) => {
    const { name, args } = call;
    const serverId = args.serverId || currentServerId;

    try {
      let res;
      switch (name) {
        case "sendTerminalCommand":
          res = await fetch("/api/server/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId, command: args.command }),
          });
          break;
        case "startServer":
          res = await fetch("/api/server/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId }),
          });
          break;
        case "stopServer":
          res = await fetch("/api/server/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId }),
          });
          break;
        case "installSoftware":
          res = await fetch("/api/server/install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serverId,
              type: args.type,
              version: args.version,
            }),
          });
          break;
        case "hangarInstallPlugin":
          res = await fetch("/api/server/plugins/hangar-install", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serverId,
              slug: args.slug,
              version: args.version,
            }),
          });
          break;
        case "listFiles":
          res = await fetch(
            `/api/server/files/list?serverId=${serverId}&folder=${args.folder || ""}`,
          );
          break;
        case "readFile":
          res = await fetch(
            `/api/server/files/content?serverId=${serverId}&path=${args.path}`,
          );
          break;
        case "saveFile":
          res = await fetch("/api/server/files/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serverId,
              path: args.path,
              content: args.content,
            }),
          });
          break;
        case "executeTerminal":
          res = await fetch("/api/server/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId, command: args.command }),
          });
          break;
        case "downloadFile":
          res = await fetch("/api/server/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serverId,
              url: args.url,
              destPath: args.destPath,
            }),
          });
          break;
        case "updateRAM":
          res = await fetch("/api/server/config/ram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId, ram: args.ram }),
          });
          break;
        case "setOP":
          res = await fetch("/api/server/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId, command: `op ${args.player}` }),
          });
          break;
        case "deleteFile":
          res = await fetch(
            `/api/server/files/delete?serverId=${serverId}&path=${args.path}`,
            { method: "DELETE" },
          );
          break;
        case "importServerFromGithub":
          res = await fetch("/api/servers/import-github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId: args.serverId, url: args.url }),
          });
          break;
        case "evaluateNode":
          res = await fetch("/api/app/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: args.code }),
          });
          break;
        case "installAICore":
          res = await fetch("/api/server/install-ai-core", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId }),
          });
          break;
        case "reloadSkripts":
          res = await fetch("/api/server/skript/reload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId }),
          });
          break;
        case "getPlayitStatus":
          res = await fetch("/api/playit/status");
          break;
        case "resetPlayit":
          res = await fetch("/api/playit/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          break;
        case "manageNPC":
          let commands: string[] = [];
          if (args.action === "create") {
            commands.push(`npc create ${args.name || "PaperCreeper"}`);
          } else if (args.action === "skin") {
            commands.push(`npc skin ${args.extra}`);
          } else if (args.action === "remove") {
            commands.push(`npc remove`);
          } else if (args.action === "message") {
            commands.push(`npc text --set "${args.extra}"`);
          } else if (args.action === "setRole") {
            if (args.role === "guard") {
              commands.push(`trait sentinel`);
              commands.push(`sentinel addtarget monsters`);
              commands.push(`sentinel speed 1.5`);
              if (args.extra) commands.push(`sentinel guard ${args.extra}`);
            } else if (args.role === "vendor") {
              commands.push(`trait shopkeeper`);
            } else if (args.role === "greeter") {
              commands.push(`npc text --range 5 --at 1 --close`);
              if (args.extra) commands.push(`npc text --add "${args.extra}"`);
            }
          }

          for (const cmdText of commands) {
            await fetch("/api/server/command", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ serverId, command: cmdText }),
            });
          }
          res = {
            ok: true,
            json: () => Promise.resolve({ success: true }),
          } as any;
          break;
        case "searchInternet":
          res = await fetch("/api/ai/web/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: args.query })
          });
          break;
        case "fetchUrl":
          res = await fetch("/api/ai/web/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: args.url })
          });
          break;
        case "saveMemory":
          res = await fetch("/api/ai/memory/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: args.key, content: args.content })
          });
          break;
        case "readMemory":
          res = await fetch("/api/ai/memory/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: args.query })
          });
          break;
        case "spawnBot":
          res = await fetch("/api/bot/spawn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId, botName: args.botName })
          });
          break;
      }

      const data = await res?.json();
      return JSON.stringify(data || { success: true });
    } catch (error) {
      return `Erro ao executar ferramenta: ${error}`;
    }
  };

  const handleAskAI = async (e?: React.FormEvent, overrideMsg?: string) => {
    e?.preventDefault();
    const finalMsg = overrideMsg !== undefined ? overrideMsg : aiInput;
    if (!finalMsg.trim() || aiLoading) return;

    let displayMsg = finalMsg;
    const searchMatch = finalMsg.match(/<call:PESQUISAR>(.*?)<\/call>/i);
    const consultMatch = finalMsg.match(/<call:CONSULTAR>(.*?)<\/call>/i);
    
    if (searchMatch) displayMsg = `🔎 Pesquise na web sobre: ${searchMatch[1]}`;
    if (consultMatch) displayMsg = `📚 Consulte na memória: ${consultMatch[1]}`;

    if (overrideMsg === undefined) setAiInput("");
    else setAiInput(""); // always clear
    setAiChat((prev) => [...prev, { role: "user", text: displayMsg }]);
    setAiLoading(true);

    try {
      const keysArray = aiKeysList.split(",").map(k => k.trim()).filter(k => k.length > 5);
      const context = `Servidor Selecionado: ${currentServerId}. Status: ${serverState.status}. Logs recentes:\n${serverState.logs.slice(-10).join("\n")}`;
      
      let firstResult: any = null;

      if (searchMatch) {
        firstResult = {
          text: `Executando pesquisa automática por: ${searchMatch[1]}...`,
          call: { name: "searchInternet", args: { query: searchMatch[1].trim() } }
        };
      } else if (consultMatch) {
         firstResult = {
          text: `Consultando memória por: ${consultMatch[1]}...`,
          call: { name: "readMemory", args: { query: consultMatch[1].trim() } }
        };
      } else {
         firstResult = await askAI(finalMsg, context, currentServerId, aiProvider, aiEndpoint, aiChat.slice(-10), aiLocalModel, keysArray, modules);
      }

      if (firstResult.call) {
        setAiChat((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `⚙️ Entendido. Executando ação: ${firstResult.call!.name}...`,
          },
        ]);
        const toolResult = await executeAITool(firstResult.call);

        // Pass the result back to the IA for a final natural language response
        const secondResult = await askAI(
          `O sistema retornou: ${toolResult}. Comunique isso ao usuário.`,
          context,
          currentServerId,
          aiProvider,
          aiEndpoint,
          aiChat.slice(-10),
          aiLocalModel,
          keysArray,
          modules
        );
        setAiChat((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            text: secondResult.text || "Ação concluída com sucesso! 💎",
          },
        ]);
      } else {
        setAiChat((prev) => [
          ...prev,
          {
            role: "assistant",
            text: firstResult.text || "Não entendi bem, pode repetir? (｡•́︿•̀｡)",
          },
        ]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setAiChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Tive um curto-circuito na redstone. Tente novamente! 🔌",
        },
      ]);
    }

    setAiLoading(false);
    setTimeout(fetchStatus, 500);
  };

  const handleGeneratePlugin = async () => {
    if (!pluginDescription.trim() || isGeneratingPlugin) return;
    setIsGeneratingPlugin(true);
    setPluginGenStatus("Consultando IA (Pode demorar alguns segundos)...");
    setPluginCode("");

    try {
      const keysArray = aiKeysList.split(",").map(k => k.trim()).filter(k => k.length > 5);
      const prompt = `Atue como um desenvolvedor Skript (Minecraft). O usuário quer o seguinte plugin/sistema:
"${pluginDescription}"

Gere o código Skript (.sk) completo e otimizado para atender a este pedido. Retorne APENAS o código encapsulado num bloco \`\`\`skript ... \`\`\`. Use blocos de command, on event, etc conforme necessário e não utilize ferramentas [ACTION:...] aqui! Só envie o código, sem explicações extras.`;
      
      const result = await askAI(prompt, "Skript Plugin Generation Mode", currentServerId, aiProvider, aiEndpoint, [], aiLocalModel, keysArray, modules);
      
      const rawText = result.text || "";
      const codeMatch = rawText.match(/```(?:skript|sk|yaml)?\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : rawText.trim();

      setPluginCode(code);
      setPluginGenStatus(t("script_builder_status_success") || "Plugin gerado com sucesso! Salve para aplicar.");
    } catch (err) {
      console.error(err);
      setPluginGenStatus(t("script_builder_status_error") || "Erro ao gerar plugin. Verifique a API Key ou o servidor Local AI.");
    }
    setIsGeneratingPlugin(false);
  };

  const handleSavePlugin = async () => {
    if (!pluginCode || !currentServerId) return;
    setPluginGenStatus("Salvando Arquivo...");
    try {
      const fileName = `plugin_${Date.now()}_aigen.sk`;
      const res = await fetch("/api/server/files/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: currentServerId,
          path: `plugins/Skript/scripts/${fileName}`,
          content: pluginCode
        })
      });
      if (res.ok) {
        setPluginGenStatus(t("script_builder_status_saving") || "Plugin Injetado e Salvo com Sucesso!");
        await executeAITool({ name: "reloadSkripts", args: { serverId: currentServerId } });
      } else {
        setPluginGenStatus(t("script_builder_status_save_error") || "Erro ao salvar plugin.");
      }
    } catch (e) {
      setPluginGenStatus("Erro na requisição. Verifique o console.");
    }
  };

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !currentServerId) return;

    // Immediate local feedback
    const cmd = command;
    setCommand("");
    setServerState((prev) => ({
      ...prev,
      logs: [...prev.logs, `> ${cmd}`].slice(-300),
    }));

    try {
      const res = await fetch("/api/server/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd, serverId: currentServerId }),
      });
      if (!res.ok) {
        setServerState((prev) => ({
          ...prev,
          logs: [...prev.logs, `⚠️ Sistema: Erro ao enviar comando.`].slice(
            -300,
          ),
        }));
      }
    } catch (error) {
      console.error("Erro ao enviar comando:", error);
    }
  };

  const getStatusBubble = () => {
    switch (serverState.status) {
      case "online":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
      case "starting":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse";
      case "stopping":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-zinc-800 text-zinc-500 border-zinc-700";
    }
  };

  return (
    <div
      className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-white transition-all duration-500 ${theme === "dark" ? "bg-[#071E14] text-emerald-50" : "bg-zinc-50 text-emerald-950"} ${isHibernating ? "grayscale-[0.8] brightness-50" : ""}`}
    >
      <div
        className={`fixed inset-0 creeper-pattern pointer-events-none ${theme === "light" ? "opacity-[0.02]" : "opacity-05"}`}
      />
      <div className="w-full max-w-[1920px] mx-auto min-h-screen flex flex-col p-6 lg:p-6 relative">
        <AnimatePresence>
          {showHibernationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-amber-950/80 backdrop-blur-md rounded-3xl border-2 border-amber-500 shadow-xl p-6 max-w-lg w-full text-center space-y-6"
              >
                <div className="w-10 h-10 bg-amber-900/50 rounded-full flex items-center justify-center mx-auto text-amber-400">
                  <Moon size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-50 tracking-tighter uppercase mb-4">
                    AVISO IMPORTANTE
                  </h3>
                  <p className="text-amber-200/80 font-bold mb-4 text-sm whitespace-pre-wrap">
                    O Google Cloud Run suspende servidores sem atividade após cerca de 15 minutos de inatividade em requisições web.
                  </p>
                  <p className="text-amber-200/80 font-bold mb-4 text-sm whitespace-pre-wrap">
                    Para que o servidor sobreviva com a página do Painel fechada, configure um monitor gratuito no [UptimeRobot.com] apontando para a sua SHARED APP URL (URL fornecida no menu de compartilhamento do AI Studio).
                  </p>
                  <p className="text-amber-200/80 font-bold text-sm whitespace-pre-wrap">
                    A aba de Hibernação prepara o servidor para manter os processos do Minecraft rodando no background apenas aguardando o "Ping" constante do UptimeRobot para evitar o congelamento do container.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowHibernationModal(false)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 border-b-4 border-amber-700 font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 active:border-b-0 uppercase"
                  >
                    OK, ENTENDI
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-emerald-950/80 backdrop-blur-md rounded-3xl border border-emerald-500 shadow-xl p-6 max-w-md w-full text-center space-y-6"
              >
                <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <Trash2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-emerald-50 tracking-tighter uppercase">
                    Tem certeza?
                  </h3>
                  <p className="text-emerald-400 font-bold mt-2 leading-relaxed italic">
                    Cuidado! Isso deletará todos os arquivos...
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-emerald-950 hover:bg-emerald-950/80 text-emerald-500 font-black py-4 rounded-2xl transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleDeleteServer}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg border-b-4 border-red-900 transition-all active:scale-95"
                  >
                    BOOM!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-md rounded-3xl border border-emerald-500 shadow-xl p-6 max-w-2xl w-full space-y-6 overflow-y-auto max-h-[90vh] custom-scrollbar"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-400">
                    <Play size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-emerald-50 tracking-tighter uppercase italic">
                      Novo Servidor
                    </h3>
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                      Configure sua nova aventura!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                        Nome do Servidor
                      </label>
                      <input
                        className="w-full bg-black/40 border border-emerald-900/50 rounded-2xl px-6 py-3 text-emerald-50 font-black outline-none focus:border-emerald-500 transition-all font-mono"
                        placeholder="Ex: Galilandia Survival"
                        value={newServerConfig.name}
                        onChange={(e) =>
                          setNewServerConfig({
                            ...newServerConfig,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                        Software (Motor)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          "paper",
                          "purpur",
                          "spigot",
                          "velocity",
                          "waterfall",
                          "bungeecord",
                          "fabric",
                          "mohist",
                          "forge",
                          "vanilla",
                          "nukkit",
                          "custom",
                        ].map((t) => (
                          <button
                            key={t}
                            onClick={() =>
                              setNewServerConfig({
                                ...newServerConfig,
                                type: t,
                              })
                            }
                            className={`px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${newServerConfig.type === t ? "bg-emerald-500 border-emerald-400 text-white shadow-lg" : "bg-black/20 border-emerald-900 text-emerald-700 hover:border-emerald-600"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {newServerConfig.type === "custom" ? (
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                          Link Direto (.jar)
                        </label>
                        <input
                          className="w-full bg-black/40 border border-emerald-900/50 rounded-2xl px-6 py-3 text-emerald-50 font-black outline-none focus:border-emerald-500 transition-all font-mono text-xs"
                          placeholder={"Ex: https://site.com/server.jar"}
                          value={newServerConfig.url}
                          onChange={(e) =>
                            setNewServerConfig({
                              ...newServerConfig,
                              url: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                          Versão
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-black/40 border border-emerald-900/50 rounded-2xl px-6 py-3 text-emerald-50 font-black outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            value={newServerConfig.version}
                            onChange={(e) =>
                              setNewServerConfig({
                                ...newServerConfig,
                                version: e.target.value,
                              })
                            }
                          >
                            {metadata.versions?.map((v) => (
                              <option
                                key={v}
                                value={v}
                                className="bg-black/40 backdrop-blur-md"
                              >
                                {v}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none"
                            size={16}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                        RAM Máxima ({newServerConfig.ram}GB)
                      </label>
                      <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-emerald-900/50">
                        <input
                          type="range"
                          min="1"
                          max={metadata.systemMaxRam || 16}
                          step="1"
                          className="flex-1 accent-emerald-400"
                          value={newServerConfig.ram}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNewServerConfig({
                              ...newServerConfig,
                              ram: val,
                              minRam: Math.min(newServerConfig.minRam, val),
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                        RAM Mínima ({newServerConfig.minRam}GB)
                      </label>
                      <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-emerald-900/50">
                        <input
                          type="range"
                          min="1"
                          max={newServerConfig.ram}
                          step="1"
                          className="flex-1 accent-emerald-400"
                          value={newServerConfig.minRam}
                          onChange={(e) =>
                            setNewServerConfig({
                              ...newServerConfig,
                              minRam: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-900/50">
                      <p className="text-[9px] text-emerald-500 font-bold leading-relaxed">
                        Ao clicar em CRIAR, o painel irá reservar os recursos e
                        começar o download do software escolhido
                        automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-emerald-950 text-emerald-500 font-black py-4 rounded-2xl transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleCreateServer}
                    disabled={isInstalling || !newServerConfig.name.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg border-b-4 border-emerald-900 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isInstalling ? "INSTALANDO..." : "CRIAR MUNDO!"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {editingServer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-md rounded-3xl border border-emerald-500/30 shadow-2xl p-0 max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between bg-emerald-950/20">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-400">
                      <Settings size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-emerald-50 tracking-tighter uppercase italic">
                        {t("edit_server")}
                      </h3>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">
                        {editingServer.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-900/50">
                    <button
                      onClick={() => setEditTab("general")}
                      className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${editTab === "general" ? "bg-emerald-600 text-white shadow-lg" : "text-emerald-700 hover:text-emerald-400"}`}
                    >
                      {t("config_tab_general")}
                    </button>
                    <button
                      onClick={() => {
                        setEditTab("plugins");
                        fetchPlugins();
                      }}
                      className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${editTab === "plugins" ? "bg-emerald-600 text-white shadow-lg" : "text-emerald-700 hover:text-emerald-400"}`}
                    >
                      {t("config_tab_plugins")}
                    </button>
                  </div>
                  <button
                    onClick={() => setEditingServer(null)}
                    className="text-emerald-900 hover:text-emerald-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {editTab === "general" ? (
                    <div className="max-w-md mx-auto space-y-4 py-4">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                          {t("server_name")}
                        </label>
                        <input
                          className="w-full bg-black/40 border border-emerald-900/50 rounded-2xl px-6 py-5 text-emerald-50 font-black outline-none focus:border-emerald-500 transition-all font-mono text-lg"
                          value={editingServer.name || ""}
                          onChange={(e) =>
                            setEditingServer({
                              ...editingServer,
                              name: e.target.value,
                            })
                          }
                          placeholder="Ex: Survival Hardcore"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                          {t("ram_allocation")}
                        </label>
                        <div className="bg-black/40 p-6 rounded-[2rem] border border-emerald-900/50 space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-700 uppercase">
                              {t("max_memory")}
                            </span>
                            <span className="text-base font-black text-white">
                              {editingServer.ram}GB
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max={metadata.systemMaxRam || 16}
                            step="1"
                            className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            value={editingServer.ram || 2}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditingServer({
                                ...editingServer,
                                ram: val,
                                minRam: Math.min(
                                  editingServer.minRam || 1,
                                  val,
                                ),
                              });
                            }}
                          />
                          <div className="flex justify-between text-[8px] font-black text-emerald-900">
                            <span>1GB</span>
                            <span>
                              {Math.floor((metadata.systemMaxRam || 16) / 4)}GB
                            </span>
                            <span>
                              {Math.floor((metadata.systemMaxRam || 16) / 2)}GB
                            </span>
                            <span>
                              {Math.floor((metadata.systemMaxRam || 16) * 0.75)}
                              GB
                            </span>
                            <span>{metadata.systemMaxRam || 16}GB</span>
                          </div>
                        </div>
                      </div>

                      {/* Java Settings Section */}
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2">
                          {t("java_settings")}
                        </label>
                        <div className="bg-black/40 p-6 rounded-[2rem] border border-emerald-900/50 space-y-4">
                          <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest leading-relaxed">
                            {t("java_path_desc")}
                          </p>
                          <div className="flex gap-2">
                            <input
                              className="flex-1 bg-black/40 border border-emerald-900/50 rounded-xl px-4 py-2 text-xs text-emerald-50 font-black outline-none focus:border-emerald-500 font-mono"
                              placeholder="Default (Auto)"
                              value={editingServer.javaPath || ""}
                              onChange={(e) => setEditingServer({...editingServer, javaPath: e.target.value})}
                            />
                            <button
                              onClick={async () => {
                                await handleUpdateServerConfig();
                                alert("Caminho do Java salvo com sucesso! (•◡•)");
                              }}
                              className="bg-emerald-600 px-4 rounded-xl text-white font-black text-[8px] flex items-center gap-2 hover:bg-emerald-500 transition-all uppercase"
                              title="Salvar Caminho Manual"
                            >
                              <Save size={10} />
                              SALVAR PATH
                            </button>
                            <button
                              onClick={scanJavas}
                              className="bg-emerald-900 px-4 rounded-xl text-emerald-500 font-black text-[8px] flex items-center gap-2 hover:bg-emerald-800 transition-all uppercase"
                            >
                              <RefreshCw size={10} className={scanningJavas ? "animate-spin" : ""} />
                              {t("java_detect_btn")}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                             {[8, 17, 21, 25].map(major => (
                               <button 
                                 key={major}
                                 onClick={async () => {
                                    alert(`Baixando Java ${major}. Verifique o console!`);
                                    try {
                                      await fetch("/api/system/java/download", {
                                        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ major })
                                      });
                                      scanJavas();
                                    } catch(e) {}
                                 }}
                                 className="flex-1 min-w-[100px] py-2 bg-emerald-950/40 text-emerald-600 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-emerald-800 hover:text-emerald-300 transition-colors border border-emerald-900/50"
                               >
                                 ➕ Baixar Java {major}
                               </button>
                             ))}
                          </div>
                          
                          {javas.length > 0 && (
                            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar border-t border-emerald-900/40 pt-2">
                              <p className="text-[8px] font-black text-emerald-800 uppercase tracking-widest mb-1 italic">
                                {t("java_found_list")}
                              </p>
                              {javas.map((j) => (
                                <button
                                  key={j.path}
                                  onClick={() => setEditingServer({...editingServer, javaPath: j.path})}
                                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${editingServer.javaPath === j.path ? "bg-emerald-500/20 border-emerald-500" : "bg-black/20 border-emerald-950 hover:border-emerald-800"}`}
                                >
                                  <div>
                                    <p className="text-[9px] font-black text-emerald-50 leading-tight">Java {j.version}</p>
                                    <p className="text-[8px] font-mono text-emerald-700 truncate max-w-[200px]">{j.path}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${j.type === "downloaded" ? "bg-emerald-900 text-emerald-300" : "bg-zinc-900 text-zinc-500"}`}>{j.type === "downloaded" ? "Compilado" : "Sistema"}</span>
                                     {editingServer.javaPath === j.path && <Check size={12} className="text-emerald-500" />}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Search Area */}
                        <div className="space-y-4 p-6 bg-emerald-900/10 border border-emerald-900/50 rounded-3xl relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                {t("mods_store")}
                              </h4>
                              <div className="bg-emerald-900/40 px-2 py-1 rounded-xl border border-emerald-800 text-[9px] font-black text-emerald-300 uppercase">
                                Modrinth
                              </div>
                              <select
                                className="bg-black/40 border border-emerald-900/50 rounded-xl px-2 py-1 text-emerald-50 text-[9px] font-black outline-none focus:border-emerald-500 uppercase"
                                value={storeFolder}
                                onChange={(e) =>
                                  setStoreFolder(
                                    e.target.value as "plugins" | "mods",
                                  )
                                }
                              >
                                <option value="plugins">Plugins</option>
                                <option value="mods">Mods</option>
                              </select>
                            </div>
                            <Sparkles
                              size={16}
                              className="text-emerald-500 animate-pulse"
                            />
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1 bg-black/40 border border-emerald-900/50 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-all">
                              <Search size={18} className="text-emerald-700" />
                              <input
                                className="bg-transparent border-none outline-none text-emerald-50 w-full font-black text-xs placeholder:text-emerald-900"
                                placeholder={t("search_placeholder")}
                                value={storeSearch}
                                onChange={(e) => setStoreSearch(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && searchStore(storeSearch)
                                }
                              />
                            </div>
                            <button
                              onClick={() => searchStore(storeSearch)}
                              className="px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[9px] transition-all border-b-4 border-emerald-800"
                            >
                              {t("search_btn")}
                            </button>
                          </div>

                          <AnimatePresence>
                            {isSearchingStore && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[8px] text-emerald-500 font-black animate-pulse uppercase tracking-widest"
                              >
                                {t("searching")} Modrinth...
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {storeResults.map((p: any) => {
                              const itemKey = p.project_id || p.id;
                              return (
                                <div
                                  key={itemKey}
                                  className="bg-black/40 p-3 rounded-xl border border-emerald-900/50 flex items-center gap-4 hover:border-emerald-500 transition-all group"
                                >
                                  {p.icon_url ? (
                                    <img
                                      src={p.icon_url}
                                      alt=""
                                      className="w-10 h-10 rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center text-[9px] font-black">
                                      {p.title ? p.title[0] : p.name?.[0]}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-black text-emerald-50 truncate text-xs">
                                      {p.title || p.name}
                                    </p>
                                    <p className="text-[8px] text-emerald-700 font-black uppercase">
                                      {t("developed_by")}{" "}
                                      {p.author || "User"}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => openModrinthPicker(p)}
                                    className="px-3 py-1.5 bg-emerald-500 group-hover:bg-emerald-400 text-white font-black text-[9px] rounded-lg transition-all uppercase flex-shrink-0"
                                  >
                                    {t("select_version")}
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Versions Modal */}
                          <AnimatePresence>
                            {showVersionsModal && selectedModrinthProject && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 z-50 bg-black/95 p-6 rounded-3xl flex flex-col border-4 border-emerald-900 shadow-2xl"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h5 className="text-emerald-50 font-black text-sm uppercase tracking-tighter">
                                      {selectedModrinthProject.title}
                                    </h5>
                                    <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest animate-pulse">
                                      {t("modrinth_versions_title")}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setShowVersionsModal(false)}
                                    className="p-2 text-emerald-900 hover:text-red-500 transition-colors"
                                  >
                                    <X size={20} />
                                  </button>
                                </div>

                                {(() => {
                                  const filteredVersions = modrinthVersions.filter(v => {
                                    if (storeGameVersion && (!v.game_versions || !v.game_versions.includes(storeGameVersion))) return false;
                                    if (storeLoader && (!v.loaders || !v.loaders.includes(storeLoader))) return false;
                                    return true;
                                  });
                                  const uniqueGameVersions = Array.from(new Set(modrinthVersions.flatMap(v => v.game_versions || []))).sort();
                                  const uniqueLoaders = Array.from(new Set(modrinthVersions.flatMap(v => v.loaders || []))).sort();

                                  return (
                                    <>
                                      <div className="flex gap-2 mb-4">
                                        <select 
                                          value={storeGameVersion} 
                                          onChange={(e) => setStoreGameVersion(e.target.value)}
                                          className="flex-1 bg-black/40 border border-emerald-900/50 rounded-xl px-2 py-2 text-emerald-50 text-[9px] font-black outline-none focus:border-emerald-500 uppercase"
                                        >
                                          <option value="">{t("game_versions")} (Todas)</option>
                                          {uniqueGameVersions.map(v => <option key={v as string} value={v as string}>{v as string}</option>)}
                                        </select>
                                        <select 
                                          value={storeLoader} 
                                          onChange={(e) => setStoreLoader(e.target.value)}
                                          className="flex-1 bg-black/40 border border-emerald-900/50 rounded-xl px-2 py-2 text-emerald-50 text-[9px] font-black outline-none focus:border-emerald-500 uppercase"
                                        >
                                          <option value="">Software/Loader (Todos)</option>
                                          {uniqueLoaders.map(l => <option key={l as string} value={l as string}>{l as string}</option>)}
                                        </select>
                                      </div>
                                      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {modrinthVersions.length === 0 ? (
                                          <div className="flex flex-col items-center justify-center h-40 text-emerald-900">
                                            <RefreshCw size={24} className="animate-spin mb-2" />
                                            <p className="text-[9px] font-black uppercase">Lendo versões...</p>
                                          </div>
                                        ) : (
                                          filteredVersions.map((v: any) => (
                                            <button
                                              key={v.id}
                                              onClick={() => installModrinthVersion(v)}
                                              disabled={installingStoreItem === v.id}
                                              className={`w-full text-left p-3 rounded-xl border transition-all group flex items-center justify-between ${installingStoreItem === v.id ? "bg-zinc-900 border-zinc-800 opacity-50" : "bg-emerald-900/10 border-emerald-900/40 hover:border-emerald-500"}`}
                                            >
                                              <div className="min-w-0">
                                                <p className="text-[9px] font-black text-emerald-50 truncate leading-tight">
                                                  {v.version_number} ({v.name})
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  <span className="text-[7px] font-black text-emerald-400 bg-emerald-950 px-1 py-0.5 rounded border border-emerald-900/50 uppercase">
                                                    {t("game_versions")}: {v.game_versions?.slice(0, 3).join(", ")}
                                                  </span>
                                                  <span className="text-[7px] font-black text-emerald-200 bg-emerald-800/40 px-1 py-0.5 rounded border border-emerald-700/50 uppercase">
                                                    {t("loaders")}: {v.loaders?.join(", ")}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex-shrink-0 ml-2">
                                                {installingStoreItem === v.id ? (
                                                  <RefreshCw size={14} className="animate-spin text-emerald-500" />
                                                ) : (
                                                  <div className="bg-emerald-500 p-1 rounded group-hover:bg-emerald-400">
                                                    <Download size={14} className="text-white" />
                                                  </div>
                                                )}
                                              </div>
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Manual/List Area */}
                        <div className="space-y-6">
                          <div className="p-6 bg-emerald-900/5 border-2 border-dashed border-emerald-900/30 rounded-3xl space-y-4">
                            <h4 className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">
                              Download Direto
                            </h4>
                            <div className="flex gap-2">
                              <input
                                className="flex-1 bg-black/20 border border-emerald-900/50/50 rounded-xl px-4 py-2 text-xs text-emerald-50 font-black outline-none focus:border-emerald-500"
                                placeholder="URL do arquivo .jar"
                                value={pluginUrl}
                                onChange={(e) => setPluginUrl(e.target.value)}
                              />
                              <button
                                onClick={handleInstallPlugin}
                                disabled={installingStoreItem === "manual"}
                                className="bg-emerald-900 px-4 rounded-xl text-emerald-500 font-black text-[9px] disabled:opacity-50"
                              >
                                {installingStoreItem === "manual"
                                  ? "..."
                                  : "OK"}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                                Instalados
                              </h3>
                              <button
                                onClick={fetchPlugins}
                                className="text-emerald-700 hover:text-emerald-500 transition-colors"
                              >
                                <RefreshCw size={12} />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {plugins.map((p) => (
                                <div
                                  key={p.filename}
                                  className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-emerald-900/30"
                                >
                                  <div>
                                    <p className="text-xs font-black text-emerald-50">
                                      {p.name}
                                    </p>
                                    <p className="text-[8px] font-black text-emerald-800 uppercase">
                                      {p.version}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      deleteFile(`plugins/${p.filename}`)
                                    }
                                    className="text-red-900 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              {plugins.length === 0 && (
                                <p className="text-[9px] text-emerald-900 font-black text-center py-4">
                                  Nenhum plugin instalado.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {editTab === "store" && (
                    <div className="max-w-2xl mx-auto space-y-4 py-4">
                      <div className="bg-emerald-950/30 p-6 rounded-3xl border border-emerald-900/50 space-y-6">
                        <div className="flex justify-between items-center bg-fuchsia-950/20 p-5 rounded-2xl border border-fuchsia-500/20 shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-zinc-900 rounded-2xl flex items-center justify-center text-fuchsia-500 shadow-lg border-b-4 border-fuchsia-950">
                              <Store size={24} />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                                Loja Pública (Website)
                              </h3>
                              <p className="text-[9px] text-fuchsia-400 font-bold mt-1.5 uppercase tracking-widest leading-none">
                                Crie pacotes e comandos via website.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setAppConfig &&
                                setAppConfig({
                                  ...appConfig,
                                  storeEnabled:
                                    appConfig.storeEnabled === false,
                                })
                              }
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-start rounded-full transition-all duration-300 focus:outline-none ring-2 ring-offset-2 ring-offset-black ${appConfig?.storeEnabled !== false ? "bg-emerald-600 ring-emerald-500/20" : "bg-zinc-700 ring-zinc-700/20"}`}
                              title={
                                appConfig?.storeEnabled !== false
                                  ? "Loja Ativa"
                                  : "Loja Inativa"
                              }
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out ${appConfig?.storeEnabled !== false ? "translate-x-6" : "translate-x-1"}`}
                              />
                            </button>

                            {appConfig?.storeEnabled !== false && (
                              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                <button
                                  onClick={() => {
                                    window.open(`/site`, "_blank");
                                  }}
                                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border border-white/5 active:scale-95 flex items-center gap-2"
                                >
                                  Ver Site <ExternalLink size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveTab("settings");
                                  }}
                                  className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 border-b-2 border-fuchsia-800 flex items-center gap-2"
                                >
                                  Opções <Settings size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-2">
                              Nome da Loja
                            </label>
                            <input
                              className="w-full bg-black/40 border border-emerald-900/50/50 rounded-xl px-4 py-3 text-emerald-50 font-bold outline-none focus:border-emerald-500 transition-all text-xs"
                              value={editingServer.store?.name || ""}
                              onChange={(e) =>
                                setEditingServer({
                                  ...editingServer,
                                  store: {
                                    ...editingServer.store,
                                    name: e.target.value,
                                  },
                                })
                              }
                              placeholder="Minha Loja de Servidor"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest px-2">
                              Cor Principal (Hex)
                            </label>
                            <input
                              className="w-full bg-black/40 border border-emerald-900/50/50 rounded-xl px-4 py-3 text-emerald-50 font-bold outline-none focus:border-emerald-500 transition-all text-xs font-mono"
                              value={editingServer.store?.color || "#10b981"}
                              onChange={(e) =>
                                setEditingServer({
                                  ...editingServer,
                                  store: {
                                    ...editingServer.store,
                                    color: e.target.value,
                                  },
                                })
                              }
                              placeholder="#10b981"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                            Pacotes à Venda
                          </h3>
                          <button
                            onClick={() => {
                              const newItem = {
                                id: `item-${Date.now()}`,
                                name: "Novo VIP",
                                description: "",
                                price: 10,
                                commands: ["say {player} comprou VIP!"],
                              };
                              setEditingServer({
                                ...editingServer,
                                store: {
                                  ...editingServer.store,
                                  items: [
                                    ...(editingServer.store?.items || []),
                                    newItem,
                                  ],
                                },
                              });
                            }}
                            className="text-[9px] bg-emerald-900 text-emerald-100 hover:bg-emerald-800 font-black px-4 py-2 rounded-xl transition-colors uppercase"
                          >
                            + Adicionar
                          </button>
                        </div>

                        {(editingServer.store?.items || []).map(
                          (item: any, i: number) => (
                            <div
                              key={item.id}
                              className="p-4 bg-black/20 border border-emerald-900/50 rounded-2xl relative group"
                            >
                              <button
                                onClick={() => {
                                  const items = [...editingServer.store.items];
                                  items.splice(i, 1);
                                  setEditingServer({
                                    ...editingServer,
                                    store: { ...editingServer.store, items },
                                  });
                                }}
                                className="absolute top-4 right-4 text-red-900 hover:text-red-500 transition-colors"
                              >
                                <X size={16} />
                              </button>

                              <div className="grid grid-cols-2 gap-4 mb-4 pr-8">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">
                                    Nome
                                  </label>
                                  <input
                                    className="w-full bg-black/40 border border-emerald-900/50 rounded-lg px-3 py-2 text-emerald-50 font-bold outline-none focus:border-emerald-500 text-xs"
                                    value={item.name}
                                    onChange={(e) => {
                                      const items = [
                                        ...editingServer.store.items,
                                      ];
                                      items[i].name = e.target.value;
                                      setEditingServer({
                                        ...editingServer,
                                        store: {
                                          ...editingServer.store,
                                          items,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">
                                    Preço (R$)
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full bg-black/40 border border-emerald-900/50 rounded-lg px-3 py-2 text-emerald-50 font-bold outline-none focus:border-emerald-500 text-xs"
                                    value={item.price}
                                    onChange={(e) => {
                                      const items = [
                                        ...editingServer.store.items,
                                      ];
                                      items[i].price = Number(e.target.value);
                                      setEditingServer({
                                        ...editingServer,
                                        store: {
                                          ...editingServer.store,
                                          items,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1 mb-4">
                                <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">
                                  Descrição Pequena
                                </label>
                                <input
                                  className="w-full bg-black/40 border border-emerald-900/50 rounded-lg px-3 py-2 text-emerald-50 font-bold outline-none focus:border-emerald-500 text-xs"
                                  value={item.description || ""}
                                  onChange={(e) => {
                                    const items = [
                                      ...editingServer.store.items,
                                    ];
                                    items[i].description = e.target.value;
                                    setEditingServer({
                                      ...editingServer,
                                      store: { ...editingServer.store, items },
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">
                                  Comandos Executados (1 por linha, use{" "}
                                  {"{player}"})
                                </label>
                                <textarea
                                  className="w-full bg-black/40 border border-emerald-900/50 rounded-lg px-3 py-2 text-emerald-50 font-mono outline-none focus:border-emerald-500 text-xs h-20 custom-scrollbar"
                                  value={(item.commands || []).join("\n")}
                                  onChange={(e) => {
                                    const items = [
                                      ...editingServer.store.items,
                                    ];
                                    items[i].commands =
                                      e.target.value.split("\n");
                                    setEditingServer({
                                      ...editingServer,
                                      store: { ...editingServer.store, items },
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-emerald-950/40 border-t border-emerald-900/50 flex gap-4">
                  <button
                    onClick={() => setEditingServer(null)}
                    className="flex-1 bg-emerald-950 text-emerald-500 font-black py-4 rounded-2xl transition-all hover:bg-emerald-900"
                  >
                    FECHAR
                  </button>
                  {editTab === "general" && (
                    <>
                      <button
                        onClick={() => {
                          setEditingServer(null);
                          setShowDeleteConfirm(true);
                        }}
                        disabled={serverState.status !== "offline"}
                        className="flex-none bg-red-950 hover:bg-red-900 text-red-500 hover:text-white font-black py-4 px-6 rounded-2xl shadow-lg border-b-4 border-red-900 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
                        title={
                          serverState.status !== "offline"
                            ? "Desligue o servidor primeiro"
                            : "Excluir Servidor"
                        }
                      >
                        <Trash2 size={24} />
                      </button>
                      <button
                        onClick={handleUpdateServerConfig}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg border-b-4 border-emerald-800 transition-all active:scale-95"
                      >
                        SALVAR ALTERAÇÕES
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {isHibernating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-emerald-900/50 shadow-2xl flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-emerald-950 rounded-full flex items-center justify-center text-emerald-500 relative">
                  <Moon size={48} fill="currentColor" />
                  <div className="absolute -top-4 -right-4 flex flex-col gap-1 font-black text-emerald-400">
                    <span className="animate-bounce delay-75">Z</span>
                    <span className="animate-bounce delay-150 ml-2">z</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-black text-emerald-50 text-xl tracking-tighter uppercase">
                    {t("hibernation_title")}
                  </p>
                  <p className="text-emerald-500 font-bold text-sm tracking-widest uppercase mt-1">
                    {t("hibernation_desc")}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorations Section */}
        <div className="fixed top-20 right-10 text-emerald-900/10 -z-10 animate-bounce cursor-default">
          <Sparkles size={120} />
        </div>

        {/* Creepers de Papel Enfeite */}
        <CreeperPaper className="top-40 left-10 rotate-[-15deg] blur-[1px]" />
        <CreeperPaper className="bottom-40 left-20 rotate-[15deg] scale-75 blur-[2px]" />
        <CreeperPaper className="top-1/4 right-2 rotate-[45deg] scale-50 opacity-10" />

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 relative">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 bg-emerald-950 rounded-3xl border border-emerald-500/30 flex items-center justify-center relative shadow-sm transition-all"
            >
              <div className="w-16 h-12 flex flex-col gap-2">
                <div className="flex justify-between px-1">
                  <div className="w-4 h-4 bg-black rounded-sm" />
                  <div className="w-4 h-4 bg-black rounded-sm" />
                </div>
                <div
                  className="w-7 h-7 bg-black mx-auto"
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 100% 100%, 70% 100%, 70% 50%, 30% 50%, 30% 100%, 0% 100%)",
                  }}
                />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-400 text-white">
                <Check size={20} />
              </div>
            </motion.div>

            <div>
              <h1 className="text-5xl font-black tracking-tighter flex items-center gap-2 italic">
                PAPER<span className="text-emerald-500">CREEPER</span>{" "}
                <Sparkles
                  className="text-emerald-500 animate-pulse"
                  size={32}
                />
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p
                  className={`font-black tracking-[0.3em] text-[9px] px-3 py-1 rounded-full w-fit shadow-sm uppercase border ${theme === "dark" ? "bg-emerald-950/50 text-emerald-500/60 border-emerald-900/50" : "bg-zinc-200 text-emerald-700 border-zinc-300"}`}
                >
                  {t("panel_active")} (•◡•)
                </p>
                <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 animate-pulse">
                  <Cpu size={10} /> LINUX PRO
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 px-4 rounded-full shadow-sm border border-emerald-900/50 transition-all hover:bg-black/60 group">
            <div className="flex flex-col items-start">
              <div className="text-[7px] font-black text-emerald-500/40 uppercase tracking-[0.2em] mb-0.5 group-hover:text-emerald-500/80 transition-colors truncate max-w-[150px]">
                {currentServerId
                  ? servers.find((s) => s.id === currentServerId)?.name ||
                    t("server_default_name")
                  : t("select_server_hint")}
              </div>
              <div
                className={`px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest border transition-all ${getStatusBubble()}`}
              >
                {t(`server_${serverState.status}`)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-4 relative flex-1">
          {/* Links Sidebar */}
          <div className="order-1 lg:col-span-3 space-y-6 lg:pr-2 h-auto lg:h-full flex flex-col">
            <div
              className={`border-2 rounded-3xl p-4 lg:p-6 shadow-sm space-y-4 lg:space-y-5 flex-shrink-0 ${theme === "dark" ? "bg-black/40 backdrop-blur-md border-emerald-900" : "bg-white border-zinc-200"}`}
            >
              <div className="hidden lg:flex text-[9px] font-black text-emerald-400 uppercase tracking-[0.25em] items-center gap-2">
                <Star size={12} fill="currentColor" /> {t("menu_magic")}
              </div>
              <nav className="flex lg:flex-col flex-wrap gap-2 lg:gap-0 lg:space-y-1 pb-2 lg:pb-0">
                <MenuLink
                  icon={<Server size={20} />}
                  label={t("servers")}
                  active={activeTab === "servers"}
                  onClick={() => setActiveTab("servers")}
                />
                <MenuLink
                  icon={<Globe size={20} />}
                  label={t("playit_title")}
                  active={activeTab === "playit"}
                  onClick={() => setActiveTab("playit")}
                />
                <MenuLink
                  icon={<Terminal size={20} />}
                  label={t("terminal")}
                  active={activeTab === "console"}
                  onClick={() => setActiveTab("console")}
                />
                {modules.ai && (
                  <>
                    <MenuLink
                      icon={<Bot size={20} />}
                      label={t("ai_assistant")}
                      active={activeTab === "ai"}
                      onClick={() => setActiveTab("ai")}
                    />
                    <MenuLink
                      icon={<Code size={20} />}
                      label="Criador de Scripts"
                      active={activeTab === "plugin-factory"}
                      onClick={() => setActiveTab("plugin-factory")}
                    />
                  </>
                )}
                {modules.map && (
                  <MenuLink
                    icon={<Map size={20} />}
                    label={t("map_editor")}
                    active={activeTab === "map"}
                    onClick={() => setActiveTab("map")}
                  />
                )}
                {modules.store && (
                  <MenuLink
                    icon={<Store size={20} />}
                    label={t("internal_store")}
                    active={activeTab === "store"}
                    onClick={() => setActiveTab("store")}
                  />
                )}
                <MenuLink
                  icon={<Settings size={20} />}
                  label={t("settings")}
                  active={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                />
              </nav>
            </div>
          </div>

          {/* Main Display Area */}
          <div className="order-2 lg:order-none col-span-1 lg:col-span-9 h-full lg:pr-2 relative">
            
            {activeTab !== "ai" && modules.ai && (
              <button
                onClick={() => setActiveTab("ai")}
                className="absolute z-50 bottom-6 right-6 lg:bottom-12 lg:right-12 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl border-4 border-emerald-900 transition-all active:scale-95 flex items-center gap-3 animate-pulse group"
                title="Perguntar para a IA"
              >
                <Bot size={28} />
                <span className="hidden group-hover:block font-black uppercase tracking-widest text-[9px] mr-2">I.A Assist</span>
              </button>
            )}

            <AnimatePresence mode="wait">
              {activeTab === "servers" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-black/40 backdrop-blur-md border border-emerald-900/50 rounded-3xl shadow-sm p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-black text-white tracking-tighter flex items-center gap-3">
                        <Server className="text-emerald-400" /> Servidores
                      </h3>
                      <div className="px-4 py-1.5 bg-emerald-900/50 rounded-full border border-emerald-500/30 text-emerald-400 font-black text-[9px] uppercase tracking-widest shadow-sm">
                        {servers.length} Criados (•◡•)
                      </div>
                    </div>

                    <div className="space-y-4">
                      {servers.map((srv) => (
                        <div
                          key={srv.id}
                          className={`p-6 rounded-[2rem] border-4 transition-all cursor-pointer shadow-sm hover:shadow-xl ${currentServerId === srv.id ? "bg-emerald-900/20 border-emerald-500" : "bg-black/20 border-zinc-900 border-opacity-50 hover:border-emerald-900/50"}`}
                          onClick={() => setCurrentServerId(srv.id)}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-transform ${currentServerId === srv.id ? "bg-emerald-500 border-emerald-400 rotate-3" : "bg-zinc-800 border-zinc-700"}`}
                              >
                                <Server size={32} className="text-white" />
                              </div>
                              <div className="min-w-0">
                                <h4
                                  className={`text-xl font-black tracking-tight truncate ${currentServerId === srv.id ? "text-white" : "text-emerald-50/80"}`}
                                >
                                  {srv.name}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-[9px] font-black text-emerald-400 bg-black/40 px-2 py-0.5 rounded-full border border-emerald-950 uppercase tracking-tighter">
                                    {srv.id}
                                  </span>
                                  {srv.type && (
                                    <span className="text-[9px] font-black text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800 uppercase tracking-tighter">
                                      {srv.type} {srv.version}
                                    </span>
                                  )}
                                  <span className="text-[9px] font-black text-emerald-400 bg-black/40 px-2 py-0.5 rounded-full border border-emerald-950 uppercase tracking-tighter">
                                    {srv.ram}GB RAM
                                  </span>
                                  {currentServerId === srv.id && (
                                    <>
                                      <span className="text-[9px] font-black text-emerald-400 bg-black/40 px-2 py-0.5 rounded-full border border-emerald-950 uppercase tracking-tighter font-mono">
                                        {serverState.status}
                                      </span>
                                      {serverState.activeJava && (
                                        <span className="text-[9px] font-black text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800 uppercase tracking-tighter">
                                          {t("java_active_tag")}: {serverState.activeJava}
                                        </span>
                                      )}
                                      {serverState.config && (
                                        <span className="text-[9px] font-black text-emerald-400 bg-black/40 px-2 py-0.5 rounded-full border border-emerald-950 uppercase tracking-tighter">
                                          {serverState.config.ram}GB RAM
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 ml-auto">
                              {currentServerId === srv.id && (
                                <>
                                  <button
                                    onClick={() => setActiveTab("console")}
                                    className="w-10 h-10 bg-emerald-950 border border-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-500 hover:border-emerald-500 hover:text-white transition-all shadow-md active:scale-95"
                                    title="Console"
                                  >
                                    <Terminal size={18} />
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentServerId(srv.id);
                                        setActiveTab("files");
                                      }}
                                      className="w-10 h-10 bg-emerald-950 border border-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-500 hover:border-emerald-500 hover:text-white transition-all shadow-md active:scale-95"
                                      title="Arquivos"
                                    >
                                      <Database size={18} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingServer({
                                          id: srv.id,
                                          name: srv.name,
                                          ram: srv.ram || 2,
                                          minRam: srv.minRam || 1,
                                          store: srv.store || {
                                            name: "",
                                            color: "#10b981",
                                            items: [],
                                          },
                                        });
                                      }}
                                      className="w-10 h-10 bg-emerald-950 border border-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-500 hover:border-emerald-500 hover:text-white transition-all shadow-md active:scale-95"
                                      title="Ajustes"
                                    >
                                      <Settings size={18} />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        if (
                                          serverState.status === "starting" ||
                                          serverState.status === "stopping"
                                        )
                                          return;
                                        handleAction(
                                          serverState.status === "online"
                                            ? "stop"
                                            : "start",
                                        );
                                      }}
                                      disabled={
                                        serverState.status === "starting" ||
                                        serverState.status === "stopping"
                                      }
                                      className={`px-6 h-10 rounded-xl font-black text-[11px] text-white transition-all shadow-lg active:scale-95 border-b-4 ${
                                        serverState.status === "online"
                                          ? "bg-red-600 border-red-800 hover:bg-red-500"
                                          : serverState.status === "offline"
                                            ? "bg-emerald-600 border-emerald-800 hover:bg-emerald-500"
                                            : "bg-zinc-700 border-zinc-900 animate-pulse cursor-wait"
                                      }`}
                                    >
                                      {serverState.status === "online"
                                        ? "STOP"
                                        : serverState.status === "offline"
                                          ? "START"
                                          : serverState.status.toUpperCase()}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full p-6 border-2 border-dashed border-emerald-900 rounded-[2rem] text-center hover:bg-emerald-950/30 hover:border-emerald-500 transition-all group flex items-center justify-center gap-4"
                      >
                        <div className="w-10 h-10 bg-emerald-950 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform border border-emerald-900">
                          <Play size={20} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-black text-white text-sm uppercase italic tracking-tighter">
                            CRIAR NOVO SERVIDOR
                          </p>
                          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">
                            Uma nova aventura te espera!
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Infos redundantes removidas */}
                </motion.div>
              )}

              {activeTab === "playit" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-black/40 backdrop-blur-md border border-emerald-900/50 rounded-3xl shadow-sm p-4 sm:p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
                >
                  <Globe
                    size={64}
                    className="text-emerald-500 mb-4 opacity-80 animate-pulse"
                  />
                  <h3 className="text-base font-black text-white tracking-tighter mb-4 text-center uppercase">
                    Playit.gg
                  </h3>
                  <p className="text-emerald-500 font-bold mb-4 text-center max-w-lg leading-relaxed mix-blend-screen text-[9px] sm:text-xs uppercase tracking-widest hidden sm:block">
                    Túnel de rede público e global.
                    <br />
                    Ative para expor as portas dos seus servidores online sem
                    configurar roteador.
                  </p>

                  <div className="flex flex-col items-center gap-4 w-full max-w-md">
                    <button
                      disabled={!!playitLoading}
                      onClick={async () => {
                        setPlayitLoading(
                          playitStatus.running ? "stop" : "start",
                        );
                        if (playitStatus.running) {
                          await fetch("/api/playit/stop", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({}),
                          });
                        } else {
                          await fetch("/api/playit/start", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({}),
                          });
                        }
                        setPlayitLoading(null);
                      }}
                      className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase shadow-lg transition-transform active:scale-95 border-b-4 ${playitLoading ? "opacity-50 cursor-not-allowed " : ""}${playitStatus.running ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-900/50" : "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border-emerald-700"}`}
                    >
                      {playitLoading === "start" || playitLoading === "stop" ? (
                        <RefreshCw className="animate-spin" size={18} />
                      ) : (
                        <Power size={18} />
                      )}
                      {playitLoading === "start"
                        ? "Ligando..."
                        : playitLoading === "stop"
                          ? "Desligando..."
                          : playitStatus.running
                            ? "Desligar Agente"
                            : "Ligar Agente Playit"}
                    </button>

                    <div className="flex w-full gap-4">
                      <button
                        disabled={!!playitLoading}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setPlayitLoading("reset");
                          await fetch("/api/playit/reset", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({}),
                          });
                          setPlayitLoading(null);
                        }}
                        className={`flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase rounded-xl transition-all border border-zinc-800 shadow-md ${playitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {playitLoading === "reset" ? "Resetando..." : "Resetar"}
                      </button>

                      {playitStatus.installed ? (
                        <>
                          <button
                            disabled={!!playitLoading}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setPlayitLoading("update");
                              await fetch("/api/playit/update", {
                                method: "POST",
                              });
                              setPlayitLoading(null);
                            }}
                            className={`flex-1 py-3 bg-blue-900/50 hover:bg-blue-800 text-blue-400 font-bold text-xs uppercase rounded-xl transition-all border border-blue-900 shadow-md ${playitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {playitLoading === "update"
                              ? "Atualizando..."
                              : "Atualizar"}
                          </button>
                          <button
                            disabled={!!playitLoading}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setPlayitLoading("uninstall");
                              await fetch("/api/playit/uninstall", {
                                method: "POST",
                              });
                              setPlayitStatus((prev) => ({
                                ...prev,
                                installed: false,
                                running: false,
                              }));
                              setPlayitLoading(null);
                            }}
                            className={`flex-1 py-3 bg-rose-900/50 hover:bg-rose-800 text-rose-400 font-bold text-xs uppercase rounded-xl transition-all border border-rose-900 shadow-md ${playitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {playitLoading === "uninstall"
                              ? "Desinstalando..."
                              : "Desinstalar"}
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={!!playitLoading}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setPlayitLoading("install");
                            await fetch("/api/playit/install", {
                              method: "POST",
                            });
                            setPlayitStatus((prev) => ({
                              ...prev,
                              installed: true,
                            }));
                            setPlayitLoading(null);
                          }}
                          className={`flex-1 py-3 flex justify-center items-center gap-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-400 font-bold text-xs uppercase rounded-xl transition-all border border-emerald-900 shadow-md ${playitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {playitLoading === "install" && (
                            <RefreshCw size={14} className="animate-spin" />
                          )}
                          {playitLoading === "install"
                            ? "Instalando..."
                            : "Instalar"}
                        </button>
                      )}
                    </div>

                    {!playitStatus.running ? (
                      <div className="w-full mt-4 p-5 bg-black/40 border-2 border-zinc-900/80 rounded-2xl text-center">
                        <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">
                          Status
                        </p>
                        <div className="text-zinc-600 font-bold text-xs uppercase tracking-widest">
                          Offline
                        </div>
                      </div>
                    ) : (
                      <div className="w-full mt-4 p-5 bg-black/40 border border-emerald-900/50/40 rounded-2xl text-center">
                        <p className="text-[9px] text-emerald-500/50 mb-3 font-black tracking-widest uppercase">
                          Status do Único Túnel
                        </p>

                        {playitStatus.linked ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center p-3 bg-emerald-950/40 rounded-xl border border-emerald-900">
                              <span className="font-bold text-emerald-400 text-[9px] sm:text-xs tracking-widest uppercase">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 size={14} /> Conta Vinculada com
                                  Sucesso
                                </div>
                              </span>
                            </div>
                            <p className="text-[9px] text-emerald-600 font-bold max-w-sm mx-auto leading-relaxed">
                              Acesse playit.gg para configurar seus túneis. O
                              Playit roteará o tráfego automaticamente para este
                              PC.
                            </p>
                            {playitStatus.tunnel ? (
                              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex justify-between items-center px-4">
                                <span className="text-zinc-300 font-mono text-xs font-bold">
                                  {playitStatus.tunnel}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      playitStatus.tunnel || "",
                                    );
                                    alert("IP copiado! (•◡•)");
                                  }}
                                  className="text-emerald-500 hover:text-emerald-400"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-900/20 rounded-xl border border-amber-900/50 flex flex-col px-4 text-center mt-2 cursor-pointer hover:bg-amber-900/40 transition-all" onClick={() => window.open("https://playit.gg/account", "_blank")}>
                                 <span className="text-amber-500 font-mono text-[9px] font-bold">
                                   AGUARDANDO ENDEREÇO IP...
                                 </span>
                                 <span className="text-zinc-400 text-[9px] mt-1 leading-relaxed">Playit conectado. Pode demorar alguns segundos. <span className="text-amber-400 underline">Clique aqui</span> para verificar no painel da Playit.gg se ele não aparecer.</span>
                              </div>
                            )}
                          </div>
                        ) : playitStatus.claimUrl ? (
                          <div className="space-y-3">
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                              Conta Playit.gg pendente
                            </p>
                            <a
                              href={playitStatus.claimUrl}
                              target="_blank"
                              className="block text-center py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] sm:text-xs uppercase rounded-xl shadow-lg border-b-4 border-emerald-800"
                            >
                              Vincular Conta Playit Agora
                            </a>
                          </div>
                        ) : (
                          <div className="text-emerald-500/60 font-bold text-xs flex justify-center items-center gap-2 uppercase tracking-widest">
                            <RefreshCw size={14} className="animate-spin" />{" "}
                            Verificando conexão...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "map" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-black/40 backdrop-blur-md border border-emerald-900/50 rounded-3xl shadow-sm p-4 sm:p-6 relative flex flex-col items-center w-full h-full max-h-[85vh] overflow-y-auto custom-scrollbar"
                >
                  <Map size={48} className="text-emerald-500 mb-4 opacity-80 shrink-0 mt-4" />
                  <h3 className="text-base font-black text-white tracking-tighter mb-2 text-center uppercase shrink-0">
                    {t("map_editor_title")}
                  </h3>
                  <p className="text-emerald-500 font-bold mb-4 text-center max-w-lg leading-relaxed mix-blend-screen text-[9px] uppercase tracking-widest hidden sm:block shrink-0">
                    {t("map_editor_desc")}
                  </p>

                  <div className={`flex flex-col items-center gap-4 w-full ${showEditor3D || showBlueMap ? 'max-w-full' : 'max-w-4xl'} shrink-0`}>
                    <div className="flex flex-wrap justify-center gap-2 w-full">
                      <button
                        onClick={() => {
                          if (!currentServerId)
                            return alert("Selecione um servidor primeiro!");
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".zip,.schematic,.schem";
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            let targetFolder = "";
                            if (
                              file.name.endsWith(".schem") ||
                              file.name.endsWith(".schematic")
                            ) {
                              targetFolder = "plugins/WorldEdit/schematics";
                            }

                            await uploadMultipleFiles(
                              [file],
                              currentServerId,
                              targetFolder,
                            );
                            alert("Mapa/Schematic enviado com sucesso!");
                          };
                          input.click();
                        }}
                        className="px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-black text-[9px] uppercase shadow-md transition-transform active:scale-95 border-b-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border-emerald-700"
                      >
                        <UploadCloud size={12} /> {t("map_upload_zip")}
                      </button>

                      <button
                        onClick={() => setShowBlueMap(!showBlueMap)}
                        className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-black text-[9px] uppercase shadow-md transition-transform active:scale-95 border-b-2 ${showBlueMap ? 'bg-red-600 hover:bg-red-500 border-red-800' : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800'} text-white`}
                      >
                        <Globe size={12} /> {showBlueMap ? "Fechar Web (BlueMap)" : "Abrir Web (BlueMap)"}
                      </button>

                      <button
                        onClick={() => setShowEditor3D(!showEditor3D)}
                        className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-black text-[9px] uppercase shadow-md transition-transform active:scale-95 border-b-2 ${showEditor3D ? 'bg-red-600 hover:bg-red-500 border-red-800' : 'bg-purple-600 hover:bg-purple-500 border-purple-800'} text-white`}
                      >
                        <Box size={12} /> {showEditor3D ? "Fechar MCEdit (3D Web)" : "Abrir MCEdit (3D Web)"}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("store");
                          setEditTab("plugins");
                          setStoreFolder("plugins");
                          setStoreSearch("bluemap");
                          searchStore("bluemap");
                          setEditingServer(servers.find(s => s.id === currentServerId) || null);
                        }}
                        className="px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-black text-[9px] uppercase shadow-md transition-transform active:scale-95 border-b-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 border-zinc-950"
                      >
                        <RefreshCw size={12} /> Engine Mods
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("files");
                          setCurrentFolder("plugins/WorldEdit/schematics");
                        }}
                        className="px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-black text-[9px] uppercase shadow-md transition-transform active:scale-95 border-b-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-950"
                      >
                        <Folder size={12} /> Schematics
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("files");
                          setCurrentFolder("");
                        }}
                        className="px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-black text-[9px] uppercase shadow-md transition-transform active:scale-95 border-b-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-950"
                      >
                        <Map size={12} /> Worlds
                      </button>
                    </div>

                    {showBlueMap && (
                      <div className="w-full mt-4 bg-black/60 border-4 border-emerald-900 rounded-[2rem] overflow-hidden flex flex-col transition-all relative">
                         <div className="bg-emerald-950 px-4 py-2 flex items-center justify-between border-b-2 border-emerald-900">
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">MAP ENGINE (WEB)</span>
                           <a href={`http://${window.location.hostname}:8100/`} target="_blank" className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition flex ">ABRIR NOVO MODO TELA CHEIA</a>
                         </div>
                         
                         {/* WorldEdit Tools Toolbar */}
                         <div className="bg-black/80 px-2 py-2 flex flex-wrap gap-2 justify-center border-b border-emerald-900/50">
                            <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-black flex items-center mr-2">Ferramentas MCEdit (In-Game):</span>
                            {[
                              { label: "WAND (Machado)", cmd: "//wand" },
                              { label: "COPIAR (Clipboard)", cmd: "//copy" },
                              { label: "COLAR", cmd: "//paste" },
                              { label: "DESFAZER", cmd: "//undo" },
                              { label: "LIMPAR (Set 0)", cmd: "//set 0" }
                            ].map(tool => (
                              <button 
                                key={tool.cmd}
                                onClick={async () => {
                                  if (!currentServerId) return;
                                  try {
                                    await fetch("/api/server/command", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ serverId: currentServerId, command: tool.cmd })
                                    });
                                    alert(`Comando ${tool.cmd} enviado para o jogador!`);
                                  } catch (e) {}
                                }}
                                className="bg-zinc-800 hover:bg-emerald-700 hover:text-white px-2 py-1 rounded text-[9px] font-bold uppercase transition text-emerald-500 border border-emerald-900"
                              >
                                {tool.label}
                              </button>
                            ))}
                         </div>

                         <iframe 
                           src={`http://${window.location.hostname}:8100/`} 
                           className="w-full h-[60vh] min-h-[500px] border-none bg-zinc-950" 
                           title="BlueMap Frame"
                           sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                         />
                      </div>
                    )}

                    {showEditor3D && (
                      <div className="w-full mt-4 min-h-[600px] flex flex-col">
                         <MapEditor3D serverId={currentServerId} />
                      </div>
                    )}

                    <div className="w-full mt-4 p-6 bg-black/40 border border-emerald-900/50/40 rounded-2xl shrink-0">
                      <p className="text-[12px] text-emerald-500 font-black tracking-widest uppercase mb-4 text-center">
                        {t("map_protector_title")}
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] uppercase font-black tracking-widest text-emerald-600 block mb-2 px-1">
                            {t("map_region_label")}
                          </label>
                          <input
                            value={mapRegion}
                            onChange={(e) => setMapRegion(e.target.value)}
                            className="w-full bg-emerald-950/20 border border-emerald-900/50/50 p-4 rounded-xl text-emerald-400 text-xs font-black uppercase focus:border-emerald-500 transition outline-none"
                            placeholder="NOME_DA_REGIAO (EX: SPAWN, VIP_ZONE)"
                          />
                        </div>
                        <p className="text-emerald-500/50 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                          {t("map_region_tip").replace(
                            "{mapRegion}",
                            mapRegion,
                          )}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <button
                            onClick={async () => {
                              if (!currentServerId)
                                return alert("Selecione ou inicie o servidor!");
                              await fetch("/api/server/command", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  command: `rg flag ${mapRegion} pvp deny`,
                                  serverId: currentServerId,
                                }),
                              });
                              alert("Permissão aplicada!");
                            }}
                            className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 p-4 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-800 transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Shield size={14} /> {t("map_no_pvp")}
                          </button>
                          <button
                            onClick={async () => {
                              if (!currentServerId)
                                return alert("Selecione ou inicie o servidor!");
                              await fetch("/api/server/command", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  command: `rg flag ${mapRegion} build deny`,
                                  serverId: currentServerId,
                                }),
                              });
                              alert("Permissão aplicada!");
                            }}
                            className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 p-4 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-800 transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Hammer size={14} /> {t("map_no_build")}
                          </button>
                          <button
                            onClick={async () => {
                              if (!currentServerId)
                                return alert("Selecione ou inicie o servidor!");
                              await fetch("/api/server/command", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  command: `rg flag ${mapRegion} mob-spawning deny`,
                                  serverId: currentServerId,
                                }),
                              });
                              alert("Permissão aplicada!");
                            }}
                            className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 p-4 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-800 transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Skull size={14} /> {t("map_no_mobs")}
                          </button>
                          <button
                            onClick={async () => {
                              if (!currentServerId)
                                return alert("Selecione ou inicie o servidor!");
                              await fetch("/api/server/command", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  command: `rg flag ${mapRegion} invincible allow`,
                                  serverId: currentServerId,
                                }),
                              });
                              alert("Permissão aplicada!");
                            }}
                            className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 p-4 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-800 transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Heart size={14} /> {t("map_immortal")}
                          </button>
                          <button
                            onClick={async () => {
                              if (!currentServerId)
                                return alert("Selecione ou inicie o servidor!");
                              await fetch("/api/server/command", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  command: `rg flag ${mapRegion} interact allow`,
                                  serverId: currentServerId,
                                }),
                              });
                              alert("Permissão aplicada!");
                            }}
                            className="col-span-2 bg-emerald-900/30 border border-emerald-800 text-emerald-400 p-4 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-800 transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Hand size={14} /> {t("map_allow_interact")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "store" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-black/40 backdrop-blur-md border border-emerald-900/50 rounded-3xl shadow-sm p-4 sm:p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
                >
                  <Store
                    size={64}
                    className="text-emerald-500 mb-4 opacity-80"
                  />
                  <h3 className="text-base font-black text-white tracking-tighter mb-4 text-center uppercase">
                    {t("store_editor_title") || "Gerenciador de Lojas"}
                  </h3>
                  <p className="text-emerald-500 font-bold mb-4 text-center max-w-lg leading-relaxed mix-blend-screen text-[9px] sm:text-xs uppercase tracking-widest hidden sm:block">
                    {t("store_editor_desc") ||
                      "Crie sua própria loja Skript 100% customizada ou gerencie plugins de Lojas NPC / GUI nativos."}
                  </p>

                  <div className="flex flex-col items-center gap-4 w-full max-w-lg">
                    <button
                      onClick={() => {
                        const prompt = window.prompt(
                          "Descreva a sua loja (Ex: Loja de Vips, Loja de Blocos, NPCs que vendem espadas):",
                          "Quero uma loja GUI simples que venda pedra por $10",
                        );
                        if (!prompt) return;

                        setAiInput(
                          `Crie um plugin Skript para uma Loja In-Game com as seguintes características: ${prompt}. O código DEVE estar em um bloco \`\`\`skript ... \`\`\`. O Skript deve usar um menu GUI e ter economia básica.`,
                        );
                        setActiveTab("ai");
                      }}
                      className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase shadow-lg transition-transform active:scale-95 border-b-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border-emerald-700"
                    >
                      <Sparkles size={18} />{" "}
                      {t("store_generate_skript") ||
                        "Gerar Loja Skript In-Game (IA)"}
                    </button>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button
                        onClick={() => {
                          setActiveTab("store");
                          setStoreSearch("Shopkeepers");
                        }}
                        className="w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2 font-black text-[9px] uppercase shadow-lg transition-transform active:scale-95 border-b-4 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-950"
                      >
                        <Users size={16} /> {t("store_npc_shopkeepers")}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("store");
                          setStoreSearch("EconomyShopGUI");
                        }}
                        className="w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2 font-black text-[9px] uppercase shadow-lg transition-transform active:scale-95 border-b-4 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-950"
                      >
                        <Store size={16} /> {t("store_gui_economy")}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("store");
                          setStoreSearch("Citizens");
                        }}
                        className="col-span-2 w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2 font-black text-[9px] uppercase shadow-lg transition-transform active:scale-95 border-b-4 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-950"
                      >
                        <Bot size={16} /> {t("store_npc_commands")}
                      </button>
                    </div>

                    <div className="w-full mt-4 p-5 bg-black/40 border border-emerald-900/50/40 rounded-2xl text-center">
                      <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">
                        {t("store_status_help")}
                      </p>
                      <div className="text-zinc-600 font-normal text-xs leading-relaxed max-w-md mx-auto">
                        {t("store_help_desc")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "plugin-factory" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/40 backdrop-blur-md backdrop-blur-md rounded-3xl border border-emerald-900/50 shadow-sm p-4 lg:p-6 min-h-[600px] lg:min-h-0 h-full flex flex-col relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-emerald-900/50 rounded-2xl border border-emerald-500/30 text-emerald-400">
                      <Code size={32} />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white tracking-tighter italic uppercase">
                        {t("script_builder_title") || "Fábrica de Scripts"}
                      </h2>
                      <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-1">
                        {t("script_builder_desc") || "I.A. SKRIPT BUILDER (•◡•)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4 min-h-0">
                    <div className="flex flex-col gap-2">
                       <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest pl-2">{t("script_builder_input_label") || "Descreva a ideia do Script"}</label>
                       <textarea
                         value={pluginDescription}
                         onChange={(e) => setPluginDescription(e.target.value)}
                         placeholder="Ex: Quero um sistema onde se o jogador quebrar terra, ele tem 5% de chance de ganhar um dima..."
                         className="w-full bg-black/40 border border-emerald-900 rounded-2xl p-4 text-emerald-100 placeholder:text-emerald-900/50 font-medium resize-none focus:outline-none focus:border-emerald-500 min-h-[120px]"
                       />
                    </div>
                    <div className="flex items-center justify-between">
                       <p className="text-xs font-mono text-emerald-500/70">{pluginGenStatus}</p>
                       <button
                         onClick={handleGeneratePlugin}
                         disabled={isGeneratingPlugin || !pluginDescription.trim()}
                         className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex hidden-sm items-center gap-2"
                       >
                         {isGeneratingPlugin ? (
                           <><RefreshCw size={16} className="animate-spin" /> {t("script_builder_btn_loading") || "Gerando..."}</>
                         ) : (
                           <><Sparkles size={16} /> {t("script_builder_btn_generate") || "Criar Script Automático"}</>
                         )}
                       </button>
                    </div>

                    {pluginCode && (
                      <div className="flex-1 flex flex-col gap-2 min-h-0 mt-4 border-t border-emerald-900/50 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest pl-2">Código Gerado</label>
                          <button
                            onClick={handleSavePlugin}
                            className="px-4 py-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 border border-emerald-800"
                          >
                            <Save size={14} /> {t("script_builder_save_btn") || "Salvar e Injetar no Servidor"}
                          </button>
                        </div>
                        <textarea
                          value={pluginCode}
                          onChange={(e) => setPluginCode(e.target.value)}
                          className="flex-1 w-full bg-black/60 border border-emerald-900 rounded-2xl p-4 text-emerald-50 font-mono text-xs resize-none focus:outline-none focus:border-emerald-500 custom-scrollbar"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-3xl border-2 shadow-sm p-4 lg:p-6 min-h-[600px] lg:min-h-0 h-full flex flex-col relative overflow-hidden ${theme === "dark" ? "bg-black/40 backdrop-blur-md border-emerald-900" : "bg-white border-zinc-200"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-950/20 rounded-lg text-emerald-500">
                      <Settings size={18} />
                    </div>
                    <div>
                      <h2
                        className={`text-base font-black tracking-tighter italic uppercase ${theme === "dark" ? "text-white" : "text-emerald-950"}`}
                      >
                        {t("settings_title")}
                      </h2>
                      <p className="text-emerald-500 text-[8px] font-bold uppercase tracking-widest leading-none mt-1">
                        {t("settings_sub")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 z-10 w-full max-w-2xl mx-auto">
                    <section className="space-y-1.5 flex flex-col">
                      <h4 className="text-[8px] font-black text-emerald-600/80 uppercase tracking-widest flex items-center gap-1.5">
                        <Languages size={10} /> {t("select_lang")}
                      </h4>
                      <div className="flex gap-1.5 h-6">
                        <button
                          onClick={() => setLanguage("en")}
                          className={`flex-1 rounded font-black text-[8px] transition-all border ${language === "en" ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/10 border-emerald-950/20 text-emerald-900/50 hover:border-emerald-500"}`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setLanguage("pt")}
                          className={`flex-1 rounded font-black text-[8px] transition-all border ${language === "pt" ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/10 border-emerald-950/20 text-emerald-900/50 hover:border-emerald-500"}`}
                        >
                          PT-BR
                        </button>
                      </div>
                    </section>

                    <section className="space-y-1.5 flex flex-col">
                      <h4 className="text-[8px] font-black text-emerald-600/80 uppercase tracking-widest flex items-center gap-1.5">
                        <Palette size={10} /> {t("select_theme")}
                      </h4>
                      <div className="flex gap-1.5 h-6">
                        <button
                          onClick={() => setTheme("dark")}
                          className={`flex-1 rounded font-black text-[8px] transition-all border flex items-center justify-center gap-1.5 ${theme === "dark" ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/10 border-emerald-950/20 text-emerald-900/50 hover:border-emerald-500"}`}
                        >
                          <Moon size={8} /> Escuro
                        </button>
                        <button
                          onClick={() => setTheme("light")}
                          className={`flex-1 rounded font-black text-[8px] transition-all border flex items-center justify-center gap-1.5 ${theme === "light" ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/10 border-emerald-950/20 text-emerald-900/50 hover:border-emerald-500"}`}
                        >
                          <Sun size={8} /> Claro
                        </button>
                      </div>
                    </section>

                    {/* Modules Toggles */}
                    <section className="space-y-1 col-span-1 md:col-span-2">
                      <h4 className="text-[8px] font-black text-emerald-600/80 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                        <Power size={8} /> Módulos Cloud
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => setModules((m) => ({ ...m, ai: !m.ai }))} className={`px-2 py-1 rounded flex items-center gap-1 font-bold text-[8px] transition-all border ${modules.ai ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/10 border-emerald-950/20 text-emerald-900/50"}`}>
                          <Bot size={8} /> Assistente IA
                        </button>
                        <button onClick={() => setModules((m) => ({ ...m, map: !m.map }))} className={`px-2 py-1 rounded flex items-center gap-1 font-bold text-[8px] transition-all border ${modules.map ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/10 border-emerald-950/20 text-emerald-900/50"}`}>
                          <Map size={8} /> Editor de Mapa
                        </button>
                        <button onClick={() => setModules((m) => ({ ...m, store: !m.store }))} className={`px-2 py-1 rounded flex items-center gap-1 font-bold text-[8px] transition-all border ${modules.store ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/10 border-emerald-950/20 text-emerald-900/50"}`}>
                          <Store size={8} /> Loja In-Game
                        </button>
                        <button onClick={() => { setModules((m) => ({ ...m, server_hibernation: !m.server_hibernation })); if (!modules.server_hibernation) setShowHibernationModal(true); }} className={`px-2 py-1 rounded flex items-center gap-1 font-bold text-[8px] transition-all border ${modules.server_hibernation ? "bg-amber-600 border-amber-400 text-white" : "bg-black/10 border-amber-950/20 text-amber-900/50"}`}>
                          <Moon size={8} /> Hibernação
                        </button>
                      </div>

                      <h4 className="text-[8px] font-black text-blue-500/80 uppercase tracking-widest flex items-center gap-1.5 pt-1 mt-1">
                        <Globe size={8} /> Habilidades da IA
                      </h4>
                      <div className="flex flex-wrap gap-1">
                         <button onClick={() => setModules((m) => ({ ...m, ai_internet: !m.ai_internet }))} className={`px-2 py-1 rounded flex items-center gap-1 font-bold text-[8px] transition-all border ${modules.ai_internet ? "bg-blue-600 border-blue-400 text-white" : "bg-black/10 border-blue-950/20 text-blue-900/50"}`}>
                          <Globe size={8} /> Internet
                        </button>
                        <button onClick={() => setModules((m) => ({ ...m, ai_memory: !m.ai_memory }))} className={`px-2 py-1 rounded flex items-center gap-1 font-bold text-[8px] transition-all border ${modules.ai_memory ? "bg-blue-600 border-blue-400 text-white" : "bg-black/10 border-blue-950/20 text-blue-900/50"}`}>
                          <Save size={8} /> Memória
                        </button>
                         <button onClick={() => setModules((m) => ({ ...m, ai_bot: !m.ai_bot }))} className={`px-2 py-1 rounded flex items-center gap-1 font-bold text-[8px] transition-all border ${modules.ai_bot ? "bg-blue-600 border-blue-400 text-white" : "bg-black/10 border-blue-950/20 text-blue-900/50"}`}>
                          <Bot size={8} /> In-Game Bot
                        </button>
                      </div>
                    </section>

                    <section className="md:col-span-2 p-2 bg-black/10 rounded-lg border border-blue-500/10 flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-blue-500">
                          <RefreshCw size={10} className={isSystemUpdating ? "animate-spin" : ""} />
                        </div>
                        <div>
                          <h5 className="font-black text-blue-700 text-[8px] uppercase tracking-tighter">
                            {t("system_update_title")}
                          </h5>
                          <p className="text-[7px] font-bold text-blue-900/60 uppercase tracking-widest leading-none">
                            Versão: {appVersion}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (isSystemUpdating) return;
                          setIsSystemUpdating(true);
                          try {
                            const res = await fetch("/api/system/update", { method: "POST" });
                            if (res.ok) {
                              alert("Atualizando... O sistema irá reiniciar.");
                              setTimeout(() => window.location.reload(), 5000);
                            } else {
                              alert("Falha"); setIsSystemUpdating(false);
                            }
                          } catch (e) {
                            setIsSystemUpdating(false);
                          }
                        }}
                        disabled={isSystemUpdating}
                        className="font-bold text-[8px] uppercase text-white px-2 py-1 rounded border-b bg-blue-500 border-blue-700 hover:bg-blue-400 transition-all active:border-b-0"
                      >
                        {isSystemUpdating ? "Aguarde..." : "Atualizar"}
                      </button>
                    </section>

                    {appConfig && setAppConfig && (
                      <section className="md:col-span-2 p-2 bg-black/10 rounded-lg border border-fuchsia-500/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-fuchsia-500">
                              <Store size={10} />
                            </div>
                            <div>
                              <h5 className="font-black text-white text-[8px] uppercase tracking-tighter">
                                Portal Web Público
                              </h5>
                              <p className="text-[7px] font-bold text-fuchsia-400 uppercase tracking-widest leading-none mb-0.5">
                                Loja & Painel
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase flex items-center gap-1 ${appConfig.storeEnabled !== false ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                              <div
                                className={`w-1 h-1 rounded-full ${appConfig.storeEnabled !== false ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}
                              />
                              {appConfig.storeEnabled !== false
                                ? "Online"
                                : "Offline"}
                            </div>
                            <button
                              onClick={() =>
                                setAppConfig({
                                  ...appConfig,
                                  storeEnabled:
                                    appConfig.storeEnabled === false,
                                })
                              }
                              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-start rounded-full transition-all duration-300 focus:outline-none ring-1 ring-offset-1 ring-offset-black ${appConfig.storeEnabled !== false ? "bg-fuchsia-600 ring-fuchsia-500/20" : "bg-zinc-700 ring-zinc-700/20"}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out ${appConfig.storeEnabled !== false ? "translate-x-3.5" : "translate-x-0.5"}`}
                              />
                            </button>
                          </div>
                        </div>

                        {appConfig.storeEnabled !== false && (
                          <div className="px-3 py-2 bg-black/40 rounded-xl border border-fuchsia-900/50 space-y-2 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[8px] font-black uppercase text-fuchsia-400 tracking-widest flex items-center gap-1">
                                <Settings size={8} /> Configurações do Portal
                              </p>
                              <button
                                onClick={() => window.open("/site", "_blank")}
                                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded text-[8px] font-black uppercase transition-all flex items-center gap-1"
                              >
                                <ExternalLink size={8} /> Visitar Site
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">
                                  Público Alvo / Estilo
                                </label>
                                <select
                                  value={
                                    appConfig.familyMode ? "family" : "pro"
                                  }
                                  onChange={(e) =>
                                    setAppConfig({
                                      ...appConfig,
                                      familyMode: e.target.value === "family",
                                    })
                                  }
                                  className="w-full bg-zinc-900 border border-white/5 rounded-lg px-2 py-1 text-[9px] uppercase text-white font-black outline-none focus:border-fuchsia-500"
                                >
                                  <option value="family">
                                    Família (Aventura)
                                  </option>
                                  <option value="pro">
                                    Hardcore / PvP
                                  </option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-2 bg-zinc-950/50 rounded-xl border border-white/5 flex items-start gap-2">
                          <div className="mt-0.5 flex-shrink-0 bg-zinc-900 p-1.5 rounded-lg text-zinc-600 border-b border-zinc-950">
                            <Info size={10} />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                              Estimativa de Performance
                            </div>
                            <p className="text-[7px] text-zinc-500 font-medium uppercase leading-relaxed tracking-wider">
                              {appConfig.storeEnabled !== false
                                ? "Site Ativo: ~25-35MB RAM consumida. CPU oscila apenas durante acessos."
                                : "Site Offline: Modo de economia total. <2MB RAM (Apenas estáticos)."}
                            </p>
                          </div>
                        </div>
                      </section>
                    )}
                  </div>

                  <div className="mt-auto flex justify-center">
                    <CreeperPaper className="relative opacity-20 scale-150 rotate-0 bottom-0 left-0" />
                  </div>
                </motion.div>
              )}

              {activeTab === "ai" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 backdrop-blur-md backdrop-blur-md rounded-3xl border border-emerald-900/50 shadow-sm p-4 lg:p-6 min-h-[600px] lg:min-h-0 h-full flex flex-col relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-3 shrink-0">
                    <div className="p-2 bg-emerald-950/20 rounded-lg text-emerald-500">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white tracking-tighter italic uppercase">
                        Assistente
                      </h2>
                      <p className="text-emerald-500 text-[8px] font-black uppercase tracking-widest mt-0.5">
                        Inteligência Creeper (•◡•)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-3 shrink-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-black/20 p-2 rounded-xl border border-emerald-900/50">
                      <div className="flex flex-wrap gap-1 bg-emerald-950/50 p-1 rounded-lg">
                        <button
                          onClick={() => { 
                            setAiProvider("remote"); 
                            setAiChat([]); 
                            fetch("/api/ai/local", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stop" }) }).catch(() => {});
                          }}
                          className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${aiProvider === "remote" ? "bg-emerald-600 text-white shadow-md" : "text-emerald-500 hover:text-emerald-400"}`}
                        >
                          I.A Remota (Cloud)
                        </button>
                        <button
                          onClick={() => { 
                            setAiProvider("local"); 
                            setAiChat([]); 
                            fetch("/api/ai/local", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start" }) }).catch(() => {});
                          }}
                          className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${aiProvider === "local" ? "bg-emerald-600 text-white shadow-md" : "text-emerald-500 hover:text-emerald-400"}`}
                        >
                          I.A Local (PC)
                        </button>
                        <button
                          onClick={() => { 
                            setAiProvider("off"); 
                            setAiChat([]); 
                            fetch("/api/ai/local", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stop" }) }).catch(() => {});
                          }}
                          className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${aiProvider === "off" ? "bg-zinc-600 text-white shadow-md" : "text-zinc-500 hover:text-zinc-400"}`}
                        >
                          Desativar
                        </button>
                      </div>

                      {aiProvider === "remote" ? (
                        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                          {!showApiKeyInput ? (
                            <button
                              onClick={() => setShowApiKeyInput(true)}
                              className="font-black text-[9px] uppercase bg-emerald-900/60 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800 hover:bg-emerald-800 transition-all flex-1 sm:flex-none"
                            >
                              {t("ai_api_key_btn")} (Gemini / OpenAI)
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                              <input
                                type="password"
                                placeholder="Key1, Key2, Key3..."
                                value={aiKeysList}
                                onChange={(e) => {
                                   setAiKeysList(e.target.value);
                                   localStorage.setItem("creeper_ai_keys_list", e.target.value);
                                }}
                                className="bg-black/60 border border-emerald-900 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 text-xs text-emerald-100 flex-1 min-w-[200px]"
                                title="Múltiplas chaves separadas por vírgula para fallback"
                              />
                              <button
                                onClick={async () => {
                                  // As chaves já estão salvas no localStorage no onChange
                                  // Vamos também tentar salvar a primeira no backend por compatibilidade
                                  const firstKey = aiKeysList.split(",")[0]?.trim();
                                  if (firstKey && firstKey.length > 5) {
                                    await fetch("/api/config/env", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ key: firstKey }),
                                    });
                                  }
                                  alert("Chaves salvas e configuradas para o auto-fallback!");
                                  setShowApiKeyInput(false);
                                }}
                                className="font-black text-[9px] uppercase bg-emerald-600 text-white px-3 py-2 rounded-xl hover:bg-emerald-500 transition-all"
                              >
                                {t("save")}
                              </button>
                              <button
                                onClick={() => setShowApiKeyInput(false)}
                                className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : aiProvider === "local" ? (
                        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            value={aiEndpoint}
                            onChange={(e) => setAiEndpoint(e.target.value)}
                            placeholder="http://127.0.0.1:11434/v1/chat/completions"
                            className="bg-black/60 border border-emerald-900 rounded-xl px-4 py-2 text-xs text-emerald-100 outline-none focus:border-emerald-500 flex-1 min-w-[200px] w-full sm:w-auto"
                            title="Endpoint (Ex: Ollama ou LM Studio)"
                          />
                          <input
                            type="text"
                            value={aiLocalModel}
                            onChange={(e) => setAiLocalModel(e.target.value)}
                            placeholder="llama3"
                            className="bg-black/60 border border-emerald-900 rounded-xl px-4 py-2 text-xs text-emerald-100 outline-none focus:border-emerald-500 w-24 sm:w-auto"
                            title="Nome do Modelo (Ex: llama3, qwen2.5-coder)"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto px-4 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                          Assistente Desativado
                        </div>
                      )}

                      <button
                        onClick={() => setAiChat([])}
                        className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-400 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ml-auto w-full sm:w-auto mt-2 sm:mt-0"
                        title="Apagar Memória do Chat"
                      >
                        <RefreshCw size={14} /> Memória
                      </button>
                    </div>
                  </div>

                  <div
                    className="flex-1 overflow-y-auto pr-4 custom-scrollbar mb-4 space-y-4"
                    ref={scrollRef}
                    onScroll={handleScroll}
                  >
                    {aiChat.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <Bot size={64} className="mb-4 text-emerald-500" />
                        <p className="font-black italic uppercase tracking-tighter text-xl">
                          Como posso ajudar?
                        </p>
                        <p className="text-xs font-bold uppercase tracking-widest mt-2 max-w-xs">
                          Pergunte sobre erros, comandos ou como otimizar seu
                          servidor.
                        </p>
                      </div>
                    )}
                    {aiChat.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl border-2 ${msg.role === "user" ? "bg-emerald-900 shadow-sm border-emerald-700 text-white rounded-tr-none" : "bg-black/40 border-emerald-900 text-emerald-100 rounded-tl-none font-mono text-sm shadow-inner"}`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-black/40 border border-emerald-900/50 text-emerald-500 p-4 rounded-2xl rounded-tl-none animate-pulse italic font-black text-xs uppercase tracking-widest">
                          Creeper está pensando... ( ੭•͈ω•͈)੭
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute right-0 -top-8 flex gap-2">
                       <button
                         type="button"
                         onClick={() => handleAskAI(undefined, `<call:PESQUISAR>${aiInput}</call>`)}
                         disabled={!aiInput.trim() || aiLoading || aiProvider === "off"}
                         className="px-3 py-1 bg-blue-900/40 hover:bg-blue-800 text-blue-400 font-bold text-[9px] uppercase tracking-widest rounded-lg border border-blue-900/50 transition-colors disabled:opacity-50 disabled:grayscale"
                       >
                         🔎 Pesquisar Web
                       </button>
                       <button
                         type="button"
                         onClick={() => handleAskAI(undefined, `<call:CONSULTAR>${aiInput}</call>`)}
                         disabled={!aiInput.trim() || aiLoading || aiProvider === "off"}
                         className="px-3 py-1 bg-purple-900/40 hover:bg-purple-800 text-purple-400 font-bold text-[9px] uppercase tracking-widest rounded-lg border border-purple-900/50 transition-colors disabled:opacity-50 disabled:grayscale"
                       >
                         📚 Consultar Docs
                       </button>
                    </div>
                    <form onSubmit={(e) => handleAskAI(e)} className="relative">
                      <input
                        className="w-full bg-black/60 border border-emerald-900/50 rounded-2xl px-6 py-5 text-emerald-50 font-medium outline-none focus:border-emerald-500 transition-all shadow-inner pr-16 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={aiProvider === "off" ? "Assistente desativado." : "Pergunte qualquer coisa sobre seu servidor..."}
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        disabled={aiProvider === "off" || aiLoading}
                      />
                      <button
                        type="submit"
                        disabled={!aiInput.trim() || aiLoading || aiProvider === "off"}
                        className="absolute right-3 top-3 w-8 h-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg border-b-4 border-emerald-800 transition-all flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                      >
                        <Send size={24} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "console" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-black/40 backdrop-blur-md backdrop-blur-md rounded-3xl border border-emerald-900/50 shadow-sm p-4 lg:p-6 min-h-[600px] lg:h-[75vh] flex flex-col relative overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 text-emerald-950 transition-colors pointer-events-none opacity-20">
                    <Flower2 size={240} />
                  </div>

                  <div className="flex items-center justify-between mb-4 relative z-10 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-emerald-900/50 rounded-2xl text-emerald-400 flex-shrink-0">
                        <Terminal size={32} />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white tracking-tighter italic uppercase break-all">
                          Terminal
                        </h2>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                            {currentServerId ? `Conectado: ${servers.find(s => s.id === currentServerId)?.name}` : 'Nenhum servidor selecionado'}
                          </p>
                          {currentServerId && (
                             <button
                               onClick={() => handleAction(serverState.status === "online" ? "stop" : "start")}
                               disabled={serverState.status !== "online" && serverState.status !== "offline"}
                               className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 border-b-2 disabled:opacity-50 disabled:grayscale ${
                                   serverState.status === "online" ? "bg-red-600 hover:bg-red-500 border-red-800" :
                                   serverState.status === "offline" ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-800" :
                                   "bg-amber-500 hover:bg-amber-400 border-amber-700"
                               }`}
                             >
                               {serverState.status === "online" ? <Square fill="currentColor" size={10} /> : <Play fill="currentColor" size={10} />}
                               {serverState.status === "online" ? "PARAR SERVIDOR" : 
                                serverState.status === "offline" ? "INICIAR SERVIDOR" :
                                "AGUARDE..."}
                             </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                       <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                         <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mr-2">Multi-Terminais:</span>
                         {servers.filter(s => s.status === "online").map(srv => {
                           if (srv.id === currentServerId) return null;
                           const active = multiTerminals.includes(srv.id);
                           return (
                             <button
                               key={srv.id}
                               onClick={() => setMultiTerminals(prev => active ? prev.filter(k => k !== srv.id) : [...prev, srv.id])}
                               className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border flex items-center gap-1 transition-all ${active ? "bg-emerald-600 border-emerald-500 text-white" : "bg-emerald-900/20 border-emerald-900 text-emerald-700"}`}
                             >
                                <Terminal size={10} /> {srv.name}
                             </button>
                           )
                         })}
                       </div>
                       <div className="flex items-center gap-2 justify-end">
                         {modules.ai_bot && (
                           <button
                             onClick={async () => {
                               if (!currentServerId) return;
                               const res = await fetch("/api/bot/spawn", {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({ serverId: currentServerId, botName: "AjudanteIA", apiKey: aiProvider === "remote" && aiKeysList ? aiKeysList.split(",")[0].trim() : "" })
                               });
                               if (res.ok) alert("Ajudante IA ativado e entrando no servidor! Verifique o console.");
                             }}
                             className="px-4 py-2 bg-purple-900/40 hover:bg-purple-800 text-purple-400 font-bold rounded-xl border border-purple-800 flex items-center gap-2 transition-colors text-xs"
                           >
                             <Bot size={14} /> Ativar IA Ajudante
                           </button>
                         )}
                         <button
                           onClick={clearLogs}
                           className="px-4 py-2 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-400 font-bold rounded-xl border border-emerald-800 flex items-center gap-2 transition-colors text-xs"
                         >
                           <Trash2 size={14} /> Limpar Logs
                         </button>
                       </div>
                    </div>
                  </div>

                  <div className={`flex ${multiTerminals.length > 0 ? "flex-col lg:flex-row gap-4 h-full" : "flex-1 flex-col"} overflow-hidden mt-4`}>
                    <div className="flex-1 flex flex-col relative bg-black/80 rounded-2xl border border-emerald-900/50 shadow-inner tech-grid overflow-hidden">
                      <div className="bg-emerald-900/30 text-[9px] font-black uppercase tracking-widest text-emerald-500 py-1 px-3 border-b border-emerald-900/50">{servers.find(s => s.id === currentServerId)?.name || 'Principal'}</div>
                      <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto pr-6 space-y-1.5 custom-scrollbar font-mono text-[11px] p-6 lg:p-6 p-4"
                      >
                        {serverState.logs.length === 0 && (
                          <div className="text-emerald-900 animate-pulse italic">
                            Aguardando sinais vitais...
                          </div>
                        )}
                        {serverState.logs.map((log, i) => (
                          <div
                            key={i}
                            className="flex gap-4 group hover:bg-emerald-500/5 transition-colors"
                          >
                            <span className="text-emerald-900 select-none font-bold tabular-nums w-8 text-right opacity-50 group-hover:opacity-100 italic">
                              {(i + 1).toString().padStart(2, "0")}
                            </span>
                            <p
                              className={`leading-relaxed break-all ${
                                log.includes("[ERROR]") || log.includes("Exception")
                                  ? "text-red-400 font-bold bg-red-950/20 px-1"
                                  : log.includes("[SUCCESS]") ||
                                      log.includes("Done") ||
                                      log.includes("For help, type")
                                    ? "text-emerald-400 font-black"
                                    : log.includes("[WARN]")
                                      ? "text-amber-500 italic"
                                      : log.startsWith(">")
                                        ? "text-emerald-100 font-bold border-l-2 border-emerald-500 pl-2"
                                        : "text-emerald-500/80"
                              }`}
                            >
                              {log}
                            </p>
                          </div>
                        ))}
                      </div>

                      <form
                        onSubmit={sendCommand}
                        className="bg-black/60 border-t border-emerald-900/50 px-4 py-3 flex items-center gap-3 relative z-10"
                      >
                        <span className="text-emerald-500 font-black text-xs">❯</span>
                        <input
                          className="flex-1 bg-transparent border-none outline-none text-emerald-50 placeholder:text-emerald-900 font-black text-xs"
                          placeholder="Mande um comando mágico..."
                          value={command}
                          onChange={(e) => setCommand(e.target.value)}
                        />
                      </form>
                    </div>

                    {multiTerminals.length > 0 && (
                      <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        {multiTerminals.map(mId => {
                          const state = multiServerStates[mId] || { logs: [], status: "offline" };
                          const sname = servers.find(s => s.id === mId)?.name || mId;
                          return (
                            <div key={mId} className="h-64 lg:h-full lg:flex-1 shrink-0 flex flex-col relative bg-black/80 rounded-2xl border border-emerald-900/50 shadow-inner tech-grid overflow-hidden">
                              <div className="bg-emerald-900/30 text-[9px] font-black uppercase tracking-widest text-emerald-500 py-1 px-3 border-b border-emerald-900/50 flex justify-between items-center">
                                <span>{sname}</span>
                                <button onClick={() => setMultiTerminals(prev => prev.filter(k => k !== mId))} className="hover:text-emerald-300">
                                  <Trash2 size={10} />
                                </button>
                              </div>
                              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] p-4">
                                {state.logs.map((log, i) => (
                                  <div key={i} className="flex gap-2 group hover:bg-emerald-500/5">
                                    <p className={`leading-relaxed break-all ${log.includes("[ERROR]") ? "text-red-400 font-bold" : log.includes("[SUCCESS]") ? "text-emerald-400" : log.includes("[WARN]") ? "text-amber-500" : "text-emerald-500/60"}`}>
                                      {log}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const fcmd = (e.currentTarget.elements.namedItem("cmd") as HTMLInputElement).value;
                                  if (!fcmd.trim()) return;
                                  fetch("/api/server/command", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ serverId: mId, command: fcmd })
                                  });
                                  (e.currentTarget.elements.namedItem("cmd") as HTMLInputElement).value = "";
                                }}
                                className="bg-black/60 border-t border-emerald-900/50 px-3 py-2 flex items-center gap-2"
                              >
                                <span className="text-emerald-700 font-black text-xs">❯</span>
                                <input
                                  name="cmd"
                                  className="flex-1 bg-transparent border-none outline-none text-emerald-100 placeholder:text-emerald-900/50 font-black text-[9px]"
                                  placeholder="Comando..."
                                />
                              </form>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "files" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-black/40 backdrop-blur-md backdrop-blur-md rounded-3xl border border-emerald-900/50 shadow-sm p-4 lg:p-6 min-h-[600px] lg:min-h-0 h-full flex flex-col relative overflow-hidden"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    /* Support common paste shortcut if focus is not on an input */
                    if (
                      e.ctrlKey &&
                      e.key === "v" &&
                      !(
                        e.target instanceof HTMLInputElement ||
                        e.target instanceof HTMLTextAreaElement
                      )
                    ) {
                      /* Handled by onPaste */
                    }
                  }}
                  tabIndex={0}
                >
                  {editingFile ? (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setEditingFile(null)}
                            className="p-3 bg-emerald-950 rounded-2xl text-emerald-400 hover:bg-emerald-900"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <div>
                            <h3 className="font-black text-white tracking-tighter italic uppercase">
                              Editor
                            </h3>
                            <p className="text-emerald-500 text-xs font-bold">
                              {editingFile.path}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingFile(null)}
                            className="p-4 rounded-2xl font-black text-xs text-emerald-500 hover:bg-emerald-950 transition-all"
                          >
                            CANCELAR
                          </button>
                          <button
                            onClick={saveFile}
                            className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-950 transition-all active:scale-95 border-b-4 border-emerald-800"
                          >
                            SALVAR
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="flex-1 w-full bg-black/60 border border-emerald-900/50 rounded-3xl p-6 font-mono text-sm text-emerald-50 outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
                        value={editingFile.content}
                        onChange={(e) =>
                          setEditingFile({
                            ...editingFile,
                            content: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-emerald-900/50 rounded-2xl border border-emerald-500/30 text-emerald-400">
                            <Database size={32} />
                          </div>
                          <div>
                            <h2 className="text-base font-black text-white tracking-tighter italic uppercase">
                              Arquivos
                            </h2>
                            <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-1">
                              {currentFolder && (
                                <button
                                  onClick={() =>
                                    setCurrentFolder(
                                      currentFolder
                                        .split("/")
                                        .slice(0, -1)
                                        .join("/"),
                                    )
                                  }
                                  className="hover:text-emerald-300 transition-colors uppercase"
                                >
                                  {servers.find((s) => s.id === currentServerId)
                                    ?.name || "Servidor"}
                                </button>
                              )}
                              {!currentFolder && (
                                <span className="uppercase">
                                  {servers.find((s) => s.id === currentServerId)
                                    ?.name || "Servidor"}
                                </span>
                              )}
                              {currentFolder && (
                                <span className="opacity-50">
                                  {"/"} {currentFolder}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleBackup}
                            className="px-6 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-amber-950 transition-all active:scale-95 border-b-4 border-amber-800 flex items-center gap-2"
                            title="Fazer Backup Completo Agora"
                          >
                            <Sparkles size={16} />
                            BACKUP FULL
                          </button>
                          <button
                            onClick={handleCloudBackup}
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-950 transition-all active:scale-95 border-b-4 border-blue-800 flex items-center gap-2"
                            title="Fazer Backup do Mapa e Plugins para envio/nuvem"
                          >
                            <Cloud size={16} />
                            BACKUP NUVEM
                          </button>
                          <button
                            onClick={() => {
                              setShowBackups(!showBackups);
                              if (!showBackups) fetchBackups();
                            }}
                            className={`px-6 py-4 rounded-2xl font-black text-xs transition-all border-b-4 flex items-center gap-2 ${showBackups ? "bg-amber-900/50 text-amber-500 border-amber-900" : "bg-emerald-900/50 text-emerald-500 border-emerald-950 hover:bg-emerald-900"}`}
                          >
                            <Database size={16} />
                            {showBackups ? "OCULTAR BACKUPS" : "LISTAR BACKUPS"}
                          </button>
                          <button
                            onClick={() =>
                              setShowDownloadInput(!showDownloadInput)
                            }
                            className={`px-6 py-4 rounded-2xl font-black text-xs transition-all border-b-4 flex items-center gap-2 ${showDownloadInput ? "bg-red-900/50 text-red-500 border-red-900" : "bg-emerald-900/50 text-emerald-500 border-emerald-950 hover:bg-emerald-900"}`}
                          >
                            <Globe size={16} />
                            {showDownloadInput ? "CANCELAR" : "BAIXAR URL"}
                          </button>
                          <label className="cursor-pointer px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-950 transition-all active:scale-95 border-b-4 border-emerald-800 flex items-center gap-2">
                            <Upload size={16} />
                            UPLOAD
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <button
                            onClick={createFolder}
                            className="px-6 py-4 bg-emerald-900/50 hover:bg-emerald-900 text-emerald-400 rounded-2xl font-black text-xs shadow-lg shadow-emerald-950/20 transition-all active:scale-95 border-b-4 border-emerald-950 flex items-center gap-2"
                            title="Nova Pasta"
                          >
                            <Folder size={16} />
                            NOVA PASTA
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showBackups && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                              marginBottom: 24,
                            }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-amber-900/10 border-2 border-amber-900/50 rounded-3xl flex flex-col gap-4 max-h-64 overflow-y-auto custom-scrollbar">
                               <h3 className="text-amber-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                 <Database size={14} /> Seus Backups
                               </h3>
                               {backups.length === 0 && cloudBackups.length === 0 && (
                                 <div className="text-zinc-500 font-bold text-xs">Nenhum backup encontrado.</div>
                               )}
                               {backups.map((bak: any, idx) => (
                                 <div key={`local-${idx}`} className="p-3 bg-black/40 rounded-xl border border-amber-900/30 flex justify-between items-center group">
                                     <div className="flex flex-col">
                                        <span className="text-amber-300 font-mono text-xs">{bak.name}</span>
                                        <span className="text-zinc-500 font-bold text-[9px]">Total/Local • {(bak.size / 1024 / 1024).toFixed(2)} MB</span>
                                     </div>
                                     <a
                                       href={`/api/server/backup/download?serverId=${currentServerId}&file=${bak.name}`}
                                       className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 hover:text-amber-400 font-black text-[9px] rounded-lg tracking-widest uppercase transition-colors"
                                     >
                                        Fazer Download
                                     </a>
                                 </div>
                               ))}
                               {cloudBackups.map((bak: any, idx) => (
                                 <div key={`cloud-${idx}`} className="p-3 bg-black/40 rounded-xl border border-blue-900/40 flex justify-between items-center group">
                                     <div className="flex flex-col">
                                        <span className="text-blue-300 font-mono text-xs">{bak.name}</span>
                                        <span className="text-zinc-500 font-bold text-[9px]">Cloud (Mapa/Plugins) • {(bak.size / 1024 / 1024).toFixed(2)} MB</span>
                                     </div>
                                     <a
                                       href={`/api/server/cloud-backup/download?serverId=${currentServerId}&file=${bak.name}`}
                                       className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-500 hover:text-blue-400 font-black text-[9px] rounded-lg tracking-widest uppercase transition-colors"
                                     >
                                        Fazer Download (Nuvem)
                                     </a>
                                 </div>
                               ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {showDownloadInput && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                              marginBottom: 24,
                            }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-emerald-900/20 border border-emerald-500 rounded-3xl flex gap-4">
                              <input
                                className="flex-1 bg-black/40 border border-emerald-900/50 rounded-xl px-4 py-3 text-sm text-emerald-50 font-black outline-none focus:border-emerald-500 transition-all font-mono"
                                placeholder="Cole aqui o link direto do arquivo (.jar, .zip, etc)"
                                value={downloadUrl}
                                onChange={(e) => setDownloadUrl(e.target.value)}
                              />
                              <button
                                onClick={handleGeneralDownload}
                                className="px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow-lg border-b-4 border-emerald-800 active:scale-95"
                              >
                                BAIXAR AGORA
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar bg-black/40 rounded-3xl border border-emerald-900/50 p-6 shadow-inner relative">
                        <div className="absolute top-4 right-4 text-[8px] font-black text-emerald-900 uppercase tracking-widest pointer-events-none">
                          DICA: ARRASTE OU COLE (CTRL+V) ARQUIVOS AQUI
                        </div>
                        {uploadQueue.length > 0 && (
                          <div className="mb-4 space-y-2 mt-4 relative z-20">
                            {uploadQueue.map((task) => (
                              <div
                                key={task.id}
                                className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-900 flex flex-col gap-2 relative overflow-hidden"
                              >
                                <div className="flex items-center justify-between text-xs font-black z-10 w-full relative">
                                  <span className="text-emerald-300 truncate pr-4">
                                    {task.name}
                                  </span>
                                  <span
                                    className={
                                      task.status === "error"
                                        ? "text-red-500 flex-shrink-0"
                                        : task.status === "done"
                                          ? "text-emerald-400 flex-shrink-0"
                                          : "text-emerald-500 flex-shrink-0"
                                    }
                                  >
                                    {task.status === "error"
                                      ? "ERRO"
                                      : task.status === "done"
                                        ? "CONCLUÍDO"
                                        : `${task.progress}%`}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden z-10 w-full relative">
                                  <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${task.status === "error" ? "bg-red-500" : "bg-emerald-500"}`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 mt-4 relative z-10">
                          {fileList
                            .sort(
                              (a, b) =>
                                (b.isDirectory ? 1 : 0) -
                                (a.isDirectory ? 1 : 0),
                            )
                            .map((item, i) => (
                              <div
                                key={i}
                                className="group flex items-center justify-between p-4 bg-emerald-950/30 hover:bg-emerald-900/50 rounded-2xl transition-all border border-emerald-900/50 hover:border-emerald-500 cursor-pointer"
                                onClick={() =>
                                  item.isDirectory
                                    ? setCurrentFolder(
                                        currentFolder
                                          ? `${currentFolder}/${item.name}`
                                          : item.name,
                                      )
                                    : openFile(
                                        currentFolder
                                          ? `${currentFolder}/${item.name}`
                                          : item.name,
                                      )
                                }
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div
                                    className={`p-2 rounded-xl border-2 ${item.isDirectory ? "bg-emerald-900/50 border-emerald-500/30 text-emerald-400" : "bg-emerald-950 border-emerald-900 text-emerald-600"}`}
                                  >
                                    {item.isDirectory ? (
                                      <Folder size={20} />
                                    ) : (
                                      <FileText size={20} />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-black text-white truncate tracking-tight text-sm">
                                      {item.name}
                                    </p>
                                    {!item.isDirectory && (
                                      <p className="text-[9px] text-emerald-700 font-black uppercase">
                                        {(item.size / 1024).toFixed(1)} KB
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  {!item.isDirectory && (
                                    <a
                                      href={`/api/server/files/download?serverId=${currentServerId}&path=${encodeURIComponent(currentFolder ? `${currentFolder}/${item.name}` : item.name)}`}
                                      onClick={(e) => e.stopPropagation()}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-3 text-emerald-900 hover:text-emerald-400 font-black"
                                      title="Baixar Arquivo"
                                    >
                                      <Download size={18} />
                                    </a>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      renameFile(
                                        currentFolder
                                          ? `${currentFolder}/${item.name}`
                                          : item.name,
                                      );
                                    }}
                                    className="p-3 text-emerald-900 hover:text-emerald-400 font-black"
                                    title="Renomear"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteFile(
                                        currentFolder
                                          ? `${currentFolder}/${item.name}`
                                          : item.name,
                                      );
                                    }}
                                    className="p-3 text-emerald-900 hover:text-red-500 font-black"
                                    title="Deletar"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            ))}

                          {fileList.length === 0 &&
                            uploadQueue.length === 0 && (
                              <div className="h-64 flex flex-col items-center justify-center text-emerald-900 gap-4">
                                <Moon size={48} className="opacity-20" />
                                <p className="font-black">Pasta vazia...</p>
                                <p className="text-xs font-black uppercase tracking-widest">
                                  Arraste arquivos aqui!
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Credits */}
        <footer className="mt-8 py-4 text-center">
          <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur px-6 py-3 rounded-full border border-emerald-900/50 shadow-sm text-emerald-800 font-black text-xs uppercase tracking-widest">
            {t("vps_hosting")}{" "}
            <span className="text-emerald-500">LINUX POWER</span>{" "}
            <Sparkles
              size={14}
              fill="currentColor"
              className="text-emerald-500 animate-pulse"
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

function CircularBtn({
  icon,
  color,
  onClick,
  disabled,
  tooltip,
}: {
  icon: React.ReactNode;
  color: "emerald" | "pink" | "blood";
  onClick: () => void;
  disabled: boolean;
  tooltip: string;
}) {
  const styles = {
    emerald:
      "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950 border-emerald-800",
    pink: "bg-red-600 hover:bg-red-500 shadow-red-950 border-red-800",
    blood: "bg-red-950 hover:bg-red-900 shadow-red-950 border-red-950",
  }[color];

  return (
    <div className="relative group/btn">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-10 h-10 rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95 shadow-xl border-b-8 disabled:opacity-10 disabled:grayscale disabled:scale-100 disabled:border-b-0 ${styles}`}
      >
        {icon}
      </button>
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-emerald-400 text-[9px] font-black px-3 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-emerald-900/50">
        {tooltip}
      </div>
    </div>
  );
}

function MenuLink({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-w-fit lg:w-full flex items-center gap-3 lg:gap-4 px-5 py-3 lg:py-4 rounded-3xl font-black text-xs lg:text-sm transition-all relative overflow-hidden group flex-grow lg:flex-grow-0 justify-center lg:justify-start ${active ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 lg:translate-x-2" : "bg-black/10 lg:bg-transparent text-emerald-700 hover:bg-emerald-950/30 hover:text-emerald-400 border lg:border-transparent border-emerald-900/10"}`}
    >
      <span
        className={
          active ? "text-white" : "group-hover:scale-110 transition-transform"
        }
      >
        {icon}
      </span>
      {label}
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="hidden lg:block absolute right-4 w-2 h-2 bg-white rounded-full"
        />
      )}
    </button>
  );
}

function MiniStat({
  icon,
  label,
  value,
  percent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  percent?: number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-black/40 backdrop-blur-md border border-emerald-900/50 rounded-3xl p-5 flex flex-col gap-3 hover:border-emerald-500/50 transition-all shadow-lg group cursor-default h-full"
    >
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-emerald-950 rounded-2xl flex items-center justify-center group-hover:bg-emerald-900 transition-colors border border-emerald-900/50">
          {icon}
        </div>
        <div>
          <div className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em]">
            {label}
          </div>
          <div className="font-black text-emerald-50 text-xl tracking-tighter">
            {value}
          </div>
        </div>
      </div>
      {percent !== undefined && (
        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-emerald-900/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: percent + "%" }}
            className={`h-full ${percent > 80 ? "bg-red-500" : percent > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
          />
        </div>
      )}
    </motion.div>
  );
}
