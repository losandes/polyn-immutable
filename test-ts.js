"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("./index");
const blueprint_1 = require("@polyn/blueprint");
const Ajv = require("ajv");
// immutable
// =============================================================================
exports.Person = index_1.immutable('Person', {
    firstName: 'string',
    lastName: 'string',
    age: blueprint_1.gt(0)
});
const person = new exports.Person({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
});
console.log(person);
// prints { firstName: 'John', lastName: 'Doe', age: 21 }
// patch
// =============================================================================
const modified = person.patch({ age: 22 });
console.log(person);
// prints { firstName: 'John', lastName: 'Doe', age: 21 }
console.log(modified);
// prints { firstName: 'John', lastName: 'Doe', age: 22 }
// toObject
// =============================================================================
const mutable = person.toObject();
mutable.age = 22;
const modified2 = new exports.Person(mutable);
console.log(person);
// prints { firstName: 'John', lastName: 'Doe', age: 21 }
console.log(modified2);
// prints { firstName: 'John', lastName: 'Doe', age: 22 }
// inheritance
// =============================================================================
class Poly1 {
    constructor(input) {
        this.prop1 = input.prop1;
    }
}
class SubPoly1 extends Poly1 {
    constructor(input) {
        super(input);
        this.prop2 = input.prop2;
    }
}
const Poly2 = index_1.immutable('Poly', {
    prop1: 'string'
});
class SubPoly2 extends Poly2 {
    constructor(input) {
        super(input);
        this.prop2 = input.prop2;
    }
}
console.log(new SubPoly1({ prop1: 'sub-class', prop2: 'polymorphism' }));
console.log(new SubPoly2({ prop1: 'sub-class', prop2: 'polymorphism' }));
// custom Validator
// =============================================================================
/**
 * Creates a validator that uses ajv to validate data against
 * the given JSON Schema
 * @param {string} name - the name of the model being validated
 * @param {object} schema - the JSON Schema this model should match
 */
function AjvValidator(name, schema) {
    const makeErrorText = (errors) => {
        return errors && errors
            .map((error) => `${name}${error.dataPath} ${error.message}`)
            .join(', ');
    };
    return {
        validate: (input) => {
            // allErrors: don't exit on first error
            const ajv = new Ajv({ allErrors: true });
            const isValid = ajv.validate(schema, input);
            if (!isValid) {
                throw new Error(`Invalid ${name}: ${makeErrorText(ajv.errors)}`);
            }
        }
    };
}
const customImmutable = index_1.Immutable({ Validator: AjvValidator });
const Person2 = customImmutable('Person', {
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
});
const person2 = new Person2({
    firstName: 'John',
    lastName: 'Doe',
    age: 21
});
console.log(person2);
// prints: ValidatedImmutable { firstName: 'John', lastName: 'Doe', age: 21 }
try {
    const person3 = new exports.Person({
        firstName: 1,
        lastName: 2,
        age: -1
    });
}
catch (e) {
    console.log(e.message);
    // prints ( `\` line breaks for readability):
    // Invalid Person: \
    // Person.firstName should be string, \
    // Person.lastName should be string, \
    // Person.age should be >= 0
}
// array
// =============================================================================
const arr1 = [1, 2, 3];
const arr2 = index_1.array(arr1).push(4);
chai_1.expect(arr1).to.deep.equal([1, 2, 3]);
chai_1.expect(arr2).to.deep.equal([1, 2, 3, 4]);
console.log(`${arr1} => ${arr2}`);
