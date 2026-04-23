import React from 'react';
import { FiUser, FiCamera, FiCreditCard, FiCheckCircle } from 'react-icons/fi';

const steps = [
  { id: 1, label: 'Details', icon: FiUser },
  { id: 2, label: 'Photo', icon: FiCamera },
  { id: 3, label: 'Payment', icon: FiCreditCard },
  { id: 4, label: 'Success', icon: FiCheckCircle },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-center justify-center max-w-lg mx-auto relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0 mx-10">
          <div
            className="progress-bar h-full"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? 'step-completed shadow-lg scale-110'
                    : isActive
                    ? 'step-active shadow-lg scale-110'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold transition-colors duration-300 ${
                  isActive || isCompleted ? 'text-usra-blue' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
