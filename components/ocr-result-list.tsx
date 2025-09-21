"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface OCRResult {
  id: string
  weight: number
  confidence: number
  unit: 'kg' | 'lbs'
}

interface OCRResultListProps {
  results: OCRResult[]
  onSelect: (result: OCRResult) => void
  onRetake: () => void
  className?: string
}

export function OCRResultList({ results, onSelect, onRetake, className }: OCRResultListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (result: OCRResult) => {
    setSelectedId(result.id)
    onSelect(result)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-success-50 text-success-600"
    if (confidence >= 0.6) return "bg-warning-50 text-warning-600"
    return "bg-danger-50 text-danger-600"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High"
    if (confidence >= 0.6) return "Medium"
    return "Low"
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-h2 text-neutral-900">Select Your Weight</CardTitle>
        <p className="text-body text-neutral-700">
          We found {results.length} possible weight reading{results.length !== 1 ? 's' : ''} in your photo.
          Choose the correct one:
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer",
              selectedId === result.id
                ? "border-primary-600 bg-primary-50"
                : "border-neutral-300 hover:border-primary-400 hover:bg-neutral-50"
            )}
            onClick={() => handleSelect(result)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {result.weight}
              </div>
              
              <div>
                <div className="text-h2 text-neutral-900">
                  {result.weight} {result.unit}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getConfidenceColor(result.confidence))}
                  >
                    {getConfidenceLabel(result.confidence)} Confidence
                  </Badge>
                  <span className="text-caption text-neutral-500">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {selectedId === result.id && (
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-neutral-300">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onRetake}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Retake Photo
            </Button>
            
            {selectedId && (
              <Button
                onClick={() => {
                  const selected = results.find(r => r.id === selectedId)
                  if (selected) onSelect(selected)
                }}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Confirm Weight
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
