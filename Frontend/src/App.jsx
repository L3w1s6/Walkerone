import BottomNav from "./components/BottomNav"
import MobileBody from "./components/MobileBody"
import Test from "./components/test"
import TopNav from "./components/TopNav"

export default function App() {
  return (
    <MobileBody>
      <TopNav/>
      <div className='text-center'>
        <Test />
        <p className="text-3xl">test</p>
      </div>
      <BottomNav/>
    </MobileBody>
  )
}