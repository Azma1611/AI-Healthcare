import React from 'react'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'

export default function Header() {
  const { currentUser } = useUser()

  return (
    <header className="glass rounded-2xl p-6">
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1">
            <p className="text-sm uppercase text-pink-400 tracking-wider font-semibold">Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
              {currentUser.quote}
            </h1>
            <p className="text-slate-300 mt-2">Manage your goals, track progress, and grow together.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right glass rounded-xl p-4">
              <p className="text-xs uppercase text-slate-400 mb-1">Active</p>
              <p className="text-3xl">{currentUser.avatar}</p>
              <p className="text-sm font-semibold mt-1">{currentUser.name}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  )
}
