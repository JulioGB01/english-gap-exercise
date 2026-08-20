/* =====================================================================
   LEVELS + BANK ASSEMBLY
   The sentences themselves live in js/bank/, one file per level, so
   each stays small enough to edit comfortably.
   ===================================================================== */
import A1 from './bank/a1.js';
import A2 from './bank/a2.js';
import B1 from './bank/b1.js';
import B2 from './bank/b2.js';
import C1 from './bank/c1.js';
import C2 from './bank/c2.js';

export const BANK = { A1, A2, B1, B2, C1, C2 };

export const LEVELS = [
  {id:"A1", name:"Beginner", sub:"To be, present simple, articles, prepositions", c:"#00E5A0"},
  {id:"A2", name:"Elementary", sub:"Past, future, comparatives, quantifiers", c:"#00C3E3"},
  {id:"B1", name:"Intermediate", sub:"Perfect tenses, conditionals, modals, relatives", c:"#7B61FF"},
  {id:"B2", name:"Upper intermediate", sub:"Phrasal verbs, collocations, prepositions", c:"#FF4AC1"},
  {id:"C1", name:"Advanced", sub:"Inversion, discourse markers, idioms", c:"#FF8A3D"},
  {id:"C2", name:"Mastery", sub:"Formal register, fixed expressions, nuance", c:"#FFD23D"}
];
