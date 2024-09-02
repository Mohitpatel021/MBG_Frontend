const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  plugins: [new NodePolyfillPlugin()],
  cache: true,
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      fs: false,
      assert: require.resolve("assert/"),
      url: require.resolve("url/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      stream: require.resolve("stream-browserify"),
      zlib: require.resolve("browserify-zlib"),
      os: require.resolve("os-browserify/browser"),
      net: false,
      tls: false,
      util: require.resolve("util/"),
      child_process: false,
    },
  },
};
