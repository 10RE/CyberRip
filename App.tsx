/// <reference lib="dom" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMap, TileType, PlayerState, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, FuneralData, Interactable, CharacterAppearance, DirectorPhase } from './types';
import PixelMap from './components/PixelMap';
import { Modal } from './components/Modal';
import { generateWittyEulogy } from './services/geminiService';

// --- CONSTANTS ---
const MOVEMENT_SPEED = 4;
const PLAYER_HITBOX_SIZE = 24;

// --- ASSETS & OPTIONS ---
const HAT_COLORS = ['#e4b85d', '#333333', '#d32f2f', '#388e3c', '#1976d2'];
const SHIRT_COLORS = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#795548'];
const PANTS_COLORS = ['#1565c0', '#3e2723', '#212121', '#558b2f'];

// --- MAP GENERATION ---
const generateMap = (): GameMap => {
  const tiles: TileType[][] = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(TileType.GRASS));
  const interactables: Record<string, Interactable> = {};

  // Build the Funeral Home (Left side) - Wooden structure
  for (let y = 2; y < 12; y++) {
    for (let x = 2; x < 11; x++) {
      if (y === 2 || y === 11 || x === 2 || x === 10) {
        tiles[y][x] = TileType.WALL;
      } else {
        tiles[y][x] = TileType.FLOOR;
      }
    }
  }
  
  // Door
  tiles[11][6] = TileType.DOOR;

  // Coffin Spot (Center of room) - Now just floor, Coffin is an Entity
  tiles[6][6] = TileType.FLOOR; 
  tiles[6][5] = TileType.ALTAR; // Flowers
  
  // Chairs (Rows)
  const chairRows = [[4,4], [4,8], [8,4], [8,8]];
  chairRows.forEach(([y, x]) => {
      tiles[y][x] = TileType.CHAIR;
      tiles[y][x+1] = TileType.CHAIR;
      interactables[`${y},${x}`] = { type: 'chair', id: `chair_${y}_${x}` };
      interactables[`${y},${x+1}`] = { type: 'chair', id: `chair_${y}_${x+1}` };
  });

  // Graveyard (Right side)
  const tombstonePositions = [[13, 3], [13, 6], [15, 3], [15, 6], [17, 4], [17, 8], [12, 12], [14, 13], [16, 13], [18, 12]];
  tombstonePositions.forEach(([x, y]) => {
      if(y < MAP_HEIGHT && x < MAP_WIDTH) {
          tiles[y][x] = TileType.TOMBSTONE;
          // We removed direct interaction with tombstones for now per request
      }
  });

  // Priest NPC Interaction Point (Next to where he stands)
  interactables['9,7'] = { type: 'priest', id: 'priest', message: "I manage the queue." };

  return { width: MAP_WIDTH, height: MAP_HEIGHT, tiles, interactables };
};

// --- INITIAL DATA ---
const INITIAL_FUNERAL: FuneralData = {
  id: 'init',
  deceasedName: 'Your Motivation',
  causeOfDeath: 'Endless Scrolling',
  eulogy: "It died as it lived: consuming content without creating anything. May it find peace in the algorithm.",
  timestamp: Date.now(),
  attendees: 42
};

const App: React.FC = () => {
  // Settings
  const [zoomLevel, setZoomLevel] = useState(2); // Default to 2x (manageable size)
  
  // Game State
  const [map] = useState<GameMap>(generateMap());
  const [player, setPlayer] = useState<PlayerState>({
    pos: { x: 5 * TILE_SIZE, y: 8 * TILE_SIZE },
    direction: 'down',
    isMoving: false,
    isSitting: false,
    appearance: {
        hatColor: HAT_COLORS[0],
        shirtColor: SHIRT_COLORS[0],
        pantsColor: PANTS_COLORS[0],
        skinColor: '#ffdbac',
        hasHat: true
    }
  });
  
  // Funeral & Director Logic
  const [funeralQueue, setFuneralQueue] = useState<FuneralData[]>([INITIAL_FUNERAL]);
  const [directorPhase, setDirectorPhase] = useState<DirectorPhase>(DirectorPhase.IDLE);
  const [activeCeremony, setActiveCeremony] = useState<FuneralData | null>(null);

  // UI State
  const [modalContent, setModalContent] = useState<{title: string, body: React.ReactNode} | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Input Refs
  const keysPressed = useRef<Set<string>>(new Set());
  const lastTime = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  // --- CEREMONY LOOP ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const advanceCeremony = () => {
        if (directorPhase === DirectorPhase.IDLE && funeralQueue.length > 0 && !activeCeremony) {
            // START CEREMONY
            const next = funeralQueue[0];
            setActiveCeremony(next);
            setFuneralQueue(prev => prev.slice(1));
            setDirectorPhase(DirectorPhase.PREACHING);
        } 
        else if (directorPhase === DirectorPhase.PREACHING) {
            // Move to AMEN
            timer = setTimeout(() => {
                setDirectorPhase(DirectorPhase.AMEN);
            }, 6000); // Read eulogy for 6s
        }
        else if (directorPhase === DirectorPhase.AMEN) {
            // Move to BURIAL
            timer = setTimeout(() => {
                setDirectorPhase(DirectorPhase.BURIAL);
            }, 2000);
        }
        else if (directorPhase === DirectorPhase.BURIAL) {
            // Finish
            timer = setTimeout(() => {
                setDirectorPhase(DirectorPhase.IDLE);
                setActiveCeremony(null);
            }, 4000); // Sinking animation time
        }
    };

    advanceCeremony();
    return () => clearTimeout(timer);
  }, [directorPhase, funeralQueue, activeCeremony]);


  // --- INPUT & GAME LOOP ---
  useEffect(() => {
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    const handleKeyDown = (e: KeyboardEvent) => {
        keysPressed.current.add(e.key.toLowerCase());
        // Break sitting on movement key
        if (player.isSitting && ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) {
            setPlayer(prev => ({ ...prev, isSitting: false, pos: { ...prev.pos, y: prev.pos.y + 10 } })); // Pop out of chair
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [player.isSitting]);

  const updateGame = useCallback((time: number) => {
    if (!lastTime.current) lastTime.current = time;
    // const deltaTime = time - lastTime.current;
    lastTime.current = time;

    if (modalContent || player.isSitting) {
        requestRef.current = requestAnimationFrame(updateGame);
        return; 
    }

    let dx = 0;
    let dy = 0;

    const k = keysPressed.current;
    if (k.has('arrowup') || k.has('w')) dy -= 1;
    if (k.has('arrowdown') || k.has('s')) dy += 1;
    if (k.has('arrowleft') || k.has('a')) dx -= 1;
    if (k.has('arrowright') || k.has('d')) dx += 1;

    // Normalize vector
    if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * MOVEMENT_SPEED;
        dy = (dy / length) * MOVEMENT_SPEED;
    }

    if (dx !== 0 || dy !== 0) {
        setPlayer(prev => {
            const nextX = prev.pos.x + dx;
            const nextY = prev.pos.y + dy;
            
            const hitboxOffset = (TILE_SIZE - PLAYER_HITBOX_SIZE) / 2;
            
            const checkCollision = (x: number, y: number) => {
                const left = x + hitboxOffset;
                const right = x + TILE_SIZE - hitboxOffset;
                const top = y + TILE_SIZE / 2; 
                const bottom = y + TILE_SIZE - 4;

                const corners = [{ x: left, y: top }, { x: right, y: top }, { x: left, y: bottom }, { x: right, y: bottom }];

                for (const p of corners) {
                    const tileX = Math.floor(p.x / TILE_SIZE);
                    const tileY = Math.floor(p.y / TILE_SIZE);
                    
                    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return true;
                    if (map.tiles[tileY][tileX] === TileType.WALL) return true;
                    // Chairs are solid if you walk into them (must interact to sit)
                    // if (map.tiles[tileY][tileX] === TileType.CHAIR) return true; 
                }
                return false;
            };

            let finalX = prev.pos.x;
            let finalY = prev.pos.y;

            if (!checkCollision(nextX, prev.pos.y)) finalX = nextX;
            if (!checkCollision(finalX, nextY)) finalY = nextY;

            let dir = prev.direction;
            if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left';
            else if (dy !== 0) dir = dy > 0 ? 'down' : 'up';

            return { ...prev, pos: { x: finalX, y: finalY }, direction: dir, isMoving: true };
        });
    } else {
        setPlayer(prev => prev.isMoving ? { ...prev, isMoving: false } : prev);
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [map, modalContent, player.isSitting]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updateGame]);


  // --- INTERACTION ---
  useEffect(() => {
      const handleInteract = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'f') checkInteraction();
      };
      window.addEventListener('keydown', handleInteract);
      return () => window.removeEventListener('keydown', handleInteract);
  }, [player.pos, map]);

  const checkInteraction = async () => {
    if (player.isSitting) {
        setPlayer(prev => ({ ...prev, isSitting: false, pos: { ...prev.pos, y: prev.pos.y + 10 } }));
        return;
    }

    const playerCenter = {
        x: player.pos.x + TILE_SIZE / 2,
        y: player.pos.y + TILE_SIZE / 2
    };

    let nearest: Interactable | null = null;
    let minDist = 60;

    Object.entries(map.interactables).forEach(([key, obj]) => {
        const [ty, tx] = key.split(',').map(Number); // NOTE: key is "y,x" in map gen
        const objCenter = {
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2
        };
        const dist = Math.hypot(playerCenter.x - objCenter.x, playerCenter.y - objCenter.y);
        if (dist < minDist) {
            minDist = dist;
            nearest = obj;
        }
    });

    if (nearest) {
      const n = nearest as Interactable;
      if (n.type === 'priest') openApplicationModal();
      else if (n.type === 'chair') {
         // Sit logic
         const [y, x] = n.id.split('_').slice(1).map(Number);
         setPlayer(prev => ({
             ...prev,
             isSitting: true,
             isMoving: false,
             direction: 'down',
             pos: { x: x * TILE_SIZE, y: y * TILE_SIZE - 10 } // Sit slightly higher
         }));
      }
    }
  };

  // --- UI HANDLERS ---
  const toggleZoom = () => setZoomLevel(prev => prev >= 3 ? 1 : prev + 1);

  const showNotification = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
  }

  const openApplicationModal = () => {
      setModalContent({
          title: "Funeral Application",
          body: <ApplicationForm onSubmit={handleFuneralSubmit} />
      })
  }
  
  const openCustomizationModal = () => {
      setModalContent({
          title: "Wardrobe",
          body: <CustomizationForm player={player} setPlayer={setPlayer} close={() => setModalContent(null)} />
      })
  }

  const handleFuneralSubmit = async (name: string, cause: string) => {
      setModalContent(null);
      showNotification("Submitting to the spirits...");
      const eulogy = await generateWittyEulogy(name, cause);

      const newFuneral: FuneralData = {
          id: Date.now().toString(),
          deceasedName: name,
          causeOfDeath: cause,
          eulogy: eulogy,
          timestamp: Date.now(),
          attendees: 0
      };

      setFuneralQueue(prev => [...prev, newFuneral]);
      showNotification("Added to Queue!");
  };
  

  // --- CAMERA CALCULATION ---
  const playerCenterWorldX = player.pos.x + (TILE_SIZE / 2);
  const playerCenterWorldY = player.pos.y + (TILE_SIZE / 2);
  const camX = (viewport.w / (2 * zoomLevel)) - playerCenterWorldX;
  const camY = (viewport.h / (2 * zoomLevel)) - playerCenterWorldY;

  return (
    <div className="w-full h-screen relative overflow-hidden select-none bg-[#f0e6d2]">
      
      {/* WORLD CONTAINER */}
      <div 
        style={{
            transform: `scale(${zoomLevel}) translate3d(${camX}px, ${camY}px, 0)`,
            transformOrigin: 'top left',
        }}
        className="will-change-transform absolute top-0 left-0"
      >
             <PixelMap mapData={map} />
             
             {/* DYNAMIC ENTITIES LAYER */}

             {/* COFFIN ENTITY */}
             <div
                style={{
                    position: 'absolute',
                    left: 6 * TILE_SIZE,
                    top: 6 * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    zIndex: 9,
                    transition: 'all 3s ease-in-out',
                    transform: directorPhase === DirectorPhase.BURIAL ? 'translateY(48px)' : 'translateY(0)',
                    opacity: directorPhase === DirectorPhase.BURIAL ? 0 : 1
                }}
                className="flex items-center justify-center text-3xl"
             >
                 ⚰️
             </div>

             {/* PLAYER ENTITY */}
             <div 
                style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    position: 'absolute',
                    left: player.pos.x, 
                    top: player.pos.y,
                    zIndex: player.isSitting ? 15 : 20, // Behind chair armrest if sitting?
                    pointerEvents: 'none'
                }}
                className="flex items-center justify-center"
             >
                 {/* Sprite Container */}
                 <div className={`w-8 h-10 relative ${player.isMoving ? 'animate-bounce' : ''} ${player.isSitting ? 'translate-y-2' : ''}`}>
                    {/* Body */}
                    <div className="absolute bottom-0 left-1 w-6 h-4 rounded-b-sm" style={{backgroundColor: player.appearance.pantsColor}}></div>
                    {/* Shirt */}
                    <div className="absolute bottom-4 left-1 w-6 h-4 rounded-t-sm" style={{backgroundColor: player.appearance.shirtColor}}></div>
                    {/* Head */}
                    <div className="absolute bottom-7 left-1.5 w-5 h-5 rounded-sm z-10" style={{backgroundColor: player.appearance.skinColor}}></div>
                    {/* Hat */}
                    {player.appearance.hasHat && (
                        <>
                            <div className="absolute bottom-10 left-0 w-8 h-2 rounded-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                            <div className="absolute bottom-11 left-2 w-4 h-2 rounded-t-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                        </>
                    )}
                    
                    {/* Face Directions */}
                    {player.direction === 'right' && <div className="absolute top-3 right-2 w-1 h-1 bg-black z-30"></div>}
                    {player.direction === 'left' && <div className="absolute top-3 left-2 w-1 h-1 bg-black z-30"></div>}
                    {player.direction === 'down' && (
                        <>
                            <div className="absolute top-3 left-2.5 w-1 h-1 bg-black z-30"></div>
                            <div className="absolute top-3 right-2.5 w-1 h-1 bg-black z-30"></div>
                        </>
                    )}
                 </div>
                 
                 <div className="absolute -top-8 text-[8px] bg-black/30 px-1 rounded text-white whitespace-nowrap scale-[0.5]">You</div>
             </div>

             {/* PRIEST / DIRECTOR ENTITY */}
             <div 
                style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    position: 'absolute',
                    left: 7 * TILE_SIZE,
                    top: 9 * TILE_SIZE,
                    zIndex: 15
                }}
                className="flex items-center justify-center"
             >
                 <div className={`w-8 h-10 bg-purple-800 relative flex justify-center rounded-t-xl ${directorPhase === DirectorPhase.PREACHING ? 'animate-pulse' : 'animate-float'}`}>
                    <div className="w-full h-2 bg-yellow-500 absolute top-4"></div>
                    <div className="w-2 h-2 bg-[#ffdbac] absolute top-1 rounded-full"></div>
                 </div>
                 
                 {/* SPEECH BUBBLE */}
                 {directorPhase !== DirectorPhase.IDLE && activeCeremony && (
                     <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 bg-white p-2 rounded border-2 border-black text-[8px] z-50 flex flex-col items-center text-center shadow-lg">
                         {directorPhase === DirectorPhase.PREACHING && (
                             <>
                                <span className="font-bold mb-1 text-red-600">{activeCeremony.deceasedName}</span>
                                <span className="italic text-gray-800 leading-tight">"{activeCeremony.eulogy}"</span>
                             </>
                         )}
                         {directorPhase === DirectorPhase.AMEN && (
                             <span className="text-lg font-bold text-blue-800">AMEN.</span>
                         )}
                         {directorPhase === DirectorPhase.BURIAL && (
                             <span className="text-gray-500">*Dirt shoveling sounds*</span>
                         )}
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 border-black rotate-45"></div>
                     </div>
                 )}
             </div>
      </div>

      {/* UI OVERLAY */}
      <div className="absolute top-4 left-4 z-50 stardew-box p-4 text-xs max-w-xs text-[#5d3a1a]">
         <h1 className="text-xl mb-2 text-[#d32f2f] drop-shadow-sm flex justify-between items-center">
             CyberRip 
             <span className="text-[10px] bg-[#8b4513] text-white px-2 rounded">{funeralQueue.length} in Queue</span>
         </h1>
         
         {activeCeremony ? (
             <div className="bg-[#fff8e1] p-2 rounded border border-[#d4b078]">
                <p className="mb-1 font-bold uppercase text-xs text-gray-500">Currently Burying:</p>
                <p className="text-[#388e3c] text-md">{activeCeremony.deceasedName}</p>
                <p className="text-gray-600 italic text-[10px]">{activeCeremony.causeOfDeath}</p>
             </div>
         ) : (
             <div className="p-2 text-gray-500 italic">Waiting for next funeral...</div>
         )}

         <div className="mt-4 flex gap-2">
             <button onClick={openCustomizationModal} className="flex-1 bg-[#2196f3] text-white p-2 rounded border-b-2 border-[#0d47a1] hover:bg-[#1e88e5] active:border-b-0 active:translate-y-1">
                 Wardrobe
             </button>
             <button onClick={toggleZoom} className="flex-1 bg-[#795548] text-white p-2 rounded border-b-2 border-[#3e2723] hover:bg-[#6d4c41] active:border-b-0 active:translate-y-1">
                 Zoom: {zoomLevel}x
             </button>
         </div>

         <div className="mt-2 text-[10px] text-[#5d3a1a]/70">
             [WASD] Move | [F] Interact/Sit
         </div>
      </div>
      
      {/* Notification Toast */}
      {notification && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#fff8e1] text-[#5d3a1a] px-6 py-3 border-2 border-[#8b4513] rounded-full z-50 animate-bounce shadow-lg font-bold">
              {notification}
          </div>
      )}

      {/* Modal Manager */}
      <Modal 
        isOpen={!!modalContent} 
        title={modalContent?.title || ''} 
        onClose={() => setModalContent(null)}
      >
        {modalContent?.body}
      </Modal>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const CustomizationForm: React.FC<{player: PlayerState, setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>, close: () => void}> = ({player, setPlayer, close}) => {
    const ColorPicker = ({label, colors, current, onSelect}: any) => (
        <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2 uppercase">{label}</label>
            <div className="flex flex-wrap gap-2">
                {colors.map((c: string) => (
                    <button
                        key={c}
                        className={`w-6 h-6 rounded border-2 ${current === c ? 'border-white scale-110' : 'border-transparent hover:border-gray-500'}`}
                        style={{backgroundColor: c}}
                        onClick={() => onSelect(c)}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center">
             {/* Preview */}
             <div className="w-16 h-20 bg-[#f0e6d2] rounded mb-6 border-2 border-[#8b4513] flex items-center justify-center scale-150">
                 <div className="w-8 h-10 relative">
                    <div className="absolute bottom-0 left-1 w-6 h-4 rounded-b-sm" style={{backgroundColor: player.appearance.pantsColor}}></div>
                    <div className="absolute bottom-4 left-1 w-6 h-4 rounded-t-sm" style={{backgroundColor: player.appearance.shirtColor}}></div>
                    <div className="absolute bottom-7 left-1.5 w-5 h-5 rounded-sm z-10" style={{backgroundColor: player.appearance.skinColor}}></div>
                    {player.appearance.hasHat && (
                        <>
                            <div className="absolute bottom-10 left-0 w-8 h-2 rounded-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                            <div className="absolute bottom-11 left-2 w-4 h-2 rounded-t-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                        </>
                    )}
                     <div className="absolute top-3 left-2.5 w-1 h-1 bg-black z-30"></div>
                     <div className="absolute top-3 right-2.5 w-1 h-1 bg-black z-30"></div>
                 </div>
             </div>

             <div className="w-full bg-[#2d2d2d] p-4 rounded">
                 <ColorPicker 
                    label="Hat Color" 
                    colors={HAT_COLORS} 
                    current={player.appearance.hatColor}
                    onSelect={(c: string) => setPlayer(p => ({...p, appearance: {...p.appearance, hatColor: c}}))}
                 />
                 <ColorPicker 
                    label="Shirt Color" 
                    colors={SHIRT_COLORS} 
                    current={player.appearance.shirtColor}
                    onSelect={(c: string) => setPlayer(p => ({...p, appearance: {...p.appearance, shirtColor: c}}))}
                 />
                 <ColorPicker 
                    label="Pants Color" 
                    colors={PANTS_COLORS} 
                    current={player.appearance.pantsColor}
                    onSelect={(c: string) => setPlayer(p => ({...p, appearance: {...p.appearance, pantsColor: c}}))}
                 />
                 
                 <div className="flex items-center gap-2 mt-4">
                     <input 
                        type="checkbox" 
                        checked={player.appearance.hasHat} 
                        onChange={e => setPlayer(p => ({...p, appearance: {...p.appearance, hasHat: e.target.checked}}))}
                        className="w-4 h-4"
                     />
                     <label className="text-white text-xs">Wear Hat</label>
                 </div>
             </div>

             <button onClick={close} className="mt-6 w-full bg-[#76c34f] text-white py-2 rounded border-b-4 border-[#5da83b] active:border-b-0 active:translate-y-1">
                 Looks Good
             </button>
        </div>
    )
}

const ApplicationForm: React.FC<{ onSubmit: (name: string, cause: string) => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [cause, setCause] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !cause) return;
        setLoading(true);
        await onSubmit(name, cause); // Note: we await here but the modal closes immediately in parent, async happens in bg
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="animate-pulse text-[#e4b85d] font-bold text-xl">Consulting the Spirits...</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs text-gray-400 mb-1">WHO/WHAT DIED?</label>
                <input 
                    type="text" 
                    maxLength={25}
                    className="w-full bg-[#2d2d2d] border border-gray-600 p-3 text-white focus:border-[#e4b85d] outline-none rounded"
                    placeholder="e.g. My Diet, John Doe"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">CAUSE OF DEATH?</label>
                <input 
                    type="text" 
                    maxLength={40}
                    className="w-full bg-[#2d2d2d] border border-gray-600 p-3 text-white focus:border-[#e4b85d] outline-none rounded"
                    placeholder="e.g. Ate too much cheese"
                    value={cause}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCause(e.target.value)}
                />
            </div>
            <button 
                type="submit" 
                className="bg-[#d32f2f] text-white p-3 border-b-4 border-[#9a0007] hover:bg-[#c62828] active:border-b-0 active:translate-y-1 transition-all mt-2 uppercase tracking-widest rounded font-bold"
            >
                Queue for Funeral
            </button>
        </form>
    )
}

export default App;