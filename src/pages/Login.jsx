import { useState } from "react"

export default function Login() {
  const [pw, setPw] = useState("")
  const [error, setError] = useState(false)

  const submit = async () => {
    const r = await fetch("/.netlify/functions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw })
    })
    const d = await r.json()
    if (d.ok) {
      window.location.reload()
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-xl shadow-md w-80">
        <h1 className="text-lg font-medium mb-4">Login</h1>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          placeholder="Passwort"
        />
        {error && (
          <div className="text-red-600 text-sm mb-2">
            Falsches Passwort
          </div>
        )}
        <button
          onClick={submit}
          className="w-full bg-black text-white py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  )
}
