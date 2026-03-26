import PixiCanvas from './core/PixiCanvas'
import './App.css'

function App() {
  return (
    <div className="App">
      <PixiCanvas />
      <div className="ui-overlay">
        {/* React UI will go here */}
      </div>
    </div>
  )
}

export default App
