/**
 * @file This file contains a collection of utility functions for type checking,
 * string manipulation, DOM interaction, and component rendering.
 * @module Utils
 */

// --- Type Checking ---

export {
    isEqual,
    isType,
    isString,
    isObject,
    isNumber,
    isStringObject,
    isPromise,
    isFunction
} from './is.mjs';

/**
 * Checks if a value is a DOM node.
 * @param {*} o - The value to check.
 * @returns {boolean} True if the value is a DOM node, otherwise false.
 */
export const isNode = o => (
    isObject(Node) ? o instanceof Node :
    o && isObject(o) && isNumber(o.nodeType) && isString(o.nodeName)
);

/**
 * Checks if a value is a DOM element.
 * @param {*} o - The value to check.
 * @returns {boolean} True if the value is a DOM element, otherwise false.
 */
export const isElement = o => (
    isObject(HTMLElement) ? o instanceof HTMLElement : // DOM2
    o && isObject(o) && o !== null && o.nodeType === 1 && isString(o.nodeName)
);

/**
 * Returns the string representation of an object's prototype.
 * @param {object} obj - The object to get the prototype string from.
 * @returns {string} The string representation of the object's prototype.
 */
const protoStr = obj => Object.prototype.toString.call(Object.getPrototypeOf(obj));

/**
 * Checks if an object is an HTML element.
 * @param {object} obj - The object to check.
 * @returns {boolean} True if the object is an HTML element, otherwise false.
 */
export const isHtmlElement = obj => ((x) => x.indexOf('HTML') > -1 && x.indexOf('Element') > -1)(protoStr(obj));


// --- String Manipulation ---

/**
 * Escapes HTML special characters in a string.
 * @param {string} s - The string to escape.
 * @returns {string} The escaped string.
 */
export const escapeHtml = s => (s + '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
})[m]);

/**
 * A tagged template literal that removes line breaks and extra whitespace.
 * @param {TemplateStringsArray} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate.
 * @returns {string} The formatted string.
 */
export const oneline = (strArr, ...valArr) => strArr
    .reduce((acc, part, i) => acc + part + (valArr[i] || ''), '')
    .replace(/(?:\n(?:\s*))+/g, ' ')
    .trim();


// --- Rendering ---

/**
 * A tagged template literal that renders a string.
 * @param {Array<String>} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate.
 * @returns {String} The rendered string.
 */
export const html = (...args) => renderString(...args);

/**
 * Renders a template literal to a string.
 * @param {TemplateStringsArray} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate.
 * @returns {string} The rendered string.
 */
export const renderString = (strArr, ...valArr) => renderLiteral(strArr.raw ? strArr.raw : strArr, ...valArr);

/**
 * Renders a template literal by joining the string parts and values.
 * @param {TemplateStringsArray} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate.
 * @returns {string} The rendered string.
 */
export const renderLiteral = (strArr, ...valArr) => strArr
    .map((strItm, i) => `${strItm}${valArr[i] ? `${valArr[i]}` : ''}`)
    .join('');

/**
 * A tagged template literal that returns a promise that resolves to the rendered HTML string.
 * @param {TemplateStringsArray} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate, which can be promises.
 * @returns {Promise<string>} A promise that resolves to the rendered HTML string.
 */
export const htmlPromise = (strArr, ...valArr) => Promise.all(valArr).then(vA => html(strArr, ...vA));

/**
 * Renders a template to a DOM element.
 * @param {TemplateStringsArray} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate.
 * @returns {function(HTMLElement): void} A function that takes an element and sets its innerHTML.
 */
export const renderToElement = (strArr, ...valArr) => {
    return el => {
        el.innerHTML = processTemplate(strArr, ...valArr);
        replacePlaceholderNodes(el);
    };
};

/**
 * Synchronously renders a component to a target element or returns the result.
 * @param {object|function} component - The component to render.
 * @param {HTMLElement} [el] - The target element to render into.
 * @returns {string|HTMLElement} The rendered result or the target element.
 */
export const render = (component, el) => {
    const result = getComponentResult(component);
    if (!el) {
        return result;
    }

    let target = getRenderTarget(el);
    if (isFunction(target)) {
        return target(result);
    }

    target = result;
    return el;
};

/**
 * Asynchronously renders a component to a target element or returns the result.
 * @param {object|function} component - The component to render.
 * @param {HTMLElement} [el] - The target element to render into.
 * @returns {Promise<string|HTMLElement>} A promise that resolves to the rendered result or the target element.
 */
export const renderAsync = async (component, el) => {
    const result = getComponentResult(component);
    return Promise.resolve(result).then(getComponentResult).then(r => {
        if (!el) {
            return r;
        }
        const target = getRenderTarget(el);
        if (isFunction(target)) {
            return target(r);
        }
        target = r;
        return el;
    });
};

/**
 * Appends a rendered component to an element.
 * @param {*} x - The component to render and append.
 * @param {HTMLElement} el - The target element.
 * @returns {HTMLElement} The target element.
 */
export const append = (x, el) => {
    const result = getComponentResult(x);
    if (!el) {
        return result;
    }
    // Note: This is not a direct DOM manipulation, it concatenates strings.
    const target = getRenderTarget(el);
    target.innerHTML += result;
    return el;
};

/**
 * Renders a component as a custom element string.
 * @param {object|function} c - The component.
 * @returns {string} The component rendered as a custom element string.
 */
export const renderAsElement = c => `<${getTagName(c)}>${render(c)}</${getTagName(c)}>`;

/**
 * Creates an empty custom element string for a component.
 * @param {object|function} c - The component.
 * @returns {string} An empty custom element string.
 */
export const asElement = c => `<${getTagName(c)}></${getTagName(c)}>`;

/**
 * Inserts content into an empty HTML element string.
 * @param {string} el - The HTML element string.
 * @param {string} i - The content to insert.
 * @returns {string} The element string with the content inserted.
 */
export const appendElement = (el, i) => el.replace('><', `>${i}<`);


// --- Component Handling ---

/**
 * A placeholder function for setting properties on an element.
 * @param {object} props - The properties to set.
 * @returns {object} The properties object.
 */
export const setProps = props => props;

/**
 * Gets the renderable result from a component.
 * @param {object|function} c - The component.
 * @returns {*} The renderable result.
 */
export const getComponentResult = c => (typeof c.render === 'function' ? c.render() : typeof c === 'function' ? c() : c);

/**
 * Gets the render target of an element (shadowRoot or innerHTML).
 * @param {HTMLElement} el - The element.
 * @returns {string} The render target.
 */
export const getRenderTarget = el => (el.shadowRoot ? el.shadowRoot.innerHTML : el.innerHTML);

/**
 * Creates a custom element class definition from a component.
 * @param {object} x - The component class or object.
 * @param {HTMLElement} [base=HTMLElement] - The base class to extend.
 * @returns {HTMLElement} The new custom element class.
 */
export const createElementDefinition = (x, base = typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) => {
    const newClass = new Function(`return class ${x.name} extends base {}`)();
    newClass.prototype.component = x;
    return newClass;
};

/**
 * Defines a custom element for a component if it's not already defined.
 * @param {object|function} componentClass - The component class or definition.
 * @returns {Promise<void>}
 */
export const defineComponentElement = async componentClass => {
    if (typeof customElements === 'undefined') {
        return;
    }
    const definition = isFunction(componentClass) ? componentClass() : componentClass;
    const tagName = getTagName(definition);
    if (typeof customElements.get(tagName) === 'undefined') {
        customElements.define(tagName, definition);
    }
};


// --- Advanced Utilities ---

/**
 * Converts a tagged template literal to a string with placeholders.
 * @param {TemplateStringsArray} strings - The template string array.
 * @returns {string} The string with placeholders like `${0}`, `${1}`, etc.
 */
export function TagToStr(strings) {
    return strings
        .map((s, i) => (i === strings.raw.length - 1) ? strings.raw[i] : strings.raw[i] + '${' + i + '}')
        .join('');
}

/**
 * Executes a string of code in a given context.
 * @param {string} source - The code to execute.
 * @param {object} ctx - The context object with variables.
 * @returns {*} The result of the executed code.
 */
export const runInContext = (source, ctx) => {
    const [keys, vals] = ObjToArrays(ctx);
    return Function(keys, source).apply(ctx, vals);
};

/**
 * Converts a string with placeholders back to a template literal result.
 * @param {string} str - The string with placeholders.
 * @returns {function(object): string} A function that takes a context and returns the rendered string.
 */
export const StrToTag = str => {
    const source = `return (() => \`${str}\`)()`;
    return (ctx) => runInContext(source, ctx);
};

/**
 * Asynchronously converts a string with placeholders to a template literal result, supporting async values.
 * @param {string} str - The string with placeholders.
 * @returns {function(object): Promise<string>} A function that takes a context and returns a promise resolving to the rendered string.
 */
export const strToTagPromise = async str => {
    const source = `return ((async () => \`${str.replace(/\${/g, '${await ')}\`))()`;
    return (ctx) => runInContext(source, ctx);
};

/**
 * Converts an object to two arrays: one of keys and one of values.
 * @param {object} obj - The object to convert.
 * @returns {Array<Array<string>, Array<*>>} An array containing two arrays: keys and values.
 */
export const ObjToArrays = obj => {
    const arrays = [[], []]; // [[...keysAsString], [...values]]
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            arrays[0].push(key);
            arrays[1].push(obj[key]);
        }
    }
    return arrays; // const [keys, vals] = arrays
};

/**
 * Converts two arrays (keys and values) back to an object.
 * @param {Array<Array<string>, Array<*>>} arrays - An array containing two arrays: keys and values.
 * @returns {object} The reconstructed object.
 */
export const ArraysToObject = arrays => {
    const [keys, vals] = arrays;
    const obj = {};
    keys.map((key, i) => obj[key] = vals[i]);
    return obj;
};


// --- Naming Conventions ---

/**
 * Converts an UpperCamelCase string to snake-case.
 * @param {string} string - The string to convert.
 * @returns {string} The snake-cased string.
 */
export const upperCamelCaseToSnakeCase = string => string
    .replace(/^([A-Z])/, $1 => $1.toLowerCase())
    .replace(/([A-Z])/g, $1 => "-" + $1.toLowerCase());

/**
 * Converts a snake-case string to UpperCamelCase.
 * @param {string} string - The string to convert.
 * @returns {string} The UpperCamelCased string.
 */
export const snakeCaseToUpperCamelCase = string => string
    .toLowerCase()
    .replace(/^([a-z])/, $1 => $1.toUpperCase())
    .replace(/\-./g, $1 => $1.substring(1, 2).toUpperCase());

/**
 * Converts a snake-case string to lowerCamelCase.
 * @param {string} string - The string to convert.
 * @returns {string} The lowerCamelCased string.
 */
export const snakeCaseToLowerCamelCase = string => snakeCaseToUpperCamelCase(string).replace(/^([A-Z])/, $1 => $1.toLowerCase());

/**
 * Gets the name of a class.
 * @param {function} Class - The class.
 * @returns {string} The name of the class.
 */
export const getName = Class => Class.name || Class.constructor.name || new Error('Class has no name property');

/**
 * Gets the tag name for a component class (converts UpperCamelCase to snake-case).
 * @param {function} Class - The component class.
 * @returns {string} The tag name.
 */
export const getTagName = Class => upperCamelCaseToSnakeCase(getName(Class));

/**
 * Gets the class name from a tag name (converts snake-case to UpperCamelCase).
 * @param {string} tagName - The tag name.
 * @returns {string} The class name.
 */
export const getClassName = tagName => snakeCaseToUpperCamelCase(tagName);


// --- DOM Utilities ---

/**
 * Processes a template literal, replacing element placeholders.
 * @param {TemplateStringsArray} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate.
 * @returns {string} The processed HTML string with placeholders for elements.
 */
const processTemplate = (strArr, ...valArr) => strArr
    .map((s, i) => `${s}${valArr[i] ? isElement(valArr[i]) ? `<unknown-html-element-placeholder class="${i}"></unknown-html-element-placeholder>` : `${valArr[i]}` : ''}`)
    .join('');

/**
 * Replaces placeholder nodes with actual DOM elements.
 * @param {DocumentFragment|HTMLElement} DOMNode - The DOM node containing placeholders.
 * @param {Array<*>} valArr - The array of values, including elements to insert.
 */
const replacePlaceholderNodes = (DOMNode, valArr) => DOMNode.querySelectorAll('unknown-html-element-placeholder')
    .forEach(el => el.parentNode.replaceChild(valArr[el.className], el));

/**
 * Creates a template element from a template literal.
 * @param {TemplateStringsArray} strArr - The template string array.
 * @param {...*} valArr - The values to interpolate.
 * @returns {function(HTMLElement): DocumentFragment} A function that clones the template and appends it to an element.
 */
export const createTemplateElement = (strArr, ...valArr) => {
    const template = document.createElement('template');
    template.innerHTML = processTemplate(strArr, ...valArr);
    replacePlaceholderNodes(template.content, valArr);

    return el => {
        const node = template.content.cloneNode(true);
        if (el) {
            el.appendChild(node);
        }
        return node;
    };
};

// --- Environment-Specific ---

/**
 * A conditional export for HTMLElement that falls back to a class for non-browser environments.
 */
const ifHTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class HTMLElement {};
export {
    ifHTMLElement as HTMLElement
};
