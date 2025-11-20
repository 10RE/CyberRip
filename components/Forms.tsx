
import React, { useState } from 'react';
import { PlayerState, FuneralData } from '../types';

// --- CUSTOMIZATION ---
export const CustomizationForm: React.FC<{
    player: PlayerState, 
    setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>, 
    close: () => void
}> = ({player, setPlayer, close}) => {
    
    const updateColor = (part: keyof typeof player.appearance, val: string) => {
        setPlayer(p => ({...p, appearance: {...p.appearance, [part]: val}}));
    };

    const colors = ['#e4b85d', '#333333', '#d32f2f', '#388e3c', '#1976d2', '#5d4037', '#f44336', '#ffeb3b'];

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4 text-center">
                {['hatColor', 'shirtColor', 'pantsColor'].map(part => (
                    <div key={part} className="bg-[#2d2d2d] p-2 rounded">
                         <label className="text-[10px] text-gray-400 uppercase block mb-2">{part.replace('Color', '')}</label>
                         <div className="flex flex-wrap gap-1 justify-center">
                             {colors.map(c => (
                                 <button 
                                    key={c} 
                                    onClick={() => updateColor(part as any, c)}
                                    className="w-4 h-4 rounded-full border border-gray-600 hover:scale-125"
                                    style={{backgroundColor: c}}
                                 />
                             ))}
                         </div>
                    </div>
                ))}
            </div>
            <button onClick={close} className="bg-green-600 text-white py-2 rounded font-bold hover:bg-green-500">Save Outfit</button>
        </div>
    );
};

// --- APPLICATION ---
export const ApplicationForm: React.FC<{ onSubmit: (n: string, c: string) => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [cause, setCause] = useState('');
    const [submitting, setSubmitting] = useState(false);

    return (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitting(true); onSubmit(name, cause); }} className="space-y-4">
            {submitting ? (
                <div className="text-center text-yellow-400 animate-pulse">Consulting the Spirits...</div>
            ) : (
                <>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">DECEASED NAME</label>
                        <input className="w-full bg-[#333] border border-gray-600 p-2 text-white outline-none focus:border-yellow-500"
                            value={name} onChange={e => setName(e.target.value)} required maxLength={20} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">CAUSE OF DEATH</label>
                        <input className="w-full bg-[#333] border border-gray-600 p-2 text-white outline-none focus:border-yellow-500"
                            value={cause} onChange={e => setCause(e.target.value)} required maxLength={40} />
                    </div>
                    <button className="w-full bg-red-700 text-white p-3 border-b-4 border-red-900 hover:bg-red-600 active:border-b-0 active:translate-y-1 font-bold">
                        SUBMIT FOR BURIAL
                    </button>
                </>
            )}
        </form>
    );
};

// --- NOTICE BOARD ---
export const NoticeBoardView: React.FC<{ history: FuneralData[], queue: FuneralData[] }> = ({ history, queue }) => (
    <div className="h-[60vh] overflow-y-auto pr-2 flex flex-col gap-6">
        <div className="bg-[#2d2d2d] p-3 rounded">
            <h3 className="text-yellow-500 border-b border-gray-600 mb-2 text-xs uppercase">Queue</h3>
            {queue.length === 0 && <span className="text-gray-600 text-xs">Empty...</span>}
            {queue.map(f => <div key={f.id} className="text-xs text-white mb-1">• {f.deceasedName}</div>)}
        </div>
        <div className="bg-[#2d2d2d] p-3 rounded">
            <h3 className="text-gray-400 border-b border-gray-600 mb-2 text-xs uppercase">Graveyard Log</h3>
            {history.length === 0 && <span className="text-gray-600 text-xs">No burials yet.</span>}
            {history.map(f => (
                <div key={f.id} className="mb-3 border-l-2 border-gray-600 pl-2">
                    <div className="text-white font-bold text-xs">{f.deceasedName}</div>
                    <div className="text-gray-400 text-[10px] italic">"{f.eulogy}"</div>
                </div>
            ))}
        </div>
    </div>
);
