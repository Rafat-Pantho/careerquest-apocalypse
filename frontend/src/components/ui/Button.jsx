/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Button Component - The Magical Stone of Actions
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A mystical RPG-styled button component that transforms boring web buttons
 * into magical stone tablets worthy of a fantasy realm.
 * 
 * Variants:
 * - stone (default): Dark stone button for general actions
 * - gold: Premium/important actions (Submit, Confirm)
 * - mana: Primary magical actions (Login, Start Quest)
 * - danger: Destructive actions (Delete, Cancel Quest)
 * - ghost: Transparent/subtle actions
 * - parchment: Light buttons for dark backgrounds
 * 
 * Sizes: sm, md, lg, xl
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';

// Button variants configuration

const variants = {
  stone: {
    base: `
      bg-stone-gradient text-parchment-100
      border-2 border-dungeon-500
      shadow-stone
      hover:bg-stone-gradient-hover hover:border-dungeon-400
      active:shadow-stone-pressed active:translate-y-0.5
    `,
    glow: 'hover:shadow-[0_0_15px_rgba(100,100,110,0.3)]',
  },
  gold: {
    base: `
      bg-gold-gradient text-dungeon-900
      border-2 border-gold-600
      shadow-stone
      hover:bg-gold-gradient-hover hover:border-gold-500
      active:shadow-stone-pressed active:translate-y-0.5
    `,
    glow: 'hover:shadow-gold-glow',
  },
  mana: {
    base: `
      bg-mana-gradient text-white
      border-2 border-mana-600
      shadow-stone
      hover:bg-mana-gradient-hover hover:border-mana-500
      active:shadow-stone-pressed active:translate-y-0.5
    `,
    glow: 'hover:shadow-mana-glow',
  },
  danger: {
    base: `
      bg-danger-gradient text-white
      border-2 border-hp-red-600
      shadow-stone
      hover:brightness-110 hover:border-hp-red-500
      active:shadow-stone-pressed active:translate-y-0.5
    `,
    glow: 'hover:shadow-danger-glow',
  },
  ghost: {
    base: `
      bg-transparent text-parchment-300
      border-2 border-dungeon-600
      hover:bg-dungeon-700/50 hover:text-parchment-100 hover:border-dungeon-500
      active:bg-dungeon-700
    `,
    glow: '',
  },
  parchment: {
    base: `
      bg-parchment-gradient text-dungeon-900
      border-2 border-parchment-500
      shadow-parchment
      hover:border-parchment-400 hover:brightness-105
      active:shadow-stone-pressed active:translate-y-0.5
    `,
    glow: '',
  },
  mystic: {
    base: `
      bg-gradient-to-b from-mystic-500 via-mystic-600 to-mystic-700 text-white
      border-2 border-mystic-500
      shadow-stone
      hover:from-mystic-400 hover:via-mystic-500 hover:to-mystic-600
      active:shadow-stone-pressed active:translate-y-0.5
    `,
    glow: 'hover:shadow-mystic-glow',
  },
};

// Size configurations
const sizes = {
  sm: 'px-3 py-1.5 text-sm min-w-16',
  md: 'px-5 py-2.5 text-base min-w-24',
  lg: 'px-7 py-3 text-lg min-w-32',
  xl: 'px-9 py-4 text-xl min-w-40',
};

// Icon sizes that match button sizes
const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

/**
 * Button Component
 * 
 * @param {Object} props
 * @param {'stone'|'gold'|'mana'|'danger'|'ghost'|'parchment'|'mystic'} props.variant - Visual style
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Button size
 * @param {boolean} props.fullWidth - Full width button
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.withGlow - Enable hover glow effect
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Button content
 */
const Button = forwardRef(({
  variant = 'stone',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  withGlow = true,
  leftIcon,
  rightIcon,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const variantStyles = variants[variant] || variants.stone;
  const sizeStyles = sizes[size] || sizes.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  const isDisabled = disabled || loading;

  // Base button classes
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2
    font-cinzel font-semibold tracking-wide
    rounded-stone
    transition-all duration-200 ease-out
    select-none cursor-pointer
    ${sizeStyles}
    ${variantStyles.base}
    ${withGlow ? variantStyles.glow : ''}
    ${fullWidth ? 'w-full' : ''}
    ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Framer motion variants for animations
  const motionVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={baseClasses}
      variants={motionVariants}
      initial="initial"
      whileHover={!isDisabled ? "hover" : "initial"}
      whileTap={!isDisabled ? "tap" : "initial"}
      {...props}
    >
      {/* Decorative corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50 rounded-tl-sm" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-50 rounded-tr-sm" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-50 rounded-bl-sm" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50 rounded-br-sm" />
      
      {/* Loading spinner */}
      {loading && (
        <svg 
          className={`animate-spin ${iconSize}`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span className={iconSize}>{leftIcon}</span>
      )}

      {/* Button text */}
      <span className="relative z-10">
        {loading ? 'Casting...' : children}
      </span>

      {/* Right icon */}
      {!loading && rightIcon && (
        <span className={iconSize}>{rightIcon}</span>
      )}

      {/* Inner highlight effect */}
      <span 
        className="absolute inset-0 rounded-stone overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;

// ═══════════════════════════════════════════════════════════════════════════════
// ICON BUTTON VARIANT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * IconButton - A square button for icon-only actions
 */
export const IconButton = forwardRef(({
  variant = 'stone',
  size = 'md',
  icon,
  'aria-label': ariaLabel,
  className = '',
  ...props
}, ref) => {
  const iconSizeMap = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4',
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`!min-w-0 aspect-square ${iconSizeMap[size]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// ═══════════════════════════════════════════════════════════════════════════════
// BUTTON GROUP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ButtonGroup - Group multiple buttons together
 */
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex gap-2 ${className}`}>
      {children}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';
