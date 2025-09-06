
import React, { useState } from 'react';
import CalculatorButton from './components/CalculatorButton';
import { Operation } from './types';

// --- ESTRUCTURA DEL ESTADO ---
// Interfaz que define la estructura del estado de la calculadora.
interface CalculatorState {
  displayValue: string;        // El valor que se muestra actualmente en la pantalla.
  previousValue: number | null;  // El primer operando de una operación (ej: el '5' en '5 + 3').
  operation: Operation | null;   // La operación seleccionada ('+', '-', '×', '÷').
  waitingForOperand: boolean;    // Es 'true' si hemos introducido un operador y estamos esperando el segundo número.
  history: string;             // La operación en curso que se muestra en la pantalla secundaria (ej: "5 ×").
}

// Estado inicial de la calculadora al cargar o al presionar 'AC'.
const initialState: CalculatorState = {
  displayValue: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  history: '', // El historial de la operación actual empieza vacío.
};

// --- LÓGICA DE CÁLCULO ---
/**
 * Función pura que realiza el cálculo aritmético basado en la operación.
 * @param val1 - El primer número.
 * @param val2 - El segundo número.
 * @param op - La operación a realizar.
 * @returns El resultado del cálculo.
 */
const calculate = (val1: number, val2: number, op: Operation): number => {
  switch (op) {
    case '+': return val1 + val2;
    case '-': return val1 - val2;
    case '×': return val1 * val2;
    case '÷':
      if (val2 === 0) return Infinity; // Maneja la división por cero para mostrar 'Error'.
      return val1 / val2;
  }
};


// --- COMPONENTE PRINCIPAL ---
const App: React.FC = () => {
  // Hook de estado de React para manejar el estado de la calculadora.
  const [state, setState] = useState<CalculatorState>(initialState);

  /**
   * Formatea el valor del display para una mejor legibilidad.
   * Añade separadores de miles y maneja el caso de 'Infinity' como 'Error'.
   */
  const formatDisplayValue = (value: string) => {
    if (value.includes('Infinity')) return 'Error';
    const [integer, decimal] = value.split('.');
    const formattedInteger = parseFloat(integer).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
    return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  /**
   * Manejador central que se ejecuta cada vez que se hace clic en un botón.
   * Determina qué acción realizar según la etiqueta del botón.
   */
  const handleButtonClick = (label: string) => {
    if ('0123456789'.includes(label)) {
      inputDigit(label);
    } else if (label === '.') {
      inputDecimal();
    } else if (label === 'AC') {
      clearAll();
    } else if (['÷', '×', '-', '+'].includes(label)) {
      performOperation(label as Operation);
    } else if (label === '=') {
      performEquals();
    }
  };
  
  // --- FUNCIONES DE MANEJO DE ESTADO ---

  /** Reinicia la calculadora a su estado inicial. */
  const clearAll = () => {
    setState(initialState);
  };

  /** Maneja la entrada de dígitos numéricos. */
  const inputDigit = (digit: string) => {
    const { displayValue, waitingForOperand } = state;

    // Si estábamos esperando un segundo número, reemplazamos el display con el nuevo dígito.
    if (waitingForOperand) {
      setState({ ...state, displayValue: digit, waitingForOperand: false });
    } else {
      // Evita que el display exceda un límite de caracteres.
      if (displayValue.length >= 15) return;
      // Concatena el dígito al valor actual, o lo reemplaza si es '0'.
      setState({ ...state, displayValue: displayValue === '0' ? digit : displayValue + digit });
    }
  };

  /** Maneja la entrada del punto decimal. */
  const inputDecimal = () => {
    const { displayValue, waitingForOperand } = state;
    // Si se presiona '.' después de un operador, empezamos con '0.'
    if (waitingForOperand) {
        setState({ ...state, displayValue: '0.', waitingForOperand: false });
        return;
    }
    // Añade un punto decimal solo si no existe ya uno.
    if (!displayValue.includes('.')) {
      setState({ ...state, displayValue: displayValue + '.' });
    }
  };

  /** Maneja la selección de una operación (+, -, ×, ÷). */
  const performOperation = (nextOperation: Operation) => {
    const { displayValue, previousValue, operation } = state;
    const inputValue = parseFloat(displayValue);

    // Si es la primera operación de una secuencia, guardamos el valor actual.
    if (previousValue === null) {
      setState({
        ...state,
        previousValue: inputValue,
        waitingForOperand: true,
        operation: nextOperation,
        history: `${formatDisplayValue(displayValue)} ${nextOperation}`, // Actualizamos el historial.
      });
    } else if (operation) {
      // Si ya hay una operación pendiente (ej: 5 + 3 - ), la resolvemos primero.
      const result = calculate(previousValue, inputValue, operation);
      const resultString = String(result);
      setState({
        ...state,
        previousValue: result,
        displayValue: resultString,
        waitingForOperand: true,
        operation: nextOperation,
        history: `${formatDisplayValue(resultString)} ${nextOperation}`, // Actualizamos el historial con el resultado parcial.
      });
    }
  };
    
  /** Ejecuta el cálculo final cuando se presiona el botón '='. */
  const performEquals = () => {
    const { displayValue, previousValue, operation } = state;
    const inputValue = parseFloat(displayValue);

    // Solo calcula si tenemos un número previo y una operación seleccionada.
    if (operation && previousValue !== null) {
      const result = calculate(previousValue, inputValue, operation);
      const resultString = String(result);
      // Reseteamos el estado pero mantenemos el resultado en el display.
      setState({
        ...initialState,
        displayValue: resultString,
      });
    }
  };

  /**
   * Devuelve las clases de CSS para cada botón según su tipo.
   * Esto centraliza el estilo y lo hace más fácil de modificar.
   */
  const getButtonClassName = (label: string, isZero: boolean) => {
    // Botones de operación (naranjas)
    if (['÷', '×', '-', '+', '='].includes(label)) {
        return 'bg-[#FF9500] text-white hover:bg-[#D97706]';
    }
    // Botones modificadores (grises claros)
    if (['AC', '+/-', '%'].includes(label)) {
        return 'bg-[#A5A5A5] text-black hover:bg-[#C7C7C7]';
    }
    // Botón cero (ocupa dos columnas)
    if(isZero) {
        return 'bg-[#333333] text-white hover:bg-[#555555] col-span-2 !rounded-full text-left pl-7';
    }
    // Botones numéricos y punto (grises oscuros)
    return 'bg-[#333333] text-white hover:bg-[#555555]';
  };
  
  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-xs mx-auto">
        {/* Pantalla de la calculadora */}
        <div className="bg-black text-white p-4 pb-2 rounded-t-lg">
          {/* Pantalla secundaria para mostrar la operación en curso */}
          <div 
            className="h-8 text-2xl font-light text-right text-gray-400 truncate"
            aria-live="polite"
          >
            {state.history}
          </div>
          <div 
            className="text-7xl font-light text-right break-all h-24 flex items-end justify-end"
            style={{ minHeight: '6rem' }}
          >
           {/* Este estilo dinámico encoge el texto si es demasiado largo para caber en la pantalla */}
           <span style={{ transform: `scale(${Math.min(1, 8 / state.displayValue.length)})`, transformOrigin: 'right' }}>
              {formatDisplayValue(state.displayValue)}
            </span>
          </div>
        </div>
        
        {/* Rejilla de botones */}
        <div className="grid grid-cols-4 gap-3 p-1">
          {/* Fila 1 */}
          <CalculatorButton onClick={handleButtonClick} label="AC" className={getButtonClassName('AC', false)} />
          <CalculatorButton onClick={() => {}} label="+/-" className={getButtonClassName('+/-', false) + " opacity-50 cursor-not-allowed"} />
          <CalculatorButton onClick={() => {}} label="%" className={getButtonClassName('%', false) + " opacity-50 cursor-not-allowed"} />
          <CalculatorButton onClick={handleButtonClick} label="÷" className={getButtonClassName('÷', false)} />

          {/* Fila 2 */}
          <CalculatorButton onClick={handleButtonClick} label="7" className={getButtonClassName('7', false)} />
          <CalculatorButton onClick={handleButtonClick} label="8" className={getButtonClassName('8', false)} />
          <CalculatorButton onClick={handleButtonClick} label="9" className={getButtonClassName('9', false)} />
          <CalculatorButton onClick={handleButtonClick} label="×" className={getButtonClassName('×', false)} />

          {/* Fila 3 */}
          <CalculatorButton onClick={handleButtonClick} label="4" className={getButtonClassName('4', false)} />
          <CalculatorButton onClick={handleButtonClick} label="5" className={getButtonClassName('5', false)} />
          <CalculatorButton onClick={handleButtonClick} label="6" className={getButtonClassName('6', false)} />
          <CalculatorButton onClick={handleButtonClick} label="-" className={getButtonClassName('-', false)} />

          {/* Fila 4 */}
          <CalculatorButton onClick={handleButtonClick} label="1" className={getButtonClassName('1', false)} />
          <CalculatorButton onClick={handleButtonClick} label="2" className={getButtonClassName('2', false)} />
          <CalculatorButton onClick={handleButtonClick} label="3" className={getButtonClassName('3', false)} />
          <CalculatorButton onClick={handleButtonClick} label="+" className={getButtonClassName('+', false)} />
          
          {/* Fila 5 */}
          <CalculatorButton onClick={handleButtonClick} label="0" className={getButtonClassName('0', true)} />
          <CalculatorButton onClick={handleButtonClick} label="." className={getButtonClassName('.', false)} />
          <CalculatorButton onClick={handleButtonClick} label="=" className={getButtonClassName('=', false)} />
        </div>
      </div>
    </div>
  );
};

export default App;
