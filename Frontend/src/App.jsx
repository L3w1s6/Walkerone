import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { useState, useRef } from 'react'

import MobileBody from './components/MobileBody'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import Account from './pages/Account'
import Login from './pages/Login'
import Map from './pages/Map'
import Stats from './pages/Stats'
import Tasks from './pages/Tasks'
import RoutesPage from './pages/Routes'

export default function App() {
  const [isRecording, setIsRecording] = useState(false) // State for checking if a route is currently recording
  const [coordinates, setCoordinates] = useState([]) // State of recorded coordinates on a route
  const watchIdRef = useRef(null) // Reference for GPS tracking session ID

  return (
    <BrowserRouter>
      <MobileBody>
        <Routes>{/*Fullscreen screens*/}
          <Route path="/" element={<Login/>}/>
          <Route path="/*" element={
            <div className="flex flex-col h-dvh justify-between">{/*Internal screens*/}
              <TopNav/>
              <div className="flex-1 h-100 overflow-y-auto bg-white">
                <Routes>
                  <Route path="/account" element={<Account/>}/>
                  <Route path="/map" element={<Map isRecording={isRecording} setIsRecording={setIsRecording} coordinates={coordinates} setCoordinates={setCoordinates} watchIdRef={watchIdRef}/>}/>
                  <Route path="/routes2" element={<RoutesPage/>}/>
                  <Route path="/stats" element={<Stats/>}/>
                  <Route path="/tasks" element={<Tasks/>}/>
                  <Route path="*" element={<div><p>Unknown path</p></div>}/>
                </Routes>
              </div>
              <BottomNav isRecording={isRecording}/>
            </div>
          }/>
        </Routes>
      </MobileBody>
    </BrowserRouter>
  )
}