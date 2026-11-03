if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    silent: false,
  });
}

module.exports = {
  environment: process.env.NODE_ENV,

  databaseServer: process.env.DATABASE_SERVER,
  databaseName: process.env.DATABASE_NAME,
  databaseUser: process.env.DATABASE_USER,
  databasePassword: process.env.DATABASE_PASSWORD,

  dataGridLicenseKey:
    "25ab014f265bb8eeedef293f63c72334Tz0xMjY4ODgsRT0xODA0OTgyMzk5MDAwLFM9cHJlbWl1bSxMTT1hbm51YWwsUFY9aW5pdGlhbCxLVj0y",

  minify: process.env.MINIFY != null ? process.env.MINIFY === "true" : process.env.NODE_ENV === "production",

  production: process.env.NODE_ENV === "production",
  development: process.env.NODE_ENV === "development",
  test: process.env.NODE_ENV === "test",

  redis: {
    url: process.env.REDIS_URL,
    prefix: process.env.REDIS_PREFIX || "",
  },

  viteDevServer: {
    url: `${process.env.SSL_ENABLED}`.trim() === "true" ? "https://localhost" : "http://localhost",
    port: 3000,
    hot: true,
    inline: true,
    noInfo: true,
    host: process.env.VITE_DEV_SERVER_HOST || null,
  },

  auth: {
    azureAD: {
      identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_TENANT_ID}/${process.env.OAUTH_ID_METADATA}`,
      clientID: process.env.OAUTH_APP_ID,
      responseType: "code id_token",
      responseMode: "form_post",
      redirectUrl: `${process.env.OAUTH_REDIRECT_URI}`,
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.OAUTH_APP_PASSWORD,
      scope: process.env.OAUTH_SCOPES?.split(" "),
      useCookieInsteadOfSession: true,
      cookieSameSite: true,
      cookieEncryptionKeys: [{ key: "xfxavIzpCOd9LlWZrbbEpHGVJrPzukWi", iv: "UWexTi9waiBn" }],
    },
  },

  server: {
    port: process.env.PORT || 3001,
    apiHost: process.env.API_HOST || "localhost:3001",
    secret: process.env.SERVER_SECRET || "serverSecret",

    protocol: process.env.SSL_ENABLED === "true" ? "https" : "http",

    graphiql: false,

    jwtSecret: process.env.JWT_SECRET || "jwtSecret",
    graphqlAppSecret: process.env.APP_SPECIFIC_KEYS || "",

    sslEnabled: process.env.SSL_ENABLED === "true",
    sslKeyFile: process.env.SSL_KEY || "",
    sslCertFile: process.env.SSL_CERT || "",

    webId: process.env.WEB_ID || "",

    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:3001"],
  },
  jobs: {
    workers: 1,
  },

  subversion: {
    repoName: process.env.SVN_REPO,
    baseUrl: process.env.SVN_URL,
    username: process.env.SVN_USER,
    password: process.env.SVN_PASSWORD,
  },

  restApi: {
    mesSecurityEndpoint: process.env.MES_SECURITY_ENDPOINT,
    mesUserPictureEndpoint: process.env.MES_USER_PICTURE_ENDPOINT,
    mesActiveDirectoryEndpoint: process.env.MES_ACTIVE_DIRECTORY_ENDPOINT,
  },
  freshservice: {
    endpoint: process.env.FRESHSERVICE_ENDPOINT,
    apiKey: process.env.FRESHSERVICE_API_KEY,
  },

  featureFlags: {
    readOnlyMode: process.env.READ_ONLY_MODE === "true" ? true : false,
    enablePdfExport: process.env.ENABLE_PDF_EXPORT === "true" ? true : false,
  },
};
