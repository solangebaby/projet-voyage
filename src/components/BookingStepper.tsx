import { Check } from '@phosphor-icons/react';

interface BookingStepperProps {
  currentStep: number;
  steps: string[];
}

const BookingStepper = ({ currentStep, steps }: BookingStepperProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center relative">
              {/* Step Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  transition-all duration-300 border-4
                  ${
                    isCompleted
                      ? 'bg-gradient-to-br from-primary to-secondary text-white border-white shadow-primary'
                      : isCurrent
                      ? 'bg-white text-primary border-primary animate-pulse shadow-lg'
                      : 'bg-white text-gray-400 border-gray-300'
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={24} weight="bold" className="text-white" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  mt-2 text-xs md:text-sm font-semibold text-center whitespace-nowrap
                  ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-secondary'
                      : 'text-gray-400'
                  }
                `}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepper;
