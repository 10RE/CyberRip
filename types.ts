export enum TileType {
  FLOOR = 0,
  WALL = 1,
  GRASS = 2,
  DOOR = 3,
  COFFIN = 4,
  TOMBSTONE = 5,
  ALTAR = 6,
  WATER = 7
}

export interface Position {
  x: number;
  y: number;
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
}

export interface GameMap {
  width: number;
  height: number;
  tiles: TileType[][];
  interactables: Record<string, Interactable>;
}

export interface Interactable {
  type: 'coffin' | 'tombstone' | 'priest' | 'fountain';
  message?: string;
  id: string;
}

export const TILE_SIZE = 48;
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 15;
