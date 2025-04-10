import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { StudentProvider } from "@/contexts/student-context"

export const metadata: Metadata = {
  title: "CLAIRE Dashboard",
  description: "Competency Learning Analytics for Insights and Reflection in Education",
  icons: {
    icon: "/favicon.ico",
    apple: "/CLAIRE-Logo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StudentProvider>{children}</StudentProvider>
      </body>
    </html>
  )
}


import './globals.css'