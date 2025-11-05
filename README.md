# tag-html: HTML Templating

A minimalistic, expressive, and cross-platform templating library using standard JavaScript Tagged Template Literals.

`tag-html` is designed to be more lightweight than libraries like `lit-html` while offering broad compatibility across different environments, including browsers, Node.js, Web Workers, and Service Workers. It creates efficient, fast, and extensible HTML templates.

### Core Features

*   **Minimalistic:** A small footprint with a simple, focused API.
*   **Expressive:** Uses the natural syntax of JavaScript template literals.
*   **Cross-Environment:** Renders templates consistently in the browser, on the server, and in workers.
*   **High-Performance SSR:** Offers first-class support for Server-Side Rendering without needing a JSDOM or heavy dependencies.
*   **Web Component Friendly:** Designed to work seamlessly with the standard Custom Elements API for creating interactive components.
*   **Promise Support:** Easily handle asynchronous data directly within your templates.

---

## Basic Usage

The core of the library consists of the `html` tag for creating templates and the `render` function to display them.

### Browser Rendering

In the browser, `render` will write the template result into a DOM element.

```js
import { html, render } from 'tag-html';

// Create a template function. It returns a renderable template.
const helloTemplate = (name) => html`<div>Hello ${name}!</div>`;

// This renders "<div>Hello Frank!</div>" to the document body.
render(helloTemplate('Frank'), document.body);

// Subsequent renders to the same element will update its content.
render(helloTemplate('Nils'), document.body);
```

### Server-Side Rendering (SSR) in Node.js

In a non-browser environment like Node.js, `render` returns the generated HTML as a string.

```js
import { html, render } from 'tag-html';

const helloTemplate = (name) => html`<div>Hello ${name}!</div>`;

// The 'render' function returns the HTML string.
const result = render(helloTemplate('Nils'));
console.log(result); // => '<div>Hello Nils!</div>'

// You can also render into a simple object for compatibility.
const target = { innerHTML: '' };
render(helloTemplate('Nils'), target);
console.log(target.innerHTML); // => '<div>Hello Nils!</div>'
```

### Asynchronous Templates

Use `htmlPromise` to work with templates that contain Promises. The template will resolve to a string after all embedded promises have been settled.

```js
import { htmlPromise, render } from 'tag-html';

const fetchUser = () => Promise.resolve('Nils');

const asyncTemplate = htmlPromise`<div>Loading... Hello ${fetchUser()}!</div>`;

// The result is a Promise that resolves to the final HTML string.
asyncTemplate.then(result => {
    render(result, document.body); // Renders "<div>Loading... Hello Nils!</div>"
});
```

---

## Working with Web Components

`tag-html` empowers you to build interactive components using the standard **Web Components** API. The philosophy is simple: use `tag-html` for efficient rendering and use Custom Elements for encapsulation, interactivity, and lifecycle management.

Below is an example of a self-defining, interactive counter component.

```js
import { html, render, defineComponentElement, HTMLElement } from 'tag-html';

// 1. Define the component class.
class MyCounter extends HTMLElement {
  constructor() {
    super();
    this.count = 0;
  }

  // The template uses the component's state.
  view() {
    return html`
      <span>Count: ${this.count}</span>
      <button>+1</button>
    `;
  }

  // Use connectedCallback to render and attach event listeners.
  connectedCallback() {
    render(this.view(), this);
    this.querySelector('button').onclick = () => {
      this.count++;
      // Re-render when the state changes.
      render(this.view(), this);
    };
  }
}

// 2. Define the custom element. This registers <my-counter> in the browser.
defineComponentElement(MyCounter);

// 3. Use your new component in any template!
const appTemplate = html`
  <h1>My Awesome Counter</h1>
  <my-counter></my-counter>
`;

render(appTemplate, document.body);
```

### SSR for Web Components

You can also render components to a string for SSR using the `renderAsElement` helper.

```js
// In Node.js
import { renderAsElement } from 'tag-html';

const myCounterInstance = new MyCounter();

// Renders the component wrapped in its tag name for SSR.
const result = renderAsElement(myCounterInstance);
console.log(result);
// => '<my-counter><span>Count: 0</span><button>+1</button></my-counter>'
```

---
---

## Legacy Documentation & Examples

*(The following information is preserved from older versions of the documentation for completeness. The patterns shown above are recommended for new projects.)*

### Overview

`tag-html` is `lit-html` compatible; the only stripped-out feature is directives. Its successor is standard Custom Elements.

For advanced component registry needs, also look into: https://github.com/direktspeed/webcomponents/tree/master

We encourage functional reactive programming via Streams and integrate in our examples the `@direktspeed/stream` lib which offers extensive predefined Stream Interfaces for Common and Impossible Tasks.

### Utility Function Example

```js
/**
 * Safely converts an HTML string into a DOM element.
 * It uses the <template> element to prevent script execution and XSS attacks.
 * @param {string} htmlString The HTML string to convert.
 * @returns {HTMLElement | null} The created DOM element, or null if the string is empty.
 */
export const htmlToElement = ((htmlString) => {
  const template = (globalThis.document && globalThis.document?.createElement('template')) || {
   innerHTML: "", content: { firstElementChild: htmlString }
  };

  template.innerHTML = htmlString.trim();
  // Use firstElementChild to skip any leading whitespace text nodes
  return template.content.firstElementChild;
})(`<div>hello world </div>`);
```

### String & Component Helper Examples

```js
import {html, htmlPromise, render, asElement, renderAsElement, getTagName, defineComponentElement} from 'tag-html';

// This is a tag-html template function. It returns a tag-html template.
const helloTemplate = name => html`<div>Hello ${name}!</div>`;
 
// This renders <div>Hello Frank!</div> to the document body
render(helloTemplate('Frank'), document.body);
 
// This updates to <div>Hello Nils!</div>
render(helloTemplate('Nils'), document.body);

// In NodeJS
render(helloTemplate('Nils')) // => <div>Hello Nils!</div>;
render(helloTemplate('Nils'),{ innerHTML: '' }) // => { innerHTML: '<div>Hello Nils!</div>' };

// Working with promises
const helloTemplatePromise = name => htmlPromise`<div>Hello ${Promise.resolve('myName')}!</div>`;
helloTemplatePromise.then(t=>render(t,el));

getTagName(helloTemplate) //=> 'hello-template'
html`${asElement(helloTemplate)}` //=> '<hello-template></hello-template>'

// Components with customElements
renderAsElement(helloTemplate('Frank')) //=> '<hello-template><div>Hello Frank!</div></hello-template>'
// you should always code your elements to be self defining like this on load.
defineComponentElement(class HelloTemplate extends ifHTMLElement {
    connectedCallback() {
        this.innerHTML = this.innerHTML+'!!!!'
    }
})
```

### Old Deprecated "How Components Work"

Its a Constructor that registers as a custom-element if a tag is supplied and we are running in the browser. It also returns an instantiatable representation of your Component that you can use via `new myComponent`. It also acts as a registry; if you use `<hello-world></hello-world>` in a Node.js Template it will look if it can get a representation of it even if the `customElements` API is not there.

**tag-html Component Example (NodeJS, Browser, WebWorker)**
```js
import { html, render, Component } from 'tag-html';

// To Make a App Template simply return it without tag then its document!
const helloComponent = Component.define({
    tag: 'hello-world',
    template: ({ name }) => html`<div>Hello ${name}!</div>`,
    viewModel: { name: 'Frank' }
});

// Deprecated define examples. superseded by new component model
// supports partials
const partial = name => html`${new helloComponent({ name })}<br />`
const myApp = Component.define({
    template: ({ names }) => html`<html><head></head><body>
    ${names.map(partial).join('')}
    </body></html>`,
    viewModel: { names: ['Frank', 'Nils'] }
});

// In Nodejs
function (req,res,next) {
    res.end(myApp.render()) 
    /**
     *  <html><head></head><body>
     *  <hello-world><div>Hello Frank!</div></hello-world><br />
     *  <hello-world><div>Hello Nils!</div></hello-world><br />
     *  </body></html>
     */
}

// In the Browser
render()
```

### TODOs

*   **Implement domc**: https://github.com/Freak613/domc
*   **Component patterns**: Show new syntax for reusable Components e.g. component + `defineComponentDefinition`. A Component can be a String, Function, or anything with a `render` function on it. If you want to use it as a CustomElement you should follow the naming convention UpperCamelCase for the function/object/class name.
