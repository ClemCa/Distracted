import { useEffect, useState } from 'react'
import Selector from './components/selector'
import Feed from './pages/feed'

function App() {
  const [status, setStatus] = useState('Checking…')
  const [currentPage, setCurrentPage] = useState('feed')

  useEffect(() => {
    fetch('/health')
      .then((res) =>
        res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`)),
      )
      .then((text) => setStatus(text))
      .catch((err) => setStatus(`Error: ${err.message}`))
  }, [])

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen bg-neutral-950 text-white">
      <h1 className="text-5xl font-bold my-5">Distracted</h1>

      <div className="flex flex-1 items-center justify-center w-full">
        {
          currentPage === 'feed' ? (
            <Feed changePage={setCurrentPage} />
          ) : "TODO"
        }
      </div>

      <p className="mb-4 text-lg text-neutral-700">
        Backend health: <span className="font-semibold">{status}</span>
      </p>
    </div>
  )
}

export default App
