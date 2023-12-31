const MAX_VALUE = 999_999_999;
const MIN_VALUE = -MAX_VALUE;
const COMMA_INSERTION_INTERVAL = 3;
let previousInput = '';
let previousOperation = '';
let num1;
let operation = '';
let negativeEntry = false;

window.addEventListener('keydown', ({ key }) => {
  const element = getElement(key);
  if (element === null) {
    return;
  }
  addCSSClass(element);
  main(element.getAttribute('data-value'));
});

window.addEventListener('keyup', ({ key }) => {
  const element = getElement(key);
  if (element === null) {
    return;
  }
  handleMouseUp(element);
});

const buttons = document.querySelectorAll('.button');
buttons.forEach((b) => {
  b.addEventListener('mousedown', (e) => handleClick(e));
  b.addEventListener('mouseup', (e) => handleMouseUp(e));
  b.addEventListener('mouseleave', (e) => handleMouseUp(e));
});

const display = document.querySelector('.display');

/**
 * Returns the node which is corresponding with the name of the key pressed.
 * @param {String} key
 * @returns {Element}
 */
function getElement(key) {
  const node = document.querySelector(`.button[data-value="${key}"]`);
  return node;
}

/**
 * Function receives both event object and Element.
 * Therefore how to read the value of the argument is defined at the first line.
 * @param {Element|DOMEvent} arg
 */
function handleMouseUp(arg) {
  arg = arg.target || arg;
  const element = arg.closest('[data-value]');
  element.classList.remove('clicked');
}

/**
 * Takes
 * @param {DOMEvent} target
 */
function handleClick({ target }) {
  addCSSClass(target);
  resetDisplayFontSize();
  const input = getInput(target);
  main(input);
}

/**
 * Conducts calculation and update results displayed on the "display" element
 * @param {String} input
 * @returns
 */
function main(input) {
  if (input === 'ac') {
    clearActiveClass();
    reset();
    return;
  }

  if (input === 'c') {
    handleClearInput();
    return;
  }

  if (input === 'toggle') {
    handleToggleInput();
    return;
  }

  if (input === '%') {
    handlePercentageInput();
    return;
  }

  if (!isNaN(parseInt(input)) || input === '.') {
    handleNumberInput(input);
    return;
  }

  if (isOperator(input)) {
    clearActiveClass();
    addActiveClass(input);
    previousOperation = '';
    if (previousInput !== '') {
      operation = input;
      handleOperatorInput(input);
      return;
    }
    //For chain calculating after "=" button was pressed.
    if (num1 !== undefined) {
      operation = input;
      display.textContent = getDisplayValue(num1);
      return;
    }
  }

  if (input === 'Enter' && operation !== '') {
    clearActiveClass();
    handleEqualInput();
    return;
  }
}

/**
 * Make operator clicked active text color
 * @param {String} operator
 */
function addActiveClass(operator) {
  buttons.forEach((b) => {
    const element = b.closest('[data-value]');
    const dataValue = element.getAttribute('data-value');
    if (dataValue && dataValue === operator) {
      console.log('dataValue', dataValue);
      element.classList.add('text-active');
    }
  });
}

/**
 * Reset the operator button text color
 */
function clearActiveClass() {
  buttons.forEach((b) => {
    const element = b.closest('[data-value]');
    if (element.classList.contains('text-active')) {
      element.classList.remove('text-active');
    }
  });
}

/**
 * Add CSS class to a clicked button.
 * @param {Element} target
 */
function addCSSClass(target) {
  const element = target.closest('[data-value]');
  element.classList.add('clicked');
}

/**
 * Routine process when "c" is entered.
 */
function handleClearInput() {
  if (previousInput === '') {
    clearActiveClass();
    reset();
  }
  previousInput = '';
  display.textContent = 0;
}

/**
 * Routine process when "+/-" is entered.
 */
function handleToggleInput() {
  negativeEntry = !negativeEntry;
  display.textContent = putMinusIfRequired(display.textContent);
}

/**
 * Routine process when "%" is entered.
 */
function handlePercentageInput() {
  let value = previousInput || `${num1}`;
  let operand1 = isExponentialForm(value) ? value : toNumber(value);
  const result = calculate(operand1, '*', '0.01');
  previousInput = `${result}`;
  display.textContent = getDisplayValue(previousInput);
  // Stop num1 to hav previous result when % is pressed after =
  if (previousOperation === '=') {
    num1 = result;
    previousInput = '';
  }
  previousOperation = '%';
}

/**
 * Routine process when number is entered.
 * @param {String} input
 */
function handleNumberInput(input) {
  if (previousOperation === '=') {
    previousOperation = '';
    previousInput = '';
    num1 = undefined;
  }
  if (previousOperation === '%') {
    previousOperation = '';
    previousInput = '';
    // num1 = undefined;
  }
  updatePreviousInput(input);
  display.textContent = putMinusIfRequired(previousInput);
}

/**
 * Routine process when "=" is entered.
 */
function handleEqualInput() {
  previousOperation = '=';
  if (previousInput !== '') {
    num1 = calculate(num1, operation, previousInput);
    if (isNaN(num1) || num1 === Infinity) {
      displayErrorMessage();
      previousInput = '';
      negativeEntry = false;
      num1 = undefined;
      return;
    }
  }
  const content = isOverLimit(num1)
    ? toExponentialIfRequired(num1)
    : insertCommas(`${num1}`);
  display.textContent = content;
  operation = '';
  previousInput = '';
  negativeEntry = false;
}

/**
 * Displays friendly error message if the result of a calculation is NaN or Infinity.
 */
function displayErrorMessage() {
  display.textContent = 'Buy me a coffee☕️';
  display.style.fontSize = '2.5rem';
}

function resetDisplayFontSize() {
  display.style.fontSize = '3.3rem';
}

/**
 * Routine when any operator is entered.
 * @param {String} operator
 */
function handleOperatorInput(operator) {
  if (num1 === undefined) {
    num1 = toNumber(previousInput);
  } else {
    num1 = calculate(num1, operator, previousInput);
  }
  display.textContent = getDisplayValue(num1);
  previousInput = '';
  negativeEntry = false;
}

/**
 * Resets all the values that are relevant to calculating.
 */
function reset() {
  previousInput = '';
  num1 = undefined;
  operation = '';
  negativeEntry = false;
  display.textContent = 0;
}

/**
 * Execute calculation and round up to proper decimal digits if required.
 * @param {Number} operandL
 * @param {String} operator
 * @param {String} operandR
 * @returns {Number}
 */
function calculate(operandL, operator, operandR) {
  operandR = toNumber(operandR);
  const result = operate(operandL, operator, operandR);
  return roundIfNecessary(operandL, operator, operandR, result);
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
function getDisplayValue(operand) {
  operand = toExponentialIfRequired(operand);
  operand = insertCommas(`${operand}`);
  operand = putMinusIfRequired(`${operand}`);
  return operand;
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
  return negativeEntry === true ? -num : +num;
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
 *Toggles the minus on the previousInput and textContent of the display.
 * @param {String} string
 * @returns {String}
 */
function putMinusIfRequired(string) {
  if (negativeEntry === true && !string.startsWith('-')) {
    return `-${string}`;
  }

  if (negativeEntry === false) {
    return string.replace('-', '');
  }
  return string;
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
  return string.replace(/[,.-]/g, '');
}

/**
 * Inserts comma(s) for each designated intervals.
 * Calculates appropriate insertion as input value grows.
 * @param {String} string
 * @returns {String}
 */
function insertCommas(string) {
  if (isExponentialForm(string)) return string;

  let prefix = string.charAt(0); // identify if the number is negative number or not.
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

  prefix = prefix === '-' ? prefix : '';

  if (fraction !== undefined) {
    const fractionNum = fraction === '' ? '.' : `.${fraction}`;
    return prefix + string.join('') + fractionNum;
  }
  return prefix + string.join('');
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
  if (
    !isFraction(calculationResult) ||
    calculationResult === 0 ||
    calculationResult === Infinity
  )
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
