import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Sky, Stars, Edges, FlyControls } from '@react-three/drei';
import * as THREE from 'three';
import { MousePointer2, Move, Eraser, Focus, Copy, ClipboardPaste, Save, Upload, Download, Map as MapIcon, Hammer } from 'lucide-react';

const _object = new THREE.Object3D();

function SelectionBox({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const minX = Math.min(start[0], end[0]) - 0.05;
  const maxX = Math.max(start[0], end[0]) + 1.05;
  const minY = Math.min(start[1], end[1]) - 0.05;
  const maxY = Math.max(start[1], end[1]) + 1.05;
  const minZ = Math.min(start[2], end[2]) - 0.05;
  const maxZ = Math.max(start[2], end[2]) + 1.05;

  const w = maxX - minX;
  const h = maxY - minY;
  const d = maxZ - minZ;

  return (
    <Box position={[minX + w / 2 - 0.5, minY + h / 2 - 0.5, minZ + d / 2 - 0.5]} args={[w, h, d]}>
      <meshBasicMaterial color="#ffffff" opacity={0.2} transparent depthWrite={false} />
      <Edges color="yellow" lineWidth={2} />
    </Box>
  );
}

function CursorHighlight({ position }: { position: [number, number, number] | null }) {
  if (!position) return null;
  return (
    <Box position={position} args={[1.02, 1.02, 1.02]}>
      <meshBasicMaterial color="white" wireframe depthWrite={false} transparent opacity={0.8} />
    </Box>
  );
}

function BlockGroup({ blocks, colorStr, hex, onSelect, onHover }: { blocks: any[], colorStr: string, hex: string, onSelect: (pos: [number, number, number]) => void, onHover: (pos: [number, number, number] | null) => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const filteredBlocks = useMemo(() => blocks.filter(b => b.color === colorStr), [blocks, colorStr]);

  useEffect(() => {
    if (meshRef.current) {
      filteredBlocks.forEach((block, i) => {
        _object.position.set(block.pos[0], block.pos[1], block.pos[2]);
        _object.updateMatrix();
        meshRef.current!.setMatrixAt(i, _object.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [filteredBlocks]);

  if (filteredBlocks.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined as any, undefined as any, filteredBlocks.length]}
      onClick={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined && onSelect) {
           onSelect(filteredBlocks[e.instanceId].pos);
        }
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined && onHover) {
           onHover(filteredBlocks[e.instanceId].pos);
        }
      }}
      onPointerOut={() => onHover(null)}
    >
      <boxGeometry args={[1, 1, 1]}>
         <Edges color={new THREE.Color(hex).multiplyScalar(0.7).getHexString()} threshold={15} />
      </boxGeometry>
      <meshStandardMaterial color={hex} roughness={0.9} />
    </instancedMesh>
  );
}

function CameraRepositioner({ coords }: { coords: { x: number, y: number, z: number } }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(coords.x + 10, coords.y + 15, coords.z + 20);
    camera.lookAt(coords.x, coords.y, coords.z);
    camera.updateProjectionMatrix();
  }, [coords.x, Math.floor(coords.y / 16), coords.z, camera]);
  // only update on major jumps to prevent destroying FlyControls! I'll just use coordinates rounded to chunk size so it only repositions when loading a chunk elsewhere!
  return null;
}

export default function MapEditor3D({ serverId, initialWorldName }: { serverId?: string, initialWorldName?: string }) {
  const [history, setHistory] = useState<{ past: {pos: [number, number, number], color: string, name?: string}[][], present: {pos: [number, number, number], color: string, name?: string}[], future: {pos: [number, number, number], color: string, name?: string}[][] }>({
    past: [], present: [], future: []
  });

  const blocks = history.present;

  const updateBlocks = (newBlocks: {pos: [number, number, number], color: string, name?: string}[]) => {
    setHistory(h => ({ past: [...h.past, h.present], present: newBlocks, future: [] }));
  };

  const undo = () => {
    setHistory(h => {
      if (h.past.length === 0) return h;
      return { past: h.past.slice(0, h.past.length - 1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
    });
  };

  const redo = () => {
    setHistory(h => {
      if (h.future.length === 0) return h;
      return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
    });
  };

  const [activeTool, setActiveTool] = useState<'select'|'brush'|'eraser'>('select');
  const [selectionState, setSelectionState] = useState<0|1|2>(0);
  const [pos1, setPos1] = useState<[number, number, number] | null>(null);
  const [pos2, setPos2] = useState<[number, number, number] | null>(null);
  const [hoverPos, setHoverPos] = useState<[number, number, number] | null>(null);
  
  const [clipboard, setClipboard] = useState<{pos: [number, number, number], color: string, name?: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [worldName, setWorldName] = useState(initialWorldName || 'world');
  const [availableWorlds, setAvailableWorlds] = useState<string[]>([]);
  const [serverSeed, setServerSeed] = useState("");
  const [coords, setCoords] = useState({ x: 0, y: 64, z: 0 });
  const [blockType, setBlockType] = useState('stone');

  useEffect(() => {
    if (initialWorldName && initialWorldName !== worldName) {
      setWorldName(initialWorldName);
    }
  }, [initialWorldName]);

  useEffect(() => {
    if (!serverId) return;
    fetch("/api/server/seed", {
      method: "POST", headers:{"Content-Type": "application/json"},
      body: JSON.stringify({ serverId })
    }).then(r => r.json()).then(data => {
      if (data.seed) setServerSeed(data.seed);
    });

    fetch("/api/world/list", {
      method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ serverId })
    }).then(r => r.json()).then(data => {
      if (data.worlds) setAvailableWorlds(data.worlds);
    });
  }, [serverId]);

  useEffect(() => {
    if (!serverId || !worldName) return;
    fetch("/api/world/spawn", {
      method: "POST", headers:{"Content-Type": "application/json"},
      body: JSON.stringify({ serverId, worldName })
    }).then(r => r.json()).then(data => {
      if (!data.error) {
        setCoords({ x: data.x, y: data.y, z: data.z });
        loadWorldChunk(data.x, data.y, data.z, worldName);
      } else {
        console.warn("Failed to read level.dat, loading default coordinates 0, 64, 0. Error:", data.error);
        setCoords({ x: 0, y: 64, z: 0 });
        loadWorldChunk(0, 64, 0, worldName);
      }
    }).catch(err => {
      console.warn("Fetch error for world/spawn", err);
      loadWorldChunk(0, 64, 0, worldName);
    });
  }, [serverId, worldName]);

  const handleSelect = (pos: [number, number, number]) => {
     if (activeTool === 'select') {
         if (selectionState === 0 || selectionState === 2) {
             setPos1(pos);
             setPos2(null);
             setSelectionState(1);
         } else if (selectionState === 1) {
             setPos2(pos);
             setSelectionState(2);
         }
     } else if (activeTool === 'brush') {
         const newBlocks = [...blocks];
         const idx = newBlocks.findIndex(b => b.pos[0]===pos[0] && b.pos[1]===pos[1]+1 && b.pos[2]===pos[2]);
         const mapName = (col: string) => col === 'wood' ? 'oak_log' : col === 'grass' ? 'grass_block' : col === 'leaves' ? 'oak_leaves' : col;
         if (idx >= 0) {
            newBlocks[idx].color = blockType;
            newBlocks[idx].name = mapName(blockType);
         }
         else newBlocks.push({pos: [pos[0], pos[1]+1, pos[2]], color: blockType, name: mapName(blockType)});
         updateBlocks(newBlocks);
     } else if (activeTool === 'eraser') {
         const newBlocks = blocks.filter(b => !(b.pos[0]===pos[0] && b.pos[1]===pos[1] && b.pos[2]===pos[2]));
         updateBlocks(newBlocks);
     }
  };

  const handleCopy = () => {
    if (!pos1 || !pos2) { alert("Selecione a área completa primeiro."); return; }
    const minX = Math.min(pos1[0], pos2[0]); const maxX = Math.max(pos1[0], pos2[0]);
    const minY = Math.min(pos1[1], pos2[1]); const maxY = Math.max(pos1[1], pos2[1]);
    const minZ = Math.min(pos1[2], pos2[2]); const maxZ = Math.max(pos1[2], pos2[2]);
    const selected = blocks.filter(b => b.pos[0] >= minX && b.pos[0] <= maxX && b.pos[1] >= minY && b.pos[1] <= maxY && b.pos[2] >= minZ && b.pos[2] <= maxZ);
    setClipboard(selected.map(b => ({ pos: [b.pos[0] - pos1[0], b.pos[1] - pos1[1], b.pos[2] - pos1[2]], color: b.color, name: b.name })));
    alert(`Copiado ${selected.length} blocos!`);
  };

  const handlePaste = () => {
     if (clipboard.length === 0) { alert("Clipboard vazio."); return; }
     if (!pos1) { alert("Selecione a posição (Pos 1) para colar."); return; }
     const newBlocks = clipboard.map(b => ({ pos: [b.pos[0] + pos1[0], b.pos[1] + pos1[1], b.pos[2] + pos1[2]] as [number, number, number], color: b.color, name: b.name }));
     const merged = [...blocks];
     newBlocks.forEach(nb => {
        const idx = merged.findIndex(mb => mb.pos[0] === nb.pos[0] && mb.pos[1] === nb.pos[1] && mb.pos[2] === nb.pos[2]);
        if (idx >= 0) merged[idx] = nb; else merged.push(nb);
     });
     updateBlocks(merged);
  };

  const handleExportSchematic = async () => {
     if (clipboard.length === 0) { alert("Use Copy para copiar a área primeiro."); return; }
     const data = JSON.stringify(clipboard);
     try {
       setLoading(true);
       const res = await fetch("/api/world/export-schematic", {
          method: "POST", headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ serverId, blocks: clipboard })
       });
       const result = await res.json();
       if (result.success) {
         alert(`Schematic salva no servidor! Arquivo: ${result.file}\nUse no jogo: //schem load ${result.name}`);
       } else {
         alert("Erro ao salvar schematic: " + result.error);
       }
     } catch(e) {
       alert("Erro ao conectar com API de schematics.");
     } finally {
       setLoading(false);
     }
  };

  const handleImportSchematic = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = (ev) => {
        try {
           const imported = JSON.parse(ev.target?.result as string);
           if (Array.isArray(imported)) {
             setClipboard(imported); alert(`Schematic importada! (${imported.length} blocos). Use Paste para colocar no mundo.`);
           } else { alert('Formato inválido.'); }
        } catch (err) { alert("Erro ao ler o arquivo JSON schematic."); }
     };
     reader.readAsText(file);
  };

  const loadWorldChunk = async (cx = coords.x, cy = coords.y, cz = coords.z, wn = worldName) => {
    if (!serverId) { alert("Selecione um servidor primeiro."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/world/load", { 
         method: "POST", headers: {"Content-Type": "application/json"},
         body: JSON.stringify({ serverId, worldName: wn, x: cx, y: cy, z: cz, size: 16 }) 
      });
      const data = await res.json();
      if (data.error) { return; } // Silently fail on first load if world not ready
      if (data.blocks) {
         const mapped = data.blocks.map((b: any) => ({
            pos: [b.pos[0], b.pos[1], b.pos[2]], 
            color: b.color,
            name: b.name
         }));
         updateBlocks(mapped);
      }
    } catch(e) {
      console.warn("Erro ao carregar mapa", e);
    } finally {
      setLoading(false);
    }
  };

  const saveWorldChunk = async () => {
    if (!serverId) { alert("Selecione um servidor primeiro."); return; }
    setLoading(true);
    const normalizedBlocks = blocks.map(b => ({
       pos: b.pos,
       color: b.color
    }));

    try {
      const res = await fetch("/api/world/save", { 
         method: "POST", headers: {"Content-Type": "application/json"},
         body: JSON.stringify({ serverId, worldName, blocks: normalizedBlocks }) 
      });
      const data = await res.json();
      if (data.success) alert("Mapa salvo com sucesso!");
      else alert(data.error || "Erro ao salvar.");
    } catch(e) {
      alert("Erro ao salvar mapa.");
    } finally {
      setLoading(false);
    }
  };

  const setWorldSpawn = async () => {
    if (!serverId) { alert("Selecione um servidor primeiro."); return; }
    if (!hoverPos) { alert("Use o mouse para apontar para um bloco que será o novo Spawn."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/world/set-spawn", { 
         method: "POST", headers: {"Content-Type": "application/json"},
         body: JSON.stringify({ serverId, worldName, x: hoverPos[0], y: hoverPos[1], z: hoverPos[2] }) 
      });
      const data = await res.json();
      if (data.success) alert(`Spawn salvo com sucesso em: X:${hoverPos[0]} Y:${hoverPos[1]} Z:${hoverPos[2]}`);
      else alert(data.error || "Erro ao salvar spawn.");
    } catch(e) {
      alert("Erro ao salvar spawn mapa.");
    } finally {
      setLoading(false);
    }
  };

  const applyFill = () => {
      if (!pos1 || !pos2) { alert("Selecione a área primeiro (Clique 2 pontos)"); return; }
      const newBlocks = [...blocks];
      const minX = Math.min(pos1[0], pos2[0]); const maxX = Math.max(pos1[0], pos2[0]);
      const minY = Math.min(pos1[1], pos2[1]); const maxY = Math.max(pos1[1], pos2[1]);
      const minZ = Math.min(pos1[2], pos2[2]); const maxZ = Math.max(pos1[2], pos2[2]);
      
      const mapName = (col: string) => col === 'wood' ? 'oak_log' : col === 'grass' ? 'grass_block' : col === 'leaves' ? 'oak_leaves' : col;
      for (let x=minX; x<=maxX; x++) {
        for (let y=minY; y<=maxY; y++) {
          for (let z=minZ; z<=maxZ; z++) {
            const idx = newBlocks.findIndex(b => b.pos[0]===x && b.pos[1]===y && b.pos[2]===z);
            if (idx>=0) {
              newBlocks[idx].color = blockType;
              newBlocks[idx].name = mapName(blockType);
            }
            else newBlocks.push({pos:[x,y,z], color:blockType, name: mapName(blockType)});
          }
        }
      }
      updateBlocks(newBlocks);
  };

  return (
    <div className="w-full flex flex-col h-[70vh] min-h-[500px] border border-zinc-800 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl relative font-sans">
      
      {/* Top Menu Bar */}
      <div className="h-10 bg-[#2d2d2d] border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
         <div className="flex items-center gap-4 text-zinc-300 text-xs font-semibold overflow-x-auto custom-scrollbar whitespace-nowrap hidden sm:flex">
           <span className="flex items-center gap-2 text-emerald-400"><MapIcon size={14}/> MCEdit 2.0 Web Engine</span>
           <div className="h-4 w-px bg-zinc-600"></div>
           <button onClick={undo} className="hover:text-white disabled:opacity-30" disabled={history.past.length===0}>Undo</button>
           <button onClick={redo} className="hover:text-white disabled:opacity-30" disabled={history.future.length===0}>Redo</button>
         </div>
         <div className="flex items-center gap-3">
             {serverSeed && (
               <a 
                 href={`https://www.chunkbase.com/apps/seed-map#seed=${serverSeed}&platform=java_1_21&dimension=overworld&x=${coords.x}&z=${coords.z}&zoom=0.014`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-purple-600/80 hover:bg-purple-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1 shrink-0"
               >
                 <MapIcon size={12}/> Seed Map
               </a>
             )}
             <span className="bg-[#1e1e1e] border border-zinc-700 rounded px-2 py-0.5 text-[10px] sm:text-xs text-emerald-400">
               {worldName || 'world'}
               {availableWorlds.length > 0 && (
                 <select 
                   value={worldName} 
                   onChange={(e) => setWorldName(e.target.value)}
                   className="ml-2 bg-transparent outline-none border-none text-emerald-400 cursor-pointer"
                 >
                   {availableWorlds.map(w => (
                     <option key={w} value={w} className="bg-[#1e1e1e]">{w}</option>
                   ))}
                 </select>
               )}
             </span>
             <button onClick={() => loadWorldChunk(coords.x, coords.y, coords.z, worldName)} disabled={loading} className="bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1 shrink-0"><Upload size={12}/> <span className="hidden sm:inline">Load Chunk</span></button>
             <button onClick={saveWorldChunk} disabled={loading} className="bg-blue-600/80 hover:bg-blue-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1 shrink-0"><Save size={12}/> <span className="hidden sm:inline">Save</span></button>
             <button onClick={setWorldSpawn} disabled={loading} className="bg-amber-600/80 hover:bg-amber-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1 shrink-0"><MapIcon size={12}/> <span className="hidden sm:inline">Set Spawn</span></button>
             {hoverPos && (
               <span className="ml-auto bg-black/50 text-emerald-300 font-mono text-[10px] sm:text-xs px-2 py-1 rounded">
                 X:{hoverPos[0]} Y:{hoverPos[1]} Z:{hoverPos[2]}
               </span>
             )}
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Toolbar */}
        <div className="w-16 bg-[#252526] border-r border-zinc-800 flex flex-col items-center py-2 gap-2 shrink-0 z-10">
           <ToolButton icon={<MousePointer2 size={18}/>} label="Select" active={activeTool==='select'} onClick={()=>setActiveTool('select')} />
           <ToolButton icon={<Hammer size={18}/>} label="Brush" active={activeTool==='brush'} onClick={()=>setActiveTool('brush')} />
           <ToolButton icon={<Eraser size={18}/>} label="Erase" active={activeTool==='eraser'} onClick={()=>setActiveTool('eraser')} />
           <div className="w-8 h-px bg-zinc-700 my-1"></div>
           <ToolButton icon={<Focus size={18}/>} label="Fill" onClick={applyFill} />
           <ToolButton icon={<Copy size={18}/>} label="Copy" onClick={handleCopy} />
           <ToolButton icon={<ClipboardPaste size={18}/>} label="Paste" onClick={handlePaste} />
           <div className="w-8 h-px bg-zinc-700 my-1"></div>
           <ToolButton icon={<Download size={18}/>} label="Export" onClick={handleExportSchematic} />
           <label className="flex flex-col items-center justify-center w-12 h-12 rounded transition-colors group relative hover:bg-zinc-700/50 cursor-pointer text-zinc-400">
             <Upload size={18}/>
             <span className="text-[9px] mt-1 font-medium">Import</span>
             <input type="file" accept=".json" className="hidden" onChange={handleImportSchematic} />
           </label>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative bg-[#1a1a1a]">
          <Canvas frameloop="demand" camera={{ position: [coords.x + 10, coords.y + 15, coords.z + 20], fov: 60 }} gl={{ antialias: true }}>
             <CameraRepositioner coords={coords} />
             <ambientLight intensity={0.6} />
             <directionalLight position={[100, 200, 50]} intensity={1.5} castShadow />
             <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
             
             <FlyControls movementSpeed={10} rollSpeed={Math.PI / 6} dragToLook={true} makeDefault />
             
             <gridHelper args={[100, 100, 0x444444, 0x222222]} position={[coords.x, coords.y - 1, coords.z]} />
             
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[coords.x, coords.y - 1, coords.z]} 
                onClick={(e) => { e.stopPropagation(); handleSelect([Math.round(e.point.x), coords.y, Math.round(e.point.z)]); }}
                onPointerMove={(e) => { e.stopPropagation(); setHoverPos([Math.round(e.point.x), coords.y, Math.round(e.point.z)]); }}
                onPointerOut={() => setHoverPos(null)}
             >
               <planeGeometry args={[100, 100]} />
               <meshBasicMaterial visible={false} />
             </mesh>

             <CursorHighlight position={hoverPos} />
             {pos1 && pos2 && <SelectionBox start={pos1} end={pos2} />}
             {pos1 && !pos2 && <CursorHighlight position={pos1} />}

             <BlockGroup blocks={blocks} colorStr="grass" hex="#55aa55" onSelect={handleSelect} onHover={setHoverPos} />
             <BlockGroup blocks={blocks} colorStr="dirt" hex="#855522" onSelect={handleSelect} onHover={setHoverPos} />
             <BlockGroup blocks={blocks} colorStr="stone" hex="#888888" onSelect={handleSelect} onHover={setHoverPos} />
             <BlockGroup blocks={blocks} colorStr="wood" hex="#5c4033" onSelect={handleSelect} onHover={setHoverPos} />
             <BlockGroup blocks={blocks} colorStr="leaves" hex="#228b22" onSelect={handleSelect} onHover={setHoverPos} />
             <BlockGroup blocks={blocks} colorStr="glass" hex="#aaddff" onSelect={handleSelect} onHover={setHoverPos} />
             <BlockGroup blocks={blocks} colorStr="water" hex="#3333ff" onSelect={handleSelect} onHover={setHoverPos} />
             <BlockGroup blocks={blocks} colorStr="sand" hex="#c2b280" onSelect={handleSelect} onHover={setHoverPos} />
             
          </Canvas>

          {/* Floating UI OVER Canvas */}
          <div className="absolute right-4 top-4 bg-[#252526] border border-zinc-800 rounded shadow-lg p-3 text-white text-xs w-48 font-mono">
             <div className="font-bold mb-2 text-zinc-300 uppercase tracking-widest text-[10px]">Chunk Origin</div>
             <div className="flex gap-2 mb-3">
                <input type="number" value={coords.x} onChange={e=>setCoords({...coords, x:parseFloat(e.target.value)||0})} className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-1 text-center" />
                <input type="number" value={coords.z} onChange={e=>setCoords({...coords, z:parseFloat(e.target.value)||0})} className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-1 text-center" />
             </div>
             
             <div className="font-bold mb-2 text-zinc-300 uppercase tracking-widest text-[10px]">Material (Brush/Fill)</div>
             <select value={blockType} onChange={e=>setBlockType(e.target.value)} className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-1 mb-2 outline-none text-emerald-400">
                <option value="stone">Stone</option>
                <option value="grass">Grass Block</option>
                <option value="dirt">Dirt</option>
                <option value="wood">Oak Log</option>
                <option value="leaves">Leaves</option>
                <option value="glass">Glass</option>
                <option value="water">Water</option>
                <option value="sand">Sand</option>
             </select>

             <div className="mt-4 pt-2 border-t border-zinc-700 text-[10px] text-zinc-400">
               Total Blocks: {blocks.length}<br/>
               State: {selectionState === 0 ? 'No Selection' : selectionState===1 ? 'Pos 1 Set' : 'Selected'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, active, disabled, onClick }: { icon: React.ReactNode, label: string, active?: boolean, disabled?: boolean, onClick: () => void }) {
   return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded transition-colors group relative
           ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-700/50 cursor-pointer'} 
           ${active ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50' : 'text-zinc-400'}`}
      >
         {icon}
         <span className="text-[9px] mt-1 font-medium">{label}</span>
      </button>
   );
}
