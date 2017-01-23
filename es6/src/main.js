/*
 * import statements
 */
import { internalName } from './module1';
/* same as "import m2 from './module2';" */
import { default as m2 } from './module2';
/* sugar for "import { default as m3 } from './module3';" */
import m3 from './module3';

import { Module1 } from './module1';
import { Module2 } from './module2';
import { Module3 } from './module3';

// import { modules } from 'main'
export const modules = {
    m2,
    m3
};

// import name from 'main'
export default {
     internalName,
     modules
 };

export class Main {
    constructor() {
        this.m1 = new Module1();
        this.m2 = new Module2();
        this.m3 = new Module3();
    }
}
