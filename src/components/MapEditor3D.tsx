import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sky, Stars, Edges } from '@react-three/drei';

function Voxel({ position, color, onSelect }: { position: [number, number, number], color: string, onSelect?: (pos: [number, number, number]) => void }) {
  const ref = useRef<any>(null);
  const [hovered, setHover] = useState(false);
  return (
    <Box
      ref={ref}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(position);
      }}
      args={[1, 1, 1]}
    >
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
      <Edges linewidth={1} threshold={15} color="black" />
    </Box>
  );
}

export default function MapEditor3D({ serverId }: { serverId?: string }) {
  const [blocks, setBlocks] = useState<{pos: [number, number, number], color: string}[]>([]);

  const [wandMode, setWandMode] = useState<'none'|'pos1'|'pos2'>('none');
  const [pos1, setPos1] = useState<[number, number, number] | null>(null);
  const [pos2, setPos2] = useState<[number, number, number] | null>(null);
  const [clipboard, setClipboard] = useState<{pos: [number, number, number], color: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [worldName, setWorldName] = useState('world');
  const [coords, setCoords] = useState({ x: 0, y: 64, z: 0 });

  const loadWorld = async () => {
    if (!serverId) { alert("Selecione um servidor primeiro."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/world/load", { 
         method: "POST", headers: {"Content-Type": "application/json"},
         body: JSON.stringify({ serverId, worldName, x: coords.x, y: coords.y, z: coords.z, size: 16 }) 
      });
      const data = await res.json();
      if (data.error) {
         alert(data.error);
         return;
      }
      if (data.blocks) {
         const mapped = data.blocks.map((b: any) => ({
            pos: [b.pos[0] + coords.x, b.pos[1] + coords.y, b.pos[2] + coords.z], 
            color: b.stateId === 2 ? 'grass' : b.stateId === 3 ? 'dirt' : 'stone'
         }));
         setBlocks(mapped);
         alert(`Map Engine: Carregados ${data.blocks.length} blocos do chunk (${Math.floor(coords.x/16)},${Math.floor(coords.z/16)}) do mundo "${worldName}"! (Modo Simplificado)`);
      }
    } catch(e) {
      alert("Erro de conexão com Map Engine.");
    } finally {
      setLoading(false);
    }
  };

  const saveWorld = async () => {
    if (!serverId) { alert("Selecione um servidor primeiro."); return; }
    setLoading(true);
    
    // Normalize absolute positions back to local dx, dy, dz relative to coords
    const normalizedBlocks = blocks.map(b => ({
       pos: [b.pos[0] - coords.x, b.pos[1] - coords.y, b.pos[2] - coords.z],
       color: b.color
    }));

    try {
      const res = await fetch("/api/world/save", { 
         method: "POST", headers: {"Content-Type": "application/json"},
         body: JSON.stringify({ serverId, worldName, x: coords.x, y: coords.y, z: coords.z, blocks: normalizedBlocks }) 
      });
      const data = await res.json();
      if (data.success) alert("Mapa salvo com sucesso!");
      else alert(data.error || "Erro ao salvar.");
    } catch(e) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const addBlock = () => {
    setBlocks([...blocks, { pos: [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)], color: 'stone' }]);
  };

  const toggleWand = () => {
    setWandMode(wandMode === 'none' ? 'pos1' : 'none');
    if (wandMode !== 'none') {
      setPos1(null);
      setPos2(null);
    }
  };

  const handleSelect = (pos: [number, number, number]) => {
     if (wandMode === 'pos1') {
       setPos1(pos);
       setWandMode('pos2');
     } else if (wandMode === 'pos2') {
       setPos2(pos);
       setWandMode('none');
     }
  };

  const handleCopy = () => {
    if (!pos1 || !pos2) {
      alert("Selecione a Posição 1 e 2 usando o //wand");
      return;
    }
    const minX = Math.min(pos1[0], pos2[0]);
    const maxX = Math.max(pos1[0], pos2[0]);
    const minY = Math.min(pos1[1], pos2[1]);
    const maxY = Math.max(pos1[1], pos2[1]);
    const minZ = Math.min(pos1[2], pos2[2]);
    const maxZ = Math.max(pos1[2], pos2[2]);
    
    const selected = blocks.filter(b => 
      b.pos[0] >= minX && b.pos[0] <= maxX &&
      b.pos[1] >= minY && b.pos[1] <= maxY &&
      b.pos[2] >= minZ && b.pos[2] <= maxZ
    );
    
    const offsetSelected = selected.map(b => ({
       pos: [b.pos[0] - pos1[0], b.pos[1] - pos1[1], b.pos[2] - pos1[2]] as [number, number, number],
       color: b.color
    }));
    setClipboard(offsetSelected);
    alert(`Copiado ${offsetSelected.length} blocos!`);
  };

  const handlePaste = () => {
     if (clipboard.length === 0) {
        alert("Clipboard vazio!"); return;
     }
     if (!pos1) {
        alert("Selecione pelo menos a Posição 1 (origem) com //wand!"); return;
     }
     const newBlocks = clipboard.map(b => ({
       pos: [b.pos[0] + pos1[0], b.pos[1] + pos1[1], b.pos[2] + pos1[2]] as [number, number, number],
       color: b.color
     }));
     
     // merge removing overlaps
     const merged = [...blocks];
     newBlocks.forEach(nb => {
        const idx = merged.findIndex(mb => mb.pos[0] === nb.pos[0] && mb.pos[1] === nb.pos[1] && mb.pos[2] === nb.pos[2]);
        if (idx >= 0) merged[idx] = nb;
        else merged.push(nb);
     });
     
     setBlocks(merged);
     alert(`Colado ${newBlocks.length} blocos em ${pos1.join(',')}!`);
  };

  const handleExportSchematic = () => {
     if (clipboard.length === 0) {
        alert("Clipboard vazio! Copie uma área primeiro usando //copy");
        return;
     }
     const data = JSON.stringify(clipboard, null, 2);
     const blob = new Blob([data], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `exported_schematic_${Date.now()}.json`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
     alert("Schematic exportada!");
  };

  const handleImportSchematic = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = (ev) => {
        try {
           const imported = JSON.parse(ev.target?.result as string);
           if (Array.isArray(imported)) {
             setClipboard(imported);
             alert(`Schematic importada! (${imported.length} blocos). Use //paste para colocar no mundo.`);
           } else {
             alert('Formato inválido.');
           }
        } catch (err) {
           alert("Erro ao ler o arquivo JSON schematic.");
        }
     };
     reader.readAsText(file);
  };

  return (
    <div className="w-full h-full relative border-4 border-emerald-900 rounded-3xl overflow-hidden bg-zinc-950 flex flex-col sm:flex-row mt-4 min-h-[60vh]">
       {/* Sidebar Controls */}
       <div className="w-full sm:w-64 bg-emerald-950/90 p-4 flex flex-col gap-3 border-b-2 sm:border-b-0 sm:border-r-2 border-emerald-900 shadow-md sm:max-h-[60vh] overflow-y-auto custom-scrollbar z-10 shrink-0">
          <div className="text-emerald-400 font-black text-xs space-y-1 mb-2 border-b border-emerald-900/50 pb-2">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               MCEDIT VIRTUAL ENGINE
             </div>
             <div className="text-[9px] text-emerald-600">Simplified Viewer</div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold text-emerald-500 uppercase">World Folder Name</label>
             <input type="text" value={worldName} onChange={(e) => setWorldName(e.target.value)} className="w-full bg-zinc-900 border border-emerald-900 rounded p-1 text-xs text-emerald-400" placeholder="world" />
          </div>
          
          <div className="flex gap-2">
             <div className="flex-1 space-y-1">
               <label className="text-[10px] font-bold text-emerald-500 uppercase">X</label>
               <input type="number" value={coords.x} onChange={(e) => setCoords({...coords, x: parseInt(e.target.value)||0})} className="w-full bg-zinc-900 border border-emerald-900 rounded p-1 text-xs text-white" />
             </div>
             <div className="flex-1 space-y-1">
               <label className="text-[10px] font-bold text-emerald-500 uppercase">Y</label>
               <input type="number" value={coords.y} onChange={(e) => setCoords({...coords, y: Math.max(0, parseInt(e.target.value)||0)})} className="w-full bg-zinc-900 border border-emerald-900 rounded p-1 text-xs text-white" />
             </div>
             <div className="flex-1 space-y-1">
               <label className="text-[10px] font-bold text-emerald-500 uppercase">Z</label>
               <input type="number" value={coords.z} onChange={(e) => setCoords({...coords, z: parseInt(e.target.value)||0})} className="w-full bg-zinc-900 border border-emerald-900 rounded p-1 text-xs text-white" />
             </div>
          </div>

          <button onClick={loadWorld} disabled={loading} className="w-full py-2 bg-blue-600 text-[10px] font-black uppercase rounded text-white hover:bg-blue-500 shadow-sm border-b-2 border-blue-800 active:translate-y-[2px] active:border-b-0 transition-all">{loading ? 'CARREGANDO...' : '1. CARREGAR CHUNK'}</button>
          
          <button onClick={saveWorld} disabled={loading || blocks.length === 0} className="w-full py-2 bg-pink-600 text-[10px] font-black uppercase rounded text-white hover:bg-pink-500 shadow-sm border-b-2 border-pink-800 active:translate-y-[2px] active:border-b-0 transition-all disabled:opacity-50">{loading ? 'SALVANDO...' : '2. SALVAR MUNDO!'}</button>

          <div className="border-t border-emerald-900/50 my-2"></div>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setBlocks([])} className="col-span-2 px-2 py-2 bg-red-900 border-b-2 border-red-950 text-[10px] font-black uppercase rounded text-red-400 hover:bg-red-800 shadow-sm active:translate-y-[2px] active:border-b-0">LIMPAR VIEWPORT</button>
            <button onClick={addBlock} className="px-2 py-2 bg-emerald-600 text-[10px] font-black uppercase rounded text-white hover:bg-emerald-500 shadow-sm border-b-2 border-emerald-800 active:translate-y-[2px] active:border-b-0">+ Bloco</button>
            <button onClick={toggleWand} className={`px-2 py-2 ${wandMode !== 'none' ? 'bg-red-800 text-red-200' : 'bg-zinc-800 text-emerald-400'} text-[10px] font-black uppercase rounded hover:bg-zinc-700 shadow-sm border-b-2 border-zinc-950 active:translate-y-[2px] active:border-b-0`}>{wandMode !== 'none' ? 'Cancel' : '//wand'}</button>
            <button onClick={handleCopy} className="px-2 py-2 bg-zinc-800 text-[10px] font-black uppercase rounded text-emerald-400 hover:bg-zinc-700 shadow-sm border-b-2 border-zinc-950 active:translate-y-[2px] active:border-b-0">//copy</button>
            <button onClick={handlePaste} className="px-2 py-2 bg-zinc-800 text-[10px] font-black uppercase rounded text-emerald-400 hover:bg-zinc-700 shadow-sm border-b-2 border-zinc-950 active:translate-y-[2px] active:border-b-0">//paste</button>
            <button onClick={handleExportSchematic} className="px-2 py-2 bg-amber-600 text-[10px] font-black uppercase rounded text-white hover:bg-amber-500 shadow-sm border-b-2 border-amber-800 active:translate-y-[2px] active:border-b-0">Export</button>
            <label className="px-2 py-2 cursor-pointer bg-amber-600 text-[10px] font-black uppercase rounded text-white hover:bg-amber-500 shadow-sm border-b-2 border-amber-800 active:translate-y-[2px] active:border-b-0 text-center">
               Import
               <input type="file" accept=".json" className="hidden" onChange={handleImportSchematic} />
            </label>
          </div>

          {wandMode !== 'none' && (
             <div className="text-red-400 text-[10px] font-black uppercase animate-pulse text-center mt-2 bg-red-950/30 py-1 rounded">
               Status: Selecione {wandMode === 'pos1' ? 'Posição 1' : 'Posição 2'}
             </div>
          )}
       </div>

       {/* 3D Viewport */}
       <div className="flex-1 w-full min-h-[400px] relative">
         <Canvas camera={{ position: [coords.x + 10, coords.y + 10, coords.z + 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[coords.x + 10, coords.y + 20, coords.z + 10]} intensity={1} />
            <Sky sunPosition={[100, 20, 100]} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <OrbitControls makeDefault target={[coords.x, coords.y, coords.z]} />
            <gridHelper args={[40, 40, 0x444444, 0x222222]} position={[coords.x, coords.y - 1, coords.z]} />
            
            {blocks.map((b, i) => (
              <Voxel key={i} position={b.pos} color={b.color === 'grass' ? '#4ade80' : b.color === 'dirt' ? '#854d0e' : '#a1a1aa'} onSelect={handleSelect} />
            ))}
            
            {pos1 && <Box position={pos1} args={[1.05, 1.05, 1.05]}><meshBasicMaterial color="red" wireframe /></Box>}
            {pos2 && <Box position={pos2} args={[1.05, 1.05, 1.05]}><meshBasicMaterial color="blue" wireframe /></Box>}
         </Canvas>
       </div>
    </div>
  );
}
