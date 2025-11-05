/**
 * @file A collection of utility functions for type checking.
 * @module is
 */

// --- Core Type Checkers ---

/**
 * Checks if two values are strictly equal (using ===).
 * @param {*} a - The first value.
 * @param {*} b - The second value.
 * @returns {boolean} True if the values are strictly equal, otherwise false.
 * @api public
 */
export const isEqual = (a, b) => a === b;

/**
 * Checks if a value's `typeof` matches the specified type string.
 *
 * @param {*} value - The value to test.
 * @param {string} type - The expected type string (e.g., 'string', 'object').
 * @return {boolean} True if the `typeof` value matches the type, otherwise false.
 * @api public
 */
export const isType = (value, type) => isEqual(typeof value, type);

/**
 * Checks if a value is a string.
 * @param {*} s - The value to check.
 * @returns {boolean} True if the value is a string, otherwise false.
 * @api public
 */
export const isString = s => isType(s, 'string');

/**
 * Checks if a value is an object (and not null).
 * @param {*} o - The value to check.
 * @returns {boolean} True if the value is a non-null object, otherwise false.
 * @api public
 */
export const isObject = o => o !== null && isType(o, 'object');

/**
 * Checks if a value is a number.
 * @param {*} n - The value to check.
 * @returns {boolean} True if the value is a number, otherwise false.
 * @api public
 */
export const isNumber = n => isType(n, 'number');

/**
 * Checks if a value is either a string or an object.
 * @param {*} so - The value to check.
 * @returns {boolean} True if the value is a string or an object, otherwise false.
 * @api public
 */
export const isStringObject = so => isString(so) || isObject(so);

/**
 * Checks if a value has a `then` method, indicating it's "Promise-like" (a thenable).
 * @param {*} x - The value to check.
 * @returns {boolean} True if the value has a `then` function, otherwise false.
 * @api public
 */
export const isPromise = x => x && isType(x.then, 'function');

/**
 * Checks if a value is a function.
 * @param {*} x - The value to check.
 * @returns {boolean} True if the value is a function, otherwise false.
 * @api public
 */
export const isFunction = x => isType(x, 'function');


// --- Content Checkers ---

/**
 * Checks if a value is defined (i.e., not `undefined`).
 *
 * @param {*} value - The value to test.
 * @return {boolean} True if 'value' is not of type 'undefined', false otherwise.
 * @api public
 */
export const isDefined = value => !isType(value, 'undefined');

// Helper variables for the isEmpty function for performance and reliability.
const toStr = Object.prototype.toString;
const owns = Object.prototype.hasOwnProperty;

/**
 * Checks if a value is empty.
 * Handles arrays, strings, arguments objects, and plain objects.
 * For other truthy values, it returns false. For falsy values (except those above), it returns true.
 *
 * @param {*} value - The value to test.
 * @return {boolean} True if `value` is empty, false otherwise.
 * @api public
 */
export const isEmpty = value => {
    const type = toStr.call(value);
    let key;

    // For arrays, strings, or arguments objects, check the length property.
    if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
        return value.length === 0;
    }

    // For plain objects, check if it has any own properties.
    if (type === '[object Object]') {
        for (key in value) {
            if (owns.call(value, key)) {
                return false; // Found an own property, so it's not empty.
            }
        }
        return true; // No own properties found.
    }

    // For all other types (null, undefined, numbers, booleans, etc.),
    // return true if the value is falsy.
    return !value;
};
