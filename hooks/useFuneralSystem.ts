import { useState, useEffect, useRef } from 'react';
import { FuneralData, DirectorPhase } from '../types';
import { generateWittyEulogy } from '../services/geminiService';

const INITIAL_FUNERAL: FuneralData = {
  id: 'init',
  deceasedName: 'Your Motivation',
  causeOfDeath: 'Doomscrolling',
  eulogy: "It died as it lived: consuming content without creating anything. It was tragic.",
  timestamp: Date.now(),
  attendees: 0
};

export const useFuneralSystem = () => {
  const [queue, setQueue] = useState<FuneralData[]>([INITIAL_FUNERAL]);
  const [history, setHistory] = useState<FuneralData[]>([]);
  const [directorPhase, setDirectorPhase] = useState<DirectorPhase>(DirectorPhase.IDLE);
  const [activeCeremony, setActiveCeremony] = useState<FuneralData | null>(null);
  
  // Speech Logic
  const [currentSpeechBubble, setCurrentSpeechBubble] = useState<string | null>(null);
  const speechChunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef(0);

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

  // Chunking Helper
  const chunkText = (text: string, wordsPerChunk: number = 4): string[] => {
      const words = text.split(' ');
      const chunks = [];
      for (let i = 0; i < words.length; i += wordsPerChunk) {
          let chunk = words.slice(i, i + wordsPerChunk).join(' ');
          if (i > 0) chunk = '...' + chunk;
          if (i + wordsPerChunk < words.length) chunk = chunk + '...';
          chunks.push(chunk);
      }
      return chunks;
  };

  // Ceremony Loop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const runPreachingLoop = () => {
        const chunks = speechChunksRef.current;
        const idx = currentChunkIndexRef.current;

        if (idx < chunks.length) {
            setCurrentSpeechBubble(chunks[idx]);
            currentChunkIndexRef.current++;
            // Slow reading speed: 2.5 seconds per bubble
            timer = setTimeout(runPreachingLoop, 2500);
        } else {
            // Done preaching, move to Amen
            setCurrentSpeechBubble(null);
            setDirectorPhase(DirectorPhase.AMEN);
        }
    };

    if (directorPhase === DirectorPhase.IDLE && queue.length > 0 && !activeCeremony) {
        // INIT CEREMONY
        const next = queue[0];
        setActiveCeremony(next);
        setQueue(prev => prev.slice(1));
        
        // Prepare Speech
        speechChunksRef.current = chunkText(next.eulogy);
        currentChunkIndexRef.current = 0;
        
        setDirectorPhase(DirectorPhase.PREACHING);
    } 
    else if (directorPhase === DirectorPhase.PREACHING) {
        if (currentChunkIndexRef.current === 0) {
            runPreachingLoop();
        }
    }
    else if (directorPhase === DirectorPhase.AMEN) {
        // AMEN lasts longer now (4 seconds)
        timer = setTimeout(() => setDirectorPhase(DirectorPhase.BURIAL), 4000);
    }
    else if (directorPhase === DirectorPhase.BURIAL) {
        timer = setTimeout(() => {
            if (activeCeremony) setHistory(prev => [activeCeremony, ...prev]);
            setDirectorPhase(DirectorPhase.IDLE);
            setActiveCeremony(null);
            setCurrentSpeechBubble(null);
        }, 4000); 
    }

    return () => clearTimeout(timer);
  }, [directorPhase, queue, activeCeremony]);

  return { queue, history, directorPhase, activeCeremony, addFuneral, currentSpeechBubble };
};