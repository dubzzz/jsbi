// Copyright 2018 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the “License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// <https://apache.org/licenses/LICENSE-2.0>.
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an “AS IS” BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import JSBI from '../jsbi.mjs';
const JSBigInt = JSBI.BigInt;

import fc from 'fast-check';

const bigUIntArbitrary = fc.array(fc.nat(9).map(n => n.toString()), 1, 1000)
        .map(f => { // trim initial zeros
            const firstNonZero = f.findIndex(v => v !== 0);
            return firstNonZero === -1 ? [0] : f.slice(firstNonZero);
        })
        .map(f => JSBigInt(f.join('')));

const bigIntArbitrary = fc.tuple(fc.boolean(), bigUIntArbitrary).map(([sign, v]) => sign ? v : JSBigInt('-' + v.toString()));

// For any n, valid integer value
// The big int representation of n should be equal to n

fc.assert(
    fc.property(
        fc.integer(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
        (n) => BigInt(n) == n
    )
);

// For any a and b, big integers with a not null
// a + b should equal b + a

fc.assert(
    fc.property(
        bigIntArbitrary.filter(a => !a.equal(0)),
        bigIntArbitrary,
        (a, b) => a.add(b).equal(b.add(a))
    )
);

// For any a and b, big integers
// a * b should equal b * a

fc.assert(
    fc.property(
        bigIntArbitrary,
        bigIntArbitrary,
        (a, b) => a.multiply(b).equal(b.multiply(a))
    )
);

// For any a and b, big integers
// a | b should equal b | a

fc.assert(
    fc.property(
        bigIntArbitrary,
        bigIntArbitrary,
        (a, b) => a.bitwiseOr(b).equal(b.bitwiseOr(a))
    )
);

// For any a and b, big integers
// a ^ b should equal b ^ a

fc.assert(
    fc.property(
        bigIntArbitrary,
        bigIntArbitrary,
        (a, b) => a.bitwiseXor(b).equal(b.bitwiseXor(a))
    )
);

// For any a and b, big integers
// a & b should equal b & a

fc.assert(
    fc.property(
        bigIntArbitrary,
        bigIntArbitrary,
        (a, b) => a.bitwiseAnd(b).equal(b.bitwiseAnd(a))
    )
);

// For any a and b, big integers
// ( a ^ b ) ^ a should equal a

fc.assert(
    fc.property(
        bigIntArbitrary,
        bigIntArbitrary,
        (a, b) => a.bitwiseXor(b).bitwiseXor(a).equal(b)
    )
);

// For any a and b, big integers with a not null
// ( a * b ) / a should equal b

fc.assert(
    fc.property(
        bigIntArbitrary.filter(a => a != 0),
        bigIntArbitrary,
        (a, b) => a.multiply(b).divide(a).equal(b)
    )
);

// For any a and b, big integers with a not null
// ( a * b ) % a should equal 0

fc.assert(
    fc.property(
        bigIntArbitrary.filter(a => a != 0),
        bigIntArbitrary,
        (a, b) => a.multiply(b).remainder(a) == 0
    )
);

// For any a, positive big integer
// JSBigInt(`0x${a.toString(16)}`) should equal a

fc.assert(
    fc.property(
        bigUIntArbitrary,
        (a) => JSBigInt(`0x${a.toString(16)}`).equal(a)
    )
);
