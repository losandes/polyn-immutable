import * as arraysTest from './ts-examples/arrays.test';
import * as customValidatorTest from './ts-examples/custom-validator.test';
import * as immutableTest from './ts-examples/immutable.test';
import * as polymorphismTest from './ts-examples/polymorphism.test';
import * as strictlyTypedInputTest from './ts-examples/strictly-typed-input.test';

arraysTest.run();
customValidatorTest.run();
immutableTest.run();
polymorphismTest.run();
strictlyTypedInputTest.run();

console.log('\x1b[32mALL TYPESCRIPT EXAMPLES PASSED\x1b[0m\n');
