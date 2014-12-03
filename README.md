#Jax

Jax is a minimal fully featured client-side AJAX library with a expressive syntax inspired by the wonderful Superagent.

**Project is currently a work in progess**

## Available Methods

*Work in progress*


## Putting it all together

```javascript
// Example GET request
Jax
  .get('www.site.com')
  .query({ foo: 'bar' }) // url is now www.site.com?foo=bar
  .query('baz=boz') // url is now www.site.com?foo=bar&baz=boz
  .then(function(err, res) {
    // do something
  });

// Example POST request
Jax
  .post('www.site.com')
  .type('application/json')
  .data({ foo: 'bar' })
  .nocache() // we dont our response cached
  .then(function(err, res) {
    // do something
  });
```
