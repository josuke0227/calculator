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
    num1 = toNumber(previousInput);
    operation = input;
    previousInput = '';
  } else if (isOperator(input) && num2 === undefined) {
    num2 = toNumber(previousInput);
    previousInput = '';
  } else previousInput += input;

  if (num1 !== undefined && operation !== '' && num2 !== undefined) {
    const result = operate(num1, operation, num2);
    num1 = roundIfNecessary(num1, num2, result);
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
  if (operator === '*') {
    return operandL * operandR;
  }
  if (operator === '/') {
    return operandL / operandR;
  }
}

/**
 * Judges if given character is one of the operations.
 * @param {Number} operandL
 * @param {String} operator
 * @param {Number} operandR
 * @returns {Number}
 */
function isOperator(character) {
  const OPERATORS = ['+', '-', '/', '*', '='];
  return OPERATORS.indexOf(character) != -1;
}

/**
 * Convert string into float or integer value
 * @param {String} string
 * @returns {Number}
 */
function toNumber(string) {
  return string.includes('.') ? parseFloat(string) : parseInt(string);
}

/**
 * Round the result if both operand is fraction number.
 * This is for preventing wrong calculation result caused by rounding error.
 * @param {Number} operand1
 * @param {Number} operand2
 * @param {Number} result
 * @returns
 */
function roundIfNecessary(operand1, operand2, result) {
  if (areFraction(operand1, operand2) === true) {
    const decimalDigit = getMaxDecimalDigitLength(operand1, operand2);
    return result.toFixed(decimalDigit);
  }
  return result;
}

/**
 * See if given numbers are fraction
 * @param {Number} a
 * @param {Number} b
 * @returns {Boolean}
 */
function areFraction(a, b) {
  return a < 1 && 0 < a && b < 1 && 0 < b;
}

/**
 * Returns longer decimal digit length between two floating point numbers.
 * @param {Number} a
 * @param {Number} b
 * @returns
 */
function getMaxDecimalDigitLength(a, b) {
  const lengthA = getDecimalDigitLength(a);
  const lengthB = getDecimalDigitLength(b);
  return Math.max(lengthA, lengthB);
}

/**
 * Get the decimal digit length of the given floating point number.
 * @param {Number} num
 * @returns {Number}
 */
function getDecimalDigitLength(num) {
  return num.toString().split('.')[1].length;
}
