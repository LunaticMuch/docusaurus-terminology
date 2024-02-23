import path from 'path';
import fs from 'node:fs';
import parseMD from 'parse-md';
import { globby } from 'globby';

const glossaryHeader = `---
id: glossary
title: Glossary
---`;

interface IFrontmatterGlossary {
  id: string;
  title: string;
  hoverText: string;
  glossaryText: string;
  type: string;
}

interface IParsedMd {
  metadata: IFrontmatterGlossary;
  content: string;
}

declare global {
  interface Array<T> {
    diff(elem: T): Array<T>;
  }
}

Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0;
  });
};

export async function getFiles(basePath, noParseFiles, noThrow = false) {
  // fixes paths on Windows environments, globby requires forward slashes
  const fixedPath = basePath.replaceAll('\\', '/');

  // Added the noThrow optional param
  // in case there is a call to this
  // function that does not want to
  // handle the error thrown
  let files = [];
  // get all files under dir
  try {
    // get all md files from basePath
    files = await globby(fixedPath + '**/*.{md,mdx}');
  } catch (err) {
    if (noThrow) {
      // handle error here
    } else {
      throw err;
    }
  }
  // filter with the noParseFiles option and return
  return files.diff(noParseFiles);
}

export async function preloadTerms(termsFiles) {
  const terms = [];
  for (const term of termsFiles) {
    let fileContent = '';
    try {
      fileContent = await fs.promises.readFile(term, 'utf8');
    } catch (err) {
      err.code === 'ENOENT'
        ? console.log(`File ${term} not found.`)
        : console.log(`${err}\nExiting...`);
      process.exit(1);
    }
    const { metadata } = parseMD(fileContent) as IParsedMd;
    if (!metadata.id) {
      console.log(
        `! The term "${term}" lacks the attribute "id" and so is ` +
          `excluded from the term parsing functionality.`
      );
    } else {
      if (!metadata.hoverText || metadata.hoverText.length == 0) {
        console.log(
          `! The term "${term}" lacks the attribute "hoverText", ` +
            `so no popup text will be shown.`
        );
      }
      const data = {
        content: fileContent,
        filepath: term,
        hoverText: metadata.hoverText || '',
        glossaryText: metadata.glossaryText || '',
        type: metadata.type || '',
        id: metadata.id,
        title: metadata.title || ''
      };
      terms.push(data);
    }
  }
  return terms;
}

export function getCleanTokens(match, separator) {
  const tokens = match.split(separator);
  // remove file extension, if present
  tokens[1] = tokens[1].replace(/\.[^/.]+$/, '');
  tokens.forEach((token, index) => {
    tokens[index] = token.replace(/[%]/g, '');
  });
  return tokens;
}

export function getHeaders(content) {
  const index = content.indexOf('---', 1) + '---'.length;
  // slice the headers of the file
  return content.slice(0, index);
}

export function addJSImportStatement(content) {
  const importStatement =
    `\n\nimport Term ` +
    `from "@lunaticmuch/docusaurus-terminology/components/tooltip.js";\n`;
  return importStatement + content;
}

export function sortFiles(files) {
  files.sort((a, b) =>
    a.title.toLowerCase() > b.title.toLowerCase()
      ? 1
      : b.title.toLowerCase() > a.title.toLowerCase()
        ? -1
        : 0
  );
}

export function cleanGlossaryTerms(terms) {
  const cleanTerms = terms.filter((item) => {
    return item.title && item.title.length > 0
      ? true
      : console.log(
          `! The file ${item.filepath} lacks the attribute "title" and so is ` +
            `excluded from the glossary.`
        );
  });
  // handle debug case here
  return cleanTerms;
}

export function filterTypeTerms(terms, glossaryTermPatterns) {
  if (glossaryTermPatterns.length == 0) {
    console.log(
      '! No glossaryTermPatterns were specified to filter ' + 'terms by type.'
    );
    return terms;
  }
  const typeTerms = terms.filter((item) => {
    return glossaryTermPatterns.indexOf(item.type) > -1
      ? true
      : console.log(
          `! The attribute "type" of term "${item.id}" is missing or does not ` +
            `match any type listed in the glossaryTermPatterns.`
        );
  });
  return typeTerms;
}

export function getGlossaryTerm(term, path) {
  let hover = term.glossaryText != undefined ? term.glossaryText : '';
  if (hover.length <= 0) {
    hover = term.hoverText != undefined ? term.hoverText : '';
  }
  return hover.length > 0
    ? `\n\n### [${term.title}](${path}) \n${hover}\n`
    : `\n\n### [${term.title}](${path})`;
}

export function getOrCreateGlossaryFile(path) {
  let fileContent = '';
  // TODO: Replace with async fs function
  if (!fs.existsSync(path)) {
    console.log(
      `! Glossary file does not exist in path: "${path}". Creating...`
    );
    fileContent = glossaryHeader;
    // TODO: Replace with async fs function
    // fs.writeFileSync(path, fileContent, "utf8",
    //   (error: any) => { if (error) throw error; });
    try {
      const content = fs.writeFileSync(path, fileContent, 'utf8');
    } catch (err) {
      console.log(err);
    }
  } else {
    // TODO: Replace with async fs function
    try {
      const content = fs.readFileSync(path, { encoding: 'utf8' });
      const index = content.indexOf('---', 1) + '---'.length;
      fileContent = content.slice(0, index);
    } catch (err) {
      console.log(err);
    }
  }
  return fileContent;
}

export function getRelativePath(_, target, opts) {
  // calculate relative path from each file's parent dir
  const targetDir = target.substr(0, target.lastIndexOf('/'));
  //const relative_url = path.relative(sourceDir, targetDir);
  const relative_url = path.relative(opts.termsDir, targetDir);
  const final_url = path.join(
    opts.termsUrl,
    relative_url,
    target.substr(target.lastIndexOf('/'))
  );
  // construct the final url by appending the target's filename
  // if the relative url is empty, it means that the referenced
  // term is in the same dir, so add a `.`
  //let final_url = relative_url === ""
  //  ? "." + target.substr(target.lastIndexOf("/"))
  //  : relative_url + target.substr(target.lastIndexOf("/"));
  //console.log(new_rel_url, new_final_url);
  //  remove .mdx suffix
  return final_url.replace(/(\.mdx?)/g, '');
}
