"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void
  onCameraCapture: () => void
  className?: string
}

export function UploadDropzone({ onFileSelect, onCameraCapture, className }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file))
      onFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        {preview ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Scale preview"
                className="w-full h-64 object-cover rounded-lg border border-neutral-300"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-700 mb-2">Scale photo ready for processing</p>
              <Button onClick={() => onFileSelect(fileInputRef.current?.files?.[0]!)}>
                Process Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver
                ? "border-primary-600 bg-primary-50"
                : "border-neutral-300 hover:border-primary-400"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              
              <div>
                <h3 className="text-h2 text-neutral-900 mb-2">Upload Scale Photo</h3>
                <p className="text-body text-neutral-700 mb-4">
                  Drag and drop your scale photo here, or click to browse
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                  aria-label="Choose scale photo file from device"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                
                <Button
                  onClick={onCameraCapture}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCameraCapture()}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
                  aria-label="Take scale photo with camera"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                aria-hidden="true"
              />

              <p className="text-caption text-neutral-500">
                Supported formats: JPG, PNG, HEIC
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
