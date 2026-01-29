import React, { useState } from 'react';
import { HamburgerMenuIcon } from './hamburger-menu-icon';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ isOpen, onClick, className = '', title = 'Toggle menu' }, ref) => {
    const [ripples, setRipples] = useState<
      Array<{ id: number; left: number; top: number }>
    >([]);
    const [nextRippleId, setNextRippleId] = useState(0);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const left = e.clientX - rect.left;
      const top = e.clientY - rect.top;

      const id = nextRippleId;
      setRipples((prev) => [...prev, { id, left, top }]);
      setNextRippleId(id + 1);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);

      onClick();
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        title={title}
        className={`relative inline-flex items-center justify-center h-10 w-10 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-foreground transition-all duration-200 ease-in-out hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 overflow-hidden ${className}`}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.left,
              top: ripple.top,
              width: '1px',
              height: '1px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              animation: `ripple 600ms ease-out`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Icon */}
        <HamburgerMenuIcon isOpen={isOpen} className="h-5 w-5" />

        {/* Ripple animation keyframes */}
        <style>{`
          @keyframes ripple {
            to {
              transform: translate(-50%, -50%) scale(4);
              opacity: 0;
            }
          }
        `}</style>
      </button>
    );
  }
);

MenuButton.displayName = 'MenuButton';
