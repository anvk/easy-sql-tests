/* global it, describe, require */

var chai = require('chai'),
    expect = chai.expect,
    EasySqlTest = require('../dist/easy-sql-test.js'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon');

describe('easy-sql-test tests', function() {
  var someDbConfig = {};

  describe('constructor test', function() {
    it('no dbConfig should throw error', function() {
      var errorMessage = 'easy-sql-test: dbConfig required';
      try{
        new EasySqlTest();
      } catch (err) {
        expect(err).to.equal(errorMessage)
      }
    });
  });

  describe('connectionOpen tests', function() {
    it('check callback invoked on connection', function() {
      var connectCallback = sinon.spy(function() {});

      var mssqlStub = {
        Connection: function() {
          return {
            connect: function(callback) {
              callback();
            }
          };
        }
      };

      var EasySqlTest = proxyquire('../dist/easy-sql-test.js', {
        mssql: mssqlStub
      });

      var easySqlTestProxy = new EasySqlTest(someDbConfig);

      easySqlTestProxy.connectionOpen(connectCallback);

      expect(connectCallback.called).to.be.true;
      expect(connectCallback.callCount).to.equal(1);
    });
  });

  describe('connectionClose tests', function() {
    it('check connection.close() called', function() {
      var closeFunctionSpy = sinon.spy(function() {});
      var mssqlStub = {
        Connection: function() {
          return {
            connect: function() {},
            close: closeFunctionSpy
          }
        }
      };

      var EasySqlTest = proxyquire('../dist/easy-sql-test.js', {
        mssql: mssqlStub
      });

      var easySqlTestProxy = new EasySqlTest(someDbConfig);

      easySqlTestProxy.connectionOpen();
      easySqlTestProxy.connectionClose();
      expect(closeFunctionSpy.called).to.be.true;
      expect(closeFunctionSpy.callCount).to.equal(1);
    });
  });

  describe('property tests', function() {

    it('get connection()', function() {
      var expectedConnection = {
        connect: function() {}
      };

      var mssqlStub = {
        Connection: function() {
          return expectedConnection;
        }
      };

      var EasySqlTest = proxyquire('../dist/easy-sql-test.js', {
        mssql: mssqlStub
      });

      var easySqlTestProxy = new EasySqlTest(someDbConfig);

      easySqlTestProxy.connectionOpen();
      var actualConnection = easySqlTestProxy.connection;
      expect(actualConnection).to.deep.equal(expectedConnection);
    });

    it('get dbConfig()', function() {

      var expected = {
        a: 'a',
        b: 'b'
      };

      var easySqlTest = new EasySqlTest(expected);

      var actual = easySqlTest.dbConfig;
      expect(expected).to.deep.equal(actual);
    });
  });

  describe('_executeStorProc() tests', function() {

    it('no storProcName should throw error', function() {
      var errorMessage = 'easy-sql-test: _executeStorProc() requires' +
          ' storProcName';

      var easySqlTest = new EasySqlTest(someDbConfig);

      try{
        easySqlTest._executeStorProc();
      } catch(err) {
        expect(err).to.equal(errorMessage);
      }
    });

    it('connection.request.input() should be called once per arg', function() {
        var inputFunctionSpy = sinon.spy(function() {});

        var sqlStub = {
          Connection: function() {
            return {
              connect: function() {},
              request: function() {
                return {
                  input: inputFunctionSpy,
                  execute: function() {}
                };
              }
            };
          }
        };

        var EasySqlTest = proxyquire('../dist/easy-sql-test.js', {
          mssql: sqlStub
        });

        var easySqlProxy = new EasySqlTest(someDbConfig);

        var storProcName = 'storProc';
        var args1 = {
          a: 'a',
          b: 'b',
          c: 1,
          d: 2
        };

        var args2 = {
          a: 'a',
          b: 'b',
          c: undefined,
          d: 2
        };

        easySqlProxy.connectionOpen();
        easySqlProxy._executeStorProc(storProcName, args1);
        expect(inputFunctionSpy.called).to.be.true;
        expect(inputFunctionSpy.callCount).to.equal(4);

        easySqlProxy._executeStorProc(storProcName, args2);
        expect(inputFunctionSpy.callCount).to.equal(7);
    });

    it('request.execute should get correct storProcName and callback',
      function() {

      var executeFunctionSpy = sinon.spy(function() {});
      var sqlStub = {
        Connection: function() {
          return {
            connect: function() {},
            request: function() {
              return {
                input: function() {},
                execute: executeFunctionSpy
              };
            }
          };
        }
      };

      var EasySqlTest = proxyquire('../dist/easy-sql-test.js', {
        mssql: sqlStub
      });

      var easySqlProxy = new EasySqlTest(someDbConfig),
          callbackFunction = 'callbackFunction',
          storProcName = 'storProcName';

      easySqlProxy.connectionOpen();
      easySqlProxy._executeStorProc(storProcName, {}, callbackFunction);
      easySqlProxy._executeStorProc(storProcName);

      var firstCall = executeFunctionSpy.getCall(0),
          secondCall = executeFunctionSpy.getCall(1);

      expect(firstCall.calledWithExactly(storProcName, callbackFunction))
        .to.be.true;

      expect(secondCall.calledWithExactly(storProcName, undefined))
         .to.be.true;
    });
  });

  describe('_query() tests', function(){
    it('request.query called without query', function() {
      var easySqlTest = new EasySqlTest(someDbConfig),
          errorMessage = 'easy-sql-test: _query() requires query';

      try {
        easySqlTest._query();
      } catch(err) {
        expect(err).to.equal(errorMessage);
      }
    });

    it('request.query called correctly', function() {
      var expectedCallback = function() { return 'a' },
          queryFunctionSpy = sinon.spy(function() {});
          expectedArgs = {
            a: 'a',
            b: 'b'
          };

      var sqlStub = {
        Connection: function() {
          return {
            connect: function() {},
            request: function() {
              return {
                query: queryFunctionSpy
              };
            }
          };
        }
      };

      var EasySqlTest = proxyquire('../dist/easy-sql-test.js', {
        mssql: sqlStub
      });

      var easySqlProxy = new EasySqlTest(someDbConfig);
      easySqlProxy.connectionOpen();

      easySqlProxy._query(expectedArgs, expectedCallback);
      easySqlProxy._query(expectedArgs, undefined);

      var firstCall = queryFunctionSpy.getCall(0),
          secondCall = queryFunctionSpy.getCall(1);

      expect(queryFunctionSpy.called).to.be.true;
      expect(firstCall.calledWithExactly(expectedArgs, expectedCallback))
        .to.be.true;
      expect(secondCall.calledWithExactly(expectedArgs, undefined)).to.be.true;
    });
  });

  describe('_convertQueriesToTestSteps() tests', function() {
    var easySqlTest,
        queries;

    function assertionCallback(error) {
      if (error) {
        this._errorCallback(error);
      }
    };

    beforeEach(function() {
      easySqlTest = new EasySqlTest(someDbConfig);
      queries = undefined;
    });

    it('with no queries', function() {
      var result = easySqlTest._convertQueriesToTestSteps();
      expect(result).is.an('array').to.have.length(0);
    });

    it('with one queries', function() {
      queries = ['a'];
      var result = easySqlTest._convertQueriesToTestSteps(queries),
          firstQuery = result[0];
      expect(result).to.have.length(1);
      expect(firstQuery.query).to.equal('a');
      expect(firstQuery).to.have.property('assertionCallback');
    });

    it('with many queries', function() {
      queries = ['a', undefined, '', 'b'];
      var result = easySqlTest._convertQueriesToTestSteps(queries),
          firstQuery = result[0],
          secondQuery = result[1];
      expect(result).to.have.length(2);
      expect(firstQuery.query).to.equal('a');
      expect(secondQuery.query).to.equal('b');
      expect(firstQuery).to.have.property('assertionCallback');
      expect(secondQuery).to.have.property('assertionCallback');
    });
  });

  describe('compileTest() tests', function() {
    var _executeStorProcSpy,
        _querySpy,
        _originalExecuteStoreProc,
        _originalQuery,
        _errorCallbackSpy,
        easySqlTest,
        testSteps;

    beforeEach(function() {
      testSteps = null;

      _errorCallbackSpy = new sinon.spy(function() {});

      easySqlTest = new EasySqlTest(someDbConfig, {
        errorCallback: _errorCallbackSpy
      });

      _originalExecuteStoreProc = easySqlTest._executeStorProc;
      _originalQuery = easySqlTest._query;

      _executeStorProcSpy = new sinon.spy(
        function(storProcName, args, callback) {
          callback();
        }
      );

      _querySpy = new sinon.spy(function(query, callback) {
        callback();
      });

      easySqlTest._executeStorProc = _executeStorProcSpy;
      easySqlTest._query = _querySpy;
    });

    afterEach(function() {
      easySqlTest._executeStorProc = _originalExecuteStoreProc;
      easySqlTest._query = _originalQuery;
    });

    it('testSteps not passed', function() {
      var doneCallbackSpy = new sinon.spy(function() {});
      easySqlTest.compileTest(undefined, doneCallbackSpy);
      expect(doneCallbackSpy.called).to.be.true;
      expect(doneCallbackSpy.callCount).to.equal(1);
      expect(_executeStorProcSpy.called).to.be.false;
      expect(_querySpy.called).to.be.false;
    });

    it('testSteps array is empty', function() {
      var doneCallbackSpy = new sinon.spy(function() {});
      easySqlTest.compileTest([], doneCallbackSpy);
      expect(doneCallbackSpy.called).to.be.true;
      expect(doneCallbackSpy.callCount).to.equal(1);
      expect(_executeStorProcSpy.called).to.be.false;
      expect(_querySpy.called).to.be.false;
    });

    it('testsSteps with query and assertionCallback', function() {
      var assertionCallbackSpy1 = new sinon.spy(function() {}),
          assertionCallbackSpy2 = new sinon.spy(function() {});
      testSteps = [
        {
          query: 'a',
          assertionCallback: assertionCallbackSpy1
        },
        {
          query: 'b',
          assertionCallback: assertionCallbackSpy2
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _querySpy.getCall(0),
          secondCall = _querySpy.getCall(1);

      expect(_querySpy.called).to.be.true;
      expect(_querySpy.callCount).to.equal(2);
      expect(firstCall.args[0]).to.equal('a');
      expect(secondCall.args[0]).to.equal('b');
      expect(_executeStorProcSpy.called).to.be.false;
      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertionCallbackSpy2.called).to.be.true;
      expect(assertionCallbackSpy2.callCount).to.equal(1);
    });

    it('testSteps with query w/o assertionCallback', function() {
      testSteps = [
        {
          query: 'a'
        },
        {
          query: 'b'
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _querySpy.getCall(0),
          secondCall = _querySpy.getCall(1);

      expect(_querySpy.called).to.be.true;
      expect(_querySpy.callCount).to.equal(2);
      expect(firstCall.args[0]).to.equal('a');
      expect(secondCall.args[0]).to.equal('b');
      expect(_executeStorProcSpy.called).to.be.false;
    });

    it('testSteps with storProc w/o args w/o assertionCallback', function() {
      testSteps = [
        {
          storProcName: 'a'
        },
        {
          storProcName: 'b'
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _executeStorProcSpy.getCall(0),
          secondCall = _executeStorProcSpy.getCall(1);

      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(2);
      expect(_querySpy.called).to.be.false;
      expect(firstCall.args[0]).to.equal('a');
      expect(firstCall.args[1]).to.deep.equal({});
      expect(secondCall.args[0]).to.equal('b');
      expect(secondCall.args[1]).to.deep.equal({});
    });

    it('testSteps with storProc w/o args with assertionCallback', function() {
      var assertionCallbackSpy1 = sinon.spy(function() {}),
          assertionCallbackSpy2 = sinon.spy(function() {});
      testSteps = [
        {
          storProcName: 'a',
          assertionCallback: assertionCallbackSpy1
        },
        {
          storProcName: 'b',
          assertionCallback: assertionCallbackSpy2
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _executeStorProcSpy.getCall(0),
          secondCall = _executeStorProcSpy.getCall(1);

      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(2);
      expect(_querySpy.called).to.be.false;
      expect(firstCall.args[0]).to.equal('a');
      expect(firstCall.args[1]).to.deep.equal({});
      expect(secondCall.args[0]).to.equal('b');
      expect(secondCall.args[1]).to.deep.equal({});
      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertionCallbackSpy2.called).to.be.true;
      expect(assertionCallbackSpy2.callCount).to.equal(1);
    });

    it('testSteps with storProc with args w/o assertionCallback', function() {
      testSteps = [
        {
          storProcName: 'a',
          args: { b: 'b', c: 'c'}
        },
        {
          storProcName: 'd',
          args: { e: 'e', f: 'f'}
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _executeStorProcSpy.getCall(0),
          secondCall = _executeStorProcSpy.getCall(1);

      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(2);
      expect(_querySpy.called).to.be.false;
      expect(firstCall.args[0]).to.equal('a');
      expect(firstCall.args[1]).to.deep.equal({ b: 'b', c: 'c'});
      expect(secondCall.args[0]).to.equal('d');
      expect(secondCall.args[1]).to.deep.equal({ e: 'e', f: 'f'});
    });

    it('testSteps with storProc with args with assertionCallback', function() {
      var assertionCallbackSpy1 = sinon.spy(function() {}),
          assertionCallbackSpy2 = sinon.spy(function() {});
      testSteps = [
        {
          storProcName: 'a',
          args: { b: 'b', c: 'c'},
          assertionCallback: assertionCallbackSpy1
        },
        {
          storProcName: 'd',
          args: { e: 'e', f: 'f'},
          assertionCallback: assertionCallbackSpy2
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _executeStorProcSpy.getCall(0),
          secondCall = _executeStorProcSpy.getCall(1);

      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(2);
      expect(_querySpy.called).to.be.false;
      expect(firstCall.args[0]).to.equal('a');
      expect(firstCall.args[1]).to.deep.equal({ b: 'b', c: 'c'});
      expect(secondCall.args[0]).to.equal('d');
      expect(secondCall.args[1]).to.deep.equal({ e: 'e', f: 'f'});
      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertionCallbackSpy2.called).to.be.true;
      expect(assertionCallbackSpy2.callCount).to.equal(1);
    });

    it('testSteps with query and storProcs', function() {
      var assertionCallbackSpy1 = sinon.spy(function() {}),
          assertionCallbackSpy2 = sinon.spy(function() {}),
          assertionCallbackSpy3 = sinon.spy(function() {}),
          assertionCallbackSpy4 = sinon.spy(function() {});

      testSteps = [
        {
          storProcName: 'a',
          args: { b: 'b', c: 'c'},
          assertionCallback: assertionCallbackSpy1
        },
        {
          query: 'b',
          assertionCallback: assertionCallbackSpy2
        },
        {
          storProcName: 'e',
          args: { f: 'f', g: 'g'},
          assertionCallback: assertionCallbackSpy3
        },
        {
          query: 'h',
          assertionCallback: assertionCallbackSpy4
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstProcCall = _executeStorProcSpy.getCall(0),
          secondProcCall = _executeStorProcSpy.getCall(1),
          firstQueryCall = _querySpy.getCall(0),
          secondQueryCall = _querySpy.getCall(1);

      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(2);
      expect(_querySpy.called).to.be.true;
      expect(_querySpy.callCount).to.equal(2);
      expect(firstProcCall.args[0]).to.equal('a');
      expect(firstProcCall.args[1]).to.deep.equal({ b: 'b', c: 'c'});
      expect(secondProcCall.args[0]).to.equal('e');
      expect(secondProcCall.args[1]).to.deep.equal({ f: 'f', g: 'g'});
      expect(firstQueryCall.args[0]).to.equal('b');
      expect(secondQueryCall.args[0]).to.equal('h');

      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertionCallbackSpy2.called).to.be.true;
      expect(assertionCallbackSpy2.callCount).to.equal(1);
      expect(assertionCallbackSpy3.called).to.be.true;
      expect(assertionCallbackSpy3.callCount).to.equal(1);
      expect(assertionCallbackSpy4.called).to.be.true;
      expect(assertionCallbackSpy4.callCount).to.equal(1);
    });

    it('testSteps with query and storProc and weird a testStep', function() {
      var assertionCallbackSpy1 = sinon.spy(function() {}),
          assertionCallbackSpy2 = sinon.spy(function() {}),
          assertionCallbackSpy3 = sinon.spy(function() {});

      testSteps = [
        {
          storProcName: 'a',
          args: { b: 'b', c: 'c'},
          assertionCallback: assertionCallbackSpy1
        },
        {
          weridQuery: true,
          args: { weird: 'yes' },
          assertionCallback: assertionCallbackSpy2
        },
        {
          query: 'b',
          assertionCallback: assertionCallbackSpy3
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstProcCall = _executeStorProcSpy.getCall(0),
          firstQueryCall = _querySpy.getCall(0);

      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(1);
      expect(_querySpy.called).to.be.true;
      expect(_querySpy.callCount).to.equal(1);
      expect(firstProcCall.args[0]).to.equal('a');
      expect(firstProcCall.args[1]).to.deep.equal({ b: 'b', c: 'c'});
      expect(firstQueryCall.args[0]).to.equal('b');

      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertionCallbackSpy2.called).to.be.false;
      expect(assertionCallbackSpy2.callCount).to.equal(0);
      expect(assertionCallbackSpy3.called).to.be.true;
      expect(assertionCallbackSpy3.callCount).to.equal(1);
    });

    it('test steps with only weird step', function() {
      var assertionCallbackSpy1 = sinon.spy(function() {}),
          assertionCallbackSpy2 = sinon.spy(function() {});

      testSteps = [
        {
          weridQuery1: true,
          args: { weird1: 'yes' },
          assertionCallback: assertionCallbackSpy2
        },
        {
          weridQuery2: true,
          args: { weird2: 'yes' },
          assertionCallback: assertionCallbackSpy2
        }
      ];

      easySqlTest.compileTest(testSteps);

      expect(_executeStorProcSpy.called).to.be.false;
      expect(_querySpy.called).to.be.false;
      expect(assertionCallbackSpy1.called).to.be.false;
      expect(assertionCallbackSpy2.called).to.be.false;
    });

    it('test steps with queries, storProc and query', function() {
      var assertionCallbackSpy1 = sinon.spy(function() {}),
          assertionCallbackSpy2 = sinon.spy(function() {}),
          assertionCallbackSpy3 = sinon.spy(function() {});

      testSteps = [
        {
          storProcName: 'a',
          args: { b: 'b', c: 'c'},
          assertionCallback: assertionCallbackSpy1
        },
        {
          queries: [
            'd',
            'e'
          ],
          assertionCallback: assertionCallbackSpy2
        },
        {
          query: 'f',
          assertionCallback: assertionCallbackSpy3
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstProcCall = _executeStorProcSpy.getCall(0),
          firstQueryCall = _querySpy.getCall(0),
          secondQueryCall = _querySpy.getCall(1),
          thirdQueryCall = _querySpy.getCall(2);

      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(1);
      expect(_querySpy.called).to.be.true;
      expect(_querySpy.callCount).to.equal(3);
      expect(firstProcCall.args[0]).to.equal('a');
      expect(firstProcCall.args[1]).to.deep.equal({ b: 'b', c: 'c'});
      expect(firstQueryCall.args[0]).to.equal('d');
      expect(secondQueryCall.args[0]).to.equal('e');
      expect(thirdQueryCall.args[0]).to.equal('f');

      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertionCallbackSpy2.called).to.be.false;
      expect(assertionCallbackSpy2.callCount).to.equal(0);
      expect(assertionCallbackSpy3.called).to.be.true;
      expect(assertionCallbackSpy3.callCount).to.equal(1);
    });

    it('test step with queries some of them fails and call errorCallback', function() {

      easySqlTest._query = sinon.spy(function(query, callback) {
        if (query === 'errorQuery') {
          return callback('error');
        }

        callback(undefined);
      });

      testSteps = [
        {
          queries: [
            'errorQuery',
            'goodQuery',
            'errorQuery'
          ]
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstErrorCall = _errorCallbackSpy.getCall(0),
          secondErrorCall = _errorCallbackSpy.getCall(1);


      expect(easySqlTest._query.called).to.be.true;
      expect(easySqlTest._query.callCount).to.equal(3);
      expect(_errorCallbackSpy.called).to.be.true;
      expect(_errorCallbackSpy.callCount).to.equal(2);
      expect(firstErrorCall.args[0]).to.equal('error');
      expect(secondErrorCall.args[0]).to.equal('error');
    });

    it('test step with query fails and calls assertionCallback with error', function() {
      var assertionCallbackSpy1 = new sinon.spy(function() {}),
          assertionCallbackSpy2 = new sinon.spy(function() {}),
          assertionCallbackSpy3 = new sinon.spy(function() {});

      easySqlTest._query = sinon.spy(function(query, callback) {
        if (query === 'errorQuery') {
          return callback('error');
        }

        callback(null);
      });

      testSteps = [
        {
          query: 'errorQuery',
          assertionCallback: assertionCallbackSpy1
        },
        {
          query: 'goodQuery',
          assertionCallback: assertionCallbackSpy2
        },
        {
          query: 'errorQuery',
          assertionCallback: assertionCallbackSpy3
        }
      ];

      easySqlTest.compileTest(testSteps);


      var assertCb1Call1 = assertionCallbackSpy1.getCall(0),
          assertCb2Call1 = assertionCallbackSpy2.getCall(0),
          assertCb3Call1 = assertionCallbackSpy3.getCall(0);

      expect(easySqlTest._query.called).to.be.true;
      expect(easySqlTest._query.callCount).to.equal(3);

      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertCb1Call1.args[0]).to.equal('error');

      expect(assertionCallbackSpy2.called).to.be.true;
      expect(assertionCallbackSpy2.callCount).to.equal(1);
      expect(assertCb2Call1.args[0]).to.equal(null);

      expect(assertionCallbackSpy3.called).to.be.true;
      expect(assertionCallbackSpy3.callCount).to.equal(1);
      expect(assertCb3Call1.args[0]).to.equal('error');
    });

    it('test step with storProc fails and calls assertionCallback with error', function() {
      var assertionCallbackSpy1 = new sinon.spy(function() {}),
          assertionCallbackSpy2 = new sinon.spy(function() {}),
          assertionCallbackSpy3 = new sinon.spy(function() {});

      easySqlTest._executeStorProc = sinon.spy(function(storProcName, args, callback) {
        if (storProcName === 'errorProc') {
          return callback('error');
        }

        callback(null, { data: 'true'});
      });

      testSteps = [
        {
          storProcName: 'errorProc',
          args: { a: 'a'},
          assertionCallback: assertionCallbackSpy1
        },
        {
          storProcName: 'goodProc',
          args: { b: 'b'},
          assertionCallback: assertionCallbackSpy2
        },
        {
          storProcName: 'errorProc',
          args: { c: 'c'},
          assertionCallback: assertionCallbackSpy3
        }
      ];

      easySqlTest.compileTest(testSteps);


      var assertCb1Call1 = assertionCallbackSpy1.getCall(0),
          assertCb2Call1 = assertionCallbackSpy2.getCall(0),
          assertCb3Call1 = assertionCallbackSpy3.getCall(0);

      expect(easySqlTest._executeStorProc.called).to.be.true;
      expect(easySqlTest._executeStorProc.callCount).to.equal(3);

      expect(assertionCallbackSpy1.called).to.be.true;
      expect(assertionCallbackSpy1.callCount).to.equal(1);
      expect(assertCb1Call1.args[0]).to.equal('error');

      expect(assertionCallbackSpy2.called).to.be.true;
      expect(assertionCallbackSpy2.callCount).to.equal(1);
      expect(assertCb2Call1.args[0]).to.equal(null);
      expect(assertCb2Call1.args[1]).to.deep.equal({ data: 'true'});

      expect(assertionCallbackSpy3.called).to.be.true;
      expect(assertionCallbackSpy3.callCount).to.equal(1);
      expect(assertCb3Call1.args[0]).to.equal('error');
    });

    it('done callback is executed at the end', function() {

      var doneCallbackSpy = sinon.spy(function() {}),
          assertionCallbackSpy1 = sinon.spy(function() {}),
          assertionCallbackSpy2 = sinon.spy(function() {});

      testSteps = [
        {
          storProcName: 'storProc',
          args: { a: 'a'},
          assertionCallback: assertionCallbackSpy1
        },
        {
          query: 'query',
          assertionCallback: assertionCallbackSpy2
        }
      ];

      easySqlTest.compileTest(testSteps, doneCallbackSpy);

      expect(doneCallbackSpy.called).to.be.true;
      expect(doneCallbackSpy.callCount).to.equal(1);
      expect(doneCallbackSpy.calledAfter(assertionCallbackSpy1)).to.be.true;
      expect(doneCallbackSpy.calledAfter(assertionCallbackSpy2)).to.be.true;
      expect(assertionCallbackSpy2.calledAfter(assertionCallbackSpy1))
        .to.be.true;
    });

    it('done callback is executed at the end even if there is an error', function() {

      var doneCallbackSpy = sinon.spy(function() {});

      easySqlTest._query = sinon.spy(function(query, callback) {
        callback('error');
      });

      testSteps = [
        {
          queries: [
            'a'
          ]
        }
      ];

      easySqlTest.compileTest(testSteps, doneCallbackSpy);

      expect(doneCallbackSpy.called).to.be.true;
      expect(doneCallbackSpy.callCount).to.equal(1);
      expect(_errorCallbackSpy.called).to.be.true;
      expect(_errorCallbackSpy.callCount).to.equal(1);

      expect(doneCallbackSpy.calledAfter(_errorCallbackSpy)).to.be.true;
    });
  });

  describe('clean() tests', function() {

    it('without cleanupQuery', function() {
      var callbackSpy = sinon.spy(function() {}),
          easySqlTest = new EasySqlTest(someDbConfig);

      easySqlTest._query = sinon.spy(function() {});

      easySqlTest.cleanup(callbackSpy);

      expect(easySqlTest._query.called).to.be.false;
      expect(callbackSpy.called).to.be.true;
      expect(callbackSpy.callCount).to.equal(1);
    });

    it('with cleanupQuery', function() {
      var callbackSpy = sinon.spy(function() {});

      var easySqlTest = new EasySqlTest(someDbConfig, {
        cleanupQuery: 'a'
      });

      easySqlTest._query = sinon.spy(function(query, callback) {
        callback();
      });

      easySqlTest.cleanup(callbackSpy);

      expect(easySqlTest._query.called).to.be.true;
      expect(easySqlTest._query.callCount).to.equal(1);
      expect(callbackSpy.called).to.be.true;
      expect(callbackSpy.callCount).to.equal(1);
      expect(callbackSpy.calledAfter(easySqlTest._query)).to.be.true;
    });
  });
});
