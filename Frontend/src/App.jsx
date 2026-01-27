import MobileBody from './components/MobileBody'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Test from './components/Test'
import Account from './pages/Account'
import Login from './pages/Login'
import Map from './pages/Map'
import Stats from './pages/Stats'
import Tasks from './pages/Tasks'
import Routes2 from './pages/Routes'

export default function App() {
  return (
    <BrowserRouter>
      <MobileBody>
        <TopNav/>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/map" element={<Map/>}/>
          <Route path="/routes2" element={<Routes2/>}/>
          <Route path="/stats" element={<Stats/>}/>
          <Route path="/tasks" element={<Tasks/>}/>
          <Route path="*" element={<div><p>Unknown path</p></div>}/>
        </Routes>
        <BottomNav/>
      </MobileBody>
    </BrowserRouter>
  )
}