var assert = chai.assert;
var server;

describe('Object Instances', function() {
  it('verb method instance of Jax.Request', function() {
    assert.instanceOf(Jax.get('data.json'), Jax.Request);
  });

  it('response instance of Jax.Response', function(done) {
    Jax
      .get('data.json')
      .then(function(err, res) {
        assert.instanceOf(res, Jax.Response);
        done();
      });
  });
});

describe('Correct Responses', function() {
  beforeEach(function() {
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

    server.respondWith('/404', [404, {}, ""]);
  });

  afterEach(function() {
    server.restore();
  });

  it('Parse application/json', function(done) {
    Jax
      .get('/json')
      .then(function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');

        done();
      });
  });

  it('Parse application/x-www-form-urlencoded', function(done) {
    Jax
      .get('/form')
      .then(function(err, res) {
        var data = res.data;

        assert.isObject(data);
        assert.propertyVal(data, 'foo', 'bar');

        done();
      });
  });

  it('Parse text/html', function(done) {
    Jax
      .get('/text')
      .then(function(err, res) {
        var data = res.data;

        assert.isString(data);
        assert.strictEqual(data, 'Hello, world.');

        done();
      });
  });

  it('Parse 404', function(done) {
    Jax
      .get('/404')
      .then(function(err, res) {
        assert.isNull(res.data);
        assert.strictEqual(res.status, 404);

        done();
      });
  });
});

describe('Jax Request Object', function() {
  beforeEach(function() {
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

  afterEach(function() {
    server.restore();
  });

  describe('Setting headers | .header()', function() {
    it('res.request.headers should be an object', function(done) {
      Jax
        .get('/json')
        .header('foo', 'bar')
        .then(function(err, res) {
          assert.isObject(res.request.headers);
          done();
        });
    });

    it('method should accept 2 params as strings', function(done) {
      Jax
        .get('/json')
        .header('foo', 'bar')
        .then(function(err, res) {
          assert.propertyVal(res.request.headers, 'foo', 'bar');
          done();
        });
    });

    it('method should accept 1 param as object', function(done) {
      Jax
        .get('/json')
        .header({
          foo: 'bar'
        })
        .then(function(err, res) {
          assert.propertyVal(res.request.headers, 'foo', 'bar');
          done();
        });
    });
  });

  describe('Sending payload data | .data()', function() {
    it('res.request.requestData should be an object', function(done) {
      Jax
        .post('/json')
        .then(function(err, res) {
          assert.isObject(res.request.requestData);
          done();
        });
    });

    it('method should accept 2 params as strings', function(done) {
      Jax
        .post('/json')
        .data('foo', 'bar')
        .then(function(err, res) {
          assert.propertyVal(res.request.requestData, 'foo', 'bar');
          done();
        });
    });

    it('method should accept 1 param as object', function(done) {
      Jax
        .post('/json')
        .data({
          foo: 'bar'
        })
        .then(function(err, res) {
          assert.propertyVal(res.request.requestData, 'foo', 'bar');
          done();
        });
    });
  });

  describe('Setting url queries | .query()', function() {
    it('res.request.queries should be an array', function(done) {
      Jax
        .get('/json')
        .query('foo=bar')
        .then(function(err, res) {
          assert.isArray(res.request.queries);
          done();
        });
    });

    it('method should accept 1 param as string', function(done) {
      Jax
        .get('/json')
        .query('foo=bar')
        .then(function(err, res) {
          assert.include(res.request.queries, 'foo=bar');
          done();
        });
    });

    it('method should accept 1 param as object', function(done) {
      Jax
        .get('/json')
        .query({
          foo: 'bar'
        })
        .then(function(err, res) {
          assert.include(res.request.queries, 'foo=bar');
          done();
        });
    });
  });

  describe('Setting content type header | .type()', function() {
    it('Content-Type should be application/json', function(done) {
      Jax
        .get('/json')
        .type('application/json')
        .then(function(err, res) {
          assert.equal(res.request.headers['Content-Type'], 'application/json');
          done();
        });
    });
  });

  describe('Setting accept header | .accept()', function() {
    it('Accept should be application/json', function(done) {
      Jax
        .get('/json')
        .accept('application/json')
        .then(function(err, res) {
          assert.equal(res.request.headers['Accept'], 'application/json');
          done();
        });
    });
  });

  describe('Setting CORS on Request | .cors()', function() {
    it('XHR should be set to handle CORS', function(done) {
      Jax
        .get('/json')
        .cors()
        .then(function(err, res) {
          assert.equal(res.request.headers['X-CORS-Enabled'], true);
          done();
        });
    });
  });

  describe('Setting auth header | .auth()', function() {
    it('Auth header should be set', function(done) {
      Jax
        .get('/json')
        .auth('john', 'doe')
        .then(function(err, res) {
          assert.isDefined(res.request.headers['Authorization']);
          done();
        });
    });
  });

  describe('Setting no cache headers | .nocache()', function() {
    it('Appropriate headers sent so response is not cached', function(done) {
      Jax
        .get('/json')
        .nocache()
        .then(function(err, res) {
          var headers = res.request.headers;

          assert.equal(headers['Cache-Control'], 'no-cache');
          assert.equal(headers['Expires'], -1);
          assert.equal(headers['X-Requested-With'], 'XMLHttpRequest');
          done();
        });
    });
  });
});
