import React from 'react'

export default function Card({ children, title, icon }) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/65 p-5 text-left shadow-sm shadow-pink-100/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 sm:p-6">
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-xl">{icon}</span>}
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
