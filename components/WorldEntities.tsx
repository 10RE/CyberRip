import React from 'react';
import { PlayerState, TILE_SIZE, DirectorPhase, FuneralData, NPC } from '../types';

interface WorldEntitiesProps {
  player: PlayerState;
  directorPhase: DirectorPhase;
  activeCeremony: FuneralData | null;
  currentSpeechBubble: string | null;
  npcs: NPC[];
  nearbyInteractableId: string | null;
}

export const WorldEntities: React.FC<WorldEntitiesProps> = ({ 
    player, 
    directorPhase, 
    activeCeremony, 
    currentSpeechBubble, 
    npcs,
    nearbyInteractableId
}) => {
  
  const isInChapel = (pos: {x: number, y: number}) => {
      const tileX = pos.x / TILE_SIZE;
      const tileY = pos.y / TILE_SIZE;
      // Rough bounds of the main chapel room
      return tileX >= 10 && tileX <= 29 && tileY >= 6 && tileY <= 17;
  };

  const renderCharacter = (appearance: any, direction: string = 'down', isMoving: boolean = false, isSitting: boolean = false) => (
      <div className={`w-8 h-10 relative ${isMoving ? 'animate-bounce' : ''} ${isSitting ? 'translate-y-2' : ''} drop-shadow-lg`}>
          <div className="absolute bottom-0 left-1 w-6 h-4 rounded-b-sm" style={{backgroundColor: appearance.pantsColor}}></div>
          <div className="absolute bottom-4 left-1 w-6 h-4 rounded-t-sm" style={{backgroundColor: appearance.shirtColor}}></div>
          <div className="absolute bottom-7 left-1.5 w-5 h-5 rounded-sm z-10" style={{backgroundColor: appearance.skinColor}}></div>
          {appearance.hasHat && (
              <>
                  <div className="absolute bottom-10 left-0 w-8 h-2 rounded-sm z-20" style={{backgroundColor: appearance.hatColor}}></div>
                  <div className="absolute bottom-11 left-2 w-4 h-2 rounded-t-sm z-20" style={{backgroundColor: appearance.hatColor}}></div>
              </>
          )}
          <div className="absolute top-3 left-2.5 w-1 h-1 bg-black z-30"></div>
          <div className="absolute top-3 right-2.5 w-1 h-1 bg-black z-30"></div>
      </div>
  );

  return (
    <>
        {/* --- NPCS --- */}
        {npcs.map(npc => (
            <div 
                key={npc.id}
                style={{
                    width: TILE_SIZE, height: TILE_SIZE,
                    position: 'absolute', left: npc.pos.x, top: npc.pos.y,
                    zIndex: 15
                }}
                className="flex items-center justify-center"
            >
                {renderCharacter(npc.appearance, 'right', false, true)}
                {directorPhase === DirectorPhase.AMEN && isInChapel(npc.pos) && (
                    <div className="absolute -top-6 bg-white px-1 rounded text-[8px] border border-black animate-float whitespace-nowrap z-50">
                        amen
                    </div>
                )}
            </div>
        ))}

        {/* --- HORIZONTAL COFFIN (Chapel Aisle) --- */}
        {activeCeremony && (
            <div
            style={{
                position: 'absolute',
                left: 19 * TILE_SIZE, 
                top: 8 * TILE_SIZE + 10,
                width: 96, // 2 Tiles Wide
                height: 48, // 1 Tile High
                zIndex: 25, // Higher zIndex to be on top of carpet/altar
                transition: 'all 3s ease-in-out',
                transform: directorPhase === DirectorPhase.BURIAL ? 'translateY(48px)' : 'translateY(0)',
                opacity: directorPhase === DirectorPhase.BURIAL ? 0 : 1
            }}
            className="flex flex-col shadow-2xl items-center justify-center"
            >
                <div className="w-full h-full bg-[#5d4037] border-4 border-[#3e2723] relative rounded flex items-center justify-center overflow-hidden">
                    {/* Clean Wood Texture */}
                    <div className="w-full h-full opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_12px)]"></div>
                    
                    {/* Cross Horizontal */}
                    <div className="w-16 h-2 bg-[#e4b85d] absolute shadow-sm"></div>
                    <div className="w-2 h-10 bg-[#e4b85d] absolute left-1/3 shadow-sm"></div>
                </div>
            </div>
        )}

        {/* --- PRIEST (x=19, y=7) --- */}
        <div 
        style={{
            width: TILE_SIZE, height: TILE_SIZE,
            position: 'absolute', left: 19 * TILE_SIZE, top: 7 * TILE_SIZE,
            zIndex: 16
        }}
        className="flex items-center justify-center"
        >
            <div className={`w-8 h-10 bg-purple-900 relative flex justify-center rounded-t-xl drop-shadow-lg ${directorPhase === DirectorPhase.PREACHING ? 'animate-pulse' : 'animate-float'}`}>
                <div className="w-full h-2 bg-yellow-500 absolute top-4"></div>
                <div className="w-2 h-2 bg-[#ffdbac] absolute top-1 rounded-full"></div>
                <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-black"></div>
                <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-black"></div>
            </div>
            
            {/* SPEECH BUBBLE */}
            {directorPhase !== DirectorPhase.IDLE && activeCeremony && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-lg border-2 border-black text-[9px] z-50 flex flex-col items-center text-center shadow-xl">
                    {directorPhase === DirectorPhase.PREACHING && currentSpeechBubble && (
                        <>
                        <span className="font-bold mb-1 text-red-600 text-xs">{activeCeremony.deceasedName}</span>
                        <span className="italic text-gray-800 leading-tight font-serif text-sm">"{currentSpeechBubble}"</span>
                        </>
                    )}
                    {directorPhase === DirectorPhase.AMEN && (
                        <span className="text-xl font-bold text-blue-800 tracking-widest">AMEN.</span>
                    )}
                    {directorPhase === DirectorPhase.BURIAL && (
                        <span className="text-gray-500 font-mono">*Dirt Sounds*</span>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-black rotate-45"></div>
                </div>
            )}
        </div>

        {/* --- RECEPTIONIST (x=25, y=20) --- */}
        <div 
        style={{
            width: TILE_SIZE, height: TILE_SIZE,
            // Moved higher (-25px) so head sticks out nicely over the high desk
            position: 'absolute', left: 25 * TILE_SIZE, top: 20 * TILE_SIZE - 25,
            zIndex: 9 
        }}
        className="flex items-center justify-center"
        >
            <div className="w-8 h-10 bg-blue-800 relative flex justify-center rounded-t-xl drop-shadow-lg">
                <div className="w-full h-2 bg-white absolute top-4"></div>
                <div className="w-2 h-2 bg-[#ffdbac] absolute top-1 rounded-full"></div>
                 {/* Face */}
                <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-black"></div>
                <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-black"></div>
                {/* Glasses */}
                 <div className="absolute top-2 left-2 w-4 h-1 border-b border-black"></div>
            </div>
            
            {/* Proximity Speech Bubble */}
            {nearbyInteractableId && nearbyInteractableId.includes('receptionist') && (
                <div className="absolute -top-10 bg-white px-2 py-1 rounded-lg border-2 border-black text-[8px] whitespace-nowrap animate-bounce z-50">
                    How can I help?
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-black rotate-45"></div>
                </div>
            )}
        </div>

        {/* --- PLAYER --- */}
        <div 
        style={{
            width: TILE_SIZE, height: TILE_SIZE,
            position: 'absolute', left: player.pos.x, top: player.pos.y,
            zIndex: player.isSitting ? 15 : 20, pointerEvents: 'none'
        }}
        className="flex items-center justify-center"
        >
            {renderCharacter(player.appearance, player.direction, player.isMoving, player.isSitting)}
            <div className="absolute -top-8 text-[8px] bg-black/40 px-1 rounded text-white whitespace-nowrap scale-[0.6]">You</div>
            {directorPhase === DirectorPhase.AMEN && isInChapel(player.pos) && (
                 <div className="absolute -top-12 bg-white px-2 rounded text-[10px] border border-black animate-float z-50">
                    AMEN
                </div>
            )}
        </div>
    </>
  );
};