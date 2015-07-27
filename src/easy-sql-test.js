'use strict';

import sql from 'mssql';

export default class EasySQLTest {

  constructor({dbConfig = {}, errorCallback = e=>console.error(e), cleanupQuery}) {
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
    this._compileTest = this._compileTest.bind(this);
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
    let request = this._connection.request();
    return request.query(query, callback);
  }

  _convertQueriesToTestSteps(prepQueries = []) {
    let result = [];

    for (let query of prepQueries) {
      result.push({
        query: query,
        assertionCallback: error => {
          if (error) {
            this._errorCallback(error);
          }
        }
      });
    }

    return result;
  }

  _compileTest(testSteps = [], doneCallback = ()=>{}) {
    let testStep = testSteps.shift();

    if (!testStep) {
      return doneCallback();
    }

    let {storProcName, args={}, query, assertionCallback=()=>{}, queries = []} = testStep;

    if (queries.length) {
      testSteps = [...this._convertQueriesToTestSteps(queries), ...testSteps];

      return this._compileTest(testSteps, doneCallback);
    }

    if (!storProcName && !query) {
      return this._compileTest(testSteps, doneCallback);
    }

    let callback = (error, recordsets) => {
      if (error) {
        assertionCallback(error);
      } else {
        assertionCallback(null, recordsets);
      }

      this._compileTest(testSteps, doneCallback);
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

  compileTest(prepQueries = [], testSteps = [], doneCallback = ()=>{}) {
    testSteps = [...this._convertQueriesToTestSteps(prepQueries), ...testSteps];

    this._compileTest(testSteps, doneCallback);
  }

};
