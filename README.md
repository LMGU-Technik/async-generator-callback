# async-generator-callback

Converts callbacks to AsyncIterables

## Example

```typescript
import { AsyncGeneratorCallback } from "https://deno.land/x/async_generator_callback/mod.ts";

const messages = new AsyncGeneratorCallback<Message>();

socket.addEventListener("msg", (msg) => {
    messages.call(msg);
});

for await (const msg of messages) {
    // do stuff ...
}
```

## API

```typescript
class AsyncGeneratorCallback<T> implements Disposable, AsyncIterable<T> {
    public [Symbol.asyncIterator](): AsyncIterator<T>;
    public call(value: T): void;
    public [Symbol.dispose](); // (*)
}
```

> (*) calling `AsyncGeneratorCallback.[Symbol.dispose]()` terminates the
> generator loop, otherwise the instance of the generator would prevent the
> process form exiting. Make sure to dispose the instance correctly in case you
> get errors like
> `error: Promise resolution is still pending but the event loop has already resolved.`.

## License

Copyright (c) 2023 Hans Schallmoser

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

See `LICENSE` file
