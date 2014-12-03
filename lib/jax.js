/**
 * Utility library
 */
var util = {};

/**
 * Determine if value is an object
 * @param  {Object}  val The value you want to check against
 * @return {Boolean}     Returns true/false
 */
util.isObject = function(val) {
  return val instanceof Object;
};

/**
 * Determine size of passed in data
 * @param  {Object}  data Data we want to size, can be object or array.
 * @return {Integer}      The number of items in data
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

  if (window.XMLHttpRequest) {
    transport = new XMLHttpRequest();
  } else {
    for (var i = 0, len = ieVersions.length; i != len; i++) {
      try {
        transport = new ActiveXObject(ieVersions[i]);
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
 * @return {String}     URL encoded string with values separated by & character
 */
util.serialize = function(obj) {
  if (!util.isObject(obj)) {
    return obj;
  }

  var pairs = [];

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var encodedKey = encodeURIComponent(key);
      var encodedVal = encodeURIComponent(obj[key]);

      pairs.push(encodedKey + '=' + encodedVal);
    }
  }

  return pairs.join('&');
};

/**
 * Return a nicely formatted response object to the user
 * @param {Object} req A instance of our Request class
 */
function Response(req) {
  this.xhr = req.xhr;
  this.status = this.xhr.status;
  this.headers = this.parseHeaders();
  this.data = this.parseData();
}

/**
 * Parse response headers into object format
 * @param  {String} str The response header string
 * @return {Object}     A nicely formatted object with all headers fields
 */
Response.prototype.parseHeaders = function() {
  var str = this.xhr.getAllResponseHeaders();
  var headers = {};

  if (str) {
    var pairs = str.split('\u000d\u000a');

    for (var i = 0, len = pairs.length; i != len; i++) {
      var header = pairs[i];
      var index = header.indexOf('\u003a\u0020');

      if (index > 0) {
        var key = header.substring(0, index);
        var val = header.substring(index + 2);

        headers[key] = val;
      }
    }
  }

  return headers;
};

/**
 * Format the return responseText from XHR object
 */
Response.prototype.parseData = function() {
  var data = this.xhr.responseText;

  return data;
};

/**
 * Request Module
 */
function Request(method, url) {
  this.url = url;
  this.method = method;
  this.headers = {};
  this.queries = [];
}

/**
 * Generic request header setter
 * @param  {String|Object} key Can be a header key or object of key/vals
 * @param  {String}        val Optional value of key (if string)
 * @return {Object}        Our Request instance for chaining
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
 * @param  {String} val The Content-Type value
 * @return {Object}     Our Request instance for chaining
 */
Request.prototype.type = function(val) {
  if (val) {
    this.headers['Content-Type'] = val;
  }

  return this;
};

/**
 * Explicitly set request header Accept
 * @param  {String} val The Accept value
 * @return {Object}     Our Request instance for chaining
 */
Request.prototype.accept = function(val) {
  this.header('Accept', val);

  return this;
};

/**
 * Explicitly set request header Authorization
 * @param  {String} user     The users username
 * @param  {String} password The users password
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
 * @param  {String|Object} val The value we want to set in the URL
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
 * @param  {String|Object} key Can be a object key or object of key/vals
 * @param  {String}        val Value of key
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
    var tmp = {};
    tmp[key] = val;

    if (hasData) {
      this.requestData[key] = val;
    } else {
      this.requestData = tmp;
    }
  }

  return this;
};

/**
 * The main callback function for sending the request and receiving the response
 * @param  {Function} callback Callback contains 2 args: callback(err, res)
 * @return {Function}          User defined callback function
 */
Request.prototype.then = function(callback) {
  var _this = this;
  var xhr = this.xhr = util.getXhr();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        callback(null, new Response(_this));
      } catch (e) {
        callback(new Error('Unable to parse response'), null);
      }
    }

    if (xhr.readyState === 0) {
      callback(new Error('Cross domain request is not allowed'), null);
    }
  };

  if (this.queries) {
    var query = this.queries.join('&');
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

  if (util.size(this.requestData)) {
    if (this.headers['Content-Type'] === 'application/json') {
      this.requestData = JSON.stringify(this.requestData);
    } else {
      this.requestData = util.serialize(this.requestData);
    }
  }

  xhr.send(this.requestData);
};

/**
 * Jax module
 */
function Jax(method, url) {
  return new Request(method, url);
}

Jax.get = function(url) {
  return new Jax('GET', url);
};

Jax.post = function(url) {
  return new Jax('POST', url);
};

Jax.put = function(url) {
  return new Jax('PUT', url);
};

Jax.delete = function(url) {
  return new Jax('DELETE', url);
};
