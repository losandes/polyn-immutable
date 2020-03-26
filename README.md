# @polyn/immutable

![tests](https://github.com/losandes/polyn-immutable/workflows/tests/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/losandes/polyn-immutable/badge.svg?branch=master)](https://coveralls.io/github/losandes/polyn-immutable?branch=master)


Define object schemas for validation, and construction of immutable objects. @polyn/immutable uses native JavaScript features (namely, `Object.freeze`) to make your objects immutable. It uses [@polyn/blueprint](https://github.com/losandes/polyn-blueprint) to validate the schemas that you define, and also supports custom validators (i.e. if you prefer JSON Schemas).

Unlike `Object.freeze`, @polyn/immutable acts on your objects recursively: nested objects are frozen, as well as the values inside arrays.

@polyn/immutable also mitigates parameter/property pollution attacks at the model level: instances of `immutable` include only properties that exist on the schema, and only if they meet the validation you expressed.

* [Getting Started with Node](#node)
* [Getting Started with the Browser](#browser)
* [Updating Models with `patch`](#updating-models-with-patch)
* [Updating Models with `toObject`](#updating-models-with-toobject)
* [The Importance of Strict Mode](#the-importance-of-strict-mode)
* [Scope (It's not Managed)](#scope-its-not-managed)
* [Using JSON Schema or Other Validators](#using-json-schema-or-other-validators)
* [TypeScript Support](#typescript-support)
* [Cookbook](#cookbook)
  * [Using JSON Schema with AJV](#using-json-schema-with-ajv)
  * [Using a Different Version of Blueprint](#using-a-different-version-of-blueprint)
  * [Schema Inheritance](#schema-inheritance)
  * [Deep Equals With Functions](#deep-equals-with-functions)

## Usage

### Node

```Shell
$ npm install --save @polyn/immutable
```

```JavaScript
'use strict'

const { immutable } = require('@polyn/immutable')
const Product = immutable('Product', {
  id: 'string',
  title: 'string',
  description: 'string',
  price: 'decimal:2',
  type: /^book|magazine|card$/,
  metadata: {
    keywords: 'string[]',
    isbn: 'string?'
  }
})

const product = new Product({
  id: '5623c1263b952eb796d79e03',
  title: 'Swamplandia',
  description: 'From the celebrated...',
  price: 9.99,
  type: 'book',
  metadata: {
    keywords: ['swamp'],
    isbn: '0-307-26399-1'
  }
})

console.log(product)
// prints: ValidatedImmutable { id: '5623c1263b952eb796d79e03', ... }

try {
  const product2 = new Product({
    id: '5623c1263b952eb796d79e03',
    title: null, // this is required!
    description: 'From the celebrated...',
    price: 9.99,
    type: 'book',
    metadata: {
      keywords: ['swamp'],
      isbn: '0-307-26399-1'
    }
  })
} catch (e) {
  console.log(e.message)
  // will print Invalid Product: Product.title {string} is invalid
}
```

> This library is bound to a specific version of [@polyn/blueprint](https://github.com/losandes/polyn-blueprint). If you install blueprint separately, and choose a different version, node will have two versions of blueprint in scope at runtime. All registrations will be performed on the version you install explicitly, which will make them unavailable to @polyn/immutable. Your best option is to just not do this.
>
> _Just install @polyn/immutable. @polyn/blueprint comes with it implicitly._
>
> If there is a reason you want a different version of @polyn/blueprint than the one packaged with @polyn/immutable, checkout [Using a Different Version of Blueprint](#using-a-different-version-of-blueprint) in the cookbook.

### Browser

```Shell
$ npm install --save @polyn/immutable
```

```HTML
<script src="./node_modules/@polyn/blueprint/dist/blueprint.min.js" />
<script src="./node_modules/@polyn/immutable/dist/immutable.min.js" />
<script>
  ((immutable) => {
    'use strict';

    const Product = immutable('Product', {
      id: 'string',
      title: 'string',
      description: 'string',
      price: 'decimal:2',
      type: /^book|magazine|card$/,
      metadata: {
        keywords: 'string[]',
        isbn: 'string?'
      }
    })

    const product = new Product({
      id: '5623c1263b952eb796d79e03',
      title: 'Swamplandia',
      description: 'From the celebrated...',
      price: 9.99,
      type: 'book',
      metadata: {
        keywords: ['swamp'],
        isbn: '0-307-26399-1'
      }
    })

    console.log(product)
    // prints: ValidatedImmutable { id: '5623c1263b952eb796d79e03', ... }
  })(window.polyn.immutable.immutable)
</script>
```

## Updating Models With `patch`
The objects that immutable creates include `patch` on their prototype (it's not enumerable; doesn't show up in `Object.keys`). This function accepts an object, and will produce a new instance, favoring the values in that object over the existing values (like PATCH in REST).

```JavaScript
const { immutable } = require('@polyn/immutable')
const { gt } = require('@polyn/blueprint')

const Person = immutable('Person', {
  firstName: 'string',
  lastName: 'string',
  age: gt(0)
})

const person = new Person({
  firstName: 'John',
  lastName: 'Doe',
  age: 21
})

console.log(person)
// prints { firstName: 'John', lastName: 'Doe', age: 21 }

const modified = person.patch({ age: 22 })

console.log(person)
// prints { firstName: 'John', lastName: 'Doe', age: 21 }
console.log(modified)
// prints { firstName: 'John', lastName: 'Doe', age: 22 }
```

## Updating Models With `toObject`
Sometimes it's easier to make a copy, modify it, and then create a new instance ourselves, than it is to patch an existing instance. Here's how:

```JavaScript
const { immutable } = require('@polyn/immutable')
const { gt } = require('@polyn/blueprint')

const Person = immutable('Person', {
  firstName: 'string',
  lastName: 'string',
  age: gt(0)
})

const person = new Person({
  firstName: 'John',
  lastName: 'Doe',
  age: 21
})

console.log(person)
// prints { firstName: 'John', lastName: 'Doe', age: 21 }

const mutable = person.toObject()
mutable.age = 22
const modified = new Person(mutable)

console.log(person)
// prints { firstName: 'John', lastName: 'Doe', age: 21 }
console.log(modified)
// prints { firstName: 'John', lastName: 'Doe', age: 22 }
```

> To learn more about blueprint schemas and validation, checkout the [@polyn/blueprint README](https://github.com/losandes/polyn-blueprint)

## The Importance of Strict Mode
This library uses `Object.freeze` to make objects immutable, so it shares the behaviors of `Object.freeze`. If you `'use strict'`, and attempt to set a property on an immutable object, the operation will throw an error (usually a `TypeError`). If you don't `'use strict'`, and attempt to set a property on an immutable object, the operation will silently do nothing.

> Nothing can be added to or removed from the properties set of a frozen object. Any attempt to do so will fail, either silently or by throwing a [TypeError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError) exception (most commonly, but not exclusively, when in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)).
>
> -- [MDN: Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)

## Scope (It's not Managed)
While strict mode will help us identify cases where we attempt to mutate an object, JavaScript scope provides some avenues to possible confusion, and limitations we chose for this library.

For instance, what happens when we mutate a value that was originally defined outside of the scope of an immutable? What about mutable scope that is managed inside of a function that is attached to an immutable (i.e. _getters_ and _setters_)? The expected behavior is illustrated below:

```JavaScript
'use strict'

// define an immutable
const MakeNumber = immutable('MakeNumber', {
  makeOne: 'function',
  gettersAndSetters: {
    immutableTwo: 'number',
    get: 'function',
    set: 'function'
  },
  one: 'number'
})

// define variables that meet the immutable's schema
let makeOne = () => 1
let makeTwo = () => {
  let nonDeterministicNumber = 2

  return {
    immutableTwo: nonDeterministicNumber,
    get: () => nonDeterministicNumber,
    set: (num) => {
      nonDeterministicNumber = num
    }
  }
}
let one = 1

// create an instance of our immutable, using the variables
// we defined above
const makeNumber = new MakeNumber({
  makeOne,
  gettersAndSetters: makeTwo(),
  one
})

// each of `makeNumber.makeOne()`, and `makeNumber.one` returns 1
expect(makeNumber.makeOne()).to.equal(1)
expect(makeNumber.one).to.equal(1)

// each of `gettersAndSetters.immutableTwo`, and
// `gettersAndSetters.get()` returns 2
expect(makeNumber.gettersAndSetters.immutableTwo).to.equal(2)
expect(makeNumber.gettersAndSetters.get()).to.equal(2)

// mutate the original properties
makeOne = () => 2
one = 2
// note that this doesn't throw
// immutable doesn't mutate the values you pass to it

// now, each of `makeOne()`, and `one` in this
// immediate scope returns 2
expect(makeOne()).to.equal(2)
expect(one).to.equal(2)

// however, each of the immutable `makeNumber.makeOne()`,
// and `makeNumber.one` still returns 1
expect(makeNumber.makeOne()).to.equal(1)
expect(makeNumber.one).to.equal(1)

// execute a function that mutates the inner scope of gettersAndSetters
makeNumber.gettersAndSetters.set(3)

// The immutable `makeNumber.gettersAndSetters.immutableTwo`
// still returns 2 :yay:
expect(makeNumber.gettersAndSetters.immutableTwo).to.equal(2)

// but `makeNumber.gettersAndSetters.get()` now returns 3
// because it's a factory that exposes non-deterministic inner scope
expect(makeNumber.gettersAndSetters.get()).to.equal(3)
```

We have the option of allowing existing scope to be managed by the developer, or to fully clone all functions and manage them in this library. The latter is likely to produce more astonishment than the prior, so this library assumes you will manage your scopes. If you don't want inner scope to change, make it `immutable`, or simply don't change it (if you're using this library, there's a good chance you believe _getters_ and _setters_ are an anti-pattern anyway).

## Using JSON Schema or Other Validators

> Also see the [Using JSON Schema with AJV](#using-json-schema-with-ajv) example

You can register your own validator by creating a new instance of Immutable. The syntax for defining your own validator is:

```JavaScript
/**
 * Creates a validator that will compare an input object to a schema
 * @param {string} name - the name of the model being validated
 * @param {object} schema - the schema this model should match
 */
function Validator (name, schema) {
  return {
    validate: (input) => {
      // throw if invalid
      // optionally: return { value: { /*...*/ } }
    }
  }
}
```

> If your validate function returns an object with a `value` property, the `value` will be used instead of the input to construct the immutable instance. This allows you to set defaults, and intercept values

## TypeScript Support
This library exports types. A brief example from [strictly-typed-input](./ts-examples/strictly-typed-input.test.ts) is shown here. If you'd like to see more, the examples above, as well as others, are implemented in TypeScript in [ts-examples](./ts-examples).

```TypeScript
import { gt, optional } from '@polyn/blueprint'
import { immutable, IValidatedImmutable } from '@polyn/immutable';
import { v4 as uuid } from 'uuid';

interface IPerson extends IValidatedImmutable<IPerson> {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly age: number;
}

// notice the `id` is optional
interface IPersonInput {
  readonly id?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly age: number;
}

const Person = immutable<IPerson, IPersonInput>('Person', {
  id: optional(UUID_REGEX).withDefault(uuid),
  firstName: 'string',
  lastName: 'string',
  age: gt(0)
});

const person: IPerson = new Person({
  firstName: 'John',
  lastName: 'Doe',
  age: 21
});

expect(UUID_REGEX.test(person.id)).to.equal(true);
expect(person.firstName).to.equal('John');
expect(person.lastName).to.equal('Doe');
expect(person.age).to.equal(21);
expect(() => new Person({
  firstName: '',
  lastName: '',
  age: -1
})).to.throw(Error, 'Invalid Person: expected `firstName` {string} to not be an empty string, expected `lastName` {string} to not be an empty string, expected `age` to be greater than 0');
```

## Cookbook

* [Using JSON Schema with AJV](#using-json-schema-with-ajv)
* [Schema Inheritance](#schema-inheritance)
* [Deep Equals With Functions](#deep-equals-with-functions)

### Using JSON Schema with AJV
In the following example, we'll use [ajv](https://github.com/epoberezkin/ajv) to validate JSON Schemas.

```JavaScript
const { Immutable } = require('@polyn/immutable')

/**
 * Creates a validator that uses ajv to validate data against
 * the given JSON Schema
 * @param {string} name - the name of the model being validated
 * @param {object} schema - the JSON Schema this model should match
 */
function AjvValidator (name, schema) {
  const makeErrorText = (errors) => {
    return errors && errors
      .map((error) => `${name}${error.dataPath} ${error.message}`)
      .join(', ')
  }
  return {
    validate: (input) => {
      // allErrors: don't exit on first error
      const ajv = new Ajv({ allErrors: true })
      const isValid = ajv.validate(schema, input)

      if (!isValid) {
        throw new Error(`Invalid ${name}: ${makeErrorText(ajv.errors)}`)
      }
    }
  }
}

const { immutable } = new PolynImmutable({ Validator: AjvValidator })

const Person = immutable('Person', {
  $id: 'https://example.com/person.schema.json',
  $schema: 'http://json-schema.org/schema#',
  title: 'Person',
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      description: 'The person\'s first name.'
    },
    lastName: {
      type: 'string',
      description: 'The person\'s last name.'
    },
    age: {
      description: 'Age in years which must be equal to or greater than zero.',
      type: 'integer',
      minimum: 0
    }
  }
})

const person = new Person({
  firstName: 'John',
  lastName: 'Doe',
  age: 21
})

console.log(person)
// prints: ValidatedImmutable { firstName: 'John', lastName: 'Doe', age: 21 }

try {
  const person2 = new Person({
    firstName: 1,
    lastName: 2,
    age: -1
  })
} catch (e) {
  console.log(e.message)
  // prints ( `\` line breaks for readability):
  // Invalid Person: \
  // Person.firstName should be string, \
  // Person.lastName should be string, \
  // Person.age should be >= 0
}
```

> NOTE this implementation isn't the fastest approach to using ajv, but it avoids collisions on the `ajv.errors` singleton

### Using a Different Version of Blueprint
This isn't necessary if you just install @polyn/immutable, and avoid conflicting versions of @polyn/blueprint. If you have a reason for doing this, you can create your own Validator, and a new instance of PolynImmutable.

```JavaScript
const { blueprint, gt, is } = require('@polyn/blueprint')
const { PolynImmutable } = require('@polyn/immutable')

const isBlueprint = (input) => {
  return is.object(input) &&
    is.string(input.name) &&
    is.function(input.validate) &&
    is.object(input.schema)
}

function Validator (name, schema) {
  let bp

  if (isBlueprint(name)) {
    // a blueprint was passed as the first argument
    bp = name
  } else {
    bp = blueprint(name, schema)
  }

  if (bp.err) {
    throw bp.err
  }

  return {
    validate: (input) => {
      const validationResult = bp.validate(input)

      if (validationResult.err) {
        throw validationResult.err
      }

      return validationResult
    }
  }
}

const { immutable } = new PolynImmutable({ Validator })

const Person = immutable('Person', {
  firstName: 'string',
  lastName: 'string',
  age: gt(0)
})

const person = new Person({
  firstName: 'John',
  lastName: 'Doe',
  age: 21
})
```

### Schema Inheritance

```JavaScript
const { blueprint, registerBlueprint } = require('@polyn/blueprint')
const { immutable } = require('@polyn/immutable')

const productBp = blueprint('Product', {
  id: 'string',
  title: 'string',
  description: 'string',
  price: 'decimal:2',
  type: /^book|magazine|card$/,
  metadata: {
    keywords: 'string[]'
  }
})

registerBlueprint('Author', {
  firstName: 'string',
  lastName: 'string'
})

const Product = immutable(productBp)
const Book = immutable('Book', {
  ...productBp.schema,
  ...{
    metadata: {
      ...productBp.schema.metadata,
      ...{
        isbn: 'string',
        authors: 'Author[]'
      }
    }
  }
})

const product = new Product({
  id: '5623c1263b952eb796d79e02',
  title: 'Happy Birthday',
  description: 'A birthday card',
  price: 9.99,
  type: 'card',
  metadata: {
    keywords: ['bday']
  }
})

const book = new Book({
  id: '5623c1263b952eb796d79e03',
  title: 'Swamplandia',
  description: 'From the celebrated...',
  price: 9.99,
  type: 'book',
  metadata: {
    keywords: ['swamp'],
    isbn: '0-307-26399-1',
    authors: [{
      firstName: 'Karen',
      lastName: 'Russell'
    }]
  }
})

console.log(product)
console.log(book)
```

### Deep Equals With Functions
Sometimes, your schema might have a type that returns a function:

```JavaScript
const Product = immutable('Product', {
  type: /^book$/i,
  comparableType: ({ input }) => {
    return {
      value: () => input.toLowerCase()
    }
  }
})
```

@polyn/immutable could put this function on `Product`s prototype so the are comparable with deep equals, but this can lead to astonishing outputs because the scope of the function would be different than the other properties. Instead, there are two ways to make instances of ValidatedImmutable comparable when they have functions on them.

#### Functions on the Prototype
If all of the functions on the object are safe to be put on the prototype, you can set the `functionsOnPrototype` option to do that when you defined the schema:

```JavaScript
const { expect } = 'chai'
const { immutable } = require('@polyn/immutable')

const Product = immutable('Product', {
  type: /^book$/i,
  comparableType: ({ input }) => {
    return {
      value: () => input.toLowerCase()
    }
  }
}, { functionsOnPrototype: true })

const p1 = new Product({ type: 'book' })
const p2 = new Product({ type: 'book' })

expect(p1).to.deep.equal(p2)
```

> Remember - the prototype is shared across ALL INSTANCES of `Product` in this example. If your functions act on non-deterministic values they may produce side-effects that effect all instances.

#### Cast to Object Without Functions
If you don't want functions to be on the prototype, you can instead pass the `removeFunctions` option to `toObjects` in order to compare:

```JavaScript
const { expect } = 'chai'
const { immutable } = require('@polyn/immutable')

const Product = immutable('Product', {
  type: /^book$/i,
  comparableType: ({ input }) => {
    return {
      value: () => input.toLowerCase()
    }
  }
})

const p1 = new Product({ type: 'book' })
const p2 = new Product({ type: 'book' })

expect(p1.toObject({ removeFunctions: true }))
  .to.deep.equal(p2.toObject({ removeFunctions: true }))
```

## Why @polyn/immutable
This won't be a case for immutability - that's been made many times, elsewhere. Why use _this_ library for immutability instead of another one?

I generally want objects to meet two criteria:

* to be immutable
* to be valid

This library deals with both of those problems in a way that's easier to grok than other languages or libraries that I've used. Unlike strictly typed languages, with JavaScript we can define the type, and the parameters beyond type that make an object, or property valid in a single location, and this library makes that trivial.
