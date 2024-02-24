const {
  addJSImportStatement,
  getRelativePath,
  getCleanTokens,
  filterTypeTerms,
  getFiles,
  preloadTerms
} = require('../src/lib.js');

const options = {
  termsUrl: '/docs/terms',
  termsDir: '/docs/'
};

describe('get relative path', () => {
  const source = '/docs/file1.md';
  const target = '/docs/dir/file2.md';
  const path = getRelativePath(source, target, options);
  it('finds the file', () => {
    expect(path).toBe('/docs/terms/dir/file2');
  });
});

describe('add import statement', () => {
  const content = '# Hospitality';
  var newContent = addJSImportStatement(content);
  it('gets the updated content with the import statement', () => {
    expect(newContent).toBe(
      '\n\nimport Term from "@lunaticmuch/docusaurus-terminology/components/tooltip.js";\n' +
        content
    );
  });
});

describe('add import statement in empty file', () => {
  const content = '';
  var newContent = addJSImportStatement(content);
  it('gets the updated content with the import statement', () => {
    expect(newContent).toBe(
      content +
        '\n\nimport Term from "@lunaticmuch/docusaurus-terminology/components/tooltip.js";\n'
    );
  });
});

describe('get the term name and reference from the regex match', () => {
  const matchPattern = '%%Term name$term%%';
  const separator = '$';
  var tokens = getCleanTokens(matchPattern, separator);
  it('the clean tokens', () => {
    expect(tokens).toStrictEqual(['Term name', 'term']);
  });
});

describe('get the term name and reference (without the file extension)', () => {
  const matchPattern = '%%Mr.Doe$term.md%%';
  const separator = '$';
  var tokens = getCleanTokens(matchPattern, separator);
  it('the clean tokens', () => {
    expect(tokens).toStrictEqual(['Mr.Doe', 'term']);
  });
});

// async functions
it('get list of files to parse', async () => {
  const basePath = './__tests__/test_docs/';
  const excludeList = ['./__tests__/test_docs/exclude.md'];
  const files = await getFiles(basePath, excludeList);
  expect(files.length).toEqual(2);
});

it('get list of terms', async () => {
  const basePath = './__tests__/test_docs/';
  const files = await getFiles(basePath, []);
  const terms = await preloadTerms(files);
  expect(terms.length).toEqual(2);
});

it('filter the terms based on the type: concept', async () => {
  const basePath = './__tests__/test_docs/';
  const files = await getFiles(basePath, []);
  const terms = await preloadTerms(files);
  const glossaryTermPatterns = ['concept'];
  var typeTerms = filterTypeTerms(terms, glossaryTermPatterns);
  expect(typeTerms.length).toEqual(1);
});
