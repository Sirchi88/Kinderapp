// Bailey – der grau getigerte Familienkater.
const OUT = '#4a3e36';
const SW = `stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const FUR = '#a7a9ab', DARK = '#5d6066', LIGHT = '#e6e3de';

// Seitenansicht (Blick nach rechts). pose: 'walk' | 'sit' | 'sleep'
export function baileySVG(pose = 'walk') {
  if (pose === 'sleep') {
    return `<svg class="bailey" viewBox="-80 -70 170 90" overflow="visible">
      <ellipse cx="0" cy="12" rx="70" ry="9" fill="#000" opacity=".12"/>
      <path d="M-60 6 Q-80 -10 -50 -14" fill="none" stroke="${FUR}" stroke-width="12" stroke-linecap="round"/>
      <ellipse cx="-4" cy="-10" rx="58" ry="26" fill="${FUR}" ${SW}/>
      <path d="M-30 -32 q4 18 0 40 M-10 -36 q4 20 0 44 M10 -34 q4 18 0 40" stroke="${DARK}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g transform="translate(44 -14)"><path d="M-14 -16 L-10 -34 L2 -20 Z M8 -20 L20 -32 L20 -14 Z" fill="${FUR}" ${SW}/><ellipse rx="24" ry="20" fill="${FUR}" ${SW}/>
        <path d="M-12 -2 q5 4 10 0 M6 -2 q5 4 10 0" stroke="${OUT}" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="2" cy="6" rx="8" ry="5" fill="${LIGHT}"/><path d="M0 4 l2 2 l2 -2" fill="#e88" stroke="none"/>
        <path d="M-6 -16 l2 6 M2 -18 v6 M10 -16 l-2 6" stroke="${DARK}" stroke-width="3" stroke-linecap="round"/></g>
      <g class="zzz small"><text x="60" y="-40">z</text><text x="72" y="-56">z</text></g>
    </svg>`;
  }
  const sit = pose === 'sit';
  const body = sit
    ? `<path d="M-30 10 Q-40 -40 0 -46 Q30 -40 26 10 Z" fill="${FUR}" ${SW}/><path d="M-14 -30 q4 14 0 30 M2 -36 q4 16 0 36" stroke="${DARK}" stroke-width="5" fill="none" stroke-linecap="round"/>
       <ellipse cx="6" cy="6" rx="10" ry="7" fill="${LIGHT}" ${SW}/><ellipse cx="-12" cy="6" rx="10" ry="7" fill="${LIGHT}" ${SW}/>`
    : `<g class="legs-back"><rect x="-38" y="-6" width="12" height="26" rx="6" fill="${FUR}" ${SW}/><rect x="16" y="-6" width="12" height="26" rx="6" fill="${FUR}" ${SW}/></g>
       <ellipse cx="0" cy="-12" rx="44" ry="22" fill="${FUR}" ${SW}/>
       <path d="M-26 -32 q4 16 0 32 M-10 -34 q4 18 0 36 M6 -34 q4 18 0 36" stroke="${DARK}" stroke-width="5" fill="none" stroke-linecap="round"/>
       <g class="legs-front"><rect x="-26" y="-4" width="12" height="26" rx="6" fill="${FUR}" ${SW}/><rect x="26" y="-4" width="12" height="26" rx="6" fill="${FUR}" ${SW}/></g>`;
  const headPos = sit ? 'translate(4 -56)' : 'translate(44 -32)';
  return `<svg class="bailey" viewBox="-80 -100 170 130" overflow="visible">
    <ellipse cx="0" cy="22" rx="${sit ? 40 : 56}" ry="8" fill="#000" opacity=".12"/>
    <g class="tail" style="transform-origin:${sit ? '-24px 4px' : '-40px -16px'}"><path d="${sit ? 'M-24 4 Q-70 6 -60 -30' : 'M-40 -16 Q-74 -30 -66 -64'}" fill="none" stroke="${FUR}" stroke-width="12" stroke-linecap="round"/>
      <path d="${sit ? 'M-50 4 l-4 -10 M-62 -10 l-8 -4' : 'M-56 -26 l-8 -4 M-66 -44 l-8 0'}" stroke="${DARK}" stroke-width="5" stroke-linecap="round"/></g>
    ${body}
    <g transform="${headPos}" class="cat-head">
      <path d="M-20 -14 L-16 -40 L-2 -22 Z M6 -22 L20 -40 L22 -12 Z" fill="${FUR}" ${SW}/><path d="M-16 -18 L-14 -32 L-6 -22 Z M10 -22 L18 -32 L18 -18 Z" fill="#f2b6b6"/>
      <ellipse rx="27" ry="23" fill="${FUR}" ${SW}/>
      <path d="M-8 -22 l2 7 M0 -23 v8 M8 -22 l-2 7" stroke="${DARK}" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="4" cy="8" rx="11" ry="7" fill="${LIGHT}"/>
      <g class="eye"><ellipse cx="-9" cy="-3" rx="5" ry="6.5" fill="#c9b53a"/><ellipse cx="-9" cy="-3" rx="2" ry="5" fill="#1d1d1d"/><circle cx="-7.5" cy="-5" r="1.6" fill="#fff"/></g>
      <g class="eye"><ellipse cx="11" cy="-3" rx="5" ry="6.5" fill="#c9b53a"/><ellipse cx="11" cy="-3" rx="2" ry="5" fill="#1d1d1d"/><circle cx="12.5" cy="-5" r="1.6" fill="#fff"/></g>
      <path d="M1 4 l3 3 l3 -3 Z" fill="#e58a8a"/><path d="M4 7 q-3 5 -7 3 M4 7 q3 5 7 3" stroke="${OUT}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M-4 8 l-20 -2 M-4 10 l-18 4 M12 8 l20 -2 M12 10 l18 4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
      <ellipse cx="-16" cy="8" rx="5" ry="3" fill="#ff8f9e" opacity=".4"/><ellipse cx="22" cy="8" rx="5" ry="3" fill="#ff8f9e" opacity=".4"/>
    </g>
  </svg>`;
}
