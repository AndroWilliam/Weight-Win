interface PreviewStepIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function PreviewStepIndicator({ 
  currentStep, 
  totalSteps,
  className = '' 
}: PreviewStepIndicatorProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-all ${
            i < currentStep
              ? 'bg-blue-600 w-3'
              : i === currentStep
              ? 'bg-blue-600 w-4'
              : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}


