"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface WeightConfirmationProps {
  photoUrl: string
  detectedWeight: number
  onConfirm: (weight: number) => void
  onRetake: () => void
}

export function WeightConfirmation({ photoUrl, detectedWeight, onConfirm, onRetake }: WeightConfirmationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedWeight, setEditedWeight] = useState(detectedWeight.toString())

  const handleConfirm = () => {
    onConfirm(detectedWeight)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const weight = Number.parseFloat(editedWeight)
    if (weight > 0 && weight < 1000) {
      onConfirm(weight)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-center">Confirm your weight</h2>

        <div className="mb-4">
          <img
            src={photoUrl || "/placeholder.svg"}
            alt="Scale reading"
            className="w-full max-w-sm mx-auto rounded-lg"
          />
        </div>

        <div className="text-center bg-muted p-6 md:p-8 rounded-lg mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                type="number"
                step="0.1"
                value={editedWeight}
                onChange={(e) => setEditedWeight(e.target.value)}
                className="text-center text-2xl md:text-3xl font-bold"
                placeholder="Enter weight"
              />
              <p className="text-sm text-muted-foreground">Enter weight in kg</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-3xl md:text-4xl font-bold text-foreground">{detectedWeight} kg</p>
              <p className="text-sm md:text-base text-muted-foreground mt-2">Reading looks accurate</p>
            </>
          )}
        </div>

        {!isEditing && (
          <>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4">
              <Button variant="outline" onClick={handleConfirm} className="flex-1 py-3 bg-transparent">
                CORRECT
              </Button>
              <Button variant="outline" onClick={handleEdit} className="flex-1 py-3 bg-transparent">
                EDIT WEIGHT
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onRetake} className="flex-1 bg-transparent">
                Retake Photo
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-chart-2 hover:bg-chart-2/90 text-white py-4 text-base md:text-lg"
              >
                SAVE TODAY'S TRACKING
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
