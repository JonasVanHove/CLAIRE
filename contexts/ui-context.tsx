"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface UIContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  hideNonCompleted: boolean
  toggleHideNonCompleted: () => void
  compactView: boolean
  toggleCompactView: () => void
  showCharts: boolean
  toggleShowCharts: () => void
  showWarnings: boolean
  toggleShowWarnings: () => void
  language: "nl" | "en"
  setLanguage: (lang: "nl" | "en") => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  // Dark mode is OFF by default now
  const [darkMode, setDarkMode] = useState(false)
  const [hideNonCompleted, setHideNonCompleted] = useState(false)
  const [compactView, setCompactView] = useState(false)
  const [showCharts, setShowCharts] = useState(true)
  const [showWarnings, setShowWarnings] = useState(true)
  const [language, setLanguage] = useState<"nl" | "en">("nl") // Default to Dutch

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    // Check if localStorage is available (client-side)
    if (typeof window !== "undefined") {
      // Check localStorage first
      const storedDarkMode = localStorage.getItem("darkMode")

      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === "true")
      }
      // We removed the system preference check to ensure dark mode is off by default

      // Initialize other settings from localStorage
      const storedHideNonCompleted = localStorage.getItem("hideNonCompleted")
      if (storedHideNonCompleted !== null) {
        setHideNonCompleted(storedHideNonCompleted === "true")
      }

      const storedCompactView = localStorage.getItem("compactView")
      if (storedCompactView !== null) {
        setCompactView(storedCompactView === "true")
      }

      const storedShowCharts = localStorage.getItem("showCharts")
      if (storedShowCharts !== null) {
        setShowCharts(storedShowCharts === "true")
      }

      const storedShowWarnings = localStorage.getItem("showWarnings")
      if (storedShowWarnings !== null) {
        setShowWarnings(storedShowWarnings === "true")
      }

      // Initialize language from localStorage
      const storedLanguage = localStorage.getItem("language")
      if (storedLanguage === "en" || storedLanguage === "nl") {
        setLanguage(storedLanguage)
      }
    }
  }, [])

  // Update body class and localStorage when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString())
    }
  }, [darkMode])

  // Update localStorage when other settings change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hideNonCompleted", hideNonCompleted.toString())
      localStorage.setItem("compactView", compactView.toString())
      localStorage.setItem("showCharts", showCharts.toString())
      localStorage.setItem("showWarnings", showWarnings.toString())
      localStorage.setItem("language", language)
    }
  }, [hideNonCompleted, compactView, showCharts, showWarnings, language])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleHideNonCompleted = () => {
    setHideNonCompleted(!hideNonCompleted)
  }

  const toggleCompactView = () => {
    setCompactView(!compactView)
  }

  const toggleShowCharts = () => {
    setShowCharts(!showCharts)
  }

  const toggleShowWarnings = () => {
    setShowWarnings(!showWarnings)
  }

  return (
    <UIContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        hideNonCompleted,
        toggleHideNonCompleted,
        compactView,
        toggleCompactView,
        showCharts,
        toggleShowCharts,
        showWarnings,
        toggleShowWarnings,
        language,
        setLanguage,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
}
