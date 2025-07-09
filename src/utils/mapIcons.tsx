
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

  const icon = iconMap[category] || '⚠️';
  
  return `<div style="
    background: ${severityColor};
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    animation: bounce-in 0.6s ease-out;
    transition: all 0.3s ease;
  ">
    ${icon}
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
