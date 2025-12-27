// Avatar mapping - centralized avatar definitions
export const AVATAR_MAP = {
  warrior: { emoji: '⚔️', name: 'Warrior', color: 'from-red-600 to-orange-600' },
  mage: { emoji: '🧙‍♂️', name: 'Mage', color: 'from-purple-600 to-blue-600' },
  rogue: { emoji: '🗡️', name: 'Rogue', color: 'from-gray-600 to-slate-600' },
  healer: { emoji: '✨', name: 'Healer', color: 'from-green-600 to-emerald-600' },
  scholar: { emoji: '📚', name: 'Scholar', color: 'from-amber-600 to-yellow-600' },
  ranger: { emoji: '🏹', name: 'Ranger', color: 'from-teal-600 to-cyan-600' },
};

// Get avatar display info
export const getAvatarInfo = (avatarId) => {
  return AVATAR_MAP[avatarId] || AVATAR_MAP.mage; // Default to mage
};

// Get avatar emoji
export const getAvatarEmoji = (avatarId) => {
  return AVATAR_MAP[avatarId]?.emoji || '🧙‍♂️';
};

// Get avatar gradient color
export const getAvatarColor = (avatarId) => {
  return AVATAR_MAP[avatarId]?.color || 'from-purple-600 to-blue-600';
};
