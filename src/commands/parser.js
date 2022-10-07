const fs = require("fs");
const path = require("path");
const gitDiff = require("git-diff")
const {
  getFiles,
  getCleanTokens,
  preloadTerms,
  getHeaders,
  getRelativePath,
  addJSImportStatement
} = require("../lib.js");

async function parser(options) {
  options.dryRun && console.log("\n* Dry run enabled *\n");

  // Load the term files
  let termsFiles = [];

  try {
    termsFiles = await getFiles(options.termsDir, options.noParseFiles);
  } catch (err) {
    console.log(`\u26A0  Not able to get files from folder: ${options.termsDir}`);
    console.log(`Check the path in option "termsDir"\n\n ${err} \nExiting...`);
    process.exit(1);
  }

  if (termsFiles.length == 0) {
    console.log(`\u26A0 No term files found`);
    console.log(`Might be wrong path "${options.termsDir}" in option ` +
      `"termsDir" or empty folder \nExiting...`);
    process.exit(1);
  }

  const termsData = await preloadTerms(termsFiles);
  console.log("Iterate through the .md(x) files, looking for term patterns");

  let allFiles = [];

  try {
    allFiles = await getFiles(options.docsDir, options.noParseFiles);
  } catch (err) {
    console.log(`\u26A0  Not able to get files from folder: ${options.docsDir}`);
    console.log(`Check the path in option "docsDir"\n\n${err} \nExiting...`);
    process.exit(1);
  }

  if (fs.lstatSync(options.docsDir).isFile() &&
    path.extname(options.docsDir).includes(".md")) {
    console.log(`! A single file to be parsed is given in option "docsDir":` +
    ` "${options.docsDir}"`);
    allFiles = [options.docsDir];
  }

  if (!allFiles.length) {
    console.log(`\u26A0 No files found. Might be wrong path` +
    ` "${options.docsDir}" in option "docsDir" or empty folder`);
    // process.exit(1);
  }

  // start counting number of term replacements
  let nmbMatches = 0;

  const regex = new RegExp(
    "\\%%.*?\\" + options.patternSeparator + ".*?\\%%",
    "g"
  );

  for (const filepath of allFiles) {
    let content = "";
    try {
      content = await fs.promises.readFile(filepath, "utf8");
    } catch (err) {
      console.log(`\u26A0 Error occurred while reading file: ${filepath}`);
      console.log(`Exiting...`);
      process.exit(1);
    }

    const oldContent = content;
    // remove headers of the content of the file
    let headers = getHeaders(content);
    content = content.replace(headers, "");
    // get all regex matches
    const regex_matches = content.match(regex);
    // iterate only pages with regex matches
    if(regex_matches !== null) {
      nmbMatches += regex_matches.length;
      for(match of regex_matches) {
        const tokens = getCleanTokens(match, options.patternSeparator);
        // for ease of use
        const text = tokens[0];
        const ref = tokens[1];
        const termReference = termsData.find(item => item.id === ref);
        if(!termReference) {
          console.log(`\nParsing file "${filepath}"...`);
          console.log(`\u26A0  Could not find the correct term from id ` +
          `"${ref}" in regex match "${match}". Maybe typo or missing term file?`);
          console.log("Exiting...");
          process.exit(1);
        }
        const current_file_path = path.resolve(process.cwd(), filepath);
        const relativePath =
          getRelativePath(current_file_path, termReference.filepath, options);
        const component = `<Term popup="${termReference.hoverText}" ` +
          `reference="${relativePath}">${text}</Term>`;
        content = content.replace(match, component);
      };
      // since we are inside the if function
      // we can safely assume that we have
      // replaced at least 1 term, so we can
      // now add the import statement after
      // the headers of the file
      content = headers + addJSImportStatement(content);
      // now the new content can be replaced
      // in the opened file
      // check: dry-run
      if(options.dryRun) {
        var diff = gitDiff(oldContent, content, {color: true});
        console.log(`\n! These changes will not be applied in the file ` +
          `${filepath}\nShowing the output below:\n\n${diff}\n\n`);
      } else {
        try {
          const result = await fs.promises.writeFile(filepath, content, "utf-8");
        } catch (err) {
          console.log(`\u26A0  An error occurred while writing new data ` +
            `to file: ${filepath}\n${err} \nExiting...`);
          process.exit(1);
        } finally {
          console.log(`\u00BB File ${filepath} is updated.`);
        }
      }
    }
  }
  console.log(`\u2713 ${nmbMatches} term replacements completed.`);
}

module.exports = parser;
