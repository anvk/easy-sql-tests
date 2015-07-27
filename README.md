# easy-sql-tests

> Micro framework to execute tests for T-SQL logic

## Install

```
$ npm install --save-dev easy-sql-tests
```

## API

> TBD

## Usage

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
      storProcName: '[sp].[STOR_PROC]',
      args: {
        intArg: 1,
        strArg: 'string'
      },
      assertionCallback: assertionCallback
    }
  ];

  easySQLTest.compileTest(undefined, testSteps, done);
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

  easySQLTest.compileTest(undefined, testSteps, done);
});
```

### Run queries before executing your test

```javascript
it('My query test', function(done) {
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

  easySQLTest.compileTest(prepQueries, testSteps, done);
});
```

OR

```javascript
it('My query test', function(done) {
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

  easySQLTest.compileTest(undefined, testSteps, done);
});
```

## Full Example

## License

MIT license; see [LICENSE](./LICENSE).

(c) 2015 by Alexey Novak
