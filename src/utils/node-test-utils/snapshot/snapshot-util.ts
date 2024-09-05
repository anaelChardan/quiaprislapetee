import { format as prettyFormat, plugins as prettyFormatPlugins } from 'pretty-format';

const normalizeNewlines = (val: string) => val.replace(/\r\n|\r/g, '\n');

const {
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent,
  AsymmetricMatcher,
} = prettyFormatPlugins;

const PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher,
];

export const serializeSnapshotData = (data: unknown): string => {
  return normalizeNewlines(
    prettyFormat(data, {
      escapeRegex: true,
      escapeString: false,
      indent: 2,
      plugins: PLUGINS,
      printFunctionName: false,
      printBasicPrototype: false,
    }),
  );
};
