
import React, { useState, useEffect, useMemo } from 'react';
import PixelMap from './components/PixelMap';
import { WorldEntities } from './components/WorldEntities';
import { UIOverlay } from './components/UIOverlay';
import { Modal } from './components/Modal';
import { ApplicationForm, CustomizationForm, NoticeBoardView } from './components/Forms';
import { useGameLoop } from './hooks/useGameLoop';
import { useFuneralSystem } from './hooks/useFuneralSystem';
import { generateMap } from './utils/mapGenerator';
import { TILE_SIZE } from './types';

const Game: React.FC = () => {
    const map = useMemo(() => generateMap(), []);
    const [zoomLevel, setZoomLevel] = useState(2);
    const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
    const [modalContent, setModalContent] = useState<{title: string, body: React.ReactNode} | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    // Logic Hooks
    const { player, setPlayer } = useGameLoop(map, !!modalContent);
    const { queue, history, directorPhase, activeCeremony, addFuneral } = useFuneralSystem();

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Interaction Logic
    useEffect(() => {
        const handleInteract = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== 'f' || modalContent) return;

            // 1. Check Chair Sitting
            if (player.isSitting) {
                setPlayer(p => ({ ...p, isSitting: false, pos: { ...p.pos, y: p.pos.y + 10 } }));
                return;
            }

            // 2. Find Nearest Object
            const playerCenter = { x: player.pos.x + TILE_SIZE / 2, y: player.pos.y + TILE_SIZE / 2 };
            let nearest: any = null;
            let minDist = 60;

            Object.entries(map.interactables).forEach(([key, obj]) => {
                const [ty, tx] = key.split(',').map(Number);
                const objCenter = { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
                const dist = Math.hypot(playerCenter.x - objCenter.x, playerCenter.y - objCenter.y);
                if (dist < minDist) { minDist = dist; nearest = obj; }
            });

            if (!nearest) return;

            // 3. Execute Interaction
            if (nearest.type === 'receptionist') {
                setModalContent({
                    title: "Funeral Application",
                    body: <ApplicationForm onSubmit={async (n, c) => {
                        setModalContent(null);
                        setNotification("Processing...");
                        await addFuneral(n, c);
                        setNotification("Accepted.");
                    }} />
                });
            } else if (nearest.type === 'notice_board') {
                setModalContent({
                    title: "Town Chronicles",
                    body: <NoticeBoardView history={history} queue={queue} />
                });
            } else if (nearest.type === 'chair') {
                const [y, x] = nearest.id.split('_').slice(1).map(Number);
                setPlayer(p => ({...p, isSitting: true, isMoving: false, direction: 'right', pos: { x: x * TILE_SIZE, y: y * TILE_SIZE - 10 }}));
            } else if (nearest.message) {
                setNotification(nearest.message);
                setTimeout(() => setNotification(null), 3000);
            }
        };

        window.addEventListener('keydown', handleInteract);
        return () => window.removeEventListener('keydown', handleInteract);
    }, [player.pos, player.isSitting, modalContent, map]);

    // Camera Math
    const camX = (viewport.w / (2 * zoomLevel)) - (player.pos.x + TILE_SIZE/2);
    const camY = (viewport.h / (2 * zoomLevel)) - (player.pos.y + TILE_SIZE/2);

    return (
        <div className="w-full h-screen bg-[#f0e6d2] overflow-hidden relative select-none">
            <div 
                style={{ transform: `scale(${zoomLevel}) translate3d(${camX}px, ${camY}px, 0)`, transformOrigin: 'top left' }}
                className="will-change-transform absolute top-0 left-0"
            >
                <PixelMap mapData={map} />
                <WorldEntities player={player} directorPhase={directorPhase} activeCeremony={activeCeremony} />
            </div>

            <UIOverlay 
                queueLength={queue.length} 
                activeName={activeCeremony?.deceasedName}
                zoomLevel={zoomLevel}
                toggleZoom={() => setZoomLevel(z => z >= 3 ? 1 : z + 1)}
                openWardrobe={() => setModalContent({
                    title: "Wardrobe", 
                    body: <CustomizationForm player={player} setPlayer={setPlayer} close={() => setModalContent(null)} />
                })}
                notification={notification}
            />

            <Modal isOpen={!!modalContent} title={modalContent?.title || ''} onClose={() => setModalContent(null)}>
                {modalContent?.body}
            </Modal>
        </div>
    );
};

export default Game;
