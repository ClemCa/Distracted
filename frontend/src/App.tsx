import { useEffect, useState } from 'react'
import Feed from './pages/feed'
import { ClemSsoUser } from './types'


function App() {
  const [status, setStatus] = useState('Checking…')
  const [currentPage, setCurrentPage] = useState('feed')
  const [user, setUser] = useState<ClemSsoUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    fetch('/health')
      .then((res) =>
        res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`)),
      )
      .then((text) => setStatus(text))
      .catch((err) => setStatus(`Error: ${err.message}`))
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true))
  }, [])

  if (!authChecked) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-neutral-950 text-white">
        <h1 className="text-5xl font-bold my-5">Distracted</h1>
        <p className="text-lg text-neutral-700">Checking authentication…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-neutral-950 text-white">
        <h1 className="text-5xl font-bold my-5">Distracted</h1>
        <a
          href="/api/auth/login"
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
        >
          Sign in with ClemSSO
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen bg-neutral-950 text-white">
      <div className="absolute top-5 right-6 flex items-center gap-3">
        <span className="text-sm text-neutral-300">
          {user.name || user.email || user.sub}
        </span>
        <a
          href="/api/auth/logout"
          className="text-sm text-neutral-500 hover:text-white"
        >
          Sign out
        </a>
      </div>

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
