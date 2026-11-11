export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Core Gradients */}
        <linearGradient id="blueMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="purpleMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        {/* Highlight Gradients for Bevels */}
        <linearGradient id="highlightBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="highlightPurple" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>

        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="4"
            floodColor="#000"
            floodOpacity="0.5"
          />
        </filter>
        <filter id="keyholeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Outer Base */}
      <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="#020617" />

      {/* Top Left Facet */}
      <path d="M15,30 L50,10 L50,25 L15,45 Z" fill="url(#blueMain)" />

      {/* Top Right Facet */}
      <path d="M50,10 L85,30 L50,50 L50,25 Z" fill="url(#blueMain)" />

      {/* Structural Connecting Ribbon Center - Top half */}
      <path
        d="M15,45 L50,65 L85,45 L85,30 L50,50 L15,30 Z"
        fill="url(#purpleMain)"
        opacity="0.8"
      />

      {/* Bottom Right Facet */}
      <path d="M85,70 L50,90 L50,75 L85,55 Z" fill="url(#purpleMain)" />

      {/* Bottom Left Facet */}
      <path d="M50,90 L15,70 L50,50 L50,75 Z" fill="url(#purpleMain)" />

      {/* Structural Connecting Ribbon Center - Bottom half overlapping */}
      <path
        d="M85,55 L50,35 L15,55 L15,70 L50,50 L85,70 Z"
        fill="url(#blueMain)"
        opacity="0.9"
      />

      {/* 3D Bevel Highlights - Light edges */}
      <path d="M15,30 L50,10 L50,13 L17,31 Z" fill="rgba(255,255,255,0.4)" />
      <path d="M50,10 L85,30 L83,31 L50,13 Z" fill="rgba(255,255,255,0.2)" />
      <path d="M15,45 L15,30 L18,31 L18,44 Z" fill="rgba(255,255,255,0.2)" />

      {/* 3D Bevel Shadows - Dark edges */}
      <path d="M85,70 L50,90 L50,87 L83,69 Z" fill="rgba(0,0,0,0.4)" />
      <path d="M50,90 L15,70 L17,69 L50,87 Z" fill="rgba(0,0,0,0.2)" />
      <path d="M85,55 L85,70 L82,69 L82,56 Z" fill="rgba(0,0,0,0.3)" />

      {/* Intersection Shadows (where ribbons cross) */}
      <path
        d="M25,48 L50,62 L50,50 L35,42 Z"
        fill="#000"
        opacity="0.4"
        filter="url(#shadow)"
      />
      <path
        d="M75,52 L50,38 L50,50 L65,58 Z"
        fill="#000"
        opacity="0.3"
        filter="url(#shadow)"
      />

      {/* Central Keyhole Cutout */}
      <g filter="url(#keyholeGlow)">
        <path
          d="M50,40 c-3.5,0 -6.5,2.5 -6.5,6 c0,2 1,3.5 2.5,5 l-1.5,7 l11,0 l-1.5,-7 c1.5,-1.5 2.5,-3 2.5,-5 c0,-3.5 -3,-6 -6.5,-6 z"
          fill="#020617"
        />
        {/* Subtle inner edge for keyhole */}
        <path
          d="M50,41 c-3,0 -5.5,2 -5.5,5 c0,1.5 0.5,3 2,4 l-1.5,6 l10,0 l-1.5,-6 c1.5,-1 2,-2.5 2,-4 c0,-3 -2.5,-5 -5.5,-5 z"
          fill="#0f172a"
        />
      </g>
    </svg>
  );
}
