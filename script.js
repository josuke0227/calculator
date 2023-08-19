const MAX_DIGITS = 9;
let previousInput = '';
let num1;
let operation = '';
let num2;
let negativeEntry = true;

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
  } else updatePreviousInput(input);

  if (num1 !== undefined && operation !== '' && num2 !== undefined) {
    const result = operate(num1, operation, num2);
    num1 = roundIfNecessary(num1, operation, num2, result);
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
  let value = string.includes('.') ? parseFloat(string) : parseInt(string);
  return negateNumberIfRequired(value);
}

/**
 * Create negative version of number.
 * This handles negative number entry mode of the calculator
 * @param {Number} num
 * @returns {Number}
 */
function negateNumberIfRequired(num) {
  return negativeEntry === true ? -num : num;
}

function updatePreviousInput(newInput) {
  newInput = validateInput(newInput) === true ? newInput : '';
  previousInput += newInput;
}

/**
 * Validates input to prevent unexpected result.
 * Prevents concatenating multiple '.'
 * @param {String} string
 * @returns {String}
 */
function validateInput(string) {
  if (string === '.' && previousInput.includes(string)) {
    return false;
  }
  return true;
}

/**
 * Round the result if both operand is fraction number.
 * This is for preventing wrong calculation result caused by rounding error.
 * @param {Number} operand1
 * @param {Number} operand2
 * @param {Number} result
 * @returns
 */
function roundIfNecessary(operand1, operator, operand2, result) {
  if (areFraction(operand1, operand2) === false || operator === '/') {
    return result;
  }
  return result.toFixed(getFractionalDigits(operand1, operator, operand2));
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
 * The decimal digit that result should be rounded up changes based on the type of the calculation.
 * This function switches the way of computing the rounding limit based on the operator.
 * @param {Number} operand1
 * @param {String} operator
 * @param {Number} operand2
 * @returns {Number}
 */
function getFractionalDigits(operand1, operator, operand2) {
  if (operator === '+' || operator === '-') {
    return getMaxDecimalDigitLength(operand1, operand2);
  }
  if (operator === '*') {
    return getTotalDecimalDigitLength(operand1, operand2);
  }
}

/**
 * Returns longer decimal digit length between two floating point numbers.
 * @param {Number} a
 * @param {Number} b
 * @returns {Number}
 */
function getMaxDecimalDigitLength(a, b) {
  const lengthA = getDecimalDigitLength(a);
  const lengthB = getDecimalDigitLength(b);
  return Math.max(lengthA, lengthB);
}

/**
 * Returns the total decimal digit length between two floating point numbers.
 * @param {Number} a
 * @param {Number} b
 * @returns {Number}
 */
function getTotalDecimalDigitLength(a, b) {
  const lengthA = getDecimalDigitLength(a);
  const lengthB = getDecimalDigitLength(b);
  return lengthA + lengthB;
}

/**
 * Get the decimal digit length of the given floating point number.
 * @param {Number} num
 * @returns {Number}
 */
function getDecimalDigitLength(num) {
  return num.toString().split('.')[1].length;
}
