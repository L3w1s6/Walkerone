import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import MobileBody from './components/MobileBody';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import MapWrapper from './components/MapWrapper';
import UserSession from './components/UserSession';
import Account from './pages/Account';
import Login from './pages/Login';
import Stats from './pages/Stats';
import Tasks from './pages/Tasks';
import RoutesPage from './pages/Routes';
import RouteInfo from './pages/RouteInfo';
import { io } from 'socket.io-client';

export default function App() {
  const [isRecording, setIsRecording] = useState(false); // State for checking if a route is currently recording
  const [coordinates, setCoordinates] = useState([]); // State of recorded coordinates on a route
  const watchIdRef = useRef(null); // Reference for GPS tracking session ID
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to backend
    socketRef.current = io();

    socketRef.current.on("connect", () => {
      console.log("Connected to backend:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from backend");
    });

    return () => {
      socketRef.current.disconnect(); // Disconnect on close
    };
  }, []);

  return (
    <BrowserRouter>
      <MobileBody>
        <Routes> {/* Fullscreen screens */}
          <Route path="/" element={<Login/>}/>
          <Route path="/*" element={
            <UserSession>
              <div className="flex flex-col h-dvh justify-between"> {/* Internal screens */}
                <TopNav/>
                <div className="flex-1 h-100 overflow-y-auto bg-white relative">
                  {/* Keep the map active at all times (stops it from having to reload constantly which also breaks route recording) */}
                  <MapWrapper isRecording={isRecording} setIsRecording={setIsRecording} coordinates={coordinates} setCoordinates={setCoordinates} watchIdRef={watchIdRef}/>
                  <Routes>
                    <Route path="/map" element={<div/>}/> {/* Empty screen, actual map added by MapWrapper */}
                    <Route path="/account" element={<Account/>}/>
                    <Route path="/routes2" element={<RoutesPage/>}/>
                    <Route path="/stats" element={<Stats/>}/>
                    <Route path="/tasks" element={<Tasks/>}/>
                    <Route path="/route" element = {<RouteInfo/>} />
                    <Route path="*" element={<div><p>Unknown path</p></div>}/>
                  </Routes>
                </div>
                <BottomNav isRecording={isRecording}/>
              </div>
            </UserSession>
          }/>
        </Routes>
      </MobileBody>
    </BrowserRouter>
  )
}