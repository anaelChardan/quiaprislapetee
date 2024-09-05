# Decoding

This module exposes several helpers to work with decoding & Result.
The most important aspects of it are:
* The `DecodeError` definition
* `decodeToResult`: run a zod schema on some data and get a `Result`
* `sequenceDecoders`: run decoding logic on an array of items and get only one `Result`

As of writing, these are all defined in relation to the `zod` library, which is our go-to library for decoding.
