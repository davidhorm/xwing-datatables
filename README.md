X-Wing DataTables
======
https://davidhorm.github.io/xwing-datatables/ is my personal website to support players of [X-Wing Second Edition](http://x-wing.com/) miniature game by [Fantasy Flight Games](http://fantasyflightgames.com/). This site takes the text found on the cards of the game and puts them in tables for easy searching and filtering.

## Usage

This project depends on another project. You may need to update the submodule to get the latest data.
```
git submodule update --init --recursive
```

This project uses [Conventional Commits](https://conventionalcommits.org). That means commit messages should be prefixed with: `fix:` (patch version), `feat:` (minor version), or `BREAKING CHANGE:` (major version) for specific versioning. Commit messages may also be prefixed with: `docs:`, `style:`, `refactor:`, `perf:`, `test:`,  or others for non-versioning. Then run the following to update the CHANGELOG.md file.
```
npm run release
```

## Technology
* [xwing-data2](/guidokessels/xwing-data2) - repository containing game data
* [DataTables](https://www.datatables.net/) - jQuery plug-in for generating HTML Tables

### Built With
* [standard-version](/conventional-changelog/standard-version) - for automatic versioning and CHANGELOG generation

## Badges

Is this a thing?

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)