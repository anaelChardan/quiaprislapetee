# Result Cheat Sheet

A reference for the main methods of the `Result` modules.

For further information, please check out [the implementation](./index.ts) and [tests](./__tests__/index.test.ts) as well as the advanced examples in the [README](./README.md).

Outside of the `asyncX` functions, ideally all functions passed to destructors / transformers / chain operations should be pure.

## Table of contents

- [Result Cheat Sheet](#result-cheat-sheet)
  - [Table of contents](#table-of-contents)
  - [Basic glossary](#basic-glossary)
  - [Constructors](#constructors)
    - [`toSuccess()`](#tosuccess)
    - [`toFailure()`](#tofailure)
  - [`fromNullable()`](#fromnullable)
  - [`tryCatch()`](#trycatch)
  - [Destructors](#destructors)
    - [`fold()`](#fold)
  - [Transformations](#transformations)
    - [`map()`](#map)
    - [`mapError()`](#maperror)
    - [`bimap()`](#bimap)
  - [Chaining operations](#chaining-operations)
    - [`flatMap()`](#flatmap)
    - [`flatMapFirst()`](#flatmapfirst)
    - [`flatMapError()`](#flatmaperror)
    - [`bindTo()`](#bindto)
    - [`bind()`](#bind)
    - [`bindAll()`](#bindall)
  - [Other operations](#other-operations)
    - [`sequenceResults()`](#sequenceresults)
    - [`sequence()`](#sequence)

## Basic glossary

- `Result`: an object that can be either a `Success` or a `Failure`
- `Success`: a tagged object containing a value
- `Failure`: a tagged object containing an error

## Constructors

Operations that construct a Result from an initial value.

### `toSuccess()`

Put a value inside a Success:

```ts
const toSuccess = (value: A): Result<never, A>;
```

<details>
  <summary>Basic usage</summary>

```ts
const result = R.toSuccess(5);

// Logs: true
console.log(R.isSuccess(result));
```

</details>

**Main use case**: returning a value we know is successful in a function returning a `Result`.

<details>
  <summary>Particularly useful to return a Success in chaining functions like flatMap</summary>

```ts
function readOneUser(
  userId: string,
): Promise<R.Result<DatabaseError | DecodeError, User | undefined>> {
  // This is a Result<DatabaseError, RawUser>
  const rawUserResult = await db.fetch(userId);

  // In this case, we consider the user's absence as a success, so we lift it in a Success with `toSuccess`
  return R.flatMap((rawUser) => (rawUser ? decodeUser(rawUser) : R.toSuccess(undefined)));
}

function decodeUser(user: RawUser): R.Result<DecodeError, User> {
  // ...
}
```

</details>

### `toFailure()`

Put a value inside a Failure:

```ts
const toFailure = (error: E): Result<E, never>;
```

<details>
  <summary>Example</summary>

```ts
const result = R.toFailure('An error');

// Logs: true
console.log(R.isFailure(result));
```

</details>

**Main use case**: returning a value we know is an error in a function returning a `Result`.

Like `toSuccess`, particularly useful in chaining functions like `flatMap()`.

## `fromNullable()`

Make a Result from a default error and a nullable value (a value that could be `null` or `undefined`).

```ts
const fromNullable = (value: A, error: E): Result<E, NonNullable<A>>;
```

If the value is `null` or `undefined`, the error will be put in a Failure, otherwise the non-null value will be put in a Success

<details>
  <summary>Basic usage</summary>

```ts
const value1: number | undefined = 4;

// result1 has type R.Result<"value is nullable 😢", number>;
const result1 = R.fromNullable(value1, 'value is nullable 😢');

// Logs: true ✅
console.log(R.isSuccess(result1));

const value2: number | undefined = undefined;

// result2 has type R.Result<"value is nullable 😢", number>;
const result2 = R.fromNullable(value2, 'value is nullable 😢');

// Logs: false ❌
console.log(R.isSuccess(result2));
```

</details>

**Main use case**: easily construct a Result in cases where nullability is considered a failure (e.g. the happy path cannot go on without this thing being present).

## `tryCatch()`

Make a Result from a function that may throw.

```ts
const tryCatch = <E, A>(
  f: () => A,
  // Will be called if the function throws
  onThrow: (e: unknown) => E
): Result<E, A>
```

<details>
  <summary>Basic usage</summary>

```ts
const divide(dividend: number, divisor: number): number {
  return dividend / divisor;
}

// All goes well
// Logs: {_tag: "success", value: 5}
console.log(R.tryCatch(() => divide(10, 2), () => ({tag: "divisionError"})));

// The function throws
// Logs: {_tag: "failure", error: "divisionError"}
console.log(R.tryCatch(() => divide(10, 0), () => ({tag: "divisionError"})));
```

</details>

**Main use case**: interact with code that does not use the Result type and may throw.

ℹ️ Note: there is an async equivalent for functions returning promises: `asyncTryCatch()`

## Destructors

Operations that get the value/error out of the Result

### `fold()`

Takes two functions (one for the Failure case, one for the Success case) and executes the proper one on the Result that is passed to it.

```ts
const fold = <E, A, NewE, NewA>(
  result: R.Result<E, A>,
  onFailure: (e: E) => NewE,
  onSuccess: (a: A) => NewA
): NewA | NewE;
```

<details>
  <summary>Basic usage</summary>

```ts
const initialSuccess: R.Result<'some error', number> = R.toSuccess(4);

const successFinalValue = R.fold(
  initialSuccess,
  (error) => error,
  (value) => value,
);

// Logs: 5
console.log(successFinalValue);

const initialFailure: R.Result<'some error', number> = R.toFailure('some error');

const failureFinalValue = R.fold(
  initialSuccess,
  (error) => error,
  (value) => value,
);

// Logs: "some error"
console.log(failureFinalValue);
```

</details>

**Main use case**: pop out of the Result at the end of your computation, usually to handle errors, return a final value, or even easily transform a Result into an outcome.

## Transformations

Operations that transform what is inside of the Result

### `map()`

Given a Result, apply a transformation to its value if it is a Success.

```ts
// Transforming the value from type A to type B
const map = <E, A, B>(
  result: R.Result<E, A>,
  transformationFunction: (a: A) => B
): R.Result<E, B>;
```

<details>
  <summary>Basic usage</summary>

```ts
function double(num: number): number {
  return num * 2;
}

const initialSuccess = R.toSuccess(5);
const initialFailure = R.toFailure('some error');

// Here, the function is applied to the value
// Logs: {_tag: "success", value: 10}
console.log(R.map(initialSuccess, double));

// Here, since we have a Failure, the double function won't be called
// Logs: {_tag: "failure", error: "some error"}
console.log(R.map(initialFailure, double));
```

</details>

**Main use case**: write your transformation logic for the happy path, and apply it to a Result directly.

### `mapError()`

Given a Result, apply a transformation to its error if it is a Failure.

```ts
// Transforming the error from type E1 to type E2
const mapError = <E1, E2, A>(result: R.Result<E1, A>, transformationFunction: (e: E1) => E2): R.Result<E2, A>;
```

<details>
  <summary>Basic usage</summary>

```ts
function translateError(errorString: string, userLanguage: 'en' | 'fr' | 'de'): string {
  // ... logic which will turn "some error" into "une erreur" in French
}

const userLanguage = 'fr';
const initialSuccess = R.toSuccess(5);
const initialFailure = R.toFailure('some error');

// Here, the function is ignored
// Logs: {_tag: "success", value: 5}
console.log(R.mapError(initialSuccess, (rawError) => translateError(rawError, userLanguage)));

// Here, the function is called to transform the error
// Logs: {_tag: "failure", error: "une erreur"}
console.log(R.mapError(initialFailure, (rawError) => translateError(rawError, userLanguage)));
```

</details>

**Main use case**: transform / wrap / operate on errors (e.g. wrap an array of errors into one, ...)

### `bimap()`

Given a Result, applies a transformation to either its value if it's a Success, or its error if it is a Failure.
Basically, does what `map()` and `mapError()` do, but in one step.

```ts
// Transforming the value from type A to type B
const bimap = <E1, E2, A, B>(
  result: R.Result<E1, A>,
  transformSuccess: (value: A) => B,
  transformError: (error: E1) => E2
): R.Result<E2, B>;
```

<details>
  <summary>Basic usage</summary>

```ts
function double(num: number): number {
  return num * 2;
}
function translateError(errorString: string, userLanguage: 'en' | 'fr' | 'de'): string {
  // ... logic which will turn "some error" into "une erreur" in French
}

const userLanguage = 'fr';
const initialSuccess = R.toSuccess(5);
const initialFailure = R.toFailure('some error');

// Here, the `double` function is called to transform the value
// Logs: {_tag: "success", value: 10}
console.log(R.bimap(initialSuccess, double, (rawError) => translateError(rawError, userLanguage)));

// Here, the `translateError` function is called to transform the error
// Logs: {_tag: "failure", error: "une erreur"}
console.log(R.bimap(initialFailure, double, (rawError) => translateError(rawError, userLanguage)));
```

</details>

**Main use case**: simplify a step of the logic where both the Success and the Failure get transformed (those are usually pretty rare).

## Chaining operations

Operations that allow chaining multiple functions returning a Result, in order to write the happy path and error recovery on one side, and error handling on the other.

These operations have `asyncX` equivalents. No specific try/catch logic will be done it the case the Promise rejects!

### `flatMap()`

Chain a potentially failing synchronous operation (returning a Result) if the given initial Result is a Success.

```ts
const flatMap = <E1, E2, A, B>(
  firstResult: Result<E1, A>,
  f: (a: A) => Result<E2, B>
): Result<E1 | E2, B>;
```

<details>
  <summary>Basic usage</summary>

```ts
function divide(dividend: number, divisor: number): R.Result<'Division by 0', number> {
  if (divisor === 0) {
    return R.toFailure('Division by 0');
  }

  return R.toSuccess(dividend / divisor);
}

const initialSuccess = R.toSuccess(10);
const initialFailure = R.toFailure('some error');

// Here, the `divide` function is called to transform the value
// Logs: {_tag: "success", value: 5}
console.log(R.flatMap(initialSuccess, (num) => divide(num, 2)));

// Here, the `divide` function fails, so we get the "Division by 0" error
// Logs: {_tag: "failure", error: "Division by 0"}
console.log(R.flatMap(initialSuccess, (num) => divide(num, 0)));

// Here, the `divide` function is not called, since we start with a Failure
// Logs: {_tag: "failure", error: "some error"}
console.log(R.flatMap(initialFailure, (num) => divide(num, 2)));

// Here, the `divide` function is not called, since we start with a Failure
// Hence, we keep the first result, even if divide() would have returned a different one
// Logs: {_tag: "failure", error: "some error"}
console.log(R.flatMap(initialFailure, (num) => divide(num, 0)));
```

</details>

**Main use case**: write logic that may fail for the happy path without having to worry about checking if the previous step succeeded or not.

### `flatMapFirst()`

Chain a potentially failing synchronous operation (returning a Result) if the given initial Result is a Success, keeping the first Success' value.
If the operation fails, the Result will be a Failure.

```ts
const flatMapFirst = <E1, E2, A, B>(
  firstResult: Result<E1, A>,
  f: (a: A) => Result<E2, B>
): Result<E1 | E2, A>;
```

<details>
  <summary>Basic usage</summary>

```ts
function writeToFile(content: string): R.Result<"Nothing to write", void> {
  if(content.length < 1) {
    return R.toFailure("Nothing to write");
  }

  writeFileSync("myFile.txt", content);

  return R.toSuccess(undefined);
}

const initialSuccess = R.toSuccess(10);
const initialSuccessWithEmptyString = R.toSuccess("");
const initialFailure = R.toFailure("some error");

// Here, the `writeToFile` function is called ("10" will be written to the file),
// and the initial Success's value is passed through
// Logs: {_tag: "success", value: 10}
console.log(R.flatMapFirst(initialSuccess, (num) => writeToFile(`${num}`)));

// Here, the `writeToFile` function fails, so we get a "Nothing to write" error
// Logs: {_tag: "failure", error: "Nothing to write"}
console.log(R.flatMapFirst(initialSuccessWithEmptyString, (num) => writeToFile(`${num}`)));

// Here, the `writeToFile` function is not called, since we start with a Failure
// Logs: {_tag: "failure", error: "some error"}
console.log(R.flatMapFirst(initialFailure, ((num) => writeToFile(`${num}`)));
```

</details>

**Main use case**:

- trigger a effect on the side, e.g. saving state to the DB, but keep on passing the original data

### `flatMapError()`

Chain a potentially failing synchronous operation (returning a Result) if the given initial Result is a Failure.

```ts
const flatMapError = <E1, E2, A, B>(
  result: Result<E1, A>,
  f: (e: E1) => Result<E2, B>
): Result<E2, A | B>;
```

<details>
  <summary>Basic usage</summary>

```ts
type NameTooLongError = { tag: 'nameTooLong'; name: string };
type NameTooShortError = { tag: 'nameTooShort'; name: string };

// If the name is too long, we'll just shorten it
function recoverFromInvalidName(
  error: NameTooLongError | NameTooShortError,
): R.Result<'Oh no 😦', string> {
  if (error.tag === 'nameTooLong') {
    return error.name.subString(0, 10);
  }

  return error;
}

const initialSuccess = R.toSuccess('Master Yoda');
const initialNameTooLongFailure = R.toFailure({
  tag: 'nameTooLong',
  name: 'Obi-Wan Kenobi',
});
const initialNameTooShortError = R.toFailure({
  tag: 'nameTooShort',
  name: 'Ah',
});

// Here, the `recoverFromInvalidName` function is not called
// Logs: {_tag: "success", value: "Master Yoda"}
console.log(R.flatMapError(initialSuccess, recoverFromInvalidName));

// Here, the `recoverFromInvalidName` function is called, and we recover
// Logs: {_tag: "success", value: "Obi-Wan Ke"}
console.log(R.flatMapError(initialNameTooLongFailure, recoverFromInvalidName));

// Here, the `initialNameTooShortError` function is called, and we get the new error
// Logs: {_tag: "failure", error: "Oh no 😦"}
console.log(R.flatMapError(initialNameTooLongFailure, recoverFromInvalidName));
```

</details>

**Main use cases**:

- Recover from a Failure
- Chain some operation in case of failure (e.g. mark export as failed)

### `bindTo()`

If the given Result is a Success, wrap its value in an object and assign the value to the given property name.

```ts
const bindTo = <E, A, N extends string>(
  result: Result<E, A>,
  propertyName: N
): Result<E, { [K in N]: A }>;
```

<details>
  <summary>Basic usage</summary>

```ts
const initialResult = R.toSuccess(5);
const boundResult = R.bindTo(initialResult, 'myResult');

// Outputs: { _tag: "success", value: { myResult: 5 } }
console.log(boundResult);
```

</details>

**Main use case**: Prepare a value for accumulation inside an object.
Works well in combination with `bind`.

### `bind()`

If the given Result is a Success, runs the given operation, and if successful add the value at the given property name.
Think of it as a `flatMap()` that puts the operation's value in the initial value at the given property.

```ts
const bind = <E, A, E2, B, N extends string>(
  r: Result<E, A>,
  propertyName: Exclude<N, keyof A>,
  f: (a: A) => Result<E2, B>
): Result<E | E2, { [K in keyof A | N]: K extends keyof A ? A[K] : B }>;
```

<details>
  <summary>Basic usage</summary>

Scenario: we have an `amount` and a `taxRateId`, and we want to fetch the tax rate by its id and apply it to the amount when found.

```ts
// 🏗 Setup types and functions
type TaxRate = {
  id: string;
  rateValue: number;
};

const fetchTaxRate = (taxRateId: string): R.Result<TaxRateFetchError, TaxRate> => {}; // ...
const applyTaxRate = ({ amount, taxRate }: { amount: number; taxRate: TaxRate }): number =>
  amount * taxRate.rateValue;

// 🤖 Doing the operation
const initialResult = R.toSuccess({ amount: 5, taxRateId: 'taxRate1234' });

const taxRateFetchedResult = R.bind(initialResult, 'taxRate', ({ taxRateId }) =>
  fetchTaxRate(taxRateId),
);

// If `fetchTaxRate` succeeded, outputs: { _tag: "success", value: { myResult: 5 } }
console.log(taxRateFetchedResult);

const taxAmountResult = R.map(taxRateFetchedResult, applyTaxRate);
```

Without `bind`, we'd have to do something like this:

```ts
// Note: same setup functions as before
// 🤖 Doing the operation
const initialResult = R.toSuccess({ amount: 5, taxRateId: 'taxRate1234' });

// 👇 This is the work that `bind` saves us from doing
const taxRateFetchedResult = R.flatMap(initialResult, (initialValue) => {
  const fetchResult = fetchTaxRate(initialValue.taxRateId);

  return R.map(fetchResult, (taxRate) => ({ ...initialValue, taxRate }));
});

// If `fetchTaxRate` succeeded, outputs: { _tag: "success", value: { myResult: 5 } }
console.log(taxRateFetchedResult);

const taxAmountResult = R.map(taxRateFetchedResult, applyTaxRate);
```

Naturally, this meshes very well with `pipe()`:

```ts
// Note: same setup functions as before
// 🤖 Doing the operation
const finalResult = pipe(
  R.toSuccess({ amount: 5, taxRateId: 'taxRate1234' }),
  R.bind_('taxRate', ({ taxRateId }) => fetchTaxRate(taxRateId)),
  R.map_(applyTaxRate),
);
```

</details>

**Main use case**: Accumulate the return value of an operation in the given value.
Particularly helpful when fetching several things in sequence, with each step being able to access all the context from the previous steps.

**⚠️ Disclaimer:** sometimes inference breaks when using `pipe` when a given operation doesn't use part of the payload that is given to it.
This can easily be solved by using an anonymous function like so:

```ts
const result = pipe(
  R.toSuccess({ thing }),
  // `operation1` doesn't use `thing`
  R.bind_('result1', operation1),
  // ❌ TS error, can't find `thing` anymore
  R.bind_('result2', operation2),
);

// Fix with:
const result = pipe(
  R.toSuccess({ thing }),
  // `operation1` doesn't use `thing`
  R.bind_('result1', (args) => operation1(args)),
  // ✅ all good now
  R.bind_('result2', operation2),
);
```

### `bindAll()`

If the given Result is a Success, runs the given operation, and if successful add the value at the given property name.
Similar to `bind`, but spreads all of the properties of the operation's value instead of assigning it to a single property.
Think of it as a `flatMap()` that spreads the operation's value in the initial value.

```ts
const bindAll = <E, A, E2, B extends { [key: string]: any }>(
  r: Result<E, A>,
  f: (a: A) => Result<E2, B>
): Result<E | E2, A & B>
```

<details>
  <summary>Basic usage</summary>

Scenario: we want to fetch the data for an accounting export.
First, we'll want to fetch the export's state,

```ts
// 🏗 Setup functions
type ExportLookups = {
  payableLookup: PayableLookup[];
  settlementLookup: SettlementLookup[];
};

const fetchExportLookup = ({
  exportId,
}: {
  exportId: string;
}): R.Result<ExportPayloadFetchError, ExportLookups> => {}; //...
const fetchExportPayload = (parameters: {
  exportId: string;
  exportLookups: ExportLookups;
}): R.Result<DataFetchError, { payables: Payable[]; settlements: Settlement[] }> => {}; // ...

// 🤖 Doing the operation
// It's convenient to lift the initial data in a Success
const initialResult = R.toSuccess({ exportId: '1234' });

const lookupResult = R.bind(initialResult, 'exportLookups', fetchExportLookup);

const payloadResult = R.bindAll(lookupResult, fetchExportPayload);

// With pipe()

const result = pipe(
  R.toSuccess({ exportId: '1234' }),
  R.bind_('exportLookups', fetchExportLookup),
  R.bindAll_(fetchExportPayload),
);
```

</details>

**Main use case**: Accumulate the return value of an operation in the given value.
Particularly helpful when fetching several things in sequence, with each step being able to access all the context from the previous steps.

## Other operations

### `sequenceResults()`

Transform an array of Results into a single Result. If at least 1 Failure is present, return a Failure with an array of all the Failure errors, else return a Success with an array of all the Success values.

```ts
const sequenceResults<E, A>(results: R.Result<E, A>[]): R.Result<
  NEA.NonEmptyArray<E>,
  A[]
>;
```

<details>
  <summary>Basic usage</summary>

```ts
const success1 = R.toSuccess(10);
const success2 = R.toSuccess('A nice success');
const failure1 = R.toFailure('Oh no 😦');
const failure2 = R.toFailure('🍎');

// All succeeded, we get a Success
// Logs: {_tag: "success", value: [10, "A nice success"]}
console.log(R.sequenceResults([success1, success2]));

// One failed, we get a Failure
// Logs: {_tag: "failure", error: ["Oh no 😦"]}
console.log(R.sequenceResults([success1, failure1, success2]));

// At least one failed, we get a Failure
// Logs: {_tag: "failure", error: ["🍎", "Oh no 😦"]}
console.log(R.sequenceResults([failure2, success1, failure1, success2]));
```

</details>

**Main use cases**:

- Get one Result after running several operations that can fail in parallel

### `sequence()`

Transform an array of Results into a single Result. If at least 1 Failure is present, combines all the errors with the given function, else return a Success with an array of all the Success values.

```ts
const sequence<E, A>(results: R.Result<E, A>[], combineErrors: (e1: E, e2: E) => E): R.Result<
  E,
  A[]
>;
```

<details>
  <summary>Basic usage</summary>

```ts
const success1 = R.toSuccess(10);
const success2 = R.toSuccess('A nice success');
const failure1 = R.toFailure('Oh no 😦');
const failure2 = R.toFailure('🍎');
const combineTextErrors = (e1: string, e2: string) => [e1, e2].join(', ');

// All succeeded, we get a Success
// Logs: {_tag: "success", value: [10, "A nice success"]}
console.log(R.sequence([success1, success2], combineTextErrors));

// One failed, we get a Failure
// Logs: {_tag: "failure", error: "Oh no 😦"}
console.log(R.sequence([success1, failure1, success2], combineTextErrors));

// At least one failed, we get one Failure with combined errors
// Logs: {_tag: "failure", error: "🍎, Oh no 😦"}
console.log(R.sequence([failure2, success1, failure1, success2], combineTextErrors));
```

</details>

**Main use cases**:

- Get one Result after running several operations that can fail in parallel and which all have error types that can combine. Typically used for decoding n things with `Dec.combineDecodeErrors`
