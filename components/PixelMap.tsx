
import React from 'react';
import { TileType, TILE_SIZE, GameMap } from '../types';

interface PixelMapProps {
  mapData: GameMap;
}

const PixelMap: React.FC<PixelMapProps> = ({ mapData }) => {
  
  const getTileStyle = (type: TileType, x: number, y: number) => {
    const baseStyle: React.CSSProperties = {
      width: TILE_SIZE,
      height: TILE_SIZE,
      position: 'absolute',
      left: x * TILE_SIZE,
      top: y * TILE_SIZE,
      boxSizing: 'border-box',
    };

    // Procedural CSS Textures
    switch (type) {
      case TileType.WALL:
        return { 
            ...baseStyle, 
            backgroundColor: '#5d4037',
            backgroundImage: `linear-gradient(335deg, rgba(0,0,0,0.2) 23px, transparent 23px), linear-gradient(155deg, rgba(0,0,0,0.2) 23px, transparent 23px)`,
            backgroundSize: '58px 58px',
            boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3)'
        }; 
      case TileType.FLOOR:
        return { 
            ...baseStyle, 
            backgroundColor: '#d7ccc8',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, #a1887f 7px, #a1887f 8px)', 
            borderLeft: '1px solid #a1887f'
        }; 
      case TileType.GRASS:
        return { 
            ...baseStyle, 
            backgroundColor: '#76c34f', 
            backgroundImage: `radial-gradient(circle at 50% 50%, #8bc34a 10%, transparent 10%)`,
            backgroundSize: '12px 12px'
        }; 
      case TileType.DOOR:
        return { 
            ...baseStyle, 
            backgroundColor: '#3e2723', 
            border: '4px solid #2d1b16',
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)'
        };
      case TileType.ALTAR:
        return { ...baseStyle, backgroundColor: '#fff3e0', border: '2px solid #d7ccc8' };
      case TileType.TOMBSTONE:
        return { 
            ...baseStyle, 
            backgroundColor: '#76c34f', 
            // Tombstone is rendered in renderObject usually, but base tile is grass
        };
      case TileType.WATER:
        return { 
            ...baseStyle, 
            backgroundColor: '#4fa4f5', 
            opacity: 0.8,
            backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, #4fa4f5, #2196f3 10px, #4fa4f5 20px)'
        };
      case TileType.CHAIR:
        return { 
            ...baseStyle, 
            backgroundColor: '#d7ccc8',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, #a1887f 7px, #a1887f 8px)' 
        };
      case TileType.CARPET:
        return {
            ...baseStyle,
            backgroundColor: '#b71c1c',
            borderLeft: '2px solid #ffeb3b',
            borderRight: '2px solid #ffeb3b',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
        };
      case TileType.PATH:
        return {
            ...baseStyle,
            backgroundColor: '#90a4ae',
            backgroundImage: `linear-gradient(45deg, #78909c 25%, transparent 25%, transparent 75%, #78909c 75%, #78909c)`,
            backgroundSize: '20px 20px'
        };
      case TileType.DESK:
          return {
              ...baseStyle,
              backgroundColor: '#5d4037',
              borderTop: '8px solid #8d6e63',
              boxShadow: '0 4px 5px rgba(0,0,0,0.3)'
          }
      default:
        return baseStyle;
    }
  };

  // Static Objects Rendered on top of tiles
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
        fontSize: '24px',
        zIndex: 10
    }

    if (type === TileType.TOMBSTONE) return <div style={style} className="drop-shadow-md">🪦</div>;
    if (type === TileType.ALTAR) return <div style={style} className="drop-shadow-lg">🕯️</div>;
    if (type === TileType.CHAIR) {
        return (
            <div style={{...style, zIndex: 5}}>
                <div className="w-8 h-8 bg-[#8d6e63] rounded-t-sm relative border-b-4 border-[#5d4037] shadow-sm mt-2">
                    <div className="absolute -top-2 left-0 w-8 h-4 bg-[#a1887f] rounded-t opacity-90"></div>
                </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div style={{ width: mapData.width * TILE_SIZE, height: mapData.height * TILE_SIZE }}>
      {mapData.tiles.map((row, y) =>
        row.map((tile, x) => (
          <React.Fragment key={`${x}-${y}`}>
            <div style={getTileStyle(tile, x, y)} />
            {renderObject(tile, x, y)}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default PixelMap;
