const MAX_VALUE = 999_999_999;
const MIN_VALUE = -MAX_VALUE;
const MIN_FLOAT = 0.00000001;
const COMMA_INSERTION_INTERVAL = 3;
let previousInput = '';
let num1;
let operation = '';
let num2;
let negativeEntry = false;
let previousOperation = '';

const buttons = document.querySelectorAll('.button');
buttons.forEach((b) => b.addEventListener('click', (e) => handleClick(e)));

const display = document.querySelector('.display');

function handleClick({ target }) {
  const input = getInput(target);

  if (!isNaN(parseInt(input)) || input === '.') {
    updatePreviousInput(input);
    display.textContent = previousInput;
    return;
  }

  if (isOperator(input)) {
    if (previousInput === '') return;

    if (previousOperation === '=') {
      operation = input;
      previousInput = '';
      return;
    }

    if (!hasValue(num1)) {
      num1 = toNumber(previousInput);
      operation = input;
      previousInput = '';
      display.textContent = getDisplayValue(operation, num1);
      return;
    }

    num2 = toNumber(previousInput);
    if (isNaN(num2)) return;
    const result = operate(num1, operation, num2);
    num1 = roundIfNecessary(num1, operation, num2, result);
    num2 = undefined;

    if (isOverLimit(num1)) {
      display.textContent = toExponentialIfRequired(num1);
    }

    if (!isOverLimit(num1)) {
      display.textContent = insertCommas(`${num1}`);
    }
    previousInput = '';
    operation = input;
  }

  if (input === '=') {
    previousOperation = input;
    if (previousInput === '' || operation === '') return;
    num2 = toNumber(previousInput);
    if (isNaN(num2)) {
      num2 = num1;
      previousInput = `${num1}`;
    }
    const result = operate(num1, operation, num2);
    console.log(result);
    num1 = roundIfNecessary(num1, operation, num2, result);

    if (isOverLimit(num1)) {
      display.textContent = toExponentialIfRequired(num1);
    }

    if (!isOverLimit(num1)) {
      display.textContent = insertCommas(`${num1}`);
    }
  }
  // console.log('num1', num1);
  // console.log('operation', operation);
  // console.log('num2', num2);
}

function isExponentialForm(num) {
  return `${num}`.includes('e');
}

/**
 * Extract value to determine which button was clicked.
 * @param {Element} element
 * @returns {String}
 */
function getInput(element) {
  let input;
  const dataValue = element.closest('[data-value]');
  if (dataValue) {
    input = dataValue.getAttribute('data-value');
  }
  return input;
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
  const OPERATORS = ['+', '-', '/', '*'];
  return OPERATORS.indexOf(character) != -1;
}

/**
 * Convert string into float or integer value
 * @param {String} string
 * @returns {Number}
 */
function toNumber(string) {
  string = string.replaceAll(',', '');
  let value = string.includes('.') ? parseFloat(string) : parseInt(string);
  return negateNumberIfRequired(value);
}

/**
 * Converts current calculation result in the form that is displayed on the display UI component.
 * @param {String} operator
 * @param {Number} operand
 * @returns {String}
 */
function getDisplayValue(operator, operand) {
  operator = getDisplayValueOfOperator(operator);
  operand = insertCommas(`${operand}`);
  return `${operator} ${operand}`;
}

/**
 * Get the operator in string that in the form that is used in math.
 * @param {String} operator
 * @returns {String}
 */
function getDisplayValueOfOperator(operator) {
  if (operator === '*') return '×';
  if (operator === '/') return '÷';
  return operator;
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
  if (isExponentialForm(string)) return string;

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
  if (operator === '/' && isFraction(result) && result >= MIN_FLOAT) {
    return roundByDigit(result, 8);
  }

  if ((!isFraction(operand1) && !isFraction(operand2)) || result < MIN_FLOAT) {
    return result;
  }

  return roundByDigits(
    result,
    getFractionalDigits(operand1, operator, operand2)
  );
}

function roundByDigits(number, digits) {
  if (isExponentialForm(number)) return number;
  return number.toFixed(digits);
}

/**
 * See if given numbers are fraction
 * @param {Number} a
 * @param {Number} b
 * @returns {Boolean}
 */
function areFraction(a, b) {
  return isFraction(a) && isFraction(b);
}

/**
 * See if given numbers is fraction
 * @param {Number} num
 * @returns {Boolean}
 */
function isFraction(num) {
  return num < 1 && 0 < num;
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
  try {
    return num.toString().split('.')[1].length;
  } catch (error) {
    return 0;
  }
}

/**
 * Used for displaying the result if it is bigger than the MAX_VALUE
 * @param {Number} num
 * @returns {String}
 */
function toExponentialIfRequired(num) {
  try {
    return isOverLimit(num) ? num.toExponential(0) : num;
  } catch (error) {
    return num;
  }
}

/**
 *
 * @param {Integer} num
 * @returns {Boolean}
 */
function isOverLimit(num) {
  return MAX_VALUE < num || MIN_VALUE > num || num < MIN_FLOAT;
}
