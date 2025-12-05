interface WizardStepperProps {
  currentStep: number
  totalSteps: number
  steps: Array<{ number: number; title: string }>
}

export function WizardStepper({ currentStep, totalSteps, steps }: WizardStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  currentStep >= step.number
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#2a2a2a] text-gray-500'
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <span
                className={`text-sm mt-2 font-semibold ${
                  currentStep >= step.number ? 'text-white' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 transition-colors ${
                  currentStep > step.number ? 'bg-[#4F46E5]' : 'bg-[#2a2a2a]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-[#4F46E5] text-white`}
          >
            {currentStep}
          </div>
          <div className="flex-1 mx-4">
            <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            {currentStep}/{totalSteps}
          </div>
        </div>
        <h3 className="text-lg font-bold text-white">
          {steps[currentStep - 1].title}
        </h3>
      </div>
    </div>
  )
}

