/*
* async-generator-callback

* Copyright (C) 2023 Hans Schallmoser

* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// marks end of data flow // stops the iterator
const END = Symbol();
type END = typeof END;

export class AsyncGeneratorCallback<T> implements Disposable, AsyncIterable<T> {
    public async *[Symbol.asyncIterator](): AsyncIterator<T> {
        while (true) {
            if (this.queue.length) {
                const next = this.queue.shift()!;

                if (next === END) {
                    break;
                } else {
                    yield next;
                }
            } else {
                const next = await new Promise<T | END>((resolve) => {
                    this.link = (value) => {
                        this.link = (value) => {
                            this.queue.push(value);
                        };
                        resolve(value);
                    };
                });

                if (next === END) {
                    break;
                } else {
                    yield next;
                }
            }
        }
    }

    private queue: (T | END)[] = [];

    private link: (value: T | END) => void = (value) => {
        this.queue.push(value);
    };

    public call(value: T) {
        this.link(value);
    }

    [Symbol.dispose]() {
        this.link(END);
    }
}
