import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapEditor } from '../../components/map/MapEditor';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen overflow-hidden bg-stone-950 flex flex-col">
      <MapEditor 
        isMaster={true} 
        onExitAdventure={() => navigate('/')} 
      />
    </div>
  );
};

export default MapPage;
