
import React from 'react';

export const getReportIcon = (category: string, severity: string = 'medium') => {
  const severityColor = getSeverityColor(severity);
  
  // Enhanced SVG-based icons with better rendering
  const svgIconMap: { [key: string]: string } = {
    'Buraco na via': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      transform-origin: center;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="12" r="4" fill="white"/>
        <circle cx="12" cy="12" r="2" fill="${severityColor}"/>
        <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" stroke-width="1" fill="none"/>
      </svg>
    </div>`,
    
    'Bueiro aberto': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <rect x="4" y="10" width="16" height="8" rx="2" fill="white"/>
        <rect x="6" y="12" width="2" height="4" fill="${severityColor}"/>
        <rect x="11" y="12" width="2" height="4" fill="${severityColor}"/>
        <rect x="16" y="12" width="2" height="4" fill="${severityColor}"/>
      </svg>
    </div>`,
    
    'Calçada danificada': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M2 20h20v2H2v-2z" fill="white"/>
        <path d="M4 16h4l2-4 4 2 6-6v8H4v-2z" fill="white"/>
        <circle cx="8" cy="8" r="1" fill="${severityColor}"/>
        <circle cx="16" cy="12" r="1" fill="${severityColor}"/>
      </svg>
    </div>`,
    
    'Sinalização': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <rect x="11" y="2" width="2" height="20" fill="white"/>
        <polygon points="9,4 15,4 14,8 10,8" fill="white"/>
        <polygon points="10,12 14,12 15,16 9,16" fill="white"/>
      </svg>
    </div>`,
    
    'Alagamento': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M3 17h18c0 1.5-1 3-3 3H6c-2 0-3-1.5-3-3z" fill="white"/>
        <path d="M5 15c1-2 2-3 3-2s2 1 4 0 3-1 4 0 2 0 3 2" stroke="white" stroke-width="1.5" fill="none"/>
        <path d="M6 12c1-1.5 2-2 3-1s2 1 3 0 2-1 3 0 2-.5 3 1" stroke="white" stroke-width="1" fill="none"/>
      </svg>
    </div>`,
    
    'Problema de drenagem': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l-2 4h4l-2-4z" fill="white"/>
        <path d="M10 6l-1 3h6l-1-3H10z" fill="white"/>
        <path d="M9 9l-1 4h8l-1-4H9z" fill="white"/>
        <ellipse cx="12" cy="18" rx="4" ry="3" fill="white"/>
      </svg>
    </div>`,
    
    'Iluminação': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M9 2h6l-1 7H10L9 2z" fill="white"/>
        <rect x="10" y="9" width="4" height="2" fill="white"/>
        <rect x="11" y="11" width="2" height="8" fill="white"/>
        <rect x="8" y="19" width="8" height="2" fill="white"/>
      </svg>
    </div>`,
    
    'Limpeza': `<div style="
      background: ${severityColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <rect x="10" y="2" width="4" height="12" fill="white"/>
        <path d="M8 14h8l-1 6H9l-1-6z" fill="white"/>
        <rect x="9" y="1" width="6" height="2" rx="1" fill="white"/>
      </svg>
    </div>`
  };

  return svgIconMap[category] || `<div style="
    background: ${severityColor};
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">⚠️</div>`;
};

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

export const getProblemTypeIcon = (category: string) => {
  const iconMap: { [key: string]: string } = {
    'Buraco na via': '🕳️',
    'Bueiro aberto': '🚧',
    'Calçada danificada': '🚶‍♂️',
    'Sinalização': '🚦',
    'Alagamento': '🌊',
    'Problema de drenagem': '💧',
    'Iluminação': '💡',
    'Limpeza': '🧹',
    'Outros': '⚠️'
  };
  
  return iconMap[category] || '⚠️';
};
