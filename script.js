const MAX_VALUE = 999_999_999;
const MIN_VALUE = -MAX_VALUE;
const COMMA_INSERTION_INTERVAL = 3;
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

  if (isOperator(input) && !hasValue(num1)) {
    num1 = toNumber(previousInput);
    operation = input;
    previousInput = '';
  } else if (isOperator(input) && !hasValue(num2)) {
    num2 = toNumber(previousInput);
    previousInput = '';
  } else updatePreviousInput(input);

  if (hasValue(num1) && operation !== '' && hasValue(num2)) {
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
    alert(toExponentialIfRequired(num1));
    break;
  }
}

/**
 * Checks num1 or num2 has value
 * @param {any} variable
 * @returns {Boolean}
 */
function hasValue(variable) {
  return variable !== undefined;
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
  string = string.replace(',', '');
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

/**
 * Updates 'previousInput' variable after the validation is processed.
 * @param {String} newInput
 */
function updatePreviousInput(newInput) {
  newInput = validateInput(newInput) === true ? newInput : '';
  previousInput = insertCommas(previousInput + newInput);
}

/**
 * Validates input to prevent unexpected result.
 * Prevents concatenating multiple '.'
 * Prevents 'previousInput' to hold the length of the text more than 'MAX_DIGITS' characters long.
 * @param {String} string
 * @returns {String}
 */
function validateInput(string) {
  let result = true;
  if (string === '.' && previousInput.includes(string)) {
    result = false;
  }
  if (countDigits(previousInput) >= countDigits(`${MAX_VALUE}`)) {
    result = false;
  }
  return result;
}

/**
 * Counts how many digits(0-9) does the argument have.
 * e.g. "1234567890." -> 10
 * @param {String} string
 * @returns {Number}
 */
function countDigits(string) {
  return extractDigits(string).length;
}

/**
 * Filter out "," or "." from the display value - "previousInput"
 * @param {String} string
 * @returns {String}
 */
function extractDigits(string) {
  return string.replace(/[,.]/g, '');
}

/**
 * Inserts comma(s) for each designated intervals.
 * Calculates appropriate insertion as input value grows.
 * @param {String} string
 * @returns {String}
 */
function insertCommas(string) {
  let fraction = undefined;
  // Prevents inserting commas for fractional part of the number.
  if (string.includes('.')) {
    const [integerPart, fractionPart] = string.split('.');
    string = integerPart;
    fraction = fractionPart;
  }

  string = extractDigits(string).split('');
  const repetition = getNumberOfCommas(string.length, COMMA_INSERTION_INTERVAL);
  let actualLength = string.length; // The calculation of the insertion point of comma should be done by the length without comma.
  for (let i = 1; i <= repetition; i++) {
    const index = actualLength - COMMA_INSERTION_INTERVAL * i;
    if (string[index] !== undefined) {
      const comma = ','; //Makes 'actualLength' calculation self-explanatory.
      string.splice(index, 0, comma);
      actualLength = string.length - comma.length; // Exclude the count of comma inserted.
    }
  }
  if (fraction !== undefined) {
    const fractionNum = fraction === '' ? '.' : `.${fraction}`;
    return string.join('') + fractionNum;
  }
  return string.join('');
}

/**
 *
 * @param {Number} stringLength
 * @param {Number} interval
 * @returns {Number}
 */
function getNumberOfCommas(stringLength, interval) {
  let count = 0;
  for (let i = 1; i <= stringLength; i++) {
    if (interval < i && i % interval === 1) {
      count++;
    }
  }
  return count;
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

/**
 * Used for displaying the result if it is bigger than the MAX_VALUE
 * @param {Number} num
 * @returns {String}
 */
function toExponentialIfRequired(num) {
  return MAX_VALUE < num || MIN_VALUE > num ? num.toExponential(0) : num;
}
