
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

    const colors = ['#e4b85d', '#333333', '#d32f2f', '#388e3c', '#1976d2', '#5d4037', '#f44336', '#ffeb3b', '#ffffff', '#000000'];

    return (
        <div className="flex gap-6 items-start">
            {/* LIVE PREVIEW */}
            <div className="flex flex-col items-center justify-center bg-[#2d2d2d] p-4 rounded border-2 border-gray-600 min-w-[120px]">
                <h3 className="text-gray-400 text-[10px] mb-4 uppercase tracking-widest">Preview</h3>
                <div className="relative w-16 h-20 scale-150">
                     {/* Character Sprite Logic Reused */}
                    <div className="absolute bottom-0 left-4 w-8 h-10">
                         <div className="absolute bottom-0 left-1 w-6 h-4 rounded-b-sm" style={{backgroundColor: player.appearance.pantsColor}}></div>
                         <div className="absolute bottom-4 left-1 w-6 h-4 rounded-t-sm" style={{backgroundColor: player.appearance.shirtColor}}></div>
                         <div className="absolute bottom-7 left-1.5 w-5 h-5 rounded-sm z-10" style={{backgroundColor: player.appearance.skinColor}}></div>
                         {player.appearance.hasHat && (
                             <>
                                 <div className="absolute bottom-10 left-0 w-8 h-2 rounded-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                                 <div className="absolute bottom-11 left-2 w-4 h-2 rounded-t-sm z-20" style={{backgroundColor: player.appearance.hatColor}}></div>
                             </>
                         )}
                         <div className="absolute top-3 left-2.5 w-1 h-1 bg-black z-30"></div>
                         <div className="absolute top-3 right-2.5 w-1 h-1 bg-black z-30"></div>
                    </div>
                </div>
                <div className="mt-8 flex items-center gap-2">
                     <input 
                        type="checkbox" 
                        checked={player.appearance.hasHat}
                        onChange={e => setPlayer(p => ({...p, appearance: {...p.appearance, hasHat: e.target.checked}}))} 
                        className="w-4 h-4"
                     />
                     <label className="text-xs text-gray-300">Hat?</label>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-1 gap-3">
                    {['hatColor', 'shirtColor', 'pantsColor'].map(part => {
                         const currentVal = player.appearance[part as keyof typeof player.appearance];
                         return (
                            <div key={part} className="bg-[#2d2d2d] p-2 rounded">
                                <label className="text-[10px] text-gray-400 uppercase block mb-2 font-bold">{part.replace('Color', '')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(c => (
                                        <button 
                                            key={c} 
                                            onClick={() => updateColor(part as any, c)}
                                            className={`w-6 h-6 rounded-sm shadow-sm transition-transform hover:scale-110 ${currentVal === c ? 'border-2 border-white ring-2 ring-blue-500 z-10 scale-110' : 'border border-gray-600'}`}
                                            style={{backgroundColor: c}}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <button onClick={close} className="bg-green-600 text-white py-3 rounded font-bold hover:bg-green-500 border-b-4 border-green-800 active:border-b-0 active:translate-y-1">Save Outfit</button>
            </div>
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
                <div className="text-center text-yellow-400 animate-pulse py-8">
                    <p className="text-xl mb-2">Consulting the Spirits...</p>
                    <p className="text-xs text-gray-500">Please wait while we process your grief.</p>
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">DECEASED NAME</label>
                        <input className="w-full bg-[#333] border border-gray-600 p-3 text-white outline-none focus:border-yellow-500 rounded"
                            value={name} onChange={e => setName(e.target.value)} required maxLength={20} placeholder="e.g. My Dignity" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">CAUSE OF DEATH</label>
                        <input className="w-full bg-[#333] border border-gray-600 p-3 text-white outline-none focus:border-yellow-500 rounded"
                            value={cause} onChange={e => setCause(e.target.value)} required maxLength={40} placeholder="e.g. Replied 'You too' to a waiter" />
                    </div>
                    <button className="w-full bg-red-700 text-white p-3 border-b-4 border-red-900 hover:bg-red-600 active:border-b-0 active:translate-y-1 font-bold rounded mt-4">
                        SUBMIT FOR BURIAL
                    </button>
                </>
            )}
        </form>
    );
};

// --- NOTICE BOARD ---
export const NoticeBoardView: React.FC<{ history: FuneralData[], queue: FuneralData[] }> = ({ history, queue }) => (
    <div className="h-[50vh] overflow-y-auto pr-2 flex flex-col gap-6 custom-scrollbar">
        <div className="bg-[#2d2d2d] p-4 rounded border border-gray-700">
            <h3 className="text-yellow-500 border-b border-gray-600 mb-3 text-xs uppercase tracking-widest font-bold">Upcoming Funerals</h3>
            {queue.length === 0 && <span className="text-gray-500 text-xs italic">The Reaper is on break.</span>}
            <ul className="space-y-2">
                {queue.map(f => (
                    <li key={f.id} className="text-xs text-white flex justify-between items-center bg-[#3a3a3a] p-2 rounded">
                        <span>{f.deceasedName}</span>
                        <span className="text-[10px] text-gray-400 bg-black/30 px-2 py-1 rounded">{f.causeOfDeath}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="bg-[#2d2d2d] p-4 rounded border border-gray-700">
            <h3 className="text-gray-400 border-b border-gray-600 mb-3 text-xs uppercase tracking-widest font-bold">Recent Burials</h3>
            {history.length === 0 && <span className="text-gray-500 text-xs italic">No souls have passed yet.</span>}
            <div className="space-y-4">
                {history.map(f => (
                    <div key={f.id} className="relative pl-4 border-l-2 border-gray-600">
                        <div className="text-white font-bold text-sm">{f.deceasedName}</div>
                        <div className="text-gray-400 text-[10px] mb-1">Died of: {f.causeOfDeath}</div>
                        <div className="text-[#e4b85d] text-xs italic font-serif bg-black/20 p-2 rounded">"{f.eulogy}"</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
