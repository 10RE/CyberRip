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

type ModalType = 'APPLICATION' | 'WARDROBE' | 'NOTICE' | null;

const Game: React.FC = () => {
    const map = useMemo(() => generateMap(), []);
    const [zoomLevel, setZoomLevel] = useState(1.25);
    const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
    
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [nearbyInteractableId, setNearbyInteractableId] = useState<string | null>(null);

    const { player, setPlayer } = useGameLoop(map, !!activeModal);
    const { queue, history, directorPhase, activeCeremony, addFuneral, currentSpeechBubble } = useFuneralSystem();

    useEffect(() => {
        const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Interaction & Proximity Loop
    useEffect(() => {
        const playerCenter = { x: player.pos.x + TILE_SIZE / 2, y: player.pos.y + TILE_SIZE / 2 };
        let nearest: any = null;
        let nearestId: string | null = null;
        let minDist = 80;

        Object.entries(map.interactables).forEach(([key, obj]) => {
            const [ty, tx] = key.split(',').map(Number);
            const objCenter = { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
            const dist = Math.hypot(playerCenter.x - objCenter.x, playerCenter.y - objCenter.y);
            if (dist < minDist) { 
                minDist = dist; 
                nearest = obj;
                nearestId = obj.id;
            }
        });

        setNearbyInteractableId(nearestId);

        const handleInteract = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== 'f' || activeModal) return;

            if (player.isSitting) {
                setPlayer(p => ({ ...p, isSitting: false, pos: { ...p.pos, y: p.pos.y + 10 } }));
                return;
            }

            if (!nearest) return;

            if (nearest.type === 'receptionist') {
                setActiveModal('APPLICATION');
            } else if (nearest.type === 'notice_board') {
                setActiveModal('NOTICE');
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
    }, [player.pos, player.isSitting, activeModal, map]);

    const camX = (viewport.w / (2 * zoomLevel)) - (player.pos.x + TILE_SIZE/2);
    const camY = (viewport.h / (2 * zoomLevel)) - (player.pos.y + TILE_SIZE/2);

    const renderModalContent = () => {
        switch(activeModal) {
            case 'WARDROBE':
                return <CustomizationForm player={player} setPlayer={setPlayer} close={() => setActiveModal(null)} />;
            case 'APPLICATION':
                return <ApplicationForm onSubmit={async (n, c) => {
                    setActiveModal(null);
                    setNotification("Processing...");
                    await addFuneral(n, c);
                    setNotification("Accepted.");
                }} />;
            case 'NOTICE':
                return <NoticeBoardView history={history} queue={queue} />;
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch(activeModal) {
            case 'WARDROBE': return 'Wardrobe';
            case 'APPLICATION': return 'Funeral Application';
            case 'NOTICE': return 'Town Chronicles';
            default: return '';
        }
    };

    return (
        <div className="w-full h-screen bg-[#f0e6d2] overflow-hidden relative select-none">
            <div 
                style={{ transform: `scale(${zoomLevel}) translate3d(${camX}px, ${camY}px, 0)`, transformOrigin: 'top left' }}
                className="will-change-transform absolute top-0 left-0"
            >
                <PixelMap mapData={map} />
                <WorldEntities 
                    player={player} 
                    directorPhase={directorPhase} 
                    activeCeremony={activeCeremony} 
                    currentSpeechBubble={currentSpeechBubble}
                    npcs={map.npcs}
                    nearbyInteractableId={nearbyInteractableId}
                />
            </div>

            <UIOverlay 
                queueLength={queue.length} 
                activeName={activeCeremony?.deceasedName}
                zoomLevel={zoomLevel}
                toggleZoom={() => setZoomLevel(z => z >= 3 ? 1 : z + 0.25)}
                openWardrobe={() => setActiveModal('WARDROBE')}
                notification={notification}
            />

            <Modal isOpen={!!activeModal} title={getModalTitle()} onClose={() => setActiveModal(null)}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default Game;