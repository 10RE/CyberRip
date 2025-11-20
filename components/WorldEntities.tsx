
import React from 'react';
import { PlayerState, TILE_SIZE, DirectorPhase, FuneralData } from '../types';

interface WorldEntitiesProps {
  player: PlayerState;
  directorPhase: DirectorPhase;
  activeCeremony: FuneralData | null;
}

export const WorldEntities: React.FC<WorldEntitiesProps> = ({ player, directorPhase, activeCeremony }) => {
  return (
    <>
        {/* --- ACTUAL SIZE COFFIN (Chapel Aisle: x=19, y=8) - Updated for new map --- */}
        <div
        style={{
            position: 'absolute',
            left: 19 * TILE_SIZE + 4, // Centered in aisle
            top: 8 * TILE_SIZE,
            width: 40,
            height: 70,
            zIndex: 9,
            transition: 'all 3s ease-in-out',
            transform: directorPhase === DirectorPhase.BURIAL ? 'translateY(48px)' : 'translateY(0)',
            opacity: directorPhase === DirectorPhase.BURIAL ? 0 : 1
        }}
        className="flex flex-col shadow-2xl"
        >
            {/* Coffin Lid */}
            <div className="w-full h-full bg-[#5d4037] border-4 border-[#3e2723] relative rounded-t-xl rounded-b-md flex items-center justify-center">
                <div className="w-20 h-32 absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                {/* Cross */}
                <div className="flex flex-col items-center opacity-70">
                    <div className="w-2 h-12 bg-[#e4b85d]"></div>
                    <div className="w-8 h-2 bg-[#e4b85d] absolute top-8"></div>
                </div>
            </div>
        </div>

        {/* --- PLAYER --- */}
        <div 
        style={{
            width: TILE_SIZE, height: TILE_SIZE,
            position: 'absolute', left: player.pos.x, top: player.pos.y,
            zIndex: player.isSitting ? 15 : 20, 
            pointerEvents: 'none'
        }}
        className="flex items-center justify-center"
        >
            <div className={`w-8 h-10 relative ${player.isMoving ? 'animate-bounce' : ''} ${player.isSitting ? 'translate-y-2' : ''} drop-shadow-lg`}>
                <div className="absolute bottom-0 left-1 w-6 h-4 rounded-b-sm" style={{backgroundColor: player.appearance.pantsColor}}></div>
                <div className="absolute bottom-4 left-1 w-6 h-4 rounded-t-sm" style={{backgroundColor: player.appearance.shirtColor}}></div>
                <div className="absolute bottom-7 left-1.5 w-5 h-5 rounded-sm z-10" style={{backgroundColor: player.appearance.skinColor}}></div>
                {player.appearance.hasHat && (
                    <>
                        <div className="absolute bottom-10 left-0 w-8 h-2 rounded-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                        <div className="absolute bottom-11 left-2 w-4 h-2 rounded-t-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                    </>
                )}
                {/* Eyes based on direction */}
                {player.direction === 'right' && <div className="absolute top-3 right-2 w-1 h-1 bg-black z-30"></div>}
                {player.direction === 'left' && <div className="absolute top-3 left-2 w-1 h-1 bg-black z-30"></div>}
                {player.direction === 'down' && <div className="absolute top-3 left-2.5 w-1 h-1 bg-black z-30"></div>}
                {player.direction === 'down' && <div className="absolute top-3 right-2.5 w-1 h-1 bg-black z-30"></div>}
            </div>
            <div className="absolute -top-8 text-[8px] bg-black/40 px-1 rounded text-white whitespace-nowrap scale-[0.6]">You</div>
        </div>

        {/* --- PRIEST (x=19, y=8) - Behind Altar --- */}
        <div 
        style={{
            width: TILE_SIZE, height: TILE_SIZE,
            position: 'absolute', left: 19 * TILE_SIZE, top: 6 * TILE_SIZE, // Adjusted to be behind altar
            zIndex: 15
        }}
        className="flex items-center justify-center"
        >
            <div className={`w-8 h-10 bg-purple-900 relative flex justify-center rounded-t-xl drop-shadow-lg ${directorPhase === DirectorPhase.PREACHING ? 'animate-pulse' : 'animate-float'}`}>
                <div className="w-full h-2 bg-yellow-500 absolute top-4"></div>
                <div className="w-2 h-2 bg-[#ffdbac] absolute top-1 rounded-full"></div>
                <div className="absolute -top-5 text-[8px] bg-black/30 px-1 rounded text-white scale-[0.5]">Priest</div>
            </div>
            
            {/* SPEECH BUBBLE */}
            {directorPhase !== DirectorPhase.IDLE && activeCeremony && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 bg-white p-3 rounded-lg border-2 border-black text-[9px] z-50 flex flex-col items-center text-center shadow-xl">
                    {directorPhase === DirectorPhase.PREACHING && (
                        <>
                        <span className="font-bold mb-1 text-red-600 text-xs">{activeCeremony.deceasedName}</span>
                        <span className="italic text-gray-800 leading-tight font-serif">"{activeCeremony.eulogy}"</span>
                        </>
                    )}
                    {directorPhase === DirectorPhase.AMEN && (
                        <span className="text-xl font-bold text-blue-800">AMEN.</span>
                    )}
                    {directorPhase === DirectorPhase.BURIAL && (
                        <span className="text-gray-500 font-mono">*Shoveling Sounds*</span>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-black rotate-45"></div>
                </div>
            )}
        </div>

        {/* --- RECEPTIONIST (x=25, y=20) --- */}
        <div 
        style={{
            width: TILE_SIZE, height: TILE_SIZE,
            position: 'absolute', left: 25 * TILE_SIZE, top: 20 * TILE_SIZE,
            zIndex: 15
        }}
        className="flex items-center justify-center"
        >
            <div className="w-8 h-10 bg-blue-800 relative flex justify-center rounded-t-xl drop-shadow-lg">
                <div className="w-full h-2 bg-white absolute top-4"></div>
                <div className="w-2 h-2 bg-[#ffdbac] absolute top-1 rounded-full"></div>
                <div className="absolute -top-5 text-[8px] bg-black/30 px-1 rounded text-white scale-[0.5]">Staff</div>
            </div>
        </div>

        {/* --- NOTICE BOARD DECAL (x=16, y=17 wall) --- */}
        <div
        style={{
            position: 'absolute', left: 16 * TILE_SIZE, top: 16 * TILE_SIZE,
            width: TILE_SIZE, height: TILE_SIZE, zIndex: 5
        }}
        className="flex items-center justify-center"
        >
            <div className="w-10 h-8 bg-[#795548] border-4 border-[#3e2723] shadow-lg flex flex-col p-0.5 gap-0.5">
                <div className="w-full h-1 bg-white opacity-50"></div>
                <div className="w-2/3 h-1 bg-white opacity-50"></div>
            </div>
        </div>
    </>
  );
};
