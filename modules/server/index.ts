import * as AuthRoutes from "client/auth/authentication-routes";
import * as _ from "lodash-es";
import bodyParser from "body-parser";
import fs from "fs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { GraphQLFormattedError } from "graphql";
import { typeDefs, resolvers } from "graphql-api";
import { jwtConfig } from "./jwt-config";
import { Context } from "context";
import { Logger } from "atomic-object/logger";
import { checkForAppKey } from "./app-key-config";
import { graphiqlMiddleware } from "modules/graphql-api/graphiql-middleware";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import { isValidOpsManagerUser, isValidOpsManagerUserAndAppKey } from "modules/core/auth";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import compression from "compression";
import http from "http";
import https from "https";
import Arena from "bull-arena";
import morgan from "morgan";
import enforce from "express-sslify";
import expressStaticGzip from "express-static-gzip";
import cookieSession from "cookie-session";
import Bull from "bull";
import config from "config";
import "./passport";
import { promRegistry } from "./prom-registry";
import { startWebSocket } from "./server-websocket";
import { msalAuthRouter } from "./msal-auth";

const localAuthOnly = process.env.AUTH_LOCAL === "true";

let app = express();
export const port = config.get<number>("server.port");

//
// sslConfiguration
//
// Keep track of valuable ssl information about the keys/certificates and whether
// or not we are using ssl.
//
const sslConfiguration = {
  enabled: config.get<boolean>("server.sslEnabled"),
  sslKeyFile: config.get<string>("server.sslKeyFile"),
  sslCertFile: config.get<string>("server.sslCertFile"),
  httpServer: config.get<boolean>("server.sslEnabled") ? https : http,
};

//
// credentials
//
// This object can be provided to https during the server creation.
const credentials = {
  key: sslConfiguration.enabled ? fs.readFileSync(sslConfiguration.sslKeyFile) : "",
  cert: sslConfiguration.enabled ? fs.readFileSync(sslConfiguration.sslCertFile) : "",
};

export async function startServer() {
  app.use(cors());
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use(cookieParser());
  app.use(
    bodyParser.json({
      limit: "50mb",
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  /* eslint-disable @typescript-eslint/no-misused-promises*/
  app.use(
    cookieSession({
      name: "session",
      secret: config.get<string>("server.secret"),
    })
  );
  /* eslint-enable @typescript-eslint/no-misused-promises*/

  // Logging
  app.use((req: any, res: any, next: any) => {
    morgan("short");
    return next();
  });

  if (sslConfiguration.enabled) {
    app.use(() => {
      enforce.HTTPS({
        trustProtoHeader: true,
      });
    });
  }

  // Gzip support
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use(compression());

  app.post(AuthRoutes.LOGOUT, (req: any, res: any) => {
    req.logout(() => {});
    res.status(200).json({
      success: true,
      cookieClear: true,
    });
    res.clearCookie("app-jwt-cookie");
  });

  // Authentication routes
  if (localAuthOnly) {
    // Local authentication using Passport LocalStrategy
    app.get(AuthRoutes.LOGIN, passport.authenticate("login", { session: false }), (req: any, res: any) => {
      if (req.user) {
        res.status(200).json({
          auth: true,
          token: jwt.sign(req.user, jwtConfig.secret),
        });
      } else {
        res.status(401).json({ auth: false, reason: "User does not exist" });
      }
    });

    app.post(AuthRoutes.LOGIN, passport.authenticate("login", { session: false }), (req: any, res: any) => {
      if (req.user) {
        res.status(200).json({
          auth: true,
          token: jwt.sign(req.user, jwtConfig.secret),
        });
      } else {
        res.status(401).json({ auth: false, reason: "User does not exist" });
      }
    });

    app.post(AuthRoutes.CALLBACK, (req: any, res: any) => {
      // For local auth, callback isn't used - redirect to login
      res.redirect("/login");
    });
  } else {
    // Azure AD authentication using MSAL
    app.use("/auth", msalAuthRouter);
  }

  app.get(AuthRoutes.CHECK_AUTH, passport.authenticate("jwt", { session: false }));

  // Prometheus metrics (no auth required for scraping)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", promRegistry.contentType);
    res.send(await promRegistry.metrics());
  });

  app.use("/arena", () => {
    Arena(
      {
        Bull,
        queues: [
          {
            name: "main",
            prefix: config.get("redis.prefix"),
            hostId: "redis",
            redis: config.get("redis.url"),
          },
        ],
      },
      {
        // Make the arena dashboard become available at {my-site.com}/arena.
        // basePath: "/arena",

        // Let express handle the listening.
        disableListen: true,
      }
    );
  });

  // GraphQL
  app.post(AuthRoutes.GRAPHQL_AUTH, passport.authenticate("graphql", { session: false }), (req: any, res: any) => {
    if (req.user) {
      res.status(200).json({
        auth: true,
        token: jwt.sign(req.user, jwtConfig.secret, { expiresIn: "1d" }),
      });
    } else {
      res.status(401).json({ auth: false, reason: "GraphQL auth failed" });
    }
  });

  const apolloServerGraphql = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    formatError: (formattedError: GraphQLFormattedError) => {
      Logger.error(formattedError);
      return formattedError;
    },
  });

  await apolloServerGraphql.start();

  app.use(
    "/graphql",
    bodyParser.json(),
    passport.authenticate("jwt", { session: false }),
    expressMiddleware(apolloServerGraphql, {
      context: async ({ req }) => {
        let userNameForContext: string | undefined = undefined;
        let appKeyForContext: string | undefined = undefined;
        let canSaveMemoryMap = false;

        if (req) {
          //https://github.com/graphql/graphql-http/discussions/99#discussioncomment-6381926
          const headerToken = req.headers.authorization;
          if (!headerToken) {
            throw new Error("Not authorized for graphql queries: Missing token.");
          }

          const decoded = jwt.verify(headerToken.replace("Bearer ", ""), jwtConfig.secret);

          if (!decoded) {
            throw new Error("Not authorized for graphql queries: Token could not be decoded.");
          }

          if (!isValidOpsManagerUser(decoded)) {
            throw new Error("Not authorized for graphql queries: Token is not a user record.");
          }

          userNameForContext = _.get(decoded, "userName", undefined);
          if (!userNameForContext) {
            throw new Error("Not authorized for graphql queries: User name not provided in token.");
          }

          //Check the app specific key (for clients who authenticated against the /auth/graphql endpoint)
          if (isValidOpsManagerUserAndAppKey(decoded)) {
            const app_specific_key = _.get(decoded, "AppKey", undefined);
            if (!app_specific_key) {
              throw new Error("Not authorized for graphql queries: App key not provided in token.");
            }

            if (!checkForAppKey(app_specific_key)) {
              throw new Error(`Not authorized for graphql queries: Unknown app key: "${app_specific_key}".`);
            }

            appKeyForContext = app_specific_key;

            //Check for token expiration
            const tokenIssuedDate = _.get(decoded, "iat", undefined);
            if (!tokenIssuedDate) {
              throw new Error("Not authorized for graphql queries: Issued at time not provided in token.");
            }

            const tokenExpirationDate = _.get(decoded, "exp", undefined);
            if (!tokenExpirationDate) {
              throw new Error("Not authorized for graphql queries: Expiration time not provided in token.");
            }
          }

          //Make sure the user is an active Gentex employee
          const employeeNumber = _.get(decoded, "employeeNumber", undefined);
          if (!employeeNumber) {
            throw new Error(
              `Not authorized for graphql queries: User "${userNameForContext}" is an inactive Gentex employee.`
            );
          }

          //Prevent read only users from running mutations
          const isUserReadOnly = _.get(decoded, "readOnly", true);
          // Independent of query text, integration headers, or caller-provided document fields.
          canSaveMemoryMap = decoded.readOnly === false && decoded.employeeNumber > 0;
          if (isUserReadOnly && !req.headers.freshservice) {
            const reqBody: string | undefined | unknown = _.get(req, "body.query", undefined);

            if (!reqBody) {
              throw new Error("Not authorized for graphql queries: Request body is missing.");
            }

            if (typeof reqBody === "string") {
              const requestCheck = reqBody.toLowerCase();
              if (
                requestCheck.includes("mutation") &&
                !requestCheck.includes("introspectionquery") &&
                !requestCheck.includes("Freshservice")
              ) {
                throw new Error(
                  `Not authorized for graphql mutations: User "${userNameForContext}" has read only permissions in the OpsManager database.`
                );
              }
            }
          }
        }

        return new Context({
          userName: userNameForContext, //userName must be provided for use by the graphql-api resolvers
          appKey: appKeyForContext, //appKey must be provided for logging which application performed a mutation
          memoryMapSaveAuthorization: userNameForContext
            ? { userName: userNameForContext, canWrite: canSaveMemoryMap }
            : undefined,
        });
      },
    })
  );

  // GraphQL web IDE
  if (config.get("server.graphiql")) {
    app.use("/graphiql", graphiqlMiddleware({ endpointUrl: "/graphiql-graphql" }));

    const apolloServerGraphiql = new ApolloServer({
      typeDefs: typeDefs,
      resolvers: resolvers,
      formatError: (formattedError: GraphQLFormattedError) => {
        Logger.error(formattedError);
        return formattedError;
      },
    });

    await apolloServerGraphiql.start();

    app.use(
      "/graphiql-graphql",
      bodyParser.json(),
      expressMiddleware(apolloServerGraphiql, {
        context: async (req) => {
          return new Context({
            userName: _.get(req, "user.name", "graphiql_user"),
            appKey: _.get(req, "user.AppKey", "GraphiQl_Web_IDE"),
          });
        },
      })
    );
  }

  // Static assets
  app.use(expressStaticGzip("./dist/", {}));
  app.use(express.static("./dist/"));

  // Health check endpoint
  app.get("/health", (req: any, res: any) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Serve index.html for all unknown URLs
  app.get("/*", function (req: any, res: any) {
    res.sendFile(process.cwd() + "/dist/index.html");
  });

  const CreateHttpsServer = () => {
    const httpsServer = https.createServer(credentials, app);
    startWebSocket(httpsServer);
    return httpsServer.listen(port, () => {
      console.info(`[HTTPS] Server Start on port ${port}.`);
    });
  };

  const CreateHttpServer = () => {
    const httpServer = http.createServer(app);
    startWebSocket(httpServer);
    return httpServer.listen(port, () => {
      console.info(`[HTTP] Server Start on port ${port}.`);
    });
  };

  const server = sslConfiguration.enabled ? CreateHttpsServer() : CreateHttpServer();

  server.setTimeout(30 * 60 * 1000);

  return server;
}
