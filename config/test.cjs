module.exports = {
  databaseServer: "sql-server",
  databaseName: "test-memorymap",
  databaseUser: "SA",
  databasePassword: "YourStrongPassw0rd",

  redis: {
    url: "redis://redis:6379/0",
    prefix: process.env.REDIS_PREFIX || "",
  },
  server: {
    port: 3002,
    requireAuth: false,
    secret: "cats",
    graphqlAppSecret: "--testAppKey1--testAppKey2--testAppKey3--",
  },
  subversion: {
    repoName: "commandsets/xml",
    baseUrl: "http://subversion/svn/gentex-repo",
    username: "user",
    password: "password",
  },
  smb: {
    versionedLibraries: {
      share: "\\\\samba\\smbFakeShare",
      domain: "WORKGROUP",
      username: "test",
      password: "TEST123",
      basePath: "tests",
    },
  },
  mesRestApi: {
    mesSecurityEndpoint: "http://rest-endpoints:3070/",
    mesUserPictureEndpoint: "http://rest-endpoints:3070/user/image/",
    mesActiveDirectoryEndpoint: "http://rest-endpoints:3070/",
  },
  freshservice: {
    endpoint: "http://rest-endpoints:3070/freshservice/",
    apiKey: "Sharingan",
  },
  featureFlags: {
    readOnlyMode: false,
    enablePdfExport: process.env.ENABLE_PDF_EXPORT === "true" ? true : false,
  },
};
