import React from "react";
import {
  Folder,
  Plus,
  Upload,
  ChevronLeft,
  Globe,
  File,
  ArrowRight,
  CornerDownLeft,
  RefreshCw,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  Play,
  Download,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
}

interface FileManagerProps {
  files: FileEntry[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onBack: () => void;
  onRefresh: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateFolder: () => void;
  onDelete: (path: string) => void;
  onEdit: (file: FileEntry) => void;
  isLoading?: boolean;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  currentPath,
  onNavigate,
  onBack,
  onRefresh,
  onUpload,
  onCreateFolder,
  onDelete,
  onEdit,
  isLoading,
}) => {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 shrink-0 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          {currentPath !== "/" && (
            <button
              onClick={onBack}
              className="p-3 bg-emerald-950 rounded-2xl text-emerald-400 hover:bg-emerald-900 border border-emerald-900/50"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h3 className="font-black text-white tracking-tighter italic uppercase text-lg">
              Explorador
            </h3>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">
              {currentPath}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group mr-2 hidden md:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/40 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-all w-40 group-hover:w-60"
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-3 bg-zinc-900 rounded-xl text-zinc-500 hover:text-emerald-400 border border-zinc-800 transition-all"
          >
            {viewMode === "grid" ? (
              <List size={18} />
            ) : (
              <LayoutGrid size={18} />
            )}
          </button>
          <button
            onClick={onRefresh}
            className="p-3 bg-zinc-900 rounded-xl text-zinc-500 hover:text-emerald-400 border border-zinc-800 transition-all"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <label className="cursor-pointer px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg border-b-4 border-emerald-900 transition-all active:scale-95">
            <Upload size={14} />{" "}
            <span className="hidden sm:inline">Upload</span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={onUpload}
            />
          </label>
          <button
            onClick={onCreateFolder}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 transition-all active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Files List */}
      <div
        className={`flex-1 overflow-auto pr-2 custom-scrollbar ${viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : "space-y-2"}`}
      >
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 col-span-full opacity-30 select-none">
            <Folder size={64} className="mb-4" />
            <p className="font-black italic uppercase tracking-widest text-xs">
              Pasta Vazia
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <motion.div
              layoutId={file.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={file.path}
              className={`${
                viewMode === "grid"
                  ? "bg-black/20 border border-zinc-900 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-emerald-950/20 hover:border-emerald-500/50 cursor-pointer transition-all h-48"
                  : "bg-black/20 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between group hover:bg-emerald-950/20 hover:border-emerald-500/30 cursor-pointer transition-all"
              }`}
              onClick={() =>
                file.isDirectory ? onNavigate(file.path) : onEdit(file)
              }
            >
              <div
                className={`${viewMode === "grid" ? "mb-4" : "flex items-center gap-4 flex-1 min-w-0"}`}
              >
                <div
                  className={`${
                    viewMode === "grid"
                      ? `w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${file.isDirectory ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`
                      : `w-10 h-10 rounded-xl flex items-center justify-center ${file.isDirectory ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`
                  }`}
                >
                  {file.isDirectory ? (
                    <Folder size={viewMode === "grid" ? 32 : 20} />
                  ) : (
                    <File size={viewMode === "grid" ? 32 : 20} />
                  )}
                </div>
                <div className={`${viewMode === "grid" ? "" : "min-w-0"}`}>
                  <p
                    className={`font-bold text-white tracking-tight truncate ${viewMode === "grid" ? "max-w-[120px]" : "max-w-[300px]"}`}
                  >
                    {file.name}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">
                    {file.isDirectory
                      ? "Pasta"
                      : `${(file.size || 0 / 1024).toFixed(1)} KB`}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 ${viewMode === "grid" ? "opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4" : ""}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(file);
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.path);
                  }}
                  className="p-2 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
