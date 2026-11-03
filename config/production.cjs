module.exports = {
  minify: true,
  server: {
    graphiql: process.env.APP_ENDPOINT === "prod" ? false : true,
  },
};
