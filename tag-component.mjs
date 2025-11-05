/**
 * @file This file defines a flexible, multi-environment component model.
 * It provides a base class mixin that can be extended by either a standard class
 * or an HTMLElement to create components that work in various JavaScript environments.
 * @module Component
 */

// --- Environment-Specific Base Class ---

/**
* A conditional class that resolves to the browser's `HTMLElement` if available,
* otherwise, it falls back to a plain JavaScript class. This allows components
* to be "isomorphic" – capable of running in both the browser (as custom elements)
* and in a Node.js environment (for server-side rendering).
* @type {typeof HTMLElement | class}
*/
const ifHTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class HTMLElement {};
export { ifHTMLElement as HTMLElement };


// --- Core Component Logic (Mixin) ---

/**
 * A mixin that provides core component functionality like rendering and data management.
 * It can be applied to a base class (like `ifHTMLElement`) to create a full-featured component class.
 *
 * @param {class} base - The base class to extend (e.g., HTMLElement or a plain class).
 * @returns {class} A new class that extends the base class with component features.
 */
const MixinComponent = base => class extends base {
    /**
     * Creates an instance of a component.
     * @param {string} [tag=''] - The tag name for the component, used for rendering as a string.
     * @param {function} [template=() => ''] - A function that returns the component's HTML content.
     * @param {*} [data='default'] - The initial data or state for the component.
     */
    constructor(tag = '', template = () => '', data = 'default') {
        // Call the constructor of the base class (e.g., HTMLElement).
        super();

        /**
         * The tag name associated with the component (e.g., 'my-tag').
         * @type {string}
         */
        this.tagName = tag;

        /**
         * The template function that defines the component's structure.
         * It is bound to the component instance to ensure `this` refers to the component.
         * @type {function}
         */
        this.template = template.bind(this);

        /**
         * The data or state for the component.
         * @type {*}
         */
        this.data = data;
    }

    /**
     * Renders the component's template with its data.
     * In a browser context, it updates the element's `innerHTML`.
     * It always returns the string representation of the component, wrapped in its tag.
     * @returns {string} The component's rendered HTML as a string (e.g., `<my-tag>...</my-tag>`).
     */
    render() {
        const { template, tagName, data } = this;
        const result = template(data);

        // If in a browser, this will update the custom element's content.
        if (typeof this.innerHTML !== 'undefined') {
          this.innerHTML = result;
        }

        return `<${tagName}>${result}</${tagName}>`;
    }
};


// --- Component Implementation Examples ---

/**
 * A minimal example of a component class created using the mixin.
 * This component can function as a custom element in the browser.
 */
class MyComponent extends MixinComponent(ifHTMLElement) {
    tagName = 'my-tag';
    data = 'Default string content';

    /**
     * Defines the HTML structure for this component.
     * @param {*} data - The data passed to the template.
     * @returns {string} The rendered HTML string.
     */
    template(data) {
        return `<div>${data}</div>`;
    }
}

/**
 * An example of a component designed to render a list of items.
 *
 * It demonstrates how to handle structured data (an array) within a component.
 */
class MyListComponent extends MixinComponent(ifHTMLElement) {
    tagName = 'my-list';
    data = ['First Item', 'Second Item', 'Third Item']; // Data is an array

    /**
     * The template iterates over the data array to create a list.
     * @param {string[]} data - An array of strings to render as list items.
     * @returns {string} An unordered list (`<ul>`) as an HTML string.
     */
    template(data) {
        const listItems = data.map(item => `<li>${item}</li>`).join('');
        return `<ul>${listItems}</ul>`;
    }
}

/**
 * An example of a larger component, representing a page or a major section of a UI.
 */
class PageComponent extends MixinComponent(ifHTMLElement) {
    tagName = 'page-container';
    data = {
        title: 'Welcome to the Page',
        content: 'This is the main content area.'
    };

    /**
     * The template uses an object for its data model.
     * @param {object} data - The page's data object.
     * @param {string} data.title - The title of the page.
     * @param {string} data.content - The main content of the page.
     * @returns {string} The rendered HTML for the page.
     */
    template(data) {
        return `
            <header>
                <h1>${data.title}</h1>
            </header>
            <main>
                <p>${data.content}</p>
            </main>
        `;
    }
}


// --- Alternative Component Patterns ---

/**
 * A simple, functional pattern for creating a component.
 * This is useful for stateless components that only need to render data.
 * @param {*} data - The data to be rendered by the component.
 * @returns {string} The rendered HTML string.
 */
function FunctionalComponent(data) {
    return `<p>This is a functional component with data: ${data}</p>`;
}

/**
 * A class-based pattern for a component without using the mixin.
 * This provides more explicit control but requires manual implementation of methods like `render`.
 */
class ClassBasedComponent {
    /**
     * @param {*} data - The initial data for the component.
     */
    constructor(data) {
        this.data = data;
    }

    /**
     * Defines the component's HTML structure.
     * @returns {string} The rendered HTML string.
     */
    template() {
        return `<p>Class-based component with data: ${this.data}</p>`;
    }

    /**
     * Renders the component by calling its template method.
     * @returns {string} The rendered HTML string.
     */
    render() {
        return this.template();
    }
}
