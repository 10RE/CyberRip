
export enum TileType {
  FLOOR = 0,      // Standard wood floor
  WALL = 1,       // Brick/Wood wall
  GRASS = 2,      // Textured grass
  DOOR = 3,       // Doorways
  // Coffin is an Entity, not a tile
  TOMBSTONE = 5,  // Static tombstone tile
  ALTAR = 6,      // Church altar
  WATER = 7,      // Fountain water
  CHAIR = 8,      // Generic Chair (Unused now, using BENCH)
  CARPET = 9,     // Red carpet
  PATH = 10,      // Stone path
  DESK = 11,      // Reception desk
  BENCH = 12,     // Church Pews
  TREE = 13,      // Nature
  FLOWER = 14,    // Nature
  CANDLE = 15     // Light source
}

export interface Position {
  x: number;
  y: number;
}

export interface CharacterAppearance {
  hatColor: string;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  hasHat: boolean;
}

export interface FuneralData {
  id: string;
  deceasedName: string;
  causeOfDeath: string; 
  eulogy: string;
  timestamp: number;
  attendees: number;
}

export interface PlayerState {
  pos: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  isSitting: boolean;
  appearance: CharacterAppearance;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: TileType[][];
  interactables: Record<string, Interactable>;
}

export interface Interactable {
  type: 'coffin' | 'tombstone' | 'priest' | 'fountain' | 'chair' | 'receptionist' | 'notice_board';
  message?: string;
  id: string;
}

export enum DirectorPhase {
  IDLE = 'idle',
  PREACHING = 'preaching',
  AMEN = 'amen',
  BURIAL = 'burial'
}

export const TILE_SIZE = 48;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;
