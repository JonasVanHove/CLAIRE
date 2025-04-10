"use client"

import { useState, useRef, useEffect } from "react"
import { useUI } from "@/contexts/ui-context"
import { Sun, Moon, Eye, EyeOff, Settings, LayoutGrid, LayoutList } from "lucide-react"

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { darkMode, toggleDarkMode, hideNonCompleted, toggleHideNonCompleted, compactView, toggleCompactView } = useUI()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Instellingen"
      >
        <Settings className="h-5 w-5 text-[#49454F]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-100 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-300">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-3">Instellingen</h3>

            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-4 w-4 text-[#49454F]" /> : <Sun className="h-4 w-4 text-[#49454F]" />}
                  <span className="text-sm text-gray-700 dark:text-gray-700">
                    {darkMode ? "Lichte modus" : "Donkere modus"}
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    darkMode ? "bg-[#75b265]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Hide Non-Completed Toggle - Updated description */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hideNonCompleted ? (
                    <EyeOff className="h-4 w-4 text-[#49454F]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#49454F]" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-700">
                    {hideNonCompleted ? "Toon alle activiteiten" : "Verberg niet-geëvalueerde"}
                  </span>
                </div>
                <button
                  onClick={toggleHideNonCompleted}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    hideNonCompleted ? "bg-[#75b265]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hideNonCompleted ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Compact View Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {compactView ? (
                    <LayoutList className="h-4 w-4 text-[#49454F]" />
                  ) : (
                    <LayoutGrid className="h-4 w-4 text-[#49454F]" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-700">
                    {compactView ? "Standaard weergave" : "Compacte weergave"}
                  </span>
                </div>
                <button
                  onClick={toggleCompactView}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    compactView ? "bg-[#75b265]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      compactView ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
