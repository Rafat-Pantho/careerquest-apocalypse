import React, { useState, useEffect, useRef } from 'react';

const GoblinHuntGame = ({ isOpen, onClose, targetCount, reward, onClaimReward }) => {
  const [goblins, setGoblins] = useState([]);
  const [killCount, setKillCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const containerRef = useRef(null);
  
  const spawnTimerRef = useRef(null);
  const goblinIdCounter = useRef(0);

  // Stop spawning if game over or unmounted
  useEffect(() => {
    if (!isOpen || gameOver) {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      return;
    }

    const spawnGoblin = () => {
      if (containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        // Assume goblin roughly 60x60 max size including paddings
        const size = 60; 
        const maxX = Math.max(0, container.width - size);
        const maxY = Math.max(0, container.height - size);
        
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);
        
        const id = goblinIdCounter.current++;
        
        setGoblins(prev => [...prev, { id, x, y }]);
        
        // Despawn goblin after 2-4 seconds if not clicked (increases difficulty slightly)
        setTimeout(() => {
          setGoblins(prev => prev.filter(g => g.id !== id));
        }, 2000 + Math.random() * 2000); 
      }
    };

    // Spawn randomly every 600 - 1000 ms roughly
    spawnTimerRef.current = setInterval(spawnGoblin, 800);
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isOpen, gameOver]);

  // Handle Win state
  useEffect(() => {
    if (killCount >= targetCount && targetCount > 0) {
      setGameOver(true);
      setGoblins([]); // clear remaining goblins
    }
  }, [killCount, targetCount]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setGoblins([]);
      setKillCount(0);
      setGameOver(false);
      goblinIdCounter.current = 0;
    }
  }, [isOpen]);

  const handleKill = (id, e) => {
    // Prevent propagating the click to background
    e.stopPropagation();
    
    // Remove the goblin and count the kill
    setGoblins(prev => prev.filter(g => g.id !== id));
    setKillCount(prev => prev + 1);
  };

  const handleClaim = () => {
    if (onClaimReward) onClaimReward(reward);
    onClose();
  };

  if (!isOpen) return null;

  const progressPercentage = Math.min(100, (killCount / Math.max(1, targetCount)) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      {/* Game Container Modal */}
      <div className="bg-gray-950 border border-blue-500/50 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] w-full max-w-4xl h-[75vh] flex flex-col relative overflow-hidden ring-1 ring-white/10">
        
        {/* Header / HUD */}
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 border-b border-gray-800 z-10 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-sm font-bold bg-gray-800 p-2 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
          
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500 font-serif drop-shadow-md mb-3 tracking-widest uppercase">
            Goblin Hunt
          </h2>
          
          {/* Progress Bar Container */}
          <div className="w-full max-w-md bg-gray-950 h-5 rounded-full overflow-hidden border border-gray-700 relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">
              Goblins Slain: {killCount} / {targetCount}
            </div>
          </div>
        </div>

        {/* Action Area (Canvas) */}
        <div 
          ref={containerRef} 
          className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black cursor-[crosshair]"
        >
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          {/* Render Goblins */}
          {!gameOver && goblins.map(goblin => (
            <button
              key={goblin.id}
              onClick={(e) => handleKill(goblin.id, e)}
              className="absolute animate-bounce focus:outline-none hover:scale-110 active:scale-90 transition-transform duration-100 ease-in-out group"
              style={{ 
                left: `${goblin.x}px`, 
                top: `${goblin.y}px`,
                width: '50px',
                height: '50px',
              }}
            >
              <div className="relative flex items-center justify-center w-full h-full">
                <span className="text-4xl drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] filter">👺</span>
                {/* Visual Pop effect container (active states simulate hit) */}
                <div className="absolute inset-0 rounded-full bg-red-500/0 group-active:bg-red-500/50 group-active:animate-ping transition-all"></div>
              </div>
            </button>
          ))}

          {/* Victory Overlay */}
          {gameOver && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="text-center p-8 bg-gray-900 border border-yellow-500/40 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] transform animate-[bounce_0.5s_ease-out]">
                <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 mb-4 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] font-serif uppercase tracking-widest">
                  Victory!
                </h1>
                <p className="text-gray-300 mb-8 text-lg font-medium">
                  Area Secured. Goblins Eliminated.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <div className="text-sm text-yellow-500/80 uppercase tracking-widest font-bold">Reward Unlocked</div>
                  <button 
                    onClick={handleClaim}
                    className="px-8 py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-extrabold text-xl rounded-xl shadow-[0_4px_15px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_25px_rgba(234,179,8,0.6)] transition-all transform hover:-translate-y-1 active:translate-y-1 active:shadow-none"
                  >
                    Claim {reward} Points
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoblinHuntGame;
