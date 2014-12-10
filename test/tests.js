var assert = chai.assert;
var server;

describe('Object Instances', function() {
  it('verb method instance of Jax.Request', function() {
    assert.instanceOf(Jax.get('data.json'), Jax.Request);
  });

  it('response instance of Jax.Response', function(end) {
    Jax
      .get('/')
      .done(function(err, res) {
        assert.instanceOf(res, Jax.Response);
        end();
      });
  });
});

describe('Shorthand methods', function() {
  before(function() {
    server = sinon.fakeServer.create();
    server.autoRespond = true;

    server.respondWith('/test', [
      200,
      {'Content-Type': 'application/json'},
      '{"foo":"bar"}'
    ]);
  });

  after(function() {
    server.restore();
  });

  it('Jax.get(url, callback)', function(end) {
    Jax
      .get('/test', function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');
        assert.strictEqual(res.status, 200);

        end();
      });
  });

  it('Jax.post(url, callback)', function(end) {
    Jax
      .post('/test', function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');
        assert.strictEqual(res.status, 200);

        end();
      });
  });

  it('Jax.put(url, callback)', function(end) {
    Jax
      .put('/test', function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');
        assert.strictEqual(res.status, 200);

        end();
      });
  });

  it('Jax.del(url, callback)', function(end) {
    Jax
      .del('/test', function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');
        assert.strictEqual(res.status, 200);

        end();
      });
  });
});

describe('Correct Responses', function() {
  before(function() {
    server = sinon.fakeServer.create();
    server.autoRespond = true;

    server.respondWith('/json', [
      200,
      {'Content-Type': 'application/json'},
      '{"foo":"bar"}'
    ]);

    server.respondWith('/form', [
      200,
      {'Content-Type': 'application/x-www-form-urlencoded'},
      'foo=bar'
    ]);

    server.respondWith('/text', [
      200,
      {'Content-Type': 'text/html'},
      'Hello, world.'
    ]);

    server.respondWith('/404', [404, {}, '']);
    server.respondWith('/500', [
      500,
      {'Content-Type': 'application/json'},
      '{"message": "There was an internal server error."}'
    ]);
  });

  after(function() {
    server.restore();
  });

  it('Parse application/json', function(end) {
    Jax
      .get('/json')
      .done(function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');
        assert.strictEqual(res.status, 200);

        end();
      });
  });

  it('Parse application/x-www-form-urlencoded', function(end) {
    Jax
      .get('/form')
      .done(function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');
        assert.strictEqual(res.status, 200);

        end();
      });
  });

  it('Parse text/html', function(end) {
    Jax
      .get('/text')
      .done(function(err, res) {
        var data = res.data;

        assert.isString(data);
        assert.strictEqual(data, 'Hello, world.');
        assert.strictEqual(res.status, 200);

        end();
      });
  });

  it('Parse 404', function(end) {
    Jax
      .get('/404')
      .done(function(err, res) {
        assert.isObject(res.error);
        assert.isNull(res.data);
        assert.strictEqual(res.status, 404);

        end();
      });
  });

  it('Parse 500', function(end) {
    Jax
      .get('/500')
      .done(function(err, res) {
        assert.isObject(res.error);
        assert.strictEqual(res.status, 500);

        end();
      });
  });
});

describe('Jax Request Object', function() {
  before(function() {
    server = sinon.fakeServer.create();
    server.autoRespond = true;

    server.respondWith('/json', [
      200,
      {'Content-Type': 'application/json'},
      '{"foo":"bar"}'
    ]);

    // I think I can use regex here?
    server.respondWith('/json?foo=bar', [
      200,
      {'Content-Type': 'application/json'},
      '{"foo":"bar"}'
    ]);
  });

  after(function() {
    server.restore();
  });

  describe('Setting headers | .header()', function() {
    it('res.request.headers should be an object', function(end) {
      Jax
        .get('/json')
        .header('foo', 'bar')
        .done(function(err, res) {
          assert.isObject(res.request.headers);
          end();
        });
    });

    it('method should accept 2 params as strings', function(end) {
      Jax
        .get('/json')
        .header('foo', 'bar')
        .done(function(err, res) {
          assert.propertyVal(res.request.headers, 'foo', 'bar');
          end();
        });
    });

    it('method should accept 1 param as object', function(end) {
      Jax
        .get('/json')
        .header({
          foo: 'bar'
        })
        .done(function(err, res) {
          assert.propertyVal(res.request.headers, 'foo', 'bar');
          end();
        });
    });
  });

  describe('Sending payload data | .data()', function() {
    it('res.request.requestData should be an object', function(end) {
      Jax
        .post('/json')
        .done(function(err, res) {
          assert.isObject(res.request.requestData);
          end();
        });
    });

    it('method should accept 2 params as strings', function(end) {
      Jax
        .post('/json')
        .data('foo', 'bar')
        .done(function(err, res) {
          assert.propertyVal(res.request.requestData, 'foo', 'bar');
          end();
        });
    });

    it('method should accept 1 param as object', function(end) {
      Jax
        .post('/json')
        .data({
          foo: 'bar'
        })
        .done(function(err, res) {
          assert.propertyVal(res.request.requestData, 'foo', 'bar');
          end();
        });
    });
  });

  describe('Setting url queries | .query()', function() {
    it('res.request.queries should be an array', function(end) {
      Jax
        .get('/json')
        .query('foo=bar')
        .done(function(err, res) {
          assert.isArray(res.request.queries);
          end();
        });
    });

    it('method should accept 1 param as string', function(end) {
      Jax
        .get('/json')
        .query('foo=bar')
        .done(function(err, res) {
          assert.include(res.request.queries, 'foo=bar');
          end();
        });
    });

    it('method should accept 1 param as object', function(end) {
      Jax
        .get('/json')
        .query({
          foo: 'bar'
        })
        .done(function(err, res) {
          assert.include(res.request.queries, 'foo=bar');
          end();
        });
    });
  });

  describe('Setting content type header | .type()', function() {
    it('Content-Type should be application/json', function(end) {
      Jax
        .get('/json')
        .type('application/json')
        .done(function(err, res) {
          assert.equal(res.request.headers['Content-Type'], 'application/json');
          end();
        });
    });
  });

  describe('Setting CORS on Request | .cors()', function() {
    it('XHR should be set to handle CORS', function(end) {
      Jax
        .get('/json')
        .cors()
        .done(function(err, res) {
          assert.equal(res.request.headers['X-CORS-Enabled'], true);
          end();
        });
    });
  });

  describe('Setting no cache headers | .nocache()', function() {
    it('Appropriate headers sent so response is not cached', function(end) {
      Jax
        .get('/json')
        .nocache()
        .done(function(err, res) {
          var headers = res.request.headers;

          assert.equal(headers['Cache-Control'], 'no-cache');
          assert.equal(headers['Expires'], -1);
          assert.equal(headers['X-Requested-With'], 'XMLHttpRequest');
          end();
        });
    });
  });
});
