
import React from 'react';

interface UIOverlayProps {
    queueLength: number;
    activeName: string | undefined;
    zoomLevel: number;
    toggleZoom: () => void;
    openWardrobe: () => void;
    notification: string | null;
}

export const UIOverlay: React.FC<UIOverlayProps> = (props) => {
    return (
        <>
            <div className="absolute top-4 left-4 z-50 stardew-box p-4 text-xs max-w-xs text-[#5d3a1a]">
                <h1 className="text-xl mb-2 text-[#d32f2f] drop-shadow-sm flex justify-between items-center">
                    CyberRip 
                    <span className="text-[10px] bg-[#8b4513] text-white px-2 rounded">{props.queueLength} in Queue</span>
                </h1>
                
                {props.activeName ? (
                    <div className="bg-[#fff8e1] p-2 rounded border border-[#d4b078]">
                        <p className="mb-1 font-bold uppercase text-xs text-gray-500">In Chapel:</p>
                        <p className="text-[#388e3c] text-md">{props.activeName}</p>
                    </div>
                ) : (
                    <div className="p-2 text-gray-500 italic">Chapel is empty...</div>
                )}

                <div className="mt-4 flex gap-2">
                    <button onClick={props.openWardrobe} className="flex-1 bg-[#2196f3] text-white p-2 rounded border-b-2 border-[#0d47a1] hover:bg-[#1e88e5] active:border-b-0 active:translate-y-1">
                        Wardrobe
                    </button>
                    <button onClick={props.toggleZoom} className="flex-1 bg-[#795548] text-white p-2 rounded border-b-2 border-[#3e2723] hover:bg-[#6d4c41] active:border-b-0 active:translate-y-1">
                        Zoom: {props.zoomLevel}x
                    </button>
                </div>

                <div className="mt-2 text-[10px] text-[#5d3a1a]/70">
                    [WASD] Move | [F] Interact
                </div>
            </div>

            {props.notification && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#fff8e1] text-[#5d3a1a] px-6 py-3 border-2 border-[#8b4513] rounded-full z-50 animate-bounce shadow-lg font-bold">
                    {props.notification}
                </div>
            )}
        </>
    );
};
