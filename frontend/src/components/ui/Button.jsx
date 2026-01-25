import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Modern Enterprise Button Component
 * Replaces the legacy RPG-styled button with a clean, accessible design system.
 */

const variants = {
  // New Enterprise Variants
  primary: `
    bg-primary-600 text-white border border-transparent
    hover:bg-primary-700 active:bg-primary-800
    shadow-sm focus:ring-primary-500
    dark:bg-primary-600 dark:hover:bg-primary-700
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-300
    hover:bg-gray-50 active:bg-gray-100
    focus:ring-gray-500
    dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700
  `,
  outline: `
    bg-transparent text-primary-600 border border-primary-600
    hover:bg-primary-50 active:bg-primary-100
    focus:ring-primary-500
    dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-900/20
  `,
  ghost: `
    bg-transparent text-gray-600 border border-transparent
    hover:bg-gray-100 hover:text-gray-900
    focus:ring-gray-500
    dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white
  `,
  danger: `
    bg-red-600 text-white border border-transparent
    hover:bg-red-700 active:bg-red-800
    focus:ring-red-500
    shadow-sm
  `,

  // Legacy RPG Mappings (for compatibility)
  stone: `
    bg-gray-800 text-white border border-transparent
    hover:bg-gray-700 active:bg-gray-900
    dark:bg-gray-700 dark:hover:bg-gray-600
  `, // Maps to a dark secondary style
  gold: `
    bg-yellow-500 text-white border border-transparent
    hover:bg-yellow-600 active:bg-yellow-700
    shadow-sm
  `, // Maps roughly to primary but gold
  mana: `
    bg-blue-600 text-white border border-transparent
    hover:bg-blue-700
  `, // Maps to primary
  parchment: `
    bg-amber-50 text-amber-900 border border-amber-200
    hover:bg-amber-100
  `, // Specialized light variant
  mystic: `
    bg-purple-600 text-white border border-transparent
    hover:bg-purple-700
  `, // Maps to a purple variant
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3.5 text-base',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // Fallback to primary if variant doesn't exist
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses}
    ${sizeClasses}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={baseClasses}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon}
      <span>{loading ? 'Processing...' : children}</span>
      {!loading && rightIcon}
    </motion.button>
  );
});

Button.displayName = 'Button';

export const IconButton = forwardRef(({ icon, ...props }, ref) => (
  <Button ref={ref} className="!px-2 !min-w-0" {...props}>{icon}</Button>
));
IconButton.displayName = 'IconButton';

export const ButtonGroup = ({ children, className = '' }) => (
  <div className={`inline-flex rounded-md shadow-sm ${className}`} role="group">
    {children}
  </div>
);
ButtonGroup.displayName = 'ButtonGroup';

export default Button;
