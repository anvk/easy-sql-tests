'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _mssql = require('mssql');

var _mssql2 = _interopRequireDefault(_mssql);

var EasySQLTest = (function () {
  function EasySQLTest(_ref) {
    var _ref$dbConfig = _ref.dbConfig;
    var dbConfig = _ref$dbConfig === undefined ? {} : _ref$dbConfig;
    var _ref$errorCallback = _ref.errorCallback;
    var errorCallback = _ref$errorCallback === undefined ? function (e) {
      return console.error(e);
    } : _ref$errorCallback;
    var cleanupQuery = _ref.cleanupQuery;

    _classCallCheck(this, EasySQLTest);

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

  _createClass(EasySQLTest, [{
    key: 'connectionOpen',
    value: function connectionOpen() {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

      this._connection = new _mssql2['default'].Connection(this._dbConfig);

      return this._connection.connect(callback);
    }
  }, {
    key: 'connectionClose',
    value: function connectionClose() {
      this._connection.close();
    }
  }, {
    key: '_executeStorProc',
    value: function _executeStorProc(storProcName, args, callback) {
      if (args === undefined) args = {};

      var request = this._connection.request();

      for (var _name in args) {
        if (args[_name] === undefined) {
          continue;
        }
        request.input(_name, args[_name]);
      }

      request.multiple = true;
      request.verbose = false;

      return request.execute(storProcName, callback);
    }
  }, {
    key: '_query',
    value: function _query(query, callback) {
      var request = this._connection.request();
      return request.query(query, callback);
    }
  }, {
    key: '_convertQueriesToTestSteps',
    value: function _convertQueriesToTestSteps() {
      var _this = this;

      var prepQueries = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      var result = [];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = prepQueries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var query = _step.value;

          result.push({
            query: query,
            assertionCallback: function assertionCallback(error) {
              if (error) {
                _this._errorCallback(error);
              }
            }
          });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return result;
    }
  }, {
    key: '_compileTest',
    value: function _compileTest() {
      var _this2 = this;

      var testSteps = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var doneCallback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

      var testStep = testSteps.shift();

      if (!testStep) {
        return doneCallback();
      }

      var storProcName = testStep.storProcName;
      var _testStep$args = testStep.args;
      var args = _testStep$args === undefined ? {} : _testStep$args;
      var query = testStep.query;
      var _testStep$assertionCallback = testStep.assertionCallback;
      var assertionCallback = _testStep$assertionCallback === undefined ? function () {} : _testStep$assertionCallback;
      var _testStep$queries = testStep.queries;
      var queries = _testStep$queries === undefined ? [] : _testStep$queries;

      if (queries.length) {
        testSteps = [].concat(_toConsumableArray(this._convertQueriesToTestSteps(queries)), _toConsumableArray(testSteps));

        return this._compileTest(testSteps, doneCallback);
      }

      if (!storProcName && !query) {
        return this._compileTest(testSteps, doneCallback);
      }

      var callback = function callback(error, recordsets) {
        if (error) {
          assertionCallback(error);
        } else {
          assertionCallback(null, recordsets);
        }

        _this2._compileTest(testSteps, doneCallback);
      };

      if (storProcName) {
        this._executeStorProc(storProcName, args, callback);
      } else {
        this._query(query, callback);
      }
    }
  }, {
    key: 'cleanup',
    value: function cleanup(callback) {
      if (!this._cleanupQuery) {
        return callback();
      }

      this._query(this._cleanupQuery, callback);
    }
  }, {
    key: 'compileTest',
    value: function compileTest() {
      var prepQueries = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var testSteps = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var doneCallback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

      testSteps = [].concat(_toConsumableArray(this._convertQueriesToTestSteps(prepQueries)), _toConsumableArray(testSteps));

      this._compileTest(testSteps, doneCallback);
    }
  }, {
    key: 'connection',
    get: function get() {
      return this._connection;
    }
  }, {
    key: 'dbConfig',
    get: function get() {
      return this._dbConfig;
    }
  }]);

  return EasySQLTest;
})();

exports['default'] = EasySQLTest;
;
module.exports = exports['default'];