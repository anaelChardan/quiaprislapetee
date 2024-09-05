/**
 * @internal
 *
 * See https://github.com/date-fns/date-fns/blob/main/docs/unicodeTokens.md
 */
export const DATE_FORMATS = [
  // no separator
  'ddMM',
  'ddMMyy',
  'ddMMy',
  'MMdd',
  'MMddyy',
  'MMddy',
  'yyMMdd',
  'yMMdd',
  'MM',
  'dd',
  'yy',
  'y',
  // separated by .
  'dd.MM',
  'dd.MM.yy',
  'dd.MM.y',
  'MM.dd',
  'MM.dd.yy',
  'MM.dd.y',
  'yy.MM.dd',
  'y.MM.dd',
  // separated by -
  'dd-MM',
  'dd-MM-yy',
  'dd-MM-y',
  'MM-dd',
  'MM-dd-yy',
  'MM-dd-y',
  'yy-MM-dd',
  'y-MM-dd',
  'y-MM',
  // separated by /
  'dd/MM',
  'dd/MM/yy',
  'dd/MM/y',
  'MM/dd',
  'MM/dd/yy',
  'MM/dd/y',
  'MM/y',
  'yy/MM/dd',
  'y/MM/dd',
  // with time
  'y-MM-dd HH:mm:ss',
] as const;
