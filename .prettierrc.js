"use strict";

module.exports = {
  printWidth: 100,
  trailingComma: "all",
  arrowParens: "avoid",
  semi: true,
  tabWidth: 4,

  overrides: [
    {
      files: ["*.md"],
      options: { printWidth: 120 },
    },
    {
      files: [".toolsharerc"],
      options: { parser: "yaml" },
    },
  ],
};
