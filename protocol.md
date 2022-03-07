# Nebula Protocol Guide

The Nebula protocol is centered around clients requesting actions from servers, executing those actions, and returning the results, porentially triggering more actions.

## Requests

Nebula requests are HTTP requests that expect the server to return actions.

### Request Objects

A Nebula request object is a JSON object that specifies the method, URL, and data of a request. 

* The `@method` property specifies the HTTP method. If not given, `GET` is default.
* The `@url` property specifies the request URL
* All other properties are extra data that will be passed to the server as described below

For example, a request object might look like:

```json
{
    "@method": "POST",
    "@url": "https://example.com/nebula",
    "myNumber": 42,
    "myString": "foo"
}
```

### `POST` and `PUT` Requests

Requests with `POST` or `PUT` methods are sent with `Content-Type: application/json` and extra data is sent as a JSON object in the request body.

### Other Methods

With other methods, extra data is sent as URLencoded parameters in the URL, with the values being the JSON representation of the actual values. For example, the example request object above would request `https://example.com/nebula?myNumber=42&myString=%22foo%22`, the `%22`s being the urlencoded quotes from the JSON representation of the string.

## Actions

The response to a Nebula request should have `Content-Type: application/json` and the response data should be a valid JSON object or array of objects. If the response it an object, it is interpreted as a single action. If an array of objects, each object is interpreted as an action and they are executed in sequence.

An action object must have a `@action` property specifying the name of the action type. All other properties are considered parameters passed to the action.

### Callbacks

Conventionally, for actions that return results, the action object should have a `@then` property specifying a request object to be a callback. The action should execute that request, passing any result data as extra parameters. For example, if there is a `prompt` action that prompts the user for input and returns the input to the callback as a property called `result`, it could be used as follows:

```json
{
    "@action": "prompt",
    "prompt": "Enter something:",
    "@then": {
        "@url": "https://example.com/onInput",
        "myExtraData": 42
    }
}
```

The server would execute the action and request `https://example.com/onInput?myExtraData=42&result=%22INPUT%22` where `INPUT` is whatever the input was. If the callback had `"@method": "POST"` or `"@method": "PUT"`, the data would have been sent as JSON in the request body instead.

### Other Events

Actions may take other callback-like request objects as parameters. For example, if there was a `Button.new` action to create a new `Button` object, it might have a `onPress` parameter to be a press listener:

```json
{
    "@action": "Button.new",
    "text": "Click Me",
    "@then": {
        "@method": "POST",
        "@url": "https://example.com/onButtonCreated"
    },
    "onPress": {
        "@method": "POST",
        "@url": "https://example.com/onButtonPress"
    }
}
```

## Object References

Conventionally, if the server needs acces to client-side objects, it references them by *handle* strings. For example, the `@then` callback in the button example above would probably receive a `result` value that is a handle string to the client-side button object. Actions that operate on client-side objects would take handle strings as parameters.