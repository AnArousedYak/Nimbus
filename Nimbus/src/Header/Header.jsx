import './Header.css'
import Nimbus from '../assets/Nimbus.png'

function App() {

  return (
    <header className="header">
      <div className="logo-container">
        <img src={Nimbus} alt="Nimbus Logo" className="logo" />
      </div>
    </header>
  )
}

export default App
