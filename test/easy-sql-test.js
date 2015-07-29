/* global it, describe, require */

var chai = require('chai'),
    expect = chai.expect,
    EasySqlTest = require('../dist/easy-sql-test.js'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon');


describe('easy-sql-test tests', function() {
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

      var easySqlTestProxy = new EasySqlTest({
        dbConfig: {}
      });

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

      var easySqlTestProxy = new EasySqlTest({
        dbConfig: {}
      });

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

      var easySqlTestProxy = new EasySqlTest({
        dbConfig: {}
      });

      easySqlTestProxy.connectionOpen();
      var actualConnection = easySqlTestProxy.connection;
      expect(actualConnection).to.deep.equal(expectedConnection);
    });

    it('get dbConfig()', function() {
    	
    	var expected = {
    		a: 'a',
    		b: 'b'
    	};

    	var easySqlTest = new EasySqlTest({
    		dbConfig: expected
    	});

    	var actual = easySqlTest.dbConfig;
    	expect(expected).to.deep.equal(actual);
    });
  });

  describe('_executeStorProc() tests', function(){
  	
    it('no storProcName should throw error', function() {
  		var errorMessage = 'easy-sql-test: _executeStorProc() requires ' +
        'storProcName';
  		
      var easySqlTest = new EasySqlTest({ dbConfig: {}});
  		
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

        var easySqlProxy = new EasySqlTest({ dbConfig: {} });

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

      var easySqlProxy = new EasySqlTest({ dbConfig: {} }),
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
});
