#Jax

Jax is a tiny (1.7kb gzipped) fully featured client-side AJAX library with a expressive syntax inspired by the wonderful Superagent.

[![Code Climate](https://codeclimate.com/github/brandonjpierce/jax/badges/gpa.svg)](https://codeclimate.com/github/brandonjpierce/jax)

## Getting Started

#### Traditional
```html
<body>
  <!-- html above -->
  <script src="dist/jax.min.js"></script>
  <script>
    Jax
      .get('/test')
      .query('data_id=1')
      .done(function(err, res) {
        if (err || res.error) {
          // handle error
        }

        // do something with response
      });
  </script>
</body>
```

#### Bower
```
bower install jax
```

*Jax also has support for both AMD and CommonJS formats.*

## HTTP verb methods

The HTTP verb methods will all return a new instance of a Jax's internal Request object. These methods are required to be called first before any request methods can be set.

#### .get(url `String`)
```javascript
Jax.get('/test').done();
```

#### .post(url `String`)
```javascript
Jax.post('/test').done();
```

#### .put(url `String`)
```javascript
Jax.put('/test').done();
```

#### .del(url `String`)
```javascript
Jax.del('/test').done();
```

## Request Methods

### .header(key `String|Object`, val `String`)

Adds a header field to the request. Will accept a key and value or a object.

```javascript
Jax
  .get('/test')
  .header('Content-Type', 'application/json')
  .query({ 'Accept': 'application/json' })
  .done();
```

### .data(key `String|Object`, val `String`)

Send payload data along with request. Will accept a key and value or a object. Before sending off the request the data is serialized into either json or a URL encoded string depending on the content-type.

```javascript
Jax
  .post('/test')
  .data('foo', 'bar')
  .data({ 'boz': 'baz' })
  .done();
```

### .query(val `String|Object`)

Adds a query string to the request URL. If a query string already exists it will automatically separate values with `&`. Will accept a string or an object, if object it will be serialized into a URL encoded string.

```javascript
Jax
  .get('/test')
  .query('baz=boz')
  .query({ foo: 'bar' })
  .done();

// request url will now be /test?baz=boz&foo=bar
```

### .type(val `String`)

Syntax sugar for setting the `Content-Type` in the request header.

```javascript
Jax
  .get('/test')
  .type('application/json')
  .done();
```

### .cors()

Syntax sugar for setting up the request to handle CORS and allows you to send cookies from the requesting location.

```javascript
Jax
  .get('/test')
  .cors()
  .done();
```

### .nocache()

Syntax sugar for setting headers that will notify the requesting server to not cache the response.

```javascript
Jax
  .get('/test')
  .nocache()
  .done();
```

### .done(err `Object|null`, res `Object|null`)

The main method to send your request and receive a response. This method will always return 2 items in its callback function. The first argument is the error object if it exists or null. The second argument is the actual response object or null.

```javascript
Jax
  .get('/test')
  .done(function(err, res) {});
```

## Response properties

The response object passed as the second argument in the done() callback contains a variety of properties that will aid you in correctly parsing a response.

#### res.request

The request object that was sent to the server, included in this object is the underlining XHR object.

#### res.status

The status code of the response

#### res.data

The parsed response data. Jax will automatically parse the data sent by the server based on the `Content-Type`. In case incorrect `Content-Type` was set in the response you are also able to access the unparsed data with `res.raw`.

#### res.raw

The unparsed response data sent just in case the parser incorrectly parsed the response data because of incorrect `Content-Type` headers sent in the response.

#### res.headers

All of the response headers parsed into a object.

#### res.error

If the response status starts with a 4 or 5 (most error responses) then it will attach an error obect to the response that you can check against in your callback.

## Putting it all together

```javascript
Jax
  .get('www.site.com')
  .query({ foo: 'bar' }) // url is now www.site.com?foo=bar
  .query('baz=boz') // url is now www.site.com?foo=bar&baz=boz
  .then(function(err, res) {
    if (err || res.error) {
      // handle error here
    }

    // do something with res
  });

Jax
  .post('www.site.com')
  .type('application/json')
  .data({ foo: 'bar' })
  .nocache() // we do not want our response cached
  .then(function(err, res) {
    if (err || res.error) {
      // handle error here
    }

    // do something with res
  });
```

## Contributing

Try and respect the existing style as best as possible. Also please make sure to add unit tests for any new or changed functionality. Also lint your code using JSHint or similar.

## Tests

Tests can be viewed by downloading source and viewing the `/test/index.html` file in your browser.

## Release history

- 1.0.0
  - Initial release
