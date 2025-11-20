
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

    switch (type) {
      case TileType.WALL:
        return { 
            ...baseStyle, 
            backgroundColor: '#4e342e',
            backgroundImage: `linear-gradient(180deg, #3e2723 0%, #5d4037 50%, #3e2723 100%)`,
            boxShadow: '0 5px 10px rgba(0,0,0,0.5)'
        }; 
      case TileType.FLOOR:
        return { 
            ...baseStyle, 
            backgroundColor: '#8d6e63', 
            border: '1px solid #795548',
            boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)'
        }; 
      case TileType.GRASS:
        return { 
            ...baseStyle, 
            backgroundColor: '#558b2f', 
            backgroundImage: 'radial-gradient(circle, #689f38 20%, transparent 20%)',
            backgroundSize: '16px 16px'
        }; 
      case TileType.DOOR:
        return { 
            ...baseStyle, 
            backgroundColor: '#5d4037', 
            border: '4px solid #3e2723',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
        };
      case TileType.ALTAR:
        return { ...baseStyle, backgroundColor: '#fff3e0', border: '2px solid #d7ccc8' };
      case TileType.WATER:
        return { 
            ...baseStyle, 
            backgroundColor: '#29b6f6', 
            opacity: 0.8,
            animation: 'pulse 3s infinite'
        };
      case TileType.BENCH:
        return { 
            ...baseStyle, 
            backgroundColor: '#8d6e63', 
        };
      case TileType.CARPET:
        return {
            ...baseStyle,
            backgroundColor: '#b71c1c',
            borderLeft: '2px solid #ffeb3b',
            borderRight: '2px solid #ffeb3b',
        };
      case TileType.PATH:
        return {
            ...baseStyle,
            backgroundColor: '#90a4ae',
            border: '1px dashed #78909c'
        };
      case TileType.DESK:
          return {
              ...baseStyle,
              backgroundColor: '#3e2723',
              borderTop: '12px solid #5d4037',
          }
      default:
        return baseStyle;
    }
  };

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
        zIndex: 10
    }

    if (type === TileType.TOMBSTONE) return <div style={style} className="text-3xl drop-shadow-md">🪦</div>;
    if (type === TileType.ALTAR) return <div style={style} className="text-2xl">🏺</div>;
    
    if (type === TileType.DOOR) {
        // Visual Knob
        return (
            <div style={style}>
                 <div className="w-full h-full relative">
                     <div className="absolute top-1/2 right-2 w-2 h-2 bg-[#ffd700] rounded-full shadow-sm"></div>
                 </div>
            </div>
        )
    }

    if (type === TileType.BENCH) {
        return (
            <div style={{...style, zIndex: 5}}>
                <div className="w-full h-6 bg-[#5d4037] mt-4 rounded-sm shadow-md border-t-4 border-[#4e342e]"></div>
            </div>
        );
    }

    if (type === TileType.CANDLE) {
        return (
            <div style={style}>
                <div className="w-2 h-5 bg-[#fff8e1] relative mt-3 rounded-sm shadow-sm">
                    <div className="absolute -top-2 left-0 right-0 mx-auto w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,165,0,0.8)]"></div>
                    <div className="absolute -top-1 left-0 right-0 mx-auto w-1 h-1 bg-yellow-200 rounded-full"></div>
                </div>
            </div>
        )
    }

    if (type === TileType.FLOWER) {
        const color = (x+y) % 2 === 0 ? 'text-pink-400' : 'text-yellow-300';
        return <div style={style} className={`text-lg ${color} drop-shadow-sm`}>❀</div>;
    }

    if (type === TileType.TREE) {
        return (
            <div style={{...style, zIndex: 25, height: TILE_SIZE * 2, top: y * TILE_SIZE - TILE_SIZE}}>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#2e7d32] rounded-full shadow-xl -mb-6 relative border-4 border-[#1b5e20]">
                        <div className="absolute top-2 left-4 w-4 h-4 bg-[#4caf50] rounded-full opacity-30"></div>
                    </div>
                    <div className="w-6 h-10 bg-[#3e2723] rounded-sm"></div>
                </div>
            </div>
        )
    }

    return null;
  };

  return (
    <div style={{ width: mapData.width * TILE_SIZE, height: mapData.height * TILE_SIZE, position: 'relative' }}>
      {/* Tiles Layer */}
      {mapData.tiles.map((row, y) =>
        row.map((tile, x) => (
          <React.Fragment key={`${x}-${y}`}>
            <div style={getTileStyle(tile, x, y)} />
            {renderObject(tile, x, y)}
          </React.Fragment>
        ))
      )}

      {/* Lighting Overlay */}
      <div 
        style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 10, 20, 0.3)', // Base darkness
            pointerEvents: 'none',
            zIndex: 20,
            mixBlendMode: 'multiply'
        }}
      ></div>

      {/* Dynamic Light Glows */}
      {mapData.tiles.map((row, y) =>
        row.map((tile, x) => {
             if(tile === TileType.CANDLE || tile === TileType.ALTAR) {
                 return (
                     <div 
                        key={`light-${x}-${y}`}
                        style={{
                            position: 'absolute',
                            left: (x * TILE_SIZE) - (TILE_SIZE * 1.5),
                            top: (y * TILE_SIZE) - (TILE_SIZE * 1.5),
                            width: TILE_SIZE * 4,
                            height: TILE_SIZE * 4,
                            background: 'radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, transparent 70%)',
                            pointerEvents: 'none',
                            zIndex: 21,
                            mixBlendMode: 'screen'
                        }}
                     />
                 )
             }
             if (tile === TileType.DOOR) {
                 // Softer light for doors
                  return (
                     <div 
                        key={`door-light-${x}-${y}`}
                        style={{
                            position: 'absolute',
                            left: (x * TILE_SIZE) - TILE_SIZE,
                            top: (y * TILE_SIZE) - TILE_SIZE,
                            width: TILE_SIZE * 3,
                            height: TILE_SIZE * 3,
                            background: 'radial-gradient(circle, rgba(200, 200, 255, 0.3) 0%, transparent 70%)',
                            pointerEvents: 'none',
                            zIndex: 21,
                            mixBlendMode: 'screen'
                        }}
                     />
                 )
             }
             return null;
        })
      )}
    </div>
  );
};

export default PixelMap;
