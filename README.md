# easy-sql-tests

> A module to write easy SQL tests

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
      query: 'SELECT * FROM [MY_TABLE]',
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

    // test that recordsets are
    expect(recordsets.length).to.not.equal(0);
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

  easySQLTest.compileTest(prepQueries, testSteps, done);
});
```

OR

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
      queries: [
        "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (1,'A');",
        "INSERT INTO [MY_TABLE] ([intVal],[strVal]) VALUES (2,'B');"
      ]
    }
    {
      query: 'SELECT * FROM [MY_TABLE]',
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
