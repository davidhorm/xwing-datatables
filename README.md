X-Wing DataTables
======
https://davidhorm.github.io/xwing-datatables/ is my personal website to support players of [X-Wing Second Edition](http://x-wing.com/) miniature game by [Fantasy Flight Games](http://fantasyflightgames.com/). This site takes the text found on the cards of the game and puts them in tables for easy searching and filtering.

## Technology
* [xwing-data2](/guidokessels/xwing-data2) - repository containing game data
* [DataTables](https://www.datatables.net/) - jQuery plugin for generating HTML Tables
* [excel-bootstrap-table-filter](/chestercharles/excel-bootstrap-table-filter) - jQuery plugin to generate an Excel-flavored table column filters

### Built With
* [standard-version](/conventional-changelog/standard-version) - for automatic versioning and CHANGELOG generation
* [HTMLMinifier](https://www.npmjs.com/package/html-minifier)(installed globally) - for minifying html

### Usage

This project depends on other GitHub projects. You may need to update the submodules to get the latest data.
```
git submodule update --init --recursive
```

This project uses [Conventional Commits](https://conventionalcommits.org). That means commit messages should be prefixed with: `fix:` (patch version), `feat:` (minor version), or `BREAKING CHANGE:` (major version) for specific versioning. Commit messages may also be prefixed with: `docs:`, `style:`, `refactor:`, `perf:`, `test:`,  or others for non-versioning. Run the following to commit, update CHANGELOG.md, and push to GitHub:
```
git commit -a -m "<type>: <message>"
npm run release
git push --follow-tags origin master
```

## Badges

Is this a thing?

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)