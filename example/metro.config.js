const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// the sdk is installed with `file:..`, so yarn copies it with its own node_modules.
// resolve everything from example/node_modules to avoid a second react / react-native.
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [`${__dirname}/node_modules`];

module.exports = config;
