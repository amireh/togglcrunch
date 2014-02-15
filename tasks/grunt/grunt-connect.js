module.exports = {
  tests: {
    options: {
      keepalive: false,
      port: 8001
    }
  },

  docs: {
    options: {
      keepalive: true,
      port: 8002,
      base: "doc"
    }
  },

  browser_tests: {
    options: {
      keepalive: true,
      port: 8003
    }
  }
};
