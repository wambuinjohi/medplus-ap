import React from 'react';

interface HamburgerMenuIconProps {
  isOpen: boolean;
  className?: string;
}

export const HamburgerMenuIcon = React.forwardRef<
  SVGSVGElement,
  HamburgerMenuIconProps
>(({ isOpen, className = 'h-6 w-6' }, ref) => {
  return (
    <svg
      ref={ref}
      className={`${className} transition-transform duration-300`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top line - rotates and scales */}
      <line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        style={{ transformOrigin: '12px 6px' }}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'rotate-45 translate-y-3' : ''
        }`}
      />

      {/* Middle line - fades out */}
      <line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Bottom line - rotates and scales */}
      <line
        x1="3"
        y1="18"
        x2="21"
        y2="18"
        style={{ transformOrigin: '12px 18px' }}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? '-rotate-45 -translate-y-3' : ''
        }`}
      />
    </svg>
  );
});

HamburgerMenuIcon.displayName = 'HamburgerMenuIcon';
