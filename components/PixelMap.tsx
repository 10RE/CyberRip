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
            boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
            zIndex: 5
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
              zIndex: 10
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

    // CSS PIXEL ART OBJECTS

    if (type === TileType.TOMBSTONE) {
        return (
            <div style={style}>
                <div className="w-8 h-10 bg-[#9e9e9e] rounded-t-2xl border-b-4 border-[#616161] relative shadow-md">
                    <div className="absolute top-2 left-2 w-4 h-1 bg-[#757575] rounded-sm"></div>
                    <div className="absolute top-4 left-2 w-3 h-0.5 bg-[#757575]"></div>
                    {/* Cracks */}
                    <div className="absolute bottom-2 right-2 w-1 h-3 bg-[#616161] rotate-45"></div>
                </div>
            </div>
        )
    }

    if (type === TileType.ALTAR) {
        return (
            <div style={style}>
                <div className="w-10 h-8 bg-[#fff8e1] border-2 border-[#ffd700] relative mt-4 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_5px,rgba(0,0,0,0.05)_5px,rgba(0,0,0,0.05)_10px)]"></div>
                    <div className="absolute top-0 w-full h-2 bg-[#b71c1c]"></div>
                </div>
            </div>
        )
    }
    
    if (type === TileType.DOOR) {
        return (
            <div style={style}>
                 <div className="w-full h-full relative">
                     <div className="absolute top-1/2 right-2 w-2 h-2 bg-[#ffd700] rounded-full shadow-sm border border-[#b8860b]"></div>
                     <div className="absolute top-2 left-2 w-8 h-8 border border-[#4e342e] opacity-30"></div>
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
                </div>
            </div>
        )
    }

    if (type === TileType.FLOWER) {
        const isPink = (x + y) % 2 === 0;
        return (
            <div style={style} className="scale-75">
                 <div className="relative w-6 h-6">
                     <div className={`absolute top-0 left-2 w-2 h-6 ${isPink ? 'bg-pink-400' : 'bg-yellow-400'} rounded-full`}></div>
                     <div className={`absolute top-2 left-0 w-6 h-2 ${isPink ? 'bg-pink-400' : 'bg-yellow-400'} rounded-full`}></div>
                     <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full z-10"></div>
                     <div className="absolute bottom-0 left-2.5 w-1 h-4 bg-green-600 -z-10"></div>
                 </div>
            </div>
        );
    }

    if (type === TileType.TREE) {
        return (
            <div style={{...style, zIndex: 25, height: TILE_SIZE * 2, top: y * TILE_SIZE - TILE_SIZE}}>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#2e7d32] rounded-full shadow-xl -mb-6 relative border-4 border-[#1b5e20]">
                        <div className="absolute top-2 left-4 w-4 h-4 bg-[#4caf50] rounded-full opacity-30"></div>
                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-[#1b5e20] rounded-full opacity-20"></div>
                    </div>
                    <div className="w-6 h-10 bg-[#3e2723] rounded-sm border-x-2 border-[#271c19]"></div>
                </div>
            </div>
        )
    }

    if (type === TileType.WINDOW) {
        // Stained Glass
        return (
            <div style={{...style, zIndex: 4}}>
                <div className="w-8 h-12 bg-blue-900 rounded-t-full border-4 border-[#424242] overflow-hidden relative shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <div className="w-full h-full grid grid-cols-2 grid-rows-3">
                        <div className="bg-red-500 opacity-50"></div><div className="bg-blue-500 opacity-50"></div>
                        <div className="bg-yellow-500 opacity-50"></div><div className="bg-green-500 opacity-50"></div>
                        <div className="bg-purple-500 opacity-50"></div><div className="bg-orange-500 opacity-50"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (type === TileType.PODIUM) {
        return (
            <div style={style}>
                <div className="w-8 h-10 bg-[#4e342e] mt-2 relative border-b-4 border-[#3e2723]">
                    <div className="absolute -top-1 left-0 w-10 -ml-1 h-3 bg-[#5d4037] rounded-sm shadow-sm"></div>
                    <div className="absolute top-2 left-2 w-4 h-4 bg-[#3e2723] rounded-full opacity-50"></div>
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
             if(tile === TileType.CANDLE || tile === TileType.ALTAR || tile === TileType.WINDOW) {
                 return (
                     <div 
                        key={`light-${x}-${y}`}
                        style={{
                            position: 'absolute',
                            left: (x * TILE_SIZE) - (TILE_SIZE * 1.5),
                            top: (y * TILE_SIZE) - (TILE_SIZE * 1.5),
                            width: TILE_SIZE * 4,
                            height: TILE_SIZE * 4,
                            background: tile === TileType.WINDOW 
                                ? 'radial-gradient(circle, rgba(100, 100, 255, 0.2) 0%, transparent 60%)' 
                                : 'radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, transparent 70%)',
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