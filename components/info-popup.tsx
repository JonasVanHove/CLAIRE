"use client"

import { useState, useRef, useEffect } from "react"
import { Info, X } from "lucide-react"
import Image from "next/image"
import { useUI } from "@/contexts/ui-context" // Add this import

export function InfoPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const { language } = useUI() // Add this to get the current language

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={popupRef}>
      <button
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-[#49454F] dark:text-gray-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Over het CLAIRE Dashboard"
      >
        <Info className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {language === "en" ? "About the CLAIRE Dashboard" : "Over het CLAIRE Dashboard"}
              </h2>
              <button
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-4">
              <div className="w-32 h-32 relative mb-3">
                <Image src="/CLAIRE-Logo.png" alt="CLAIRE Logo" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">CLAIRE</h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                {language === "en"
                  ? "Competency Learning Analytics for Insights and Reflection in Education"
                  : "Competency Learning Analytics for Insights and Reflection in Education"}
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                {language === "en"
                  ? "CLAIRE is a dashboard that helps visualize learning data. It was developed as a proof of concept (PoC) in collaboration with KU Leuven, GITO Overijse, and Eummena."
                  : "CLAIRE is een dashboard dat helpt om leerdata inzichtelijk te maken. Het werd ontwikkeld als proof of concept (PoC) in samenwerking met KU Leuven, GITO Overijse en Eummena."}
              </p>
              <p>
                {language === "en"
                  ? 'Jonas Van Hove designed this dashboard as part of his master\'s thesis "Turning Learning Data into Meaningful Learning Analytics Dashboards" (2025). Later, he worked with Eummena to further develop it.'
                  : 'Jonas Van Hove ontwierp dit dashboard als onderdeel van zijn masterthesis "Turning Learning Data into Meaningful Learning Analytics Dashboards" (2025). Later werkte hij samen met Eummena om het verder uit te bouwen.'}
              </p>
              <p>
                {language === "en"
                  ? "Created with care, in the hope that CLAIRE will form a valuable foundation for future dashboards within GITO and beyond."
                  : "Met veel zorg gemaakt, in de hoop dat CLAIRE een waardevolle basis vormt voor toekomstige dashboards binnen GITO en daarbuiten."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
