interface ProgressCirclesProps {
  completed: number
  total: number
  size?: "sm" | "md" | "lg"
}

export function ProgressCircles({ completed, total, size = "md" }: ProgressCirclesProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const gapClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  }

  return (
    <div className={`flex justify-center ${gapClasses[size]}`}>
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} rounded-full ${index < completed ? "bg-chart-2" : "bg-muted-foreground/30"}`}
        />
      ))}
    </div>
  )
}
