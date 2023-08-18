// when a character is given, concatenate the value with "previousInput".
let previousInput = '';
let num1;
let operation = '';
let num2;

while (true) {
  const input = prompt();
  if (input === null) {
    break;
  }

  if (isOperator(input) && num1 === undefined) {
    num1 = parseInt(previousInput);
    operation = input;
    previousInput = '';
  } else if (isOperator(input) && num2 === undefined) {
    num2 = parseInt(previousInput);
    previousInput = '';
  } else previousInput += input;

  if (num1 !== undefined && operation !== '' && num2 !== undefined) {
    num1 = operate(num1, operation, num2);
    num2 = undefined;
    operation = input;
  }

  alert(`
    previousInput: ${previousInput}
    num1: ${num1}
    operation: ${operation}
    num2: ${num2}
  `);

  if (input === '=') {
    alert(num1);
    break;
  }
}

/**
 * Convert given string number into number and do calculation.
 * @param {Number} operandL
 * @param {String} operator
 * @param {Number} operandR
 * @returns {Number}
 */
function operate(operandL, operator, operandR) {
  if (operator === '+') {
    return operandL + operandR;
  }
  if (operator === '-') {
    return operandL - operandR;
  }
}

function isOperator(character) {
  return (
    character === '+' ||
    character === '-' ||
    character === '/' ||
    character === '%' ||
    character === '='
  );
}
