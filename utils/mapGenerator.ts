
import { TileType, GameMap, Interactable, MAP_WIDTH, MAP_HEIGHT } from '../types';

export const generateMap = (): GameMap => {
  const tiles: TileType[][] = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(TileType.GRASS));
  const interactables: Record<string, Interactable> = {};

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

  // --- GRAVEYARD (Perimeter) ---
  // Fill the map with random graveyard items first, then overwrite with building
  for(let y=1; y<MAP_HEIGHT-1; y++) {
      for(let x=1; x<MAP_WIDTH-1; x++) {
         const r = Math.random();
         // Higher chance of trees/tombs on the edges
         const isEdge = x < 8 || x > 31 || y < 6 || y > 24;
         
         if (isEdge && tiles[y][x] === TileType.GRASS) {
             if (r < 0.08) tiles[y][x] = TileType.TOMBSTONE;
             else if (r < 0.12) tiles[y][x] = TileType.TREE;
             else if (r < 0.15) tiles[y][x] = TileType.FLOWER;
         }
      }
  }

  // Paths through graveyard
  drawRect(18, 0, 21, 8, TileType.PATH); // Top path
  drawRect(18, 24, 21, 29, TileType.PATH); // Bottom path leading to entrance
  drawRect(0, 14, 8, 16, TileType.PATH); // Left path
  drawRect(32, 14, 39, 16, TileType.PATH); // Right path


  // --- BUILDING (Central Block) ---
  // Footprint: x:9 to x:30, y:6 to y:24
  const bX1 = 10, bY1 = 6, bX2 = 29, bY2 = 24;
  
  // 1. CHAPEL (Upper Room)
  // y: 6 to 17
  drawRect(bX1, bY1, bX2, 17, TileType.FLOOR, true);
  
  // Carpet Aisle
  drawRect(19, bY1 + 1, 20, 17, TileType.CARPET);

  // Altar
  place(19, bY1 + 2, TileType.ALTAR);
  place(20, bY1 + 2, TileType.ALTAR);
  place(18, bY1 + 2, TileType.CANDLE);
  place(21, bY1 + 2, TileType.CANDLE);

  // Benches (Tighter arrangement)
  const benchRows = [9, 11, 13, 15];
  benchRows.forEach(y => {
      // Left pews
      [12, 13, 14, 15, 16].forEach(x => place(x, y, TileType.BENCH, { type: 'chair', id: `pew_${y}_${x}` }));
      // Right pews
      [23, 24, 25, 26, 27].forEach(x => place(x, y, TileType.BENCH, { type: 'chair', id: `pew_${y}_${x}` }));
  });
  
  // Priest interaction
  interactables[`${bY1+2},19`] = { type: 'priest', id: 'priest', message: "Shh..." };


  // 2. RECEPTION (Lower Room)
  // y: 17 to 24
  drawRect(bX1, 17, bX2, bY2, TileType.FLOOR, true);

  // Divider Wall between Chapel and Reception (overwrite floor)
  drawRect(bX1 + 1, 17, bX2 - 1, 17, TileType.WALL);
  
  // Internal Door (Double doors to chapel)
  place(19, 17, TileType.DOOR);
  place(20, 17, TileType.DOOR);

  // Main Entrance (South)
  place(19, 24, TileType.DOOR);
  place(20, 24, TileType.DOOR);
  place(18, 24, TileType.CANDLE); // Lights outside
  place(21, 24, TileType.CANDLE);

  // Side Doors (East/West) to Graveyard
  place(bX1, 20, TileType.DOOR);
  place(bX2, 20, TileType.DOOR);

  // Reception Details
  // Desk
  place(24, 20, TileType.DESK);
  place(25, 20, TileType.DESK);
  interactables['25,20'] = { type: 'receptionist', id: 'receptionist', message: "Applications here." };

  // Notice Board
  place(15, 17, TileType.WALL); // Ensure wall backing
  interactables['16,15'] = { type: 'notice_board', id: 'notice_board', message: "History" }; // Interaction point below wall

  // Waiting Area (Left side of reception)
  place(12, 19, TileType.BENCH, { type: 'chair', id: `wait_19_12` });
  place(12, 21, TileType.BENCH, { type: 'chair', id: `wait_21_12` });
  
  // Plants/Decoration
  place(11, 23, TileType.FLOWER);
  place(28, 23, TileType.FLOWER);
  place(11, 18, TileType.CANDLE);
  place(28, 18, TileType.CANDLE);

  return { width: MAP_WIDTH, height: MAP_HEIGHT, tiles, interactables };
};
