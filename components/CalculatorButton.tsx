
import React from 'react';

interface CalculatorButtonProps {
  onClick: (label: string) => void;
  label: string;
  className?: string;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ onClick, label, className = '' }) => {
  return (
    <button
      onClick={() => onClick(label)}
      className={`flex items-center justify-center text-3xl font-semibold rounded-full aspect-square focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-all duration-150 ${className}`}
    >
      {label}
    </button>
  );
};

export default CalculatorButton;
