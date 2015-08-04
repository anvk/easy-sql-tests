'use strict';

import sql from 'mssql';

export default class EasySQLTest {

  constructor(dbConfig, {errorCallback = e=>console.error(e), cleanupQuery}={}) {
    if (!dbConfig) {
      throw 'easy-sql-test: dbConfig required';
    }

    this._dbConfig = dbConfig;
    this._connection = undefined;
    this._errorCallback = errorCallback;
    this._cleanupQuery = cleanupQuery;

    this.connectionOpen = this.connectionOpen.bind(this);
    this.connectionClose = this.connectionClose.bind(this);
    this.compileTest = this.compileTest.bind(this);
    this.cleanup = this.cleanup.bind(this);

    this._query = this._query.bind(this);
    this._executeStorProc = this._executeStorProc.bind(this);
    this._convertQueriesToTestSteps = this._convertQueriesToTestSteps.bind(this);
  }

  connectionOpen(callback = ()=>{}) {
    this._connection = new sql.Connection(this._dbConfig);

    return this._connection.connect(callback);
  }

  connectionClose() {
    this._connection.close();
  }

  get connection() {
    return this._connection;
  }

  get dbConfig() {
    return this._dbConfig;
  }

  _executeStorProc(storProcName, args = {}, callback) {
    if (!storProcName) {
      throw 'easy-sql-test: _executeStorProc() requires storProcName';
    }

    let request = this._connection.request();

    for (let name in args) {
      if (args[name] === undefined) {
        continue;
      }
      request.input(name, args[name]);
    }

    request.multiple = true;
    request.verbose = false;
    return request.execute(storProcName, callback);
  }

  _query(query, callback) {
    if (!query) {
      throw 'easy-sql-test: _query() requires query';
    }

    let request = this._connection.request();
    return request.query(query, callback);
  }

  _convertQueriesToTestSteps(queries = []) {
    let result = [];

    // Replace forEach loop with for-of loop when ES6 is better supported by
    // Babel and Node. The issue is with Symbol.iterator when code is transpiled
    queries.forEach(query => {
      result.push({
        query: query,
        assertionCallback: error => {
          if (error) {
            this._errorCallback(error);
          }
        }
      });
    });

    return result;
  }

  compileTest(testSteps = [], doneCallback = ()=>{}) {
    let testStep = testSteps.shift();

    if (!testStep) {
      return doneCallback();
    }

    let {storProcName, args = {}, query, assertionCallback = ()=>{}, queries = []} = testStep;

    if (queries.length) {
      testSteps = [...this._convertQueriesToTestSteps(queries), ...testSteps];

      return this.compileTest(testSteps, doneCallback);
    }

    if (!storProcName && !query) {
      return this.compileTest(testSteps, doneCallback);
    }

    let callback = (error, recordsets) => {
      if (error) {
        assertionCallback(error);
      } else {
        assertionCallback(null, recordsets);
      }

      this.compileTest(testSteps, doneCallback);
    };

    if (storProcName) {
      this._executeStorProc(storProcName, args, callback);
    } else {
      this._query(query, callback);
    }
  }

  cleanup(callback) {
    if (!this._cleanupQuery) {
      return callback();
    }

    this._query(this._cleanupQuery, callback);
  }

};
