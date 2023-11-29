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

import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { AsyncGeneratorCallback } from "./mod.ts";

function* testData(limit: number) {
    let i = 0;
    while (i < limit) yield i++;
}

function asyncTest(limit: number) {
    const test = testData(limit);
    const ref = testData(limit);
    function check(data: number) {
        const refVal = ref.next();
        if (refVal.done) {
            if (!isNaN(data)) {
                throw new Error(`unexpected end of ref data: got ${data}`);
            }
        } else {
            assertEquals(data, refVal.value);
        }
    }
    return [test, check] as const;
}

Deno.test("call before loop setup", async () => {
    const [test, check] = asyncTest(10);
    using agc = new AsyncGeneratorCallback<number>();
    for (const i of test) {
        agc.call(i);
    }
    setTimeout(() => {
        check(NaN); // throw error if remaining items
        agc[Symbol.dispose](); // let the promise exit
    }, 0);
    for await (const i of agc) {
        check(i);
    }
});

Deno.test("call after loop setup", async () => {
    const [test, check] = asyncTest(10);
    using agc = new AsyncGeneratorCallback<number>();

    setTimeout(() => {
        for (const i of test) {
            agc.call(i);
        }
        setTimeout(() => {
            check(NaN); // throw error if remaining items
            agc[Symbol.dispose](); // let the promise exit
        }, 0);
    }, 0);

    for await (const i of agc) {
        check(i);
    }
});

Deno.test("call from loop", async () => {
    const [test, check] = asyncTest(10);
    using agc = new AsyncGeneratorCallback<number>();

    setTimeout(() => {
        const next = test.next();
        if (!next.done) {
            agc.call(next.value); // start loop
        }

        setTimeout(() => {
            check(NaN); // throw error if remaining items
            agc[Symbol.dispose](); // let the promise exit
        }, 0);
    }, 0);

    for await (const i of agc) {
        check(i);

        const next = test.next();
        if (!next.done) {
            agc.call(next.value);
        }
    }
});
