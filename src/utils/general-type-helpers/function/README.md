# Function

## `pipe`

`pipe` is a helper function which allows to chain computations on a initial value. Its main advantages are:
* It removes the need for intermediary values, making the risk to misuse them disappear
* It provides a clear flow of execution, as no conditionals can skip parts of the chain
* It discourages mutation (which often leads to code that's hard to follow)
* It encourages splitting logic in clear, separate steps, which makes for more understandable programs

TL;DR: with `pipe`, it's easier to avoid the 300 line functions with shared & mutated variables.

Here's an example usage of the `pipe` function:

```ts
// A function which doubles a given number
const double = (n: number): number => n * 2;
const add = (n1: number) => (n2: number): number => n1 + n2;
const initialValue = 1;

const result = pipe(
  // Provide an initial value
  initialValue,
  // Provide functions to transform this value
  // Step 1
  double,
  // Step 2
  add(3),
  // Step 3
  double
);

// 'The result is 10'
console.log(`The result is ${result}`);

```

By design, `pipe` is meant to work with unary functions (functions that only take one argument). But you can easily use `pipe` with non-unary functions, as shown in this example:

```ts
const double = (n: number): number => n * 2;
// Non-unary version of add
const add =
  (n1: number, n2: number): number => n1 + n2;
  const initialValue = 1;

const result = pipe(
  initialValue,
  double,
  // To use `add`, we only need to declare an arrow function and return its result.
  (n) => add(3, n),
  double
);

// 'The result is 10'
console.log(`The result is ${result}`);
```

Caveats:
* `pipe` only works with synchronous functions.
* The current implementation is limited to passing 20 arguments. In practice, operations with more than 20 steps probably deserve to be split, so this limitation should not be an issue.

## asyncPipe

Like `pipe` but async.

<details>

<summary>Examples:</summary>

This is how we can transform some code into a pipe.

```ts
// We have an object we need and we do some checks on it.
const resultObject = await runInConnection(
      pool,
      async (connection) => {
        return connection.maybeOne(query);
      }
);
if (R.isFailure(resultObject)) {
  return resultObject;
}

if (!resultObject.value) {
  return R.toFailure(toErrorMethod());
}
// If the checks passed, we can read from the database and do some modifications
const databaseResult = await readFromDatabase(companyId);
if (R.isFailure(databaseResult)) {
  return databaseResult;
}

const now = new Date().toISOString();
const valueToUpsert : any = databaseResult.value
  ? {
      ...databaseResult.value,
      updatedAt: now,
    }
  : {
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };
// Then we encode the result and we call a query to upsert in the database
const result = await runInTransaction(pool, async (transaction) => {
  const {
    headers,
    normalizedRows,
  } = getSlonikHeadersAndRowsForRecord(
    TABLE_DEFINITIONS,
    [encode(valueToUpsert)]
  );
  await transaction.query(
    buildQuery(headers, normalizedRows)
  );
  return R.toSuccess(undefined);
});

return R.flatMap(result, identity);
```

This can be translated into: 

```ts
const updateUser = async () => asyncPipe(
  await readUser(pool, update.id),
  // If the previous step is empty then we return error. The happy path is not run.
  R.flatMap_(R.fromNullable_(toErrorMethod())), 
  R.asyncFlatMap_(async (databaseValue) => updateUser(pool, databaseValue)),
  // We do not need the result from the previous step.
  R.asyncFlatMap_(() => readFromDatabase(companyId)),
);

async function readUser(pool: DatabasePoolType, id: string): Promise<R.Result<DatabaseError, User | undefined>> {
  const query = sql`SELECT * FROM users WHERE id = '${userId}'`;

  return runInConnection(pool, async (connection) => connection.maybeOne(query))
}

// Notice how this function is written for the happy path: it doesn't have to
// take into account the failure of a previous step
async function updateUser(pool: DatabasePoolType, databaseValue: User): Promise<R.Result<DatabaseError, void>> {
  const now = new Date().toISOString();

  const valueToUpsert = {
    ...databaseValue,
    updatedAt: now,
  }

  const {
    headers,
    normalizedRows,
  } = getSlonikHeadersAndRowsForRecord(
    TABLE_DEFINITIONS,
    [encode(valueToUpsert)]
  );

  return runInTransaction(pool, async (transaction) => {
    await transaction.query(
      buildQuery(headers, normalizedRows)
    );
    return undefined;
  });
}
```

</details>
