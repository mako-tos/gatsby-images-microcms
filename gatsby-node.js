const { sourceNodes } = require('./src/sourceNodes');
const { onPreBootstrap } = require('./src/onPreBootstrap');
const { createSchemaCustomization } = require('./src/createSchemaCustomization');

module.exports = {
  sourceNodes,
  onPreBootstrap,
  createSchemaCustomization,
};
