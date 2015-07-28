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

    });
  })
});
