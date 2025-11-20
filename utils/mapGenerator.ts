import { TileType, GameMap, Interactable, MAP_WIDTH, MAP_HEIGHT, NPC, TILE_SIZE } from '../types';

const getRandomColor = (colors: string[]) => colors[Math.floor(Math.random() * colors.length)];
const HAT_COLORS = ['#e4b85d', '#333333', '#d32f2f', '#388e3c', '#1976d2'];
const SHIRT_COLORS = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#795548'];
const PANTS_COLORS = ['#1565c0', '#3e2723', '#212121', '#558b2f'];

export const generateMap = (): GameMap => {
  const tiles: TileType[][] = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(TileType.GRASS));
  const interactables: Record<string, Interactable> = {};
  const npcs: NPC[] = [];

  // Helper to draw filled rectangles
  const drawRect = (x1: number, y1: number, x2: number, y2: number, type: TileType, border = false) => {
      for(let y=y1; y<=y2; y++) {
          for(let x=x1; x<=x2; x++) {
              if (border && (x===x1 || x===x2 || y===y1 || y===y2)) {
                  tiles[y][x] = TileType.WALL;
              } else {
                  tiles[y][x] = type;
              }
          }
      }
  };

  // Helper to place single objects
  const place = (x: number, y: number, type: TileType, interactable?: Interactable) => {
      tiles[y][x] = type;
      if (interactable) interactables[`${y},${x}`] = interactable;
  }

  // Helper to spawn NPC
  const spawnNPC = (x: number, y: number) => {
      // 60% chance to be empty
      if (Math.random() > 0.4) return; 
      npcs.push({
          id: `npc_${x}_${y}`,
          pos: { x: x * TILE_SIZE, y: y * TILE_SIZE - 10 }, // Sit offset
          appearance: {
              hatColor: getRandomColor(HAT_COLORS),
              shirtColor: getRandomColor(SHIRT_COLORS),
              pantsColor: getRandomColor(PANTS_COLORS),
              skinColor: '#ffdbac',
              hasHat: Math.random() > 0.5
          }
      });
  }

  // --- GRAVEYARD (Perimeter) ---
  for(let y=1; y<MAP_HEIGHT-1; y++) {
      for(let x=1; x<MAP_WIDTH-1; x++) {
         const r = Math.random();
         const isEdge = x < 8 || x > 31 || y < 6 || y > 24;
         if (isEdge && tiles[y][x] === TileType.GRASS) {
             if (r < 0.08) tiles[y][x] = TileType.TOMBSTONE;
             else if (r < 0.12) tiles[y][x] = TileType.TREE;
             else if (r < 0.15) tiles[y][x] = TileType.FLOWER;
         }
      }
  }
  drawRect(18, 0, 21, 8, TileType.PATH); 
  drawRect(18, 24, 21, 29, TileType.PATH); 
  drawRect(0, 14, 8, 16, TileType.PATH); 
  drawRect(32, 14, 39, 16, TileType.PATH); 

  // --- BUILDING (Central Block) ---
  const bX1 = 10, bY1 = 6, bX2 = 29, bY2 = 24;
  
  // 1. CHAPEL (Upper Room)
  drawRect(bX1, bY1, bX2, 17, TileType.FLOOR, true);
  
  // Windows on back wall
  place(13, bY1, TileType.WINDOW);
  place(16, bY1, TileType.WINDOW);
  place(23, bY1, TileType.WINDOW);
  place(26, bY1, TileType.WINDOW);

  drawRect(19, bY1 + 1, 20, 17, TileType.CARPET); // Aisle

  // Altar Area
  // Priest stands at 19,7 (Visual). Interaction triggered at 19,9 (Before Altar)
  interactables[`9,19`] = { type: 'priest', id: 'priest', message: "Shh..." };
  interactables[`9,20`] = { type: 'priest', id: 'priest_alt', message: "Shh..." };

  place(19, bY1 + 2, TileType.ALTAR);
  place(20, bY1 + 2, TileType.ALTAR);
  place(18, bY1 + 2, TileType.CANDLE);
  place(21, bY1 + 2, TileType.CANDLE);
  
  place(17, bY1 + 2, TileType.PODIUM);

  // Benches & NPCs
  const benchRows = [10, 12, 14, 16];
  benchRows.forEach(y => {
      // Left pews
      [12, 13, 14, 15, 16].forEach(x => {
          place(x, y, TileType.BENCH, { type: 'chair', id: `pew_${y}_${x}` });
          spawnNPC(x, y);
      });
      // Right pews
      [23, 24, 25, 26, 27].forEach(x => {
          place(x, y, TileType.BENCH, { type: 'chair', id: `pew_${y}_${x}` });
          spawnNPC(x, y);
      });
  });
  
  // 2. RECEPTION (Lower Room)
  drawRect(bX1, 17, bX2, bY2, TileType.FLOOR, true);
  drawRect(bX1 + 1, 17, bX2 - 1, 17, TileType.WALL); // Divider
  place(19, 17, TileType.DOOR);
  place(20, 17, TileType.DOOR);
  place(19, 24, TileType.DOOR); // Main Entrance
  place(20, 24, TileType.DOOR);
  place(18, 24, TileType.CANDLE); 
  place(21, 24, TileType.CANDLE);
  place(bX1, 20, TileType.DOOR); // Side doors
  place(bX2, 20, TileType.DOOR);

  // Desk & Receptionist
  // Desk at 24,20 and 25,20. Receptionist visually at 25,20.
  place(24, 20, TileType.DESK);
  place(25, 20, TileType.DESK);
  // Interaction trigger in front of desk
  interactables['21,24'] = { type: 'receptionist', id: 'receptionist', message: "Applications here." };
  interactables['21,25'] = { type: 'receptionist', id: 'receptionist_alt', message: "Applications here." };

  // Notice Board
  place(15, 17, TileType.WALL); 
  interactables['18,15'] = { type: 'notice_board', id: 'notice_board', message: "History" }; 

  place(12, 19, TileType.BENCH, { type: 'chair', id: `wait_19_12` });
  place(12, 21, TileType.BENCH, { type: 'chair', id: `wait_21_12` });
  
  place(11, 23, TileType.FLOWER);
  place(28, 23, TileType.FLOWER);
  place(11, 18, TileType.CANDLE);
  place(28, 18, TileType.CANDLE);

  return { width: MAP_WIDTH, height: MAP_HEIGHT, tiles, interactables, npcs };
};