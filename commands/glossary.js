const fs = require("fs");
const parser = require("./parser.js");
const path = require("path");
const {
  getFiles,
  preloadTerms,
  getCleanTokens,
  cleanGlossaryTerms,
  filterTypeTerms,
  getRelativePath,
  getGlossaryTerm,
  sortFiles,
  getOrCreateGlossaryFile
} = require("../lib.js");

async function glossary(options) {
  options.dryRun && console.log("\n* Dry run enabled *\n");

  let glossaryContent = "";
  if (options.glossaryPatternSeparator) {
    options.patternSeparator = options.glossaryPatternSeparator;
  }

  // Load the term files
  let termsFiles = [];

  try {
    termsFiles = await getFiles(options.termsDir, options.noGlossaryFiles);
  } catch (err) {
    console.log(`\u26A0  Not able to get files from folder: ${options.termsDir}`);
    console.log(`Check the path in option "termsDir"\n\n ${err} \nExiting...`);
    process.exit(1);
  }

  if (termsFiles.length == 0) {
    console.log(`\u26A0  No term files found`);
    console.log(`Might be wrong path "${options.termsDir}" in option ` +
      `"termsDir" or empty folder \nExiting...`);
    process.exit(1);
  }

  const termsData = await preloadTerms(termsFiles);

  // remove terms that don't have title or hoverText
  let cleanTerms = cleanGlossaryTerms(termsData);

  let termsByType = filterTypeTerms(cleanTerms, options.glossaryTermPatterns);

  // sort termsData alphabetically
  sortFiles(termsByType);

  // append terms to the glossary
  for (const term of termsByType) {
    const current_file_path = path.resolve(process.cwd(), options.glossaryFilepath);
    const relativePath = getRelativePath(current_file_path, term.filepath, options);
    const glossaryTerm = getGlossaryTerm(term, relativePath);
    glossaryContent = glossaryContent + glossaryTerm;
  }

  if(options.dryRun) {
    console.log(`\n! These changes will not be applied in the glossary file.` +
      `\nShowing the output below:\n\n${(glossaryContent)}\n\n`);
  } else {
    const glossaryFile = getOrCreateGlossaryFile(options.glossaryFilepath);
    try {
      const result = await fs.promises.writeFile(
        options.glossaryFilepath, glossaryFile+glossaryContent, "utf-8");
    } catch (err) {
      console.log(`\u26A0  An error occurred while writing new data to ` +
        `the file: ${options.glossaryFilepath}\n ${err} \nExiting...`);
      process.exit(1);
    } finally {
      console.log(`\u00BB Parsing terms in the glossary`);
      options.docsDir = options.glossaryFilepath;
      glossaryContent = await parser(options);
      console.log(`\u00BB Glossary is updated.`);
    }
  }
  console.log(`\u2713 ${termsByType.length} terms found.`)
};

module.exports = glossary;
