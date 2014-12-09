/* global define */
/* global module */
/* global exports */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.Jax = factory(root);
  }
})(this, function(root) {
  'use strict';

  /**
   * Utility library
   */
  var util = {};

  /**
   * Determine if value is an object
   * @param  {*}  val The value you want to check against
   * @return {boolean}     Returns true/false
   */
  util.isObject = function(val) {
    return val instanceof Object;
  };

  /**
   * Determine size of passed in data
   * @param  {*} data Data we want to size, can be object or array.
   * @return {Number} The number of items in data
   */
  util.size = function(data) {
    var len = 0;

    if (data) {
      if (util.isObject(data)) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            len++;
          }
        }
      } else {
        len = data.length;
      }
    }

    return len;
  };

  /**
   * Get a cross browser XHR instance
   * @return {Object|Boolean} Our XHR object or false
   */
  util.getXhr = function() {
    var transport = false;
    var ieVersions = [
      'Microsoft.XMLHTTP',
      'Msxml2.XMLHTTP.6.0',
      'Msxml2.XMLHTTP.3.0',
      'Msxml2.XMLHTTP'
    ];

    if ('XMLHttpRequest' in root) {
      transport = new root.XMLHttpRequest();
    } else {
      for (var i = 0, len = ieVersions.length; i !== len; i++) {
        try {
          transport = new root.ActiveXObject(ieVersions[i]);
        } catch (e) {
          transport = false;
        }
      }
    }

    return transport;
  };

  /**
   * Serialize an object into a URL encoded string
   * @param  {Object} obj The object we want to serialize
   * @return {string}     URL encoded string with values separated by & character
   */
  util.serialize = function(obj) {
    // dont parse if its not an object
    if (!util.isObject(obj)) {
      return '';
    }

    var pairs = [];
    var serializedstring = '';

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var encodedKey = encodeURIComponent(key);
        var encodedVal = encodeURIComponent(obj[key]);

        pairs.push(encodedKey + '=' + encodedVal);
      }
    }

    serializedstring = pairs.join('&');

    return serializedstring;
  };

  /**
   * Unserialize a url encoded string into object format
   * @param  {string} str The string we wish to unserialize
   * @return {Object}     Formatted object
   */
  util.unserialize = function(str) {
    var formatted = {};
    var pairs = str.split('&');

    for (var i = 0, len = pairs.length; i !== len; i++) {
      var split = pairs[i].split('=');
      var key = decodeURIComponent(split[0]);
      var val = decodeURIComponent(split[1]);

      formatted[key] = val;
    }

    return formatted;
  };

  /**
   * Return a nicely formatted response object to the user
   * @constructor
   * @param {Object} req A instance of our Request class
   */
  function Response(req) {
    this.request = req;
    this.status = this.request.xhr.status;
    this.headers = this.parseHeaders();
    this.data = this.parseData();

    var shortStatus = this.status / 100 | 0;
    if (shortStatus === 4 || shortStatus === 5) {
      this.error = this.parseError();
    }
  }

  /**
   * Parse response headers into object format
   * @return {Object}     A nicely formatted object with all headers fields
   */
  Response.prototype.parseHeaders = function() {
    var str = this.request.xhr.getAllResponseHeaders();
    var headers = {};

    if (str) {
      var pairs = str.split('\u000d\u000a');

      for (var i = 0, len = pairs.length; i !== len; i++) {
        var header = pairs[i];
        var index = header.indexOf('\u003a\u0020');

        if (index > 0) {
          var key = header.substring(0, index);
          var val = header.substring(index + 2);

          headers[key] = val;
        }
      }
    }

    // I might want to remove this...
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  };

  /**
   * Format the return responseText from XHR object
   * @return {Object|string|null} Formatted data
   */
  Response.prototype.parseData = function() {
    var data = this.request.xhr.responseText || null;
    var type = this.headers['Content-Type'];

    if (data) {
      // determine parser method based on content type
      var parsers = {
        'application/x-www-form-urlencoded': util.unserialize,
        'application/json': JSON.parse
      };

      if (parsers[type]) {
        data = parsers[type](data);
      }
    }

    return data;
  };

  /**
   * Format the error object if error status was thrown
   * @return {object} Error object
   */
  Response.prototype.parseError = function() {
    var method = this.request.method;
    var url = this.request.url;

    return new Error('Cannot ' + method + ' ' + url);
  }

  /**
   * Forms a request object with correct XHR headers and payload data
   * @constructor
   * @param {string} method The HTTP request method
   * @param {string} url    The HTTP request url
   */
  function Request(method, url) {
    this.url = url;
    this.method = method;
    this.headers = {};
    this.requestData = {};
    this.queries = [];
  }

  /**
   * Generic request header setter
   * @param  {Object|string}  key   Can be a header key or object of key/vals
   * @param  {string|boolean} [val] Optional value of key (if string)
   * @return {Object}               Our Request instance for chaining
   */
  Request.prototype.header = function(key, val) {
    if (key) {
      if (util.isObject(key)) {
        for (var headerKey in key) {
          if (key.hasOwnProperty(headerKey)) {
            this.headers[headerKey] = key[headerKey];
          }
        }
      } else {
        this.headers[key] = val;
      }
    }

    return this;
  };

  /**
   * Explicitly set request header Content-Type
   * @param  {string} val The Content-Type value
   * @return {Object}     Our Request instance for chaining
   */
  Request.prototype.type = function(val) {
    if (val) {
      this.headers['Content-Type'] = val;
    }

    return this;
  };

  /**
   * Explicitly set request header Authorization
   * @param  {string} user     The users username
   * @param  {string} password The users password
   * @return {Object}          Our Request instance for chaining
   */
  Request.prototype.auth = function(user, password) {
    var data = btoa(user + ':' + password);

    this.header('Authorization', 'Basic ' + data);

    return this;
  };

  /**
   * Enable CORS for our XHR instance
   * @return {Object} Our Request instance for chaining
   */
  Request.prototype.cors = function() {
    this.header('X-CORS-Enabled', true);
    this.cors = true;

    return this;
  };

  /**
   * Explicitly set request headers to disable caching of response
   * @return {Object} Our Request instance for chaining
   */
  Request.prototype.nocache = function() {
    this.header({
      'Cache-Control': 'no-cache',
      'Expires': '-1',
      'X-Requested-With': 'XMLHttpRequest'
    });

    return this;
  };

  /**
   * Set query data in the request URL
   * @param  {string|Object} val The value we want to set in the URL
   * @return {Object}            Our Request instance for chaining
   */
  Request.prototype.query = function(val) {
    if (val) {
      if (util.isObject(val)) {
        val = util.serialize(val);
      }

      this.queries.push(val);
    }

    return this;
  };

  /**
   * Send payload data with request
   * @param  {string|Object} key Can be a object key or object of key/vals
   * @param  {string}        val Value of key
   * @return {Object}            Our Request instance for chaining
   */
  Request.prototype.data = function(key, val) {
    var hasData = util.size(this.requestData);

    if (util.isObject(key)) {
      if (hasData) {
        for (var item in key) {
          if (key.hasOwnProperty(item)) {
            this.requestData[item] = key[item];
          }
        }
      } else {
        this.requestData = key;
      }
    } else {
      this.requestData[key] = val;
    }

    return this;
  };

  /**
   * Format and send request
   * @param  {Object} callback Handles the response
   */
  Request.prototype.done = function(callback) {
    var _this = this;
    var xhr = this.xhr = util.getXhr();
    var data = this.requestData;
    var queries = this.queries;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 0) {
          var err = new Error('Cross domain request is not allowed');
          callback(err, null);
        }

        try {
          var response = new Response(_this);
          callback(null, response);
        } catch (e) {
          var err = new Error('Unable to parse response');
          err.original = e;
          callback(err, null);
        }
      }
    };

    if (util.size(queries)) {
      var query = queries.join('&');
      var start = this.url.indexOf('?') > -1 ? '&' : '?';

      this.url += start + query;
    }

    xhr.open(this.method, this.url, true);

    if (this.cors) {
      xhr.withCredentials = true;
    }

    for (var field in this.headers) {
      if (this.headers.hasOwnProperty(field)) {
        xhr.setRequestHeader(field, this.headers[field]);
      }
    }

    if (util.size(data)) {
      if (this.headers['Content-Type'] === 'application/json') {
        data = JSON.stringify(data);
      } else {
        data = util.serialize(data);
      }
    }

    xhr.send(data);
  };

  /**
   * Jax constructor
   * @constructor
   * @param {string} method The HTTP request method
   * @param {string} url    The HTTP request url
   */
  function Jax(method, url) {
    return new Request(method, url);
  }

  /**
   * GET HTTP request method
   * @param  {string} url The HTTP request method
   * @return {Object}     An instance of our Request Object
   */
  Jax.get = function(url) {
    return new Jax('GET', url);
  };

  /**
   * POST HTTP request method
   * @param  {string} url The HTTP request method
   * @return {Object}     An instance of our Request Object
   */
  Jax.post = function(url) {
    return new Jax('POST', url);
  };

  /**
   * PUT HTTP request method
   * @param  {string} url The HTTP request method
   * @return {Object}     An instance of our Request Object
   */
  Jax.put = function(url) {
    return new Jax('PUT', url);
  };

  /**
   * DELETE HTTP request method
   * @param  {string} url The HTTP request method
   * @return {Object}     An instance of our Request Object
   */
  Jax.del = function(url) {
    return new Jax('DELETE', url);
  };

  Jax.Request = Request;
  Jax.Response = Response;

  return Jax;

});
