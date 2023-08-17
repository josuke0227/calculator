const num1 = '3';
const operation = '+';
const num2 = '5';

/**
 * Convert given string number into number and do calculation.
 * @param {String} operandL
 * @param {String} operator
 * @param {String} operandR
 */
function operate(operandL, operator, operandR) {
  if (operator === '+') {
    return +operandL + +operandR;
  }
}

console.log(operate(num1, operation, num2));
