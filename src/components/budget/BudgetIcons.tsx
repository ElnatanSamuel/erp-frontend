import React from 'react';

export function BlueShieldCurrency({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute inset-0 rounded-full bg-blue-50" />
      <svg viewBox="0 0 48 48" className="relative h-full w-full">
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6CA8FF" />
            <stop offset="100%" stopColor="#3B6FFF" />
          </linearGradient>
        </defs>
        <g>
          <path d="M24 4l14 6v10c0 9-6.3 17-14 18-7.7-1-14-9-14-18V10l14-6z" fill="url(#blueGrad)" opacity="0.95"/>
          <text x="24" y="28" textAnchor="middle" fontSize="14" fill="#fff">₦</text>
        </g>
      </svg>
    </div>
  );
}

export function OrangeBag({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute inset-0 rounded-full bg-orange-50" />
      <svg viewBox="0 0 48 48" className="relative h-full w-full">
        <defs>
          <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFC46C" />
            <stop offset="100%" stopColor="#FF8A00" />
          </linearGradient>
        </defs>
        <g>
          <path d="M12 18h24l-2 20a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4l-2-20z" fill="url(#orangeGrad)"/>
          <path d="M18 18a6 6 0 1 1 12 0" stroke="#fff" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="30" r="6" fill="#fff" opacity=".2"/>
        </g>
      </svg>
    </div>
  );
}

export function PurplePurse({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute inset-0 rounded-full bg-fuchsia-50" />
      <svg viewBox="0 0 48 48" className="relative h-full w-full">
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C17CFF" />
            <stop offset="100%" stopColor="#8A2EFF" />
          </linearGradient>
        </defs>
        <g>
          <rect x="10" y="18" width="28" height="20" rx="6" fill="url(#purpleGrad)"/>
          <rect x="16" y="14" width="16" height="8" rx="4" fill="#6E3BEE" opacity=".8"/>
          <circle cx="24" cy="28" r="5" fill="#fff" opacity=".2"/>
        </g>
      </svg>
    </div>
  );
}

export function GreenMoneyBag({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute inset-0 rounded-full bg-emerald-50" />
      <svg viewBox="0 0 48 48" className="relative h-full w-full">
        <defs>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#25D366" />
            <stop offset="100%" stopColor="#0EA35B" />
          </linearGradient>
        </defs>
        <g>
          <path d="M18 12h12l-2 6H20l-2-6z" fill="#0EA35B"/>
          <path d="M12 20h24l-3 18a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4l-3-18z" fill="url(#greenGrad)"/>
          <text x="24" y="34" textAnchor="middle" fontSize="12" fill="#fff">%</text>
        </g>
      </svg>
    </div>
  );
}
