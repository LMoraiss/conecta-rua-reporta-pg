
import { useEffect, useRef } from 'react';

const SimpleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('SimpleMap mounted');
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div style="
          width: 100%; 
          height: 300px; 
          background: linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        ">
          <div style="
            text-align: center;
            color: #666;
            font-size: 16px;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
            <div>Mapa carregando...</div>
            <div style="font-size: 14px; margin-top: 8px;">
              Ponta Grossa - PR
            </div>
          </div>
        </div>
      `;
    }
  }, []);

  return <div ref={mapRef} className="w-full h-96" />;
};

export default SimpleMap;
