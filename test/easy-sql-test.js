/* global it, describe, require */

var chai = require('chai'),
    expect = chai.expect,
    EasySqlTest = require('../dist/easy-sql-test.js'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon');

describe('easy-sql-test tests', function() {
  var emptyDbConfig = {};

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

      var easySqlTestProxy = new EasySqlTest(emptyDbConfig);

      easySqlTestProxy.connectionOpen(connectCallback);

      expect(connectCallback.called).to.be.true;
      expect(connectCallback.callCount).to.equal(1);
    });
  });

  describe('connectionClose tests', function(){
    it('check connection.close() called', function() {
      var closeFunctionSpy = sinon.spy(function(){});
      var mssqlStub = {
        Connection: function() {
          return {
            connect: function(){},
            close: closeFunctionSpy
          }
        }
      };

      var EasySqlTest = proxyquire('../dist/easy-sql-test.js', {
        mssql: mssqlStub
      });

      var easySqlTestProxy = new EasySqlTest(emptyDbConfig);

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

      var easySqlTestProxy = new EasySqlTest(emptyDbConfig);

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

  describe('_executeStorProc() tests', function(){

    it('no storProcName should throw error', function() {
  		var errorMessage = 'easy-sql-test: _executeStorProc() requires' +
          ' storProcName';

      var easySqlTest = new EasySqlTest(emptyDbConfig);

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

        var easySqlProxy = new EasySqlTest(emptyDbConfig);

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

      var easySqlProxy = new EasySqlTest(emptyDbConfig),
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

      var easySqlProxy = new EasySqlTest(emptyDbConfig);
      easySqlProxy.connectionOpen();

      easySqlProxy._query(expectedArgs, expectedCallback);
      easySqlProxy._query(undefined, expectedCallback);
      easySqlProxy._query(expectedArgs, undefined);
      easySqlProxy._query();

      var firstCall = queryFunctionSpy.getCall(0),
          secondCall = queryFunctionSpy.getCall(1),
          thirdCall = queryFunctionSpy.getCall(2),
          fourthCall = queryFunctionSpy.getCall(3);
      
      expect(queryFunctionSpy.called).to.be.true;
      expect(firstCall.calledWithExactly(expectedArgs, expectedCallback))
        .to.be.true;
      expect(secondCall.calledWithExactly(undefined, expectedCallback))
        .to.be.true;
      expect(thirdCall.calledWithExactly(expectedArgs, undefined)).to.be.true;
      expect(fourthCall.calledWithExactly(undefined, undefined)).to.be.true;
    });
  });

  describe('_convertQueriesToTestSteps() tests', function() {
    var easySqlTest,
        prepQuery;

    function assertionCallback(error) {
      if (error) {
        this._errorCallback(error);
      }
    };

    beforeEach(function() {
      easySqlTest = new EasySqlTest(emptyDbConfig);
      prepQuery = undefined;
    });

    it('with no prepQuery', function() {
      var result = easySqlTest._convertQueriesToTestSteps();
      expect(result).is.an('array').to.have.length(0);
    });

    it('with one prepQuery', function() {
      prepQuery = ['a'];
      var result = easySqlTest._convertQueriesToTestSteps(prepQuery),
          firstQuery = result[0];
      expect(result).to.have.length(1);
      expect(firstQuery.query).to.equal('a');
      expect(firstQuery).to.have.property('assertionCallback');
    });

    it('with many prepQuery', function() {
      prepQuery = ['a', undefined, '', '  ', 'b'];
      var result = easySqlTest._convertQueriesToTestSteps(prepQuery),
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
        assertionCallbackSpy,
        _originalExecuteStoreProc,
        _originalQuery,
        easySqlTest,
        testSteps;

    beforeEach(function() {
      testSteps = null;
      easySqlTest = new EasySqlTest(emptyDbConfig);
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

      assertionCallbackSpy = new sinon.spy(function() {});

      easySqlTest._executeStorProc = _executeStorProcSpy;
      easySqlTest._query = _querySpy;
    });

    afterEach(function() {
      easySqlTest._executeStorProc = _originalExecuteStoreProc;
      easySqlTest._query = _originalQuery;
    });

    it('no testSteps should call doneCallback', function() {
      var doneCallbackSpy = new sinon.spy(function() {});
      easySqlTest.compileTest(undefined, doneCallbackSpy);
      expect(doneCallbackSpy.called).to.be.true;
      expect(doneCallbackSpy.callCount).to.equal(1);
      expect(_executeStorProcSpy.called).to.be.false;
      expect(_querySpy.called).to.be.false;
    });

    it('one testStep with storProc', function() {
      testSteps = [
        {
          storProcName: 'a',
          args: { b: 'c'},
          assertionCallback: assertionCallbackSpy
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _executeStorProcSpy.getCall(0);
      expect(_executeStorProcSpy.called).to.be.true;
      expect(_executeStorProcSpy.callCount).to.equal(1);
      expect(_querySpy.called).to.be.false;
      
      // PLEASE NOTE firstCall.args[x] is better and more reliable than
      // firstCall.calledWith or firstCall.calledWithExactly for some reason!!!
      expect(firstCall.args[0]).to.equal('a');
      expect(firstCall.args[1]).to.deep.equal({ b: 'c'});

      expect(assertionCallbackSpy.called).to.be.true;
      expect(assertionCallbackSpy.callCount).to.equal(1);
    });

    it('one testStep with query', function() {
      testSteps = [
        {
          query: 'a',
          assertionCallback: assertionCallbackSpy
        }
      ];

      easySqlTest.compileTest(testSteps);

      var firstCall = _querySpy.getCall(0);
      expect(_querySpy.called).to.be.true;
      expect(_querySpy.callCount).to.equal(1);
      expect(firstCall.args[0]).to.equal('a');
      expect(_executeStorProcSpy.called).to.be.false;
      expect(assertionCallbackSpy.called).to.be.true;
      expect(assertionCallbackSpy.callCount).to.equal(1);
    });

    // it('one testStep with storProc and one setup queries', function() {
    //   testSteps = [
    //     queries: [

    //     ],
    //   ]
    // });

    // it('one testStep with storProc and two setup queries', function() {

    // });

    // it('one testStep with query and one setup queries', function() {

    // });

    // it('one testStep with query and two setup queries', function() {

    // });

    // it('two testSteps with storProcs and one setup queries', function() {

    // });

    // it('two testSteps with storProcs and two setup queries', function() {

    // });

    // it('two testSteps with query and one setup queries', function() {

    // });

    // it('two testSteps with query and two setup queries', function() {

    // });

    // it('two testSteps: one storProc and one query', function() {

    // });

    // it('two testSteps: one storProc and one query and one setup queries', function() {

    // });

    // it('two testSteps: one storProc and one query and two setup queries', function() {

    // });
  });
});
