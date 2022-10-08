# Docusaurus Terminology

**docusaurus-terminology** is a node package for creating a
terminology structure in your [Docusaurus](https://docusaurus.io/)
project. This plugin allows you to use terms in your pages that
'stick out' of the surrounding text, while hovering over them makes a
popup appear with a short explanation of the term and clicking on the
term navigates the user to the page that documents the concept.

![Term in text example](static/terminology_example.gif)

You can also generate a glossary with the list of your terms.

## How It Works

This plugin, once it's installed in a Docusaurus project, parses docs
in two ways:

  1. Parses all `*.md(x)` files under `docs/` and replaces each pattern with an
  appropriate React component supporting a tooltip functionality (see below).
  2. Generates a glossary page with all terms corresponding to the
  `*.md(x)` files under `docs/terms/`.

## Compatibility

The plugin has been tested with Docusaurus 2.0 and above. 
The same default environment used by docusaurus satisfies the plugin requirements.

## Installation

To install the plugin to your Docusaurus repository, use the command:

```commandline
npm install @lunaticmuch/docusaurus-terminology
```

Then, you can add the plugin to `docusaurus.config.js` file of your repository:

```js
module.exports = {
  // ...
  plugins: [
    '@lunaticmuch/docusaurus-terminology'
  ]
}
```

Or, you can use it with extra options defined (with more examples in
the next sections): 

```js
  plugins: [
    [
      "@lunaticmuch/docusaurus-terminology",
      {
        //options
      }
    ]
  ]
```

## Usage

### Defining a Term

This plugin assumes that you follow a specific pattern. Each term
should have its own `.md(x)` file, inside the `./docs/terms`
directory, and it needs to consist of the following structure:

```markdown
---
id: term_name
title: Term page
hoverText: This hover text will appear in the documentation page that you reference this term
---

### Term explanation

content here
```

> Pay attention to the `hoverText` attribute, as it is important to provide this
> attribute (along with the default Docusaurus attributes), so the plugin can
> fetch the correct popup text to show when referencing a term.


### Use Patterns to Reference a Term

When writing docs inside `docs/*.md(x)` files, in order to refer to a term, 
you may use the following syntax:


```
%%term_text|term_name%%
```

where:
- `term_text`: The terminology text you want it to be visible in the
documentation page
- `term_name`: The value of the `id` attribute, which resides in the
header of the term file:
  > ```markdown
  > ---
  > id: term_name
  > ...
  > ---
  > ```

After successfully running the script, the above occurrence will be replaced by 
a reference (technically a React component) that  will render `term_text` as a 
link to the corresponding term page, which is in turn generated from the 
`term_name` attribute; furthermore, *hovering* over `term_text` displays a term 
summary, as extracted from the corresponding term page.

### Example Usage

Say you want to reference a term that exists under the `./docs/terms/` directory,
e.g., `./docs/terms/party.md`. You can use the following syntax to reference
this term in your documentation page:

```markdown
Some content that wants to reference the %%Party|party%% term
```

When the script runs, this will be replaced as follows:

```html
Some content that wants to reference the <Term reference="party" popup="Popup text">Party</Term> term
```

which supports the functionality explained above.

And finally, all you will see in your compiled documentation page, will be:

```markdown
Some content that wants to reference the Party term
```

with the word **Party** containing the described functionality.

### Testing the Changes Locally

After writing terms and patterns in your `.md` files, you can always validate 
these changes, by running a dry-run command, in order to see compile errors
and a sample output of all the changes that will be made from the actual 
script. You can do that by running:

```commandline
npm docusaurus parse --dry-run
```

and you will see in the command line the expected output of the actual command.

### Generating the Terminology Documentation

When you are finished referencing terms and have written corresponding term 
pages, you can test this locally by running:

```commandline
npm docusaurus parse
```

This will replace all `%%term_text|term_name%%` occurrences with the React 
component supporting the required functionality.

### Generating the Glossary Page

If everything works well with the above procedure, you can then generate a
glossary page, by running:

```commandline
npm docusaurus glossary
```

This will generate a file in `./docs/glossary.md` where every term that has been
mentioned above will be populated in the `glossary.md` page.

## When to Generate the Terminology Docs

As the terminology plugin actually edits all markdown files, your Git repository 
will show changes in the `git diff` command. It is highly recommended to avoid 
committing the changes, as the plugin will no longer be able to detect
patterns that have been altered. 

Your best case scenario will be to use the scripts in CI, just before building 
and deploying the documentation.

The following example of a Gitlab CI job shows how to perform these steps in 
the CI environment:

```yaml
...

generate-docs:
	image: node:lts
	stage: build
	before_script:
		- yarn install
	script:
		- yarn docusaurus parse
		- yarn docusaurus glossary
		- yarn build
```
and then you can use the `build` directory to serve your documentation.

## Configuration Options

For using the plugin with the default options, you can provide just the plugin 
name in `docusaurus.config.js` file of your repository:

```js
  plugins: [
    '@lunaticmuch/docusaurus-terminology'
  ]
```

You can also use some of the following options specified by wrapping the name 
and an options object in an array inside your configuration:

|      Option          |                                                Description                                                |  Type  |    Default value   |
|:--------------------:|:---------------------------------------------------------------------------------------------------------:|:------:|:------------------:|
|     termsDir         |                                the directory used to collect the term files                               | string |    ./docs/terms    |
|  glossaryFilepath    |                            specify the directory and name of the glossary file                            | string | ./docs/glossary.md |
|  patternSeparator    | the special character used to separate `term_text` <br>and `term_name` in the replace pattern for parsing | string |         \|         |
|   noParseFiles       |                             array of files to be excluded from search/replace                             |  array |         []         |
|  noGlossaryFiles     |                         array of term files to not be listed on the glossary page                         |  array |         []         |
| glossaryTermPatterns |          array of `type` values, to choose category/ies of terms to be included in the glossary           |  array |         []         |

> `type`: optional attribute in the header of the Markdown files

**IMPORTANT NOTE**: All file paths need to be relative to the
project's root directory. If you want to exclude a file, you should
write `./docs/excude-me.md`. 

Example:

```js
plugins: [
  [
    '@lunaticmuch/docusaurus-terminology',
    {
      termsDir: './docs/terminology/',
      noParseFiles: ['./docs/terminology/agent.md', './docs/terminology/actor.md'],
      noGlossaryFiles: ['./docs/terminology/agent.md'],
      glossaryTermPatterns: ['concept']
    }
  ]
]
```

## To Do

- [ ] Include the option to select a [Popover](https://mui.com/material-ui/react-popover/) 
as alternative to Tooltip for longer descriptions
- [ ] Include addtional options in the `Term` tag to control classes

## Original Author

This plugin has been originally developed by Thanasis Katsadas <kathan@admin.grnet.gr> and the Greek Government. 
The original work is still available on [GRNet Gitlab](https://gitlab.grnet.gr/terminology/docusaurus-terminology). 