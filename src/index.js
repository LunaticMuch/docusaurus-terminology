const path = require("path");

const parser = require("./commands/parser.js");
const glossary = require("./commands/glossary.js");
const validateOptions = require("./validator.js");

const DEFAULT_OPTIONS = {
  docsDir: "./docs/",
  termsDir: "./docs/terms/",
  termsUrl: "/docs/terms",
  glossaryFilepath: "./docs/glossary.md",
  patternSeparator: "|",
  noParseFiles: [],
  noGlossaryFiles: [],
  glossaryTermPatterns: [],
  dryRun: false,
  debug: false
};

module.exports = function (context, opts) {
  // initialize options
  let options = {};
  !opts.termsDir && console.log(`\n! No option for terms directory found, ` +
      `using default directory "${DEFAULT_OPTIONS.termsDir}"\n`);
  options = Object.assign({}, DEFAULT_OPTIONS, opts);
  validateOptions(options);
  options.termsUrl = path.join(context.baseUrl, options.termsDir, "/");
  options.termsDir = path.resolve(options.termsDir) + "/";
  options.docsDir = path.resolve(options.docsDir) + "/";
  options.glossaryFilepath = path.resolve(options.glossaryFilepath);
  for (const [index,item] of options.noParseFiles.entries()) {
    options.noParseFiles[index] = path.resolve(process.cwd(), item);
  }
  for (const [index,item] of options.noGlossaryFiles.entries()) {
    options.noGlossaryFiles[index] = path.resolve(process.cwd(), item);
  }

  return {
    name: "terminology-parser",
    extendCli(cli) {
      cli
        .command("parse")
        .option("--dry-run", "see what the command will do")
        .option("--debug", "see all log output of the command")
        .description("Parse all md files to replace terms")
        .action((args) => {
          // check for dry-run and debug
          options.dryRun = args.dryRun ? true : false;
          options.debug = args.debug ? true : false;

          console.log("Replacing patterns with <Term />");
          parser(options);
        });
      cli
        .command("glossary")
        .option("--dry-run", "see what the command will do")
        .option("--debug", "see all log output of the command")
        .description("Generate a glossary of terms")
        .action((args) => {
          // check for dry-run and debug
          options.dryRun = args.dryRun ? true : false;
          options.debug = args.debug ? true : false;

          console.log("Alphabetical list of terms");
          glossary(options);
        });
    },
  };
};
