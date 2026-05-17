import React from "react";
import { Terminal, Square, Play, RefreshCw, Trash2, Download, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ServerConsoleProps {
  logs: string[];
  status: string;
  serverName: string;
  onAction: (action: string) => void;
  onSendCommand: (cmd: string) => void;
  onClear: () => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  suggestedCmd: string | null;
  onFixWithAI: (log: string) => void;
}

export const ServerConsole: React.FC<ServerConsoleProps> = ({
  logs,
  status,
  serverName,
  onAction,
  onSendCommand,
  onClear,
  isAnalyzing,
  onAnalyze,
  suggestedCmd,
  onFixWithAI
}) => {
  const [command, setCommand] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    onSendCommand(command);
    setCommand("");
  };

  const formatLogLine = (log: string) => {
    const timeMatch = log.match(/^\[\d{2}:\d{2}:\d{2}\]/);
    if (timeMatch) {
      return (
        <>
          <span className="text-zinc-600 font-bold mr-2">{timeMatch[0]}</span>
          {log.replace(timeMatch[0], "")}
        </>
      );
    }
    return log;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black/80 rounded-2xl border border-emerald-900/50 shadow-inner overflow-hidden relative">
      {/* Header Info */}
      <div className="bg-emerald-900/30 flex justify-between py-3 px-4 border-b border-emerald-900/50 relative z-10 items-center flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status === "online" ? "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" : status === "starting" ? "bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" : status === "stopping" ? "bg-red-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-[12px] font-black text-white uppercase tracking-widest">{serverName}</span>
          </div>
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
             status === "online" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
             status === "starting" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
             status === "stopping" ? "text-rose-500 bg-rose-500/10 border-rose-500/20" :
             "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
          }`}>{status.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center gap-3 ml-auto flex-wrap">
           <div className="flex items-center gap-2 mr-4 border-r border-emerald-900/50 pr-4">
              <button
                onClick={() => onAction(status === "online" ? "stop" : "start")}
                disabled={status === "starting" || status === "stopping"}
                className={`px-3 py-1.5 rounded font-black text-[9px] uppercase tracking-widest transition-all ${
                  status === "online" 
                  ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 border border-rose-500/30" 
                  : status === "offline"
                  ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/30"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                  {status === "online" ? "STOP" : status === "offline" ? "START" : status.toUpperCase()}
              </button>
              {status === "online" && (
                <button
                  onClick={() => onAction("restart")}
                  className="px-3 py-1.5 rounded font-black text-[9px] uppercase tracking-widest transition-all bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border border-blue-500/30"
                >
                    RESTART
                </button>
              )}
              {status !== "offline" && status !== "stopping" && (
                <button
                  onClick={() => onAction("kill")}
                  className="px-3 py-1.5 rounded flex items-center gap-1 font-black text-[9px] uppercase tracking-widest transition-all bg-red-600/20 text-red-500 hover:bg-red-600/40 border border-red-900/50"
                  title="Forçar Parada (Kill)"
                >
                    <Trash2 size={10} /> KILL
                </button>
              )}
           </div>

           <button onClick={onClear} className="text-zinc-500 hover:text-emerald-400 transition-colors" title="Limpar Logs"><Trash2 size={14} /></button>
           <button onClick={() => {
              const blob = new Blob([logs.join("\n")], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `logs-${serverName}.txt`; a.click();
           }} className="text-zinc-500 hover:text-emerald-400 transition-colors" title="Baixar Logs"><Download size={14} /></button>
        </div>
      </div>

      {/* Logs Window */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 custom-scrollbar relative"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[length:100%_2px,3px_100%] z-10" 
             style={{backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.25) 50%), linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))'}} />
        
        {logs.length === 0 && <div className="text-emerald-900 italic">Estabelecendo conexão neural...</div>}
        
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 group hover:bg-emerald-500/5 transition-colors">
            <p className={`leading-relaxed break-all flex items-center gap-2 ${
              log.includes("[ERROR]") || log.includes("Exception") ? "text-red-400 font-bold bg-red-950/20 px-1" :
              log.includes("[SUCCESS]") || log.includes("Done") ? "text-emerald-400 font-black" :
              log.includes("[WARN]") ? "text-amber-500 italic" : "text-emerald-500/80"
            }`}>
              {formatLogLine(log)}
              {(log.includes("[ERROR]") || log.includes("Exception")) && (
                <button
                  onClick={() => onFixWithAI(log)}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black uppercase rounded shadow-lg flex items-center gap-1"
                >
                   <Sparkles size={10} /> CORRIGIR
                </button>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="bg-black/60 border-t border-emerald-900/50 px-4 py-3 flex items-center gap-3 relative z-10">
        <span className="text-emerald-500 font-black text-xs">❯</span>
        <input
          className="flex-1 bg-transparent border-none outline-none text-emerald-50 placeholder:text-zinc-800 font-black text-xs"
          placeholder={suggestedCmd ? `Sugestão: ${suggestedCmd}` : "Mande um comando mágico..."}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
        </button>
      </form>
    </div>
  );
};
