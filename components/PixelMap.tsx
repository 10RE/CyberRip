import React from 'react';
import { TileType, TILE_SIZE, GameMap, Position } from '../types';

interface PixelMapProps {
  mapData: GameMap;
  cameraOffset: Position;
}

const PixelMap: React.FC<PixelMapProps> = ({ mapData, cameraOffset }) => {
  const getTileStyle = (type: TileType, x: number, y: number) => {
    const baseStyle: React.CSSProperties = {
      width: TILE_SIZE,
      height: TILE_SIZE,
      position: 'absolute',
      left: x * TILE_SIZE,
      top: y * TILE_SIZE,
      boxSizing: 'border-box',
    };

    // Stardew-ish Palette
    switch (type) {
      case TileType.WALL:
        return { ...baseStyle, backgroundColor: '#8b5a2b', borderBottom: '4px solid #5d3a1a', borderTop: '2px solid #a06e3d' }; // Wooden walls
      case TileType.FLOOR:
        return { ...baseStyle, backgroundColor: '#e6c288', border: '1px solid #d4b078' }; // Light wood floor
      case TileType.GRASS:
        return { ...baseStyle, backgroundColor: '#76c34f', border: 'none' }; // Bright grass
      case TileType.DOOR:
        return { ...baseStyle, backgroundColor: '#5d3a1a', border: '4px solid #3e2723' };
      case TileType.COFFIN:
        return { ...baseStyle, backgroundColor: '#e6c288' }; // Floor under coffin
      case TileType.ALTAR:
        return { ...baseStyle, backgroundColor: '#e6c288' };
      case TileType.TOMBSTONE:
        return { ...baseStyle, backgroundColor: '#76c34f' }; // Grass under tombstone
      case TileType.WATER:
        return { ...baseStyle, backgroundColor: '#4fa4f5', opacity: 0.9 };
      default:
        return baseStyle;
    }
  };

  // Render Objects (High res emojis or simple shapes)
  const renderObject = (type: TileType, x: number, y: number) => {
    const style: React.CSSProperties = {
        width: TILE_SIZE,
        height: TILE_SIZE,
        position: 'absolute',
        left: x * TILE_SIZE,
        top: y * TILE_SIZE,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        zIndex: 10
    }

    if (type === TileType.COFFIN) {
        return <div style={style}>⚰️</div>
    }
    if (type === TileType.TOMBSTONE) {
        return <div style={style}>🪦</div>
    }
    if (type === TileType.ALTAR) {
        return <div style={style}>💐</div>
    }
    return null;
  };

  return (
    <div 
      style={{ 
        position: 'absolute', 
        transform: `translate3d(${-cameraOffset.x}px, ${-cameraOffset.y}px, 0)`,
        transition: 'transform 0.1s linear',
        width: mapData.width * TILE_SIZE,
        height: mapData.height * TILE_SIZE
      }}
    >
      {mapData.tiles.map((row, y) =>
        row.map((tile, x) => (
          <React.Fragment key={`${x}-${y}`}>
            <div style={getTileStyle(tile, x, y)}>
               {/* Add some texture details */}
               {tile === TileType.GRASS && Math.random() > 0.8 && (
                   <div className="w-1 h-1 bg-green-800 absolute bottom-1 right-2 opacity-20 rounded-full"></div>
               )}
               {tile === TileType.FLOOR && (x + y) % 2 === 0 && (
                   <div className="w-full h-full bg-black/5"></div>
               )}
            </div>
            {renderObject(tile, x, y)}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default PixelMap;