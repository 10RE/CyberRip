export enum TileType {
  FLOOR = 0,
  WALL = 1,
  GRASS = 2,
  DOOR = 3,
  // COFFIN removed as tile, will be an entity
  TOMBSTONE = 5,
  ALTAR = 6,
  WATER = 7,
  CHAIR = 8
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
  causeOfDeath: string; // Usually funny/metaphorical
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
  type: 'coffin' | 'tombstone' | 'priest' | 'fountain' | 'chair';
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
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 15;