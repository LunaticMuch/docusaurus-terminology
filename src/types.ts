export interface IOptions {
  termsUrl: string;
  termsDir: string;
  docsDir: string;
  glossaryFilepath: string;
  noParseFiles: string[];
  noGlossaryFiles: string[];
  glossaryTermPatterns: string[];
  dryRun: boolean;
  debug: boolean;
  patternSeparator: string;
}

export interface ITerm {
  glossaryText: string;
  hoverText: string;
  title: string;
}
