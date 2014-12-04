var assert = chai.assert;

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

describe('Jax Request object', function() {
  describe('Setting headers | .header()', function() {
    it('res.request.headers should be an object', function(done) {
      Jax
        .get('data.json')
        .header('foo', 'bar')
        .then(function(err, res) {
          assert.isObject(res.request.headers);
          done();
        });
    });

    it('method should accept 2 params as strings', function(done) {
      Jax
        .get('data.json')
        .header('foo', 'bar')
        .then(function(err, res) {
          assert.propertyVal(res.request.headers, 'foo', 'bar');
          done();
        });
    });

    it('method should accept 1 param as object', function(done) {
      Jax
        .get('data.json')
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
        .post('data.json')
        .then(function(err, res) {
          assert.isObject(res.request.requestData);
          done();
        });
    });

    it('method should accept 2 params as strings', function(done) {
      Jax
        .post('data.json')
        .data('foo', 'bar')
        .then(function(err, res) {
          assert.propertyVal(res.request.requestData, 'foo', 'bar');
          done();
        });
    });

    it('method should accept 1 param as object', function(done) {
      Jax
        .post('data.json')
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
        .get('data.json')
        .query('foo=bar')
        .then(function(err, res) {
          assert.isArray(res.request.queries);
          done();
        });
    });

    it('method should accept 1 param as string', function(done) {
      Jax
        .get('data.json')
        .query('foo=bar')
        .then(function(err, res) {
          assert.include(res.request.queries, 'foo=bar');
          done();
        });
    });

    it('method should accept 1 param as object', function(done) {
      Jax
        .get('data.json')
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
        .get('data.json')
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
        .get('data.json')
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
        .get('data.json')
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
        .get('data.json')
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
        .get('data.json')
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
