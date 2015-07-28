# easy-sql-tests [![Build Status](https://travis-ci.org/anvk/easy-sql-tests.svg?branch=master)](https://travis-ci.org/anvk/easy-sql-tests)

> Micro framework to execute tests for T-SQL logic in Node.js

## Install

```
$ npm install --save-dev easy-sql-tests
```


## API

#### EasySQLTests(options)

> constructor to initialize easy sql tests module  
> **options** - options for the module  
> **options.dbConfig** - mssql module database configuration  
> **options.dbConfig.user**  
> **options.dbConfig.password**  
> **options.dbConfig.server**  
> **options.dbConfig.database**  
> **options.cleanupQuery** - (optional) query to be executed for cleanup() function  
> **options.errorCallback** - (optional) function callback to be executed if one of the prepQueries will fail to execute  

#### connectionOpen(callback)

> function to open connection to the DB.

#### connectionClose()

> function to close connection to the DB.

#### cleanup(callback)

> function to execute cleanup query if it was passed into constructor

#### compileTest(prepQueries, testSteps, doneCallback)

> function to execute test steps  
> **prepQueries** - array of string queries to be executed prior testSteps  
> **testSteps** - array of test step objects  
> **testSteps.storProcName** - stored procedure name to be executed  
> **testSteps.args** - object containing arguments for stored procedure  
> **testSteps.query** - string containing query to be executed
> **testSteps.assertionCallback** - callback after query/storProc being executed. Put your assertions inside  
> **testSteps.queries** - array of strings representing queries to be executed  

#### connection

> property which contains MSSQL connection

#### dbConfig

> property which contains DB Configuration


## Usage


### Create instance of easySQLTests

In order to create an instance of the module to use in your test follow this simple example:

```javascript
var EasySQLTests = require('easy-sql-tests');

// ...

describe('my test suite', function() {
  var easySQLTests;

  var dbConfig = {
    user: "USERNAME",
    password: "PASSWORD",
    server: "MY_SERVER",
    database: "DB"
  };

  // ...

  // runs before all the tests
  before(function(done) {
    easySQLTests = new EasySQLTest({
      dbConfig: dbConfig
    });
  });

  // ...

});
```


### Open and Close connection

Most of the times you will need to open connection once and close by the end of your tests.

```javascript
var EasySQLTests = require('easy-sql-tests');

// ...

describe('my test suite', function() {
  var easySQLTests;

  var dbConfig = {
    user: "USERNAME",
    password: "PASSWORD",
    server: "MY_SERVER",
    database: "DB"
  };

  // ...

  // runs before all the tests
  before(function(done) {
    easySQLTests = new EasySQLTest({
      dbConfig: dbConfig
    });

    easySQLTests.connectionOpen(function(error) {
      if (error) {
        console.log(error);
      }

      done();
    });
  });

  // ...

  // runs after all the tests
  after(function() {
    easySQLTests.connectionClose();
  });

  // ...

});
```


### Setup cleanup for the test suite

To ensure proper testing you might want to cleanup all temporarily generated data by your tests.  
You can easily achieve that by defining a `cleanupQuery` and calling `cleanup()` function.

```javascript
describe('my test suite', function() {
  var easySQLTests;

  // ...

  // runs before all the tests
  before(function(done) {
    easySQLTests = new EasySQLTest({
      dbConfig: dbConfig,
      cleanupQuery: 'EXEC [test].[CLEANUP_LOGIC]'
    });

    easySQLTests.connectionOpen(function(error) {
      if (error) {
        console.log(error);
        return done();
      }

      // cleanup before running tests
      easySQLTest.cleanup(function(error) {
        if (error) {
          errorCallback(error);
        }

        done();
      });
    });
  });

  // ...

  // runs after every test case
  afterEach(function(done) {
    cleanup(done);
  });

  // ...

});
```


### Run basic query test

```javascript
it('My query test', function(done) {
  var assertionCallback = function(error, recordsets) {
    if (error) {
      console.log(error);
      return done();
    }

    // test that we returned a table
    expect(recordsets.length).to.equal(1);
  };

  var testSteps = [
    {
      query: 'SELECT * FROM [MY_TABLE]',
      assertionCallback: assertionCallback
    }
  ];

  easySQLTests.compileTest(undefined, testSteps, done);
});
```


### Run basic stor proc test

```javascript
it('My stor proc test', function(done) {
  var assertionCallback = function(error, recordsets) {
    if (error) {
      console.log(error);
      return done();
    }

    // test that we returned a table
    expect(recordsets.length).to.equal(1);
  };

  var testSteps = [
    {
      storProcName: '[sp].[STOR_PROC]',
      args: {
        intArg: 1,
        strArg: 'string'
      },
      assertionCallback: assertionCallback
    }
  ];

  easySQLTests.compileTest(undefined, testSteps, done);
});
```


### Run multiple test steps

If you need to run multiple steps to check that logic is correct then you can define multiple `testSteps` with their assertions.

```javascript
it('Multiple steps inside the test', function(done) {
  var assertionCallback = function(error, recordsets) {
    if (error) {
      console.log(error);
      return done();
    }

    // asserions here
  };

  var assertionCallback2 = function(error, recordsets) {
    if (error) {
      console.log(error);
      return done();
    }

    // asserions here
  };

  var testSteps = [
    {
      storProcName: '[sp].[STOR_PROC]',
      args: {
        intArg: 1,
        strArg: 'string'
      },
      assertionCallback: assertionCallback
    },
    {
      query: 'SELECT * FROM [MY_TABLE]',
      assertionCallback: assertionCallback2
    },
    {
      storProcName: '[sp].[STOR_PROC2]',
      args: {},
      assertionCallback: assertionCallback2
    },
  ];

  easySQLTests.compileTest(undefined, testSteps, done);
});
```


### Run queries before executing your test

Some of the tests require initial setup of the data or state in your testing database.  
'prepQueries' are there for you to make this initial setup.

```javascript
it('Prep queries before test', function(done) {
  var prepQueries = [
    "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (1,'A');",
    "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (2,'B');"
  ];

  var assertionCallback = function(error, recordsets) {
    // ...
  };

  var testSteps = [
    // {
    //    another test step
    // },
    {
      storProcName: '[sp].[STOR_PROC]',
      args: {},
      assertionCallback: assertionCallback
    }
  ];

  easySQLTests.compileTest(prepQueries, testSteps, done);
});
```

OR

```javascript
it('Prep queries before test', function(done) {
  var assertionCallback = function(error, recordsets) {
    // ...
  };

  var testSteps = [
    {
      queries: [
        "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (1,'A');",
        "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (2,'B');"
      ]
    },
    // {
    //    another test step
    // },
    {
      storProcName: '[sp].[STOR_PROC]',
      args: {},
      assertionCallback: assertionCallback
    }
  ];

  easySQLTests.compileTest(undefined, testSteps, done);
});
```


### Setting up a fail callback when prep queries fail

```javascript
describe('my test suite', function() {
  var easySQLTests;

  var errorCallback = function(error) {
    console.error(error);

    // DO SOME EXTRA LOGIC HERE
  };

  // ...

  // runs before all the tests
  before(function(done) {
    easySQLTests = new EasySQLTest({
      dbConfig: dbConfig,
      errorCallback: errorCallback
    });
  });

  // ...

});
```


## Full Example

```javascript
var EasySQLTests = require('easy-sql-test'));

describe('my test suite', function() {

  var easySQLTests;

  var dbConfig = {
    user: "USERNAME",
    password: "PASSWORD",
    server: "MY_SERVER",
    database: "DB"
  };

  var errorCallback = function(error) {
    console.error(error);
  };

  var cleanup = function(done) {
    easySQLTests.cleanup(function(error) {
      if (error) {
        errorCallback(error);
      }

      done();
    });
  };

  // runs before all the tests
  before(function(done) {
    easySQLTests = new EasySQLTest({
      dbConfig: dbConfig,
      cleanupQuery: 'EXEC [test].[CLEANUP_LOGIC]',
      errorCallback: errorCallback
    });

    easySQLTests.connectionOpen(function(error) {
      if (error) {
        errorCallback(error);
        return done();
      }

      cleanup(done);
    });
  });

  // runs after all tests in this block
  after(function() {
    easySQLTests.connectionClose();
  });

  // runs after every test case
  afterEach(function(done) {
    cleanup(done);
  });

  it('Different Vendors. Select all vendors', function(done) {

    var prepQueries = [
      "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (1,'A');",
      "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (2,'B');"
    ];

    var assertionCallback = sinon.spy(function(error, recordsets) {
      if (error) {
        return console.error(error);
      }

      // we have data
      expect(recordsets.length).to.not.equal(0);
    });

    var assertionCallback = sinon.spy(function(error, recordsets) {
      if (error) {
        return console.error(error);
      }

      // we have data
      expect(recordsets.length).to.not.equal(0);
      // we have at least one row
      expect(recordsets[0]).to.not.equal(0);
    });

    var testSteps = [
      {
        storProcName: '[sp].[STOR_PROC]',
        args: {
          intArg: 1,
          strArg: 'string'
        },
        assertionCallback: assertionCallback
      },
      {
        query: 'SELECT * FROM [MY_TABLE]',
        assertionCallback: assertionCallback
      }
    ];

    easySQLTests.compileTest(prepQueries, testSteps, function() {
      expect(assertionCallback.called).to.be.true;
      expect(assertionCallback.callCount).to.equal(1);

      done();
    });
  });

});
```


## License

MIT license; see [LICENSE](./LICENSE).

(c) 2015 by Alexey Novak and Abdul Khan
