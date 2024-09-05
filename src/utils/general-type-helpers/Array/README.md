# Array

🚧 Work in progress

Sometimes basic array functions in TS have some limitations:
* in some cases, `filter` does not allow for a refinement to be applied (`(x: X | Y): X is Y => ...` functions)
* using them in `pipe()` is awkward, requiring anonymous functions

This module proposes improved versions of those array functions when needed, and pipeable versions of array functions.
