const profiles = require("./profiles");
const validationRules = require("./validationRules");

const stdScopeTemplate = require("./standard/stdScopeTemplate");
const stdSrsTemplate = require("./standard/stdSrsTemplate");
const stdSdsTemplate = require("./standard/stdSdsTemplate");
const stdStpTemplate = require("./standard/stdStpTemplate");

const acadScopeTemplate = require("./academic/acadScopeTemplate");
const acadSrsTemplate = require("./academic/acadSrsTemplate");
const acadSdsTemplate = require("./academic/acadSdsTemplate");
const acadStpTemplate = require("./academic/acadStpTemplate");

const compScopeTemplate = require("./company/compScopeTemplate");
const compSrsTemplate = require("./company/compSrsTemplate");
const compSdsTemplate = require("./company/compSdsTemplate");
const compStpTemplate = require("./company/compStpTemplate");

const templates = [
  stdScopeTemplate,
  stdSrsTemplate,
  stdSdsTemplate,
  stdStpTemplate,
  acadScopeTemplate,
  acadSrsTemplate,
  acadSdsTemplate,
  acadStpTemplate,
  compScopeTemplate,
  compSrsTemplate,
  compSdsTemplate,
  compStpTemplate
];

module.exports = {
  profiles,
  templates,
  validationRules
};
