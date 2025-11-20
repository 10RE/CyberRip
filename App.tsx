/// <reference lib="dom" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMap, TileType, PlayerState, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, FuneralData, Interactable, Position } from './types';
import PixelMap from './components/PixelMap';
import { Modal } from './components/Modal';
import { generateWittyEulogy, generateTombstoneInscription } from './services/geminiService';

// --- CONSTANTS ---
const MOVEMENT_SPEED = 4;
const PLAYER_HITBOX_SIZE = 24; // Visual size is bigger, but collision box is smaller (feet)
const SCALE = 3; // Zoom level for that chunky pixel look

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

  // Coffin (Center of room)
  tiles[6][6] = TileType.COFFIN;
  tiles[6][5] = TileType.ALTAR; // Flowers
  interactables['6,6'] = { type: 'coffin', id: 'main_coffin' };
  interactables['6,5'] = { type: 'coffin', id: 'main_coffin_flowers' };

  // Graveyard (Right side) - Garden vibe
  const tombstonePositions = [[13, 3], [13, 6], [15, 3], [15, 6], [17, 4], [17, 8], [12, 12], [14, 13], [16, 13], [18, 12]];
  tombstonePositions.forEach(([x, y]) => {
      if(y < MAP_HEIGHT && x < MAP_WIDTH) {
          tiles[y][x] = TileType.TOMBSTONE;
          interactables[`${y},${x}`] = { type: 'tombstone', id: `grave_${x}_${y}` };
      }
  });

  // Priest NPC (Near door)
  interactables['9,7'] = { type: 'priest', id: 'priest', message: "Submissions for the next funeral are open." };

  return { width: MAP_WIDTH, height: MAP_HEIGHT, tiles, interactables };
};

// --- INITIAL DATA ---
const INITIAL_FUNERAL: FuneralData = {
  id: 'init',
  deceasedName: 'Your Productivity',
  causeOfDeath: 'One "Quick" Game',
  eulogy: "We gathered here to mourn the loss of Your Productivity. It fought valiantly against the urge to min-max a virtual farm, but alas, the turnips won.",
  timestamp: Date.now(),
  attendees: 42
};

const App: React.FC = () => {
  const [map] = useState<GameMap>(generateMap());
  const [player, setPlayer] = useState<PlayerState>({
    pos: { x: 5 * TILE_SIZE, y: 8 * TILE_SIZE }, // Start in pixel coordinates
    direction: 'down',
    isMoving: false
  });
  
  const [currentFuneral, setCurrentFuneral] = useState<FuneralData>(INITIAL_FUNERAL);
  const [modalContent, setModalContent] = useState<{title: string, body: React.ReactNode} | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Input State
  const keysPressed = useRef<Set<string>>(new Set());
  const lastTime = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- GAME LOOP ---
  const updateGame = useCallback((time: number) => {
    if (!lastTime.current) lastTime.current = time;
    const deltaTime = time - lastTime.current; // In case we want frame independence later
    lastTime.current = time;

    if (modalContent) {
        requestRef.current = requestAnimationFrame(updateGame);
        return; // Pause movement when modal is open
    }

    let dx = 0;
    let dy = 0;

    const k = keysPressed.current;
    if (k.has('arrowup') || k.has('w')) dy -= 1;
    if (k.has('arrowdown') || k.has('s')) dy += 1;
    if (k.has('arrowleft') || k.has('a')) dx -= 1;
    if (k.has('arrowright') || k.has('d')) dx += 1;

    // Normalize vector for diagonal movement
    if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * MOVEMENT_SPEED;
        dy = (dy / length) * MOVEMENT_SPEED;
    }

    if (dx !== 0 || dy !== 0) {
        setPlayer(prev => {
            const nextX = prev.pos.x + dx;
            const nextY = prev.pos.y + dy;
            
            // Collision Check (AABB)
            // We check the feet position
            const hitboxOffset = (TILE_SIZE - PLAYER_HITBOX_SIZE) / 2;
            
            const checkCollision = (x: number, y: number) => {
                // Define player hitbox (bottom center of sprite)
                const left = x + hitboxOffset;
                const right = x + TILE_SIZE - hitboxOffset;
                const top = y + TILE_SIZE / 2; // only bottom half collides
                const bottom = y + TILE_SIZE - 4;

                // Check corners
                const corners = [
                    { x: left, y: top },
                    { x: right, y: top },
                    { x: left, y: bottom },
                    { x: right, y: bottom }
                ];

                for (const p of corners) {
                    const tileX = Math.floor(p.x / TILE_SIZE);
                    const tileY = Math.floor(p.y / TILE_SIZE);
                    
                    // Boundary check
                    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return true;
                    
                    // Wall check
                    if (map.tiles[tileY][tileX] === TileType.WALL) return true;
                    if (map.tiles[tileY][tileX] === TileType.COFFIN) return true;
                }
                return false;
            };

            let finalX = prev.pos.x;
            let finalY = prev.pos.y;

            // Try X movement
            if (!checkCollision(nextX, prev.pos.y)) {
                finalX = nextX;
            }

            // Try Y movement
            if (!checkCollision(finalX, nextY)) {
                finalY = nextY;
            }

            // Determine direction for sprite
            let dir = prev.direction;
            if (Math.abs(dx) > Math.abs(dy)) {
                dir = dx > 0 ? 'right' : 'left';
            } else if (dy !== 0) {
                dir = dy > 0 ? 'down' : 'up';
            }

            return {
                pos: { x: finalX, y: finalY },
                direction: dir,
                isMoving: true
            };
        });
    } else {
        setPlayer(prev => prev.isMoving ? { ...prev, isMoving: false } : prev);
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [map, modalContent]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateGame]);

  // --- INTERACTION HANDLER ---
  useEffect(() => {
      const handleInteract = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'f') {
              checkInteraction();
          }
      };
      window.addEventListener('keydown', handleInteract);
      return () => window.removeEventListener('keydown', handleInteract);
  }, [player.pos, map]); // Depend on current position

  const checkInteraction = async () => {
    // Find nearest interactable
    const playerCenter = {
        x: player.pos.x + TILE_SIZE / 2,
        y: player.pos.y + TILE_SIZE / 2
    };

    let nearest: Interactable | null = null;
    let minDist = 60; // Interaction radius (pixels)

    Object.entries(map.interactables).forEach(([key, obj]) => {
        const [tx, ty] = key.split(',').map(Number);
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
      if (n.type === 'coffin') openCoffinModal();
      else if (n.type === 'tombstone') await openTombstoneModal();
      else if (n.type === 'priest') openApplicationModal();
    } else {
        // No notification spam
    }
  };

  // --- MODALS LOGIC (Same as before) ---
  const showNotification = (msg: string) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
  }

  const openCoffinModal = () => {
    setModalContent({
      title: `R.I.P. ${currentFuneral.deceasedName}`,
      body: (
        <div className="text-center">
            <div className="text-6xl mb-4 drop-shadow-md">⚰️</div>
            <p className="mb-4 text-gray-600 italic">Died of: {currentFuneral.causeOfDeath}</p>
            <div className="bg-[#fff8e1] p-4 rounded border-2 border-[#d4b078] mb-6 shadow-inner text-[#5d3a1a]">
                <p className="text-lg font-bold">"{currentFuneral.eulogy}"</p>
            </div>
            <div className="flex justify-center gap-4">
                <button className="bg-[#76c34f] text-white px-6 py-3 hover:bg-[#5da83b] pixelated border-b-4 border-[#3e6e28] active:border-b-0 active:translate-y-1 transition-all rounded" onClick={() => {
                    setCurrentFuneral(prev => ({...prev, attendees: prev.attendees + 1}));
                    showNotification("You paid respects. +1 Karma.");
                    setModalContent(null);
                }}>
                    Press F to Pay Respects
                </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">Attendees: {currentFuneral.attendees}</p>
        </div>
      )
    });
  };

  const openTombstoneModal = async () => {
      setModalContent({
          title: "Reading Tombstone...",
          body: <p className="animate-pulse text-center text-[#5d3a1a]">Deciphering mossy text...</p>
      });
      
      const inscription = await generateTombstoneInscription();
      
      setModalContent({
          title: "Ancient Tombstone",
          body: (
              <div className="text-center text-[#2d2d2d]">
                  <div className="bg-gray-300 p-6 rounded-t-full border-4 border-gray-400 w-48 mx-auto mb-4 shadow-lg">
                     <p className="mb-4 font-serif italic">"{inscription}"</p>
                  </div>
                  <button onClick={() => setModalContent(null)} className="text-xs text-gray-500 mt-4 hover:underline">[Walk Away]</button>
              </div>
          )
      })
  }

  const openApplicationModal = () => {
      setModalContent({
          title: "Funeral Application",
          body: <ApplicationForm onSubmit={handleFuneralSubmit} />
      })
  }

  const handleFuneralSubmit = async (name: string, cause: string) => {
      setAiLoading(true);
      const eulogy = await generateWittyEulogy(name, cause);
      setAiLoading(false);

      const newFuneral: FuneralData = {
          id: Date.now().toString(),
          deceasedName: name,
          causeOfDeath: cause,
          eulogy: eulogy,
          timestamp: Date.now(),
          attendees: 0
      };

      setCurrentFuneral(newFuneral);
      setModalContent(null);
      showNotification("New Ceremony Started!");
  };
  

  // --- CAMERA RENDER CALCULATION ---
  // Center of player sprite
  const playerCenterWorldX = player.pos.x + (TILE_SIZE / 2);
  const playerCenterWorldY = player.pos.y + (TILE_SIZE / 2);

  // Camera translation
  const camX = (viewport.w / (2 * SCALE)) - playerCenterWorldX;
  const camY = (viewport.h / (2 * SCALE)) - playerCenterWorldY;

  return (
    <div className="w-full h-screen relative overflow-hidden select-none bg-[#f0e6d2]">
      
      {/* WORLD CONTAINER */}
      <div 
        style={{
            transform: `scale(${SCALE}) translate3d(${camX}px, ${camY}px, 0)`,
            transformOrigin: 'top left',
            // Free movement requires instant updates, no CSS transition on the container
        }}
        className="will-change-transform absolute top-0 left-0"
      >
             <PixelMap mapData={map} cameraOffset={{x:0, y:0}} />
             
             {/* Player Entity - Cute Farmer Style */}
             <div 
                style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    position: 'absolute',
                    left: player.pos.x, 
                    top: player.pos.y,
                    zIndex: 20,
                    pointerEvents: 'none'
                }}
                className="flex items-center justify-center"
             >
                 {/* Sprite Container */}
                 <div className={`w-8 h-10 relative ${player.isMoving ? 'animate-bounce' : ''}`}>
                    {/* Body */}
                    <div className="absolute bottom-0 left-1 w-6 h-4 bg-blue-700 rounded-b-sm"></div>
                    {/* Shirt */}
                    <div className="absolute bottom-4 left-1 w-6 h-4 bg-red-500 rounded-t-sm"></div>
                    {/* Head */}
                    <div className="absolute bottom-7 left-1.5 w-5 h-5 bg-[#ffdbac] rounded-sm z-10"></div>
                    {/* Hat */}
                    <div className="absolute bottom-10 left-0 w-8 h-2 bg-[#e4b85d] rounded-sm z-20"></div>
                    <div className="absolute bottom-11 left-2 w-4 h-2 bg-[#e4b85d] rounded-t-sm z-20"></div>
                    
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
                 
                 {/* Name tag */}
                 <div className="absolute -top-8 text-[8px] bg-black/30 px-1 rounded text-white whitespace-nowrap scale-[0.5]">You</div>
             </div>

             {/* NPC Priest Entity */}
             <div 
                style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    position: 'absolute',
                    left: 7 * TILE_SIZE, // 9,7 previously, moved slightly
                    top: 9 * TILE_SIZE,
                    zIndex: 15
                }}
                className="flex items-center justify-center"
             >
                 <div className="w-8 h-10 bg-purple-800 relative flex justify-center animate-float rounded-t-xl">
                    <div className="w-full h-2 bg-yellow-500 absolute top-4"></div>
                    <div className="w-2 h-2 bg-[#ffdbac] absolute top-1 rounded-full"></div>
                 </div>
                 <div className="absolute -top-6 text-[8px] text-gray-600 whitespace-nowrap scale-[0.5] font-bold">Director</div>
             </div>
      </div>

      {/* UI OVERLAY - Brighter Theme */}
      <div className="absolute top-4 left-4 z-50 stardew-box p-4 text-xs max-w-md text-[#5d3a1a]">
         <h1 className="text-xl mb-2 text-[#d32f2f] drop-shadow-sm">CyberRip v2.0</h1>
         <div className="bg-[#fff8e1] p-2 rounded border border-[#d4b078]">
            <p className="mb-1 font-bold uppercase text-xs text-gray-500">Now Departing:</p>
            <p className="text-[#388e3c] text-lg">{currentFuneral.deceasedName}</p>
            <p className="text-gray-600 italic">Cause: {currentFuneral.causeOfDeath}</p>
         </div>
         <div className="mt-2 text-[10px] text-[#5d3a1a]/70">
             Use [WASD] to walk. [F] to interact.
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
        onClose={() => !aiLoading && setModalContent(null)}
      >
        {modalContent?.body}
      </Modal>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ApplicationForm: React.FC<{ onSubmit: (name: string, cause: string) => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [cause, setCause] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !cause) return;
        setLoading(true);
        await onSubmit(name, cause);
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="animate-pulse text-[#e4b85d] font-bold text-xl">Consulting the Spirits...</p>
                <p className="text-xs text-gray-400 mt-2">Generating witty eulogy</p>
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
                Start Funeral
            </button>
        </form>
    )
}

export default App;