# `Result`

## Description

The `Result` type represents the result of an operation that can fail. It has two variants, `Success` and `Failure`. Here are some examples where it can be used:
* an executed Promise, being a `Success` if the Promise was resolved and an `Failure` if the Promise was rejected.
* the return value of a validation function, being `Success` with the validated value if the validation passed and `Failure` if it failed

## Basic usage

Here's an example of some validation logic relating to a User type

```ts
import {result as R} from "@dev-spendesk/general-type-helpers";

type User = { name: string; age: number };

function validateAge(user: User): R.Result<"Age is invalid", User> {
  if (user.age < 18) {
    return R.toFailure("Age is invalid");
  }

  return R.toSuccess(user);
}

function validateName(user: User): R.Result<"Name is invalid", User> {
  if (user.name.length < 1) {
    return R.toFailure("Name is invalid");
  }

  return R.toSuccess(user);
}

// Apply all validation rules in sequence
// The value returned by this function is R.Result<"Age is invalid" | "Name is invalid", User>
function validateUser(user: User) {
  // First, validate the age
  const ageValidationResult = validateAge(user);
  // Then apply the validation to the result (only if the age validation was a success)
  const nameValidationResult = R.flatMap(ageValidationResult, validateName);

  return nameValidationResult;
}

// The equivalent with pipe
function validateUser(user: User) {
  return pipe(
    user,
    // First, validate the age
    validateAge,
    // Then apply the validation to the result (only if the age validation was a success)
    R.flatMap_(validateName)
  );
}
```

We can run and use this validation result as we would with the outcome pattern:

```ts
type ValidationError = {
  kind: "validationError";
  message: string;
};

async function validateAndSaveUser(
  user: User
): Promise<ValidationError | UserSaveResult> {
  const validationResult = validateUser(user);

  // There's also an "isFailure" helper
  if (validationResult._tag === "failure") {
    return {
      kind: "validationError",
      message: validationResult.error,
    };
  }

  // Do whatever we want with the user
  return saveToDb(user);
}

async function saveToDb(user: User): UserSaveResult {
  // ...
}
```

## Advanced scenario 1: get error handling out of the way with `flatMap`

Let's say we have to write a new `updateUserEmail` function in a `UserService`, which needs to do the following:
1. Check that the new email is a valid email string, replacing special characters if they are present (for the sake of the example, we'll call that "sanitizing")
2. If it is, check with an external validation system that it isn't blacklisted
3. If it isn't blacklisted, save the new email
4. If the save step was successful, send an email to both the new and old email address

Of course, if any of these steps goes wrong, we want to log the error.

Here are the definitions of the different services / functions we'll need:

```ts
// The Success branch will return the passed email string with special characters replaced
function validateAndSanitizeUserEmail(
  emailAddress: string
): R.Result<InvalidEmailError, string>;

type BlacklistService = {
  // This function won't return the email string, just an empty Success if the email
  // isn't blacklisted
  checkEmail: (emailAddress: string) => Promise<
    R.Result<
      // Several things can go wrong here
      | BlacklistServiceNetworkError
      | BlacklistServiceRateLimitedError
      // If the email address is blacklisted, this is the error we'll get,
      // defined below
      | EmailAddressIsBlacklistedError,
      void
    >
  >;
};

type EmailAddressIsBlacklistedError = {
  tag: "emailAddressIsBlacklisted",
  emailAddress: string;
}

type UserRepository = {
  readUserById: (
    userId: string
  ) => Promise<R.Result<DatabaseError | UserNotFoundError, User>>;
  // Here too, several things can go wrong with the update
  updateUserEmail: (
    userId: string,
    newEmailAddress: string
  ) => Promise<R.Result<DatabaseError | UserNotFoundError, void>>;
};

type EmailService = {
  sendUpdateEmail: (
    oldEmailAddress: string,
    newEmailAddress: string
  ) => Promise<R.Result<EmailServiceUnknownError, void>>;
};

type UserService = {
  // Our function needs to have this signature
  // Here, we arbitrarily decide not to return any trace of the result,
  // expecting this function to log potential errors
  updateUserEmail: (userId: string) => Promise<void>;
};
```

Here's how we would write this function treating Result like a simple outcome, if we wanted to be 100% safe:

```ts
async function updateUserEmail(
    userId: string,
    rawNewEmailAddress: string
  ): Promise<void> {
  // 1. validate the email string
  const validateResult = validateUserEmail(rawNewEmailAddress);

  // This is the equivalent of if (result.outcome !== "valid")
  if (R.isFailure(validateResult)) {
    logger.error("An error occurred when updating the user", {
      error: validateResult.error,
    });

    return;
  }

  const sanitizedNewEmailAddress = validateResult.value;

  // 2. validate with the BlacklistService
  const blacklistCheckResult = await blacklistService.checkEmail(
    sanitizedNewEmailAddress
  );

  if (R.isFailure(blacklistCheckResult)) {
    logger.error("An error occurred when updating the user", {
      error: blacklistCheckResult.error,
    });

    return;
  }

  // 3a. fetching the user to get the old email
  const userFetchResult = await userRepository.readUserById(userId);

  if (R.isFailure(userFetchResult)) {
    logger.error("An error occurred when updating the user", {
      error: userFetchResult.error,
    });

    return;
  }

  const oldUserVersion = userFetchResult.value;

  // 3b. updating the user email
  const userUpdateResult = await userRepository.updateUserEmail(
    userId,
    sanitizedNewEmailAddress
  );

  if (R.isFailure(userUpdateResult)) {
    logger.error("An error occurred when updating the user", {
      error: userUpdateResult.error,
    });

    return;
  }

  // 4. sending the email notification
  const finalResult = await emailService.sendUpdateEmail(
    oldUserVersion.email,
    sanitizedNewEmailAddress
  );

  if (R.isFailure(finalResult)) {
    logger.error("An error occurred when updating the user", {
      error: finalResult.error,
    });
  }
}
```

It's ok, but there are some downsides:
* The error handling requires us to return early and obscures the flow of the function
* There are many intermediary variables, most of which are discarded right away
* Subtle bugs can happen when misusing intermediary variables
* Refactoring could prove difficult, e.g. if we mutated variables along the flow

Here's how we could `updateUserEmail` leveraging `Result`'s tools:

```ts
async function updateUserEmail(
  userId: string,
  rawNewEmailAddress: string
): Promise<void> {
  // 1. validate the email string
  const validateResult = validateUserEmail(rawNewEmailAddress);

  // 2. validate with the BlacklistService
  const blacklistCheckResult = await R.asyncFlatMap(
    validateResult,
    async (sanitizedNewEmailAddress) => {
      const result = await blacklistService.checkEmail(
        sanitizedNewEmailAddress
      );

      // We want to keep the sanitized email address, since `checkEmail` returns `void`
      return R.map(result, () => sanitizedNewEmailAddress);
    }
  );

  // 3a. fetching the user to get the old email
  const userFetchResult = await R.asyncFlatMap(
    blacklistCheckResult,
    async (sanitizedNewEmailAddress) => {
      const result = await userRepository.readUserById(userId);

      // We want to keep the sanitized email address, alongside the newly fetched user
      return R.map(result, (userWithOldEmail) => ({
        userWithOldEmail,
        sanitizedNewEmailAddress,
      }));
    }
  );

  // 3b. updating the user email
  const userUpdateResult = await R.asyncFlatMap(
    userFetchResult,
    async ({ userWithOldEmail, sanitizedNewEmailAddress }) => {
      const result = await userRepository.updateUserEmail(
        userId,
        sanitizedNewEmailAddress
      );

      // We only need the old and new emails from now on
      return R.map(result, () => ({
        oldEmail: userWithOldEmail.email,
        newEmail: sanitizedNewEmailAddress,
      }));
    }
  );

  // 4. sending the email notification
  const finalResult = await R.asyncFlatMap(
    userUpdateResult,
    async ({ oldEmail, newEmail }) => {
      return emailService.sendUpdateEmail(oldEmail, newEmail);
    }
  );

  if (R.isFailure(finalResult)) {
    logger.error("An error occurred when updating the user", {
      error: finalResult.error,
    });
  }
}
```

Using `asyncPipe`, we could get entirely rid of intermediary variables:

```ts
async function updateUserEmail(
  userId: string,
  rawNewEmailAddress: string
): Promise<void> {
  return asyncPipe(
    rawNewEmailAddress,
    // 1. validate the email string
    validateUserEmail,
    // 2. validate with the BlacklistService
    R.asyncFlatMap_(async (sanitizedNewEmailAddress) => {
      const result = await blacklistService.checkEmail(
        sanitizedNewEmailAddress
      );

      // We want to keep the sanitized email address, since `checkEmail` returns `void`
      return R.map(result, () => sanitizedNewEmailAddress);
    }),

    // 3a. fetching the user to get the old email
    R.asyncFlatMap_(async (sanitizedNewEmailAddress) => {
      const result = await userRepository.readUserById(userId);

      // We want to keep the sanitized email address, alongside the newly fetched user
      return R.map(result, (userWithOldEmail) => ({
        userWithOldEmail,
        sanitizedNewEmailAddress,
      }));
    }),

    // 3b. updating the user email
    R.asyncFlatMap_(async ({ userWithOldEmail, sanitizedNewEmailAddress }) => {
      const result = await userRepository.updateUserEmail(
        userId,
        sanitizedNewEmailAddress
      );

      // We only need the old and new emails from now on
      return R.map(result, () => ({
        oldEmail: userWithOldEmail.email,
        newEmail: sanitizedNewEmailAddress,
      }));
    }),

    // 4. sending the email notification
    R.asyncFlatMap_(async ({ oldEmail, newEmail }) => {
      return emailService.sendUpdateEmail(oldEmail, newEmail);
    }),

    // 5. Log error if any
    R.fold_(
      (error) =>
        logger.error("An error occurred when updating the user", {
          error,
        }),
      () => undefined
    )
  );
}
```

### Advanced scenario 2: recovering from errors

Building on scenario 1, let's say we want to update our flow to be as follows:
1. Check that the new email is a valid email string, replacing special characters if they are present (for the sake of the example, we'll call that "sanitizing")
2. If it is, check with an external validation system that it isn't blacklisted
3. If it isn't blacklisted, save the new email
4. If the save step was successful, send an email to both the new and old email address
5. ✨ New step: if it is blacklisted, send an email to the administrator to let them know about the blacklist issue. We don't want to log in this case!

Let's adapt the definition of our EmailService to send this new notification email:

```ts
type EmailService = {
  // ...
  sendBlacklistedEmailNotification: (
    blacklistedEmail: string
  ) => Promise<R.Result<EmailServiceUnknownError, void>>;
};
```

Here's the updated implementation:

```ts
async function updateUserEmail(
  userId: string,
  rawNewEmailAddress: string
): Promise<void> {
  // 1. validate the email string
  const validateResult = validateUserEmail(rawNewEmailAddress);

  // 2. validate with the BlacklistService
  const blacklistCheckResult = await R.asyncFlatMap(
    validateResult,
    async (sanitizedNewEmailAddress) => {
      const result = await blacklistService.checkEmail(
        sanitizedNewEmailAddress
      );

      // We want to keep the sanitized email address, since `checkEmail` returns `void`
      return R.map(result, () => sanitizedNewEmailAddress);
    }
  );

  // 3a. fetching the user to get the old email
  const userFetchResult = await R.asyncFlatMap(
    blacklistCheckResult,
    async (sanitizedNewEmailAddress) => {
      const result = await userRepository.readUserById(userId);

      // We want to keep the sanitized email address, alongside the newly fetched user
      return R.map(result, (userWithOldEmail) => ({
        userWithOldEmail,
        sanitizedNewEmailAddress,
      }));
    }
  );

  // 3b. updating the user email
  const userUpdateResult = await R.asyncFlatMap(
    userFetchResult,
    async ({ userWithOldEmail, sanitizedNewEmailAddress }) => {
      const result = await userRepository.updateUserEmail(
        userId,
        sanitizedNewEmailAddress
      );

      // We only need the old and new emails from now on
      return R.map(result, () => ({
        oldEmail: userWithOldEmail.email,
        newEmail: sanitizedNewEmailAddress,
      }));
    }
  );

  // 4. sending the email notification
  const finalResult = await R.asyncFlatMap(
    userUpdateResult,
    async ({ oldEmail, newEmail }) => {
      return emailService.sendUpdateEmail(oldEmail, newEmail);
    }
  );

  // ✨ The recovery happens here
  // 5. notifying the administrator if the blacklisting failed
  const finalResult = await R.asyncFlatMapError(
    userUpdateResult,
    async (error) => {
      // If this is the blacklist error, we want to
      if (error.tag === "emailAddressIsBlacklisted") {
        // This could potentially fail, in which case we will have a Failure in finalResult
        // Otherwise, we will recover and finalResult will be a Success
        return emailService.sendBlacklistedEmailNotification(
          error.emailAddress
        );
      }

      return R.toFailure(error);
    }
  );

  if (R.isFailure(finalResult)) {
    logger.error("An error occurred when updating the user", {
      error: finalResult.error,
    });
  }
}
```

You can also use `unwrapOrThrow` to turn an error result into a thrown error. This is useful if the caller comes from a context that expects throws when unexpected errors happens, such as HTTP handlers that turn throws into error responses, or message handlers that turn throws into requeues.

```ts
const updatedUser = await R.unwrapOrThrow(finalResult);
```

Or, providing your own context:

```ts
const updatedUser = await R.unwrapOrThrow(finalResult, (error) =>
  new Oops("An error occurred when updating the user", {
    error,
  })
);
```