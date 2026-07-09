"use client"

import { useEffect, useState } from "react"
import { Warp, warpPresets } from "@/components/ui/warp"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Sun, Moon, ArrowRight } from "lucide-react"

export default function DemoPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  // Sync theme with body and localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light") {
      setIsDarkMode(false)
      document.body.classList.add("light")
    } else {
      setIsDarkMode(true)
      document.body.classList.remove("light")
    }
  }, [])

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev
      localStorage.setItem("theme", next ? "dark" : "light")
      if (next) {
        document.body.classList.remove("light")
      } else {
        document.body.classList.add("light")
      }
      return next
    })
  }

  // Handle mouse movement for interactive parallax and shader morphing
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
  }

  // Dynamic values mapped from mouse coordinates
  const rotateX = (mousePos.y - 0.5) * -12 // tilting up/down
  const rotateY = (mousePos.x - 0.5) * 12  // tilting left/right

  // Choose colors based on active mode
  const defaultColors = isDarkMode
    ? ["#030712", "#0f172a", "#1e293b", "#0f172a"] // professional dark slate & steel
    : ["#fafaf9", "#f4f4f5", "#e4e4e7", "#fafaf9"] // minimalist bone/zinc light layout

  const warpParams = {
    rotation: 20 + mousePos.x * 30,
    speed: 0.05 + mousePos.y * 0.1,
    proportion: 0.45,
    softness: 1.0,
    distortion: 0.05 + mousePos.y * 0.05,
    swirl: 0.2,
    swirlIterations: 4,
    shapeScale: 0.08,
    shape: "edge" as const,
    scale: 1.02 + mousePos.x * 0.05,
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden py-16 px-4 transition-colors duration-500 ${
        isDarkMode ? "bg-[#050508] text-white" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* Background dynamic interactive shader */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-90 transition-opacity duration-300">
        <Warp 
          {...warpParams} 
          colors={defaultColors} 
          style={{ width: "100%", height: "100%" }} 
        />
      </div>

      {/* Floating sleeker designer theme toggle */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={handleToggleTheme}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold backdrop-blur-md shadow-md transition-all ${
            isDarkMode 
              ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white" 
              : "border-slate-200 bg-white/60 text-slate-700 hover:text-slate-950"
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Parallax Interactive card container */}
      <div 
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
        className={`relative p-2 w-full max-w-3xl z-10 rounded-3xl transition-all duration-300 shadow-2xl ${
          isDarkMode 
            ? "border border-white/5 bg-slate-950/20 backdrop-blur-md shadow-black/80" 
            : "border border-slate-200/50 bg-white/20 backdrop-blur-md shadow-slate-200/60"
        }`}
      >
        <main 
          className={`relative py-16 px-6 overflow-hidden rounded-2xl transition-all duration-300 ${
            isDarkMode 
              ? "border border-white/5 bg-slate-950/50" 
              : "border border-slate-200/40 bg-white/70"
          }`}
        >
          {/* Availability Badge */}
          <div className="flex justify-center mb-6">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              isDarkMode 
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                : "bg-emerald-50 border-emerald-200 text-emerald-600"
            }`}>
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span>Available for New Projects</span>
            </div>
          </div>

          <h1 className={`mb-6 text-center text-5xl font-black tracking-tight md:text-7xl select-none leading-none ${
            isDarkMode 
              ? "text-white" 
              : "text-slate-900"
          }`}>
            Design is <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
              isDarkMode ? 'from-slate-100 via-slate-200 to-slate-400' : 'from-slate-900 via-slate-800 to-slate-600'
            }`}>Everything</span>
          </h1>

          <p className={`px-6 text-center text-sm md:text-base max-w-lg mx-auto leading-relaxed select-none ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}>
            Unleashing creativity through interactive fluid motions, tactile micro-animations, and hyper-custom interfaces.
          </p>
          
          <div className="flex justify-center mt-10"> 
            <LiquidButton 
              className={`border transition-all duration-300 flex items-center gap-2 rounded-full ${
                isDarkMode 
                  ? "text-white border-white/10 bg-white/5 hover:bg-white/10" 
                  : "text-slate-900 border-slate-900/10 bg-slate-900/5 hover:bg-slate-900/10"
              }`} 
              size="xl"
            >
              Let's Go <ArrowRight className="h-4 w-4" />
            </LiquidButton> 
          </div> 
        </main>
      </div>

      {/* Decorative details to break AI aesthetic */}
      <div className={`absolute bottom-6 left-6 text-[10px] font-mono select-none tracking-widest ${
        isDarkMode ? "text-slate-600" : "text-slate-400"
      }`}>
        [ SHADER RES: {Math.round(mousePos.x * 100)}% / {Math.round(mousePos.y * 100)}% ]
      </div>
      <div className={`absolute bottom-6 right-6 text-[10px] font-mono select-none tracking-widest ${
        isDarkMode ? "text-slate-600" : "text-slate-400"
      }`}>
        © {new Date().getFullYear()} / DHARMIK THAKUR
      </div>
    </div>
  )
}
