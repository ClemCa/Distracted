import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('Checking…')

  useEffect(() => {
    fetch('/health')
      .then((res) =>
        res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`)),
      )
      .then((text) => setStatus(text))
      .catch((err) => setStatus(`Error: ${err.message}`))
  }, [])

  return (
    <div className="mx-auto mt-16 max-w-xl px-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900">React + Spring Boot</h1>
      <p className="mt-4 text-lg text-gray-700">
        Backend health: <span className="font-semibold">{status}</span>
      </p>
    </div>
  )
}

export default App
