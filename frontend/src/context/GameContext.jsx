/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Game Context - The Global Game State Chamber
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Manages game-related state across the application:
 * - Sound effects on/off
 * - Anime overlays state
 * - XP/Gold notifications
 * - Achievement unlocks
 * - Theme preferences
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef } from 'react';

// Create the context

const GameContext = createContext(null);

/**
 * Game Provider Component
 */
export const GameProvider = ({ children }) => {
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  
  // Overlay states
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [showDefeatOverlay, setShowDefeatOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  
  // Notifications queue
  const [notifications, setNotifications] = useState([]);
  
  // Audio refs
  const audioRef = useRef({});

  /**
   * Play a sound effect
   */
  const playSound = useCallback((soundName) => {
    if (!soundEnabled) return;

    const soundPaths = {
      'level-up': '/sounds/level-up.mp3',
      'game-over': '/sounds/game-over.mp3',
      'gold-coins': '/sounds/gold-coins.mp3',
      'quest-complete': '/sounds/quest-complete.mp3',
      'button-click': '/sounds/button-click.mp3',
    };

    const path = soundPaths[soundName];
    if (!path) return;

    try {
      if (!audioRef.current[soundName]) {
        audioRef.current[soundName] = new Audio(path);
      }
      
      const audio = audioRef.current[soundName];
      audio.volume = soundVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Audio play failed (probably due to browser autoplay policy)
        console.log('Sound blocked by browser');
      });
    } catch (err) {
      console.log('Error playing sound:', err);
    }
  }, [soundEnabled, soundVolume]);

  /**
   * Trigger victory celebration
   */
  const triggerVictory = useCallback((message = 'VICTORY!') => {
    setOverlayMessage(message);
    setShowVictoryOverlay(true);
    playSound('level-up');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowVictoryOverlay(false);
    }, 3000);
  }, [playSound]);

  /**
   * Trigger defeat/failure overlay
   */
  const triggerDefeat = useCallback((message = 'CRITICAL HIT! MORALE DEPLETED.') => {
    setOverlayMessage(message);
    setShowDefeatOverlay(true);
    playSound('game-over');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowDefeatOverlay(false);
    }, 3000);
  }, [playSound]);

  /**
   * Add a notification (XP gain, gold, achievement)
   */
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Play appropriate sound
    if (notification.type === 'xp') {
      playSound('level-up');
    } else if (notification.type === 'gold') {
      playSound('gold-coins');
    } else if (notification.type === 'achievement') {
      playSound('quest-complete');
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    
    return id;
  }, [playSound]);

  /**
   * Remove a notification
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Toggle sound
   */
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Context value
  const value = {
    // Sound
    soundEnabled,
    soundVolume,
    setSoundVolume,
    toggleSound,
    playSound,
    
    // Overlays
    showVictoryOverlay,
    showDefeatOverlay,
    overlayMessage,
    triggerVictory,
    triggerDefeat,
    setShowVictoryOverlay,
    setShowDefeatOverlay,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Custom hook to use game context
 */
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider. Did you forget to wrap your app?');
  }
  
  return context;
};

