import * as amountGenerators from './amount';
import * as genericGenerators from './generic';
import * as idGenerators from './id';
import * as intervalGenerators from './interval';
import * as validDateGenerators from './valid-date';

export const generators = {
  ...validDateGenerators,
  ...intervalGenerators,
  ...genericGenerators,
  ...amountGenerators,
  ...idGenerators,
};
