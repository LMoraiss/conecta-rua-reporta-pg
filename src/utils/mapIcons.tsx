
import React from 'react';

export const getReportIcon = (category: string, severity: string = 'medium') => {
  const severityColor = getSeverityColor(severity);
  
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

  // Enhanced SVG-based icons for better visibility
  const svgIconMap: { [key: string]: string } = {
    'Buraco na via': `<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.04.03 2.04-.03 3-.15V16.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V18c1.54-2.05 2.24-4.76 2-7.5V7l-10-5z"/>
      <circle cx="12" cy="14" r="3" fill="${severityColor}"/>
    </svg>`,
    'Bueiro aberto': `<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <rect x="4" y="10" width="16" height="8" rx="2" fill="${severityColor}"/>
      <rect x="6" y="12" width="2" height="4" fill="white"/>
      <rect x="11" y="12" width="2" height="4" fill="white"/>
      <rect x="16" y="12" width="2" height="4" fill="white"/>
    </svg>`,
    'Calçada danificada': `<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M2 18h20v2H2v-2zm0-4h20v2H2v-2zm8-8l-4 4h3v4h2v-4h3l-4-4z" fill="${severityColor}"/>
    </svg>`,
    'Sinalização': `<svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <rect x="10" y="4" width="4" height="16" fill="${severityColor}"/>
      <polygon points="8,4 16,4 14,8 10,8" fill="white"/>
      <polygon points="10,12 14,12 16,16 8,16" fill="white"/>
    </svg>`,
    'Alagamento': `<svg width="20" height="20" viewBox="0 0 24 24" fill="${severityColor}">
      <path d="M3 17h18v2H3v-2zm2.5-5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5-4.5-2-4.5-4.5zm7 0c0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5z"/>
    </svg>`,
    'Iluminação': `<svg width="20" height="20" viewBox="0 0 24 24" fill="${severityColor}">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`
  };

  const icon = svgIconMap[category] || iconMap[category] || '⚠️';
  
  return `<div style="
    background: ${severityColor};
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    animation: bounce-in 0.6s ease-out;
    transition: all 0.3s ease;
    transform-origin: center;
  " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
    ${typeof icon === 'string' && icon.includes('<svg') ? icon : icon}
  </div>`;
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
