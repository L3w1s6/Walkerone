import Test from './components/test'
import MobileBody from './components/MobileBody'

export default function App() {
  return (
    <MobileBody>
      <div className='text-center'>
        <Test />
        <p className="text-3xl">test</p>
      </div>
    </MobileBody>
  )
}