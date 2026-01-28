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
        <TopNav />
        <div className="flex-1 w-full overflow-y-auto relative bg-white">
          <Routes>
            <Route path="/" element={<Test />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/map" element={<Map />} />
            <Route path="/routes" element={<Routes />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </div>
        <BottomNav />
      </MobileBody>
    </BrowserRouter>
  )
}