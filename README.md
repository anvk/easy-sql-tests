# easy-sql-tests

> Micro framework to execute tests for T-SQL logic

## Install

```
$ npm install --save-dev easy-sql-tests
```

## API

> TBD

## Usage

### Create instance of easySQLTests

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

(c) 2015 by Alexey Novak
