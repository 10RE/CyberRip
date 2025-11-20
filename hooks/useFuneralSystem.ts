
import { useState, useEffect } from 'react';
import { FuneralData, DirectorPhase } from '../types';
import { generateWittyEulogy } from '../services/geminiService';

const INITIAL_FUNERAL: FuneralData = {
  id: 'init',
  deceasedName: 'Your Motivation',
  causeOfDeath: 'Doomscrolling',
  eulogy: "It died as it lived: consuming content without creating anything.",
  timestamp: Date.now(),
  attendees: 0
};

export const useFuneralSystem = () => {
  const [queue, setQueue] = useState<FuneralData[]>([INITIAL_FUNERAL]);
  const [history, setHistory] = useState<FuneralData[]>([]);
  const [directorPhase, setDirectorPhase] = useState<DirectorPhase>(DirectorPhase.IDLE);
  const [activeCeremony, setActiveCeremony] = useState<FuneralData | null>(null);

  // Add new funeral to queue
  const addFuneral = async (name: string, cause: string) => {
      const eulogy = await generateWittyEulogy(name, cause);
      const newFuneral: FuneralData = {
          id: Date.now().toString(),
          deceasedName: name,
          causeOfDeath: cause,
          eulogy,
          timestamp: Date.now(),
          attendees: 0
      };
      setQueue(prev => [...prev, newFuneral]);
  };

  // Ceremony State Machine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (directorPhase === DirectorPhase.IDLE && queue.length > 0 && !activeCeremony) {
        // START
        const next = queue[0];
        setActiveCeremony(next);
        setQueue(prev => prev.slice(1));
        setDirectorPhase(DirectorPhase.PREACHING);
    } 
    else if (directorPhase === DirectorPhase.PREACHING) {
        timer = setTimeout(() => setDirectorPhase(DirectorPhase.AMEN), 6000); 
    }
    else if (directorPhase === DirectorPhase.AMEN) {
        timer = setTimeout(() => setDirectorPhase(DirectorPhase.BURIAL), 2000);
    }
    else if (directorPhase === DirectorPhase.BURIAL) {
        timer = setTimeout(() => {
            if (activeCeremony) setHistory(prev => [activeCeremony, ...prev]);
            setDirectorPhase(DirectorPhase.IDLE);
            setActiveCeremony(null);
        }, 4000); 
    }

    return () => clearTimeout(timer);
  }, [directorPhase, queue, activeCeremony]);

  return { queue, history, directorPhase, activeCeremony, addFuneral };
};
