"use client"

import { useState, useRef, useEffect } from "react"
import { useUI } from "@/contexts/ui-context"
import { Sun, Moon, Eye, EyeOff, Settings, LayoutGrid, LayoutList, Globe, Sliders } from "lucide-react"
import { GlobalParametersModal } from "@/components/global-parameters-modal"

// Add a global array to store click logs
const clickLogs: Array<{
  timestamp: string
  element: string
  x: number
  y: number
  target: string
}> = []

// Function to track clicks
const trackClick = (e: MouseEvent) => {
  // Get information about the clicked element
  const target = e.target as HTMLElement
  const elementType = target.tagName.toLowerCase()
  const elementId = target.id || "unknown"
  const elementClass = target.className || "unknown"
  const elementText = target.textContent?.trim().substring(0, 20) || "unknown"

  // Create a log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    element: elementType,
    x: e.clientX,
    y: e.clientY,
    target: `${elementType}${elementId ? "#" + elementId : ""}${elementClass ? "." + elementClass.toString().split(" ")[0] : ""} - ${elementText}`,
  }

  // Add to logs array
  clickLogs.push(logEntry)

  // Log to console
  console.log("Click tracked:", logEntry)
}

// Update the SettingsMenu component
export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showGlobalParams, setShowGlobalParams] = useState(false)
  const {
    darkMode,
    toggleDarkMode,
    hideNonCompleted,
    toggleHideNonCompleted,
    compactView,
    toggleCompactView,
    language,
    setLanguage,
  } = useUI()
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

  // Add event listener when component mounts
  useEffect(() => {
    // Add click event listener to document
    document.addEventListener("click", trackClick)

    // Clean up when component unmounts
    return () => {
      document.removeEventListener("click", trackClick)
    }
  }, [])

  // Translations for the settings menu
  const translations = {
    en: {
      settings: "Settings",
      darkMode: "Dark mode",
      lightMode: "Light mode",
      hideEvaluated: "Hide non-evaluated",
      showAll: "Show all activities",
      compactView: "Compact view",
      standardView: "Standard view",
      language: "Language",
      globalParameters: "Global parameters",
      globalParametersDesc: "Set risk thresholds for all students or by class",
    },
    nl: {
      settings: "Instellingen",
      darkMode: "Donkere modus",
      lightMode: "Lichte modus",
      hideEvaluated: "Verberg niet-geëvalueerde",
      showAll: "Toon alle activiteiten",
      compactView: "Compacte weergave",
      standardView: "Standaard weergave",
      language: "Taal",
      globalParameters: "Globale parameters",
      globalParametersDesc: "Stel risicodrempels in voor alle leerlingen of per klas",
    },
  }

  // Get translations based on current language
  const t = translations[language]

  // Function to generate mock log data
  const generateMockLogs = () => {
    // Get current date for the logs
    const now = new Date()

    // Create mock log data
    return {
      userId: "user_" + Math.floor(Math.random() * 1000),
      sessionId: "session_" + Math.floor(Math.random() * 10000),
      sessionStart: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
      sessionEnd: now.toISOString(),
      interactions: [
        ...clickLogs, // Include real click logs
        {
          type: "pageView",
          timestamp: new Date(now.getTime() - 3500000).toISOString(),
          page: "dashboard",
          timeSpent: 120000, // milliseconds
        },
        {
          type: "modalOpen",
          timestamp: new Date(now.getTime() - 3300000).toISOString(),
          modalType: "competencyDetail",
          timeSpent: 45000,
        },
        {
          type: "tabChange",
          timestamp: new Date(now.getTime() - 3200000).toISOString(),
          fromTab: "competencies",
          toTab: "activities",
        },
        {
          type: "search",
          timestamp: new Date(now.getTime() - 3100000).toISOString(),
          query: "Marc",
          resultsCount: 1,
        },
        {
          type: "settingsChange",
          timestamp: new Date(now.getTime() - 3000000).toISOString(),
          setting: "darkMode",
          newValue: true,
        },
      ],
      clickLogs: clickLogs, // Add a dedicated section for click logs
      settings: {
        darkMode: true,
        language: "nl",
        hideNonCompleted: false,
        compactView: true,
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      },
      performance: {
        loadTime: 1250, // milliseconds
        renderTime: 350, // milliseconds
        interactionDelay: 120, // milliseconds
      },
    }
  }

  // Function to download logs as JSON file
  const downloadLogs = () => {
    // Generate the log data
    const logs = generateMockLogs()

    // Convert to JSON string
    const jsonString = JSON.stringify(logs, null, 2)

    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: "application/json" })

    // Create a URL for the blob
    const url = URL.createObjectURL(blob)

    // Create a temporary anchor element
    const a = document.createElement("a")
    a.href = url
    a.download = `claire_logs_${new Date().toISOString().split("T")[0]}.json`

    // Append to the body, click, and remove
    document.body.appendChild(a)
    a.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.settings}
      >
        <Settings className="h-5 w-5 text-[#49454F]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-100 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-300 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="p-4 flex flex-col">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-700 mb-3">{t.settings}</h3>

            <div className="space-y-4">
              {/* Global Parameters Option */}
              <div
                className="flex items-center justify-between relative cursor-pointer"
                onClick={() => {
                  setShowGlobalParams(true)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#49454F]" />
                  <span className="text-sm text-gray-700 dark:text-gray-700">{t.globalParameters}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>

              {/* Hide Non-Completed Toggle - with consistent label and tooltip */}
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                  {hideNonCompleted ? (
                    <EyeOff className="h-4 w-4 text-[#49454F]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#49454F]" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-700 group relative">
                    {language === "nl" ? "Verberg niet-geëvalueerde" : "Hide non-evaluated"}
                    <div className="absolute left-0 -bottom-14 w-64 bg-black text-white text-xs p-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                      {language === "nl"
                        ? "Verbergt activiteiten die nog niet zijn afgelegd of geëvalueerd. Deze tellen niet mee in het eindresultaat."
                        : "Hides activities that are not yet completed or evaluated. These will not count towards the final result."}
                    </div>
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

              {/* Compact View Toggle - with consistent label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {compactView ? (
                    <LayoutList className="h-4 w-4 text-[#49454F]" />
                  ) : (
                    <LayoutGrid className="h-4 w-4 text-[#49454F]" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-700">
                    {language === "nl" ? "Compacte weergave" : "Compact view"}
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

              {/* Dark Mode Toggle - with consistent label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-4 w-4 text-[#49454F]" /> : <Sun className="h-4 w-4 text-[#49454F]" />}
                  <span className="text-sm text-gray-700 dark:text-gray-700">
                    {language === "nl" ? "Donkere modus" : "Dark mode"}
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

              {/* Language Selector - with clear active state */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#49454F]" />
                  <span className="text-sm text-gray-700 dark:text-gray-700">
                    {language === "nl" ? "Taal" : "Language"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage("nl")}
                    className={`px-2 py-1 text-xs rounded-md ${
                      language === "nl"
                        ? "bg-[#75b265] text-white font-medium"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    NL
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-2 py-1 text-xs rounded-md ${
                      language === "en"
                        ? "bg-[#75b265] text-white font-medium"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            {/* Download Logs Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => downloadLogs()}
                className="w-full py-1.5 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-300 dark:hover:bg-gray-400 dark:text-gray-800 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {language === "nl" ? "Download logbestanden" : "Download logs"}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {language === "nl"
                  ? "Download gebruiksgegevens voor analyse en onderzoeksdoeleinden."
                  : "Download usage data for analysis and research purposes."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Parameters Modal */}
      {showGlobalParams && <GlobalParametersModal onClose={() => setShowGlobalParams(false)} language={language} />}
    </div>
  )
}
