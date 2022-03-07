# Nebula

Nebula is a HTTP and JSON based protocol for applications with most of their logic on the server-side. The client can be a general purpose thin layer that requests actions from the server and sends back results.

## Why

With most of an application on the server, security is increased because the application code does not have direct access to the client system. It is inherently cross-platform since the application code runs on a standard server environment, it allows for easy updating, and doesn't take up space on the client.

## The Protocol

The Nebula protocol is documented in the [protocol guide](https://github.com/universe-software/nebula/tree/master/protocol.md).

## Usage

This module is a client library for the Nebula protocol. It can be installed with NPM or Yarn and imported as an ES module, assuming the `fetch` API is available.

### Installing With NPM

```
npm install nebula-protocol
```

### Installing With Yarn

```
yarn add nebula-protocol
```

### Importing For Browser

#### Using ES imports

If the importing module is an ES module (`"type": "module"` in `package.json`), you can use an ES import:

```javascript
import Nebula from 'nebula-protocol'
```

#### Using Dynamic Import

If the importing module is CommonJS (no `"type": "module"` in `package.json`), you must use a dynamic import:

```javascript
import('nebula-protocol').then(({default: Nebula}) => {
    //... Code that uses Nebula
})
```

### Importing For Node

Using Nebula with Node requires first importing `node-fetch` and making it global:

#### Using ES imports

If the importing module is an ES module (`"type": "module"` in `package.json`), you can use an ES import:

```javascript
import fetch from 'node-fetch'
globalThis.fetch = fetch
import Nebula from 'nebula-protocol'
```

#### Using Dynamic Import

If the importing module is CommonJS (no `"type": "module"` in `package.json`), you must use a dynamic import:

```javascript
import('node-fetch').then(({default: fetch}) => {
    globalThis.fetch = fetch
    import('nebula-protocol').then(({default: Nebula}) => {
        //... Code that uses Nebula
    })
})
```

### Client API

#### Environment Objects

To be able to execute actions, the Nebula client needs a set of action functions, called an *environment*. This module provides a minimal set of actions for deallocating objects and invoking other requests in the `Nebula.env` object, but you will need to provide more functions for anything useful.

An action function takes three parameters: the action object, the `exec` function, and the environment object. The action object is the action JSON as received. The `exec` function is a reference to `Nebula.exec`. The environment object is the environment object used for the execution that triggered this action function. If an action function needs to invoke another Nebula request, it should do so by calling the passed `exec` function with the same usage as `Nebula.exec`, using the passed environment object.

Custom environment objects should include the functions from `Nebula.env`. For example:

```javascript
const myEnv = {
    // Inherit from Nebula.env
    ...Nebula.env,

    // A `print` action that prints the `value` parameter 
    print(action) {
        console.log(action.value)
    },

    // A `prompt` action to call the browser `prompt` function and use `exec` to return the result
    prompt(action, exec, env) {
        exec(action['@then'], env, {result: prompt(action.prompt)})
    }
}
```

#### `Nebula.exec(request, env, params)`

Sends the `request` (see the [protocol guide](https://github.com/universe-software/nebula/tree/master/protocol.md)), with any additional data given in `params`, and executes the action(s) returned by the server using action functions provided by `env`.

#### `Nebula.alloc(value): string`

Adds the given `value` to the Nebula value registry with a randomly generated handle and returns the handle. Useful for creating a way for the server to reference a client-side object.

#### `Nebula.handles: object`

The Nebula value registry. Keys are handles and correspond to the allocated values.

#### `Nebula.delete(handle)`

Removes the value with the given `handle` from the Nebula value registry.