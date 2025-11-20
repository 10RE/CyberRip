
import { TileType, GameMap, Interactable, MAP_WIDTH, MAP_HEIGHT } from '../types';

export const generateMap = (): GameMap => {
  const tiles: TileType[][] = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(TileType.GRASS));
  const interactables: Record<string, Interactable> = {};

  // Helper to draw rectangles
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

  // --- 1. CHAPEL (Top Left) ---
  // Room structure
  drawRect(2, 2, 14, 15, TileType.FLOOR, true);
  
  // Red Carpet Aisle
  drawRect(8, 3, 8, 14, TileType.CARPET);
  
  // Altar
  tiles[4][8] = TileType.ALTAR;
  
  // Pews (Chairs)
  [8, 10, 12].forEach(y => {
      [4, 5, 6, 10, 11, 12].forEach(x => {
          tiles[y][x] = TileType.CHAIR;
          interactables[`${y},${x}`] = { type: 'chair', id: `pew_${y}_${x}` };
      });
  });

  // Priest Logic Point
  interactables['4,7'] = { type: 'priest', id: 'priest', message: "Shh. The ceremony is in progress." };

  // --- 2. RECEPTION (Bottom Left) ---
  drawRect(2, 17, 14, 27, TileType.FLOOR, true);
  
  // Connecting Hallway
  drawRect(7, 15, 9, 17, TileType.FLOOR);
  tiles[15][7] = TileType.WALL; tiles[15][9] = TileType.WALL;
  tiles[16][7] = TileType.WALL; tiles[16][9] = TileType.WALL;

  // Reception Desk
  tiles[20][10] = TileType.DESK;
  tiles[20][11] = TileType.DESK;
  interactables['21,11'] = { type: 'receptionist', id: 'receptionist', message: "Welcome to CyberRip." };

  // Notice Board (Wall Mounted)
  tiles[18][4] = TileType.WALL;
  interactables['19,4'] = { type: 'notice_board', id: 'notice_board', message: "View History" };

  // Main Entrance
  tiles[27][8] = TileType.DOOR;
  tiles[28][8] = TileType.PATH;

  // --- 3. GRAVEYARD (Right Side) ---
  // Path from Reception side door
  tiles[21][14] = TileType.DOOR;
  drawRect(15, 21, 19, 21, TileType.PATH);

  // Graveyard Paths
  drawRect(19, 2, 39, 29, TileType.GRASS); // Base
  drawRect(21, 11, 37, 13, TileType.PATH); // Horizontal Main
  drawRect(27, 3, 29, 28, TileType.PATH);  // Vertical Main

  // Procedural Tombstones
  for (let i = 0; i < 50; i++) {
      const tx = Math.floor(Math.random() * 19) + 20; // x: 20-39
      const ty = Math.floor(Math.random() * 26) + 3;  // y: 3-29
      
      // Only place on grass, not paths
      if (tiles[ty][tx] === TileType.GRASS) {
          tiles[ty][tx] = TileType.TOMBSTONE;
      }
  }

  return { width: MAP_WIDTH, height: MAP_HEIGHT, tiles, interactables };
};
