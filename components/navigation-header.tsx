'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NavigationHeader() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">WeightWin</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
          >
            How it works
          </button>
          <button 
            onClick={() => scrollToSection('for-nutritionists')}
            className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
          >
            For Nutritionists
          </button>
        </nav>
        
        <Link href="/auth/login">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium">
            Start the 7-Day Challenge
          </Button>
        </Link>
      </div>
    </header>
  )
}
