# `NonEmptyArray`

Often times, it makes no sense to call a function with an empty array. For example, consider this function:

```typescript
async function saveUsers(users: User[]) {
  // ...
};

// users is of type User[]
const users = getUsersFromSomewhere();
await saveUsers(users);
```

How should it behave when the `users` array is empty? Should it throw an error? Do nothing? Return a special outcome (e.g. `nothingToDo`) or an `error` outcome?

If we use a `NonEmptyArray`, we put the burden on the caller to decide what to do if there are no users (most likely, it'll just avoid calling the function altogether). This gets rid of the questions above:

```typescript
async function saveUsers(users: NonEmptyArray<User>) {
  // ...
};

// users is of type User[]
const users = getUsersFromSomewhere();
// Compile error
await saveUsers(users);
```

We can get construct a `NonEmptyArray` with the `fromArray` function:

```typescript
async function saveUsers(users: NonEmptyArray<User>) {
  // ...
};

// users is of type NonEmptyArray<User> | undefined
const users = fromArray(getUsersFromSomewhere());

  // We have to deal with users being an empty array before saving users
if(!users) {
  return;
}

await saveUsers(users);
```
