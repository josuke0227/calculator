const MAX_VALUE = 999_999_999;
const MIN_VALUE = -MAX_VALUE;
const COMMA_INSERTION_INTERVAL = 3;
let previousInput = '';
let num1;
let operation = '';
let negativeEntry = false;

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

  if (isOperator(input) && previousInput !== '') {
    operation = input;
    if (num1 === undefined) {
      num1 = toNumber(previousInput);
    } else {
      calculate();
    }
    display.textContent = getDisplayValue(operation, num1);
    previousInput = '';
    return;
  }

  if (input === '=' && operation !== '') {
    if (previousInput !== '') {
      calculate();
    }
    const content = isOverLimit(num1)
      ? toExponentialIfRequired(num1)
      : insertCommas(`${num1}`);
    display.textContent = content;
    previousInput = '';
    return;
  }

  //For chain calculating after "=" button was pressed.
  operation = input;
  display.textContent = getDisplayValue(operation, num1);
}

/**
 * Conduct calculation and set value to num1;
 */
function calculate() {
  const operand = toNumber(previousInput);
  const result = operate(num1, operation, operand);
  num1 = roundIfNecessary(num1, operation, operand, result);
}

/**
 * Sees if given number is exponential numerical form
 * @param {Number} num
 * @returns Boolean
 */
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
  operand = toExponentialIfRequired(operand);
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
function roundIfNecessary(operand1, operator, operand2, calculationResult) {
  if (!isFraction(calculationResult) || calculationResult === 0)
    return calculationResult;

  if (isExponentialForm(calculationResult)) {
    return parseFloat(calculationResult.toExponential(0));
  }

  const digits = adjustDecimalLength(
    operand1,
    operator,
    operand2,
    calculationResult
  );
  return parseFloat(calculationResult.toFixed(digits));
}
/**
 * Dynamically change the decimal digit length by taking integer digits into account
 * <Max 9 digits>.<Max 8 digits> e.g. 100 / 3 is 33.3333333(returns 7)
 * @param {Number} operand1
 * @param {String} operator
 * @param {Number} operand2
 * @param {Number} calculationResult
 * @returns {Number}
 */
function adjustDecimalLength(operand1, operator, operand2, calculationResult) {
  const maxDigits = getMaxDecimalDigits(calculationResult);
  if (operator === '/') return maxDigits;

  const digits = getFractionalDigits(operand1, operator, operand2);
  return digits > maxDigits ? maxDigits : digits;
}
/**
 * Get how many decimal digits does given floating point number has.
 * @param {Number} calculationResult
 * @returns {Number}
 */
function getMaxDecimalDigits(calculationResult) {
  if (!isFraction(calculationResult)) return 0;

  const integerDigits = `${calculationResult}`.split('.')[0].length;
  return 8 - integerDigits + 1; // maxDecimalDigits - integerDigits + countOfPrefixedZero e.g.(0.1)
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
function isFraction(number) {
  return `${number}`.includes('.');
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
  return isFraction(num) ? num.toString().split('.')[1].length : 0;
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
  return MAX_VALUE < num || MIN_VALUE > num;
}
