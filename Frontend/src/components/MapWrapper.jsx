import { useLocation } from 'react-router-dom';
import Map from '../pages/Map';

export default function MapWrapper({isRecording, setIsRecording, coordinates, setCoordinates, watchIdRef}) {
  const location = useLocation();
  const isMapPage = location.pathname === '/map'; // Check if current page is the map, to determine whether or not to show the map

  return (
    <div className={`h-full w-full ${isMapPage ? 'block relative' : 'hidden absolute'}`}>
      <Map isRecording={isRecording} setIsRecording={setIsRecording} coordinates={coordinates} setCoordinates={setCoordinates} watchIdRef={watchIdRef}/>
    </div>
  )
}
