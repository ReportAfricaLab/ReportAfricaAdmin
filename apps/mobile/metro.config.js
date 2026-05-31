const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;

// Fix socket.io-client / engine.io-client module resolution for Metro
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'cjs'];

// Fix Sentry internal module resolution — Metro with package exports
// can't resolve some CJS tracing sub-modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Let Sentry internal CJS requires bypass package exports
  if (moduleName.startsWith('./tracing/') && context.originModulePath?.includes('@sentry')) {
    let resolved = path.resolve(path.dirname(context.originModulePath), moduleName);
    if (!path.extname(resolved)) resolved += '.js';
    return { type: 'sourceFile', filePath: resolved };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
