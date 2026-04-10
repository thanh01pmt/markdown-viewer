import { Marp } from '@marp-team/marp-core';
import MarpCore from '@marp-team/marp-core';

console.log('Named Marp:', typeof Marp);
console.log('Default MarpCore:', typeof MarpCore);
if (MarpCore && MarpCore.Marp) console.log('MarpCore.Marp:', typeof MarpCore.Marp);
