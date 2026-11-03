import passport from "passport";
import { jwtConfig } from "./jwt-config";
import { IVerifyOptions, Strategy as LocalStrategy, VerifyFunction } from "passport-local";
import { Strategy as JWTStrategy, StrategyOptions as JWTStrategyOptions, ExtractJwt } from "passport-jwt";
import { buildContext } from "./context";
import { isValidOpsManagerUser } from "modules/core/auth";
import * as db from "db";
import { notNilString } from "modules/helpers/nil-helpers";
import { appKeyConfig, checkForAppKey } from "./app-key-config";
import {
  isUserName,
  OpsManagerUser,
  OpsManagerUserAndAppKey,
  UserName,
  UserNameOrEmail,
} from "modules/helpers/user-information";

const localAuthOnly = process.env.AUTH_LOCAL === "true";

const ctx = buildContext({ db: db.getConnection() });

const validateGraphQLAuth: VerifyFunction = (
  user_name: string,
  app_specific_key: string,
  done: (error: any, user?: any, options?: IVerifyOptions) => void
): void => {
  try {
    console.info("🔐 GraphQL Authenticated Login:", user_name);

    if (!notNilString(app_specific_key)) {
      return done(`app_specific_key is nil`);
    }

    if (!notNilString(appKeyConfig.secret)) {
      return done(`app specific keys are missing on the server`);
    }

    if (!checkForAppKey(app_specific_key)) {
      return done(`Unknown app_specific_key: ${app_specific_key}`);
    }

    ctx.activeDirectory
      .getActiveDirectoryGroupMembers("OpsManager Author")
      .then((authorMembers) => {
        if (authorMembers) {
          const authorMatch = authorMembers.find((member) => {
            if (isUserName(user_name)) {
              return member["accountName"] === user_name;
            } else {
              return member["email"] === user_name;
            }
          });

          if (authorMatch) {
            return done(null, {
              department: authorMatch.department,
              distinguishedName: authorMatch.distinguishedName,
              emailAddress: authorMatch.email,
              employeeNumber: parseInt(authorMatch.employeeId),
              firstName: authorMatch.givenName,
              lastName: authorMatch.surname,
              formattedName: authorMatch.name,
              gentexPhone: authorMatch.phone,
              manager: authorMatch.manager,
              mobilePhone: authorMatch.mobilePhone,
              pager: authorMatch.pager,
              principalName: authorMatch.principalName,
              sid: authorMatch.sid,
              userName: authorMatch.accountName,
              readOnly: process.env.READ_ONLY_MODE === "true" ? true : false,
              AppKey: app_specific_key,
            } as OpsManagerUserAndAppKey);
          }

          ctx.activeDirectory
            .getActiveDirectoryGroupMembers("OpsManager User")
            .then((readOnlyMembers) => {
              const readOnlyUserMatch = readOnlyMembers.find((member) => {
                if (isUserName(user_name)) {
                  return member["accountName"] === user_name;
                } else {
                  return member["email"] === user_name;
                }
              });

              if (readOnlyUserMatch) {
                return done(null, {
                  department: readOnlyUserMatch.department,
                  distinguishedName: readOnlyUserMatch.distinguishedName,
                  emailAddress: readOnlyUserMatch.email,
                  employeeNumber: parseInt(readOnlyUserMatch.employeeId),
                  firstName: readOnlyUserMatch.givenName,
                  lastName: readOnlyUserMatch.surname,
                  formattedName: readOnlyUserMatch.name,
                  gentexPhone: readOnlyUserMatch.phone,
                  manager: readOnlyUserMatch.manager,
                  mobilePhone: readOnlyUserMatch.mobilePhone,
                  pager: readOnlyUserMatch.pager,
                  principalName: readOnlyUserMatch.principalName,
                  sid: readOnlyUserMatch.sid,
                  userName: readOnlyUserMatch.accountName,
                  readOnly: true,
                  AppKey: app_specific_key,
                } as OpsManagerUserAndAppKey);
              } else {
                const errorMsg = Error(
                  `The specified user "${user_name}" does not have permissions to access OpsManager.`
                );
                return done(errorMsg, user_name);
              }
            })
            .catch((error) => {
              const errorMsg = Error(`Exception during call to getActiveDirectoryGroupMembers: ${error}`);
              return done(errorMsg, null);
            });
        }
      })
      .catch((error) => {
        const errorMsg = Error(`Exception during call to getActiveDirectoryGroupMembers: ${error}`);
        return done(errorMsg, null);
      });
  } catch (error) {
    const errorMsg = Error(`Exception during graphql auth: ${error}`);
    return done(errorMsg, null);
  }
};

const doesUserHaveOpsmanagerAccess: VerifyFunction = (
  usernameOrEmail: UserNameOrEmail,
  password: string,
  done: (error: any, email?: any, options?: IVerifyOptions) => void
) => {
  try {
    console.info("🔐 Authenticated Login:", usernameOrEmail);

    ctx.activeDirectory
      .getActiveDirectoryGroupMembers("OpsManager Author")
      .then((authorMembers) => {
        if (authorMembers) {
          const authorMatch = authorMembers.find((member) => {
            if (isUserName(usernameOrEmail)) {
              return member["accountName"] === usernameOrEmail;
            } else {
              return member["email"] === usernameOrEmail;
            }
          });

          if (authorMatch) {
            return done(null, {
              department: authorMatch.department,
              distinguishedName: authorMatch.distinguishedName,
              emailAddress: authorMatch.email,
              employeeNumber: parseInt(authorMatch.employeeId),
              firstName: authorMatch.givenName,
              lastName: authorMatch.surname,
              formattedName: authorMatch.name,
              gentexPhone: authorMatch.phone,
              manager: authorMatch.manager,
              mobilePhone: authorMatch.mobilePhone ?? "",
              pager: authorMatch.pager,
              principalName: authorMatch.principalName,
              sid: authorMatch.sid,
              userName: authorMatch.accountName,
              readOnly: process.env.READ_ONLY_MODE === "true" ? true : false,
            } as OpsManagerUser);
          }

          ctx.activeDirectory
            .getActiveDirectoryGroupMembers("OpsManager User")
            .then((readOnlyMembers) => {
              const readOnlyUserMatch = readOnlyMembers.find((member) => {
                if (isUserName(usernameOrEmail)) {
                  return member["accountName"] === usernameOrEmail;
                } else {
                  return member["email"] === usernameOrEmail;
                }
              });

              if (readOnlyUserMatch) {
                return done(null, {
                  department: readOnlyUserMatch.department,
                  distinguishedName: readOnlyUserMatch.distinguishedName,
                  emailAddress: readOnlyUserMatch.email,
                  employeeNumber: parseInt(readOnlyUserMatch.employeeId),
                  firstName: readOnlyUserMatch.givenName,
                  lastName: readOnlyUserMatch.surname,
                  formattedName: readOnlyUserMatch.name,
                  gentexPhone: readOnlyUserMatch.phone,
                  manager: readOnlyUserMatch.manager,
                  mobilePhone: readOnlyUserMatch.mobilePhone ?? "",
                  pager: readOnlyUserMatch.pager,
                  principalName: readOnlyUserMatch.principalName,
                  sid: readOnlyUserMatch.sid,
                  userName: readOnlyUserMatch.accountName,
                  readOnly: true,
                } as OpsManagerUser);
              } else {
                const errorMsg = Error(
                  `The specified user "${usernameOrEmail}" does not have permissions to access OpsManager.`
                );
                return done(errorMsg, usernameOrEmail);
              }
            })
            .catch((error) => {
              const errorMsg = Error(`Exception during call to getActiveDirectoryGroupMembers: ${error}`);
              return done(errorMsg, null);
            });
        }
      })
      .catch((error) => {
        const errorMsg = Error(`Exception during call to getActiveDirectoryGroupMembers: ${error}`);
        return done(errorMsg, null);
      });
  } catch (error) {
    const errorMsg = Error(`Exception during doesUserHaveOpsManagerAccess: ${error}`);
    return done(errorMsg, null);
  }
};

if (localAuthOnly) {
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "username", passwordField: "username", session: false },
      (username: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) =>
        doesUserHaveOpsmanagerAccess(username as UserName, password, done)
    )
  );
}

const opts: JWTStrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtConfig.secret,
};

passport.use(
  "jwt",
  new JWTStrategy(opts, (jwtPayload, done) => {
    if (!isValidOpsManagerUser(jwtPayload)) {
      const errorMsg = `jwtPayload is not a valid opsmanager user record`;
      return done(errorMsg);
    }

    return done(null, jwtPayload);
  })
);

passport.use(
  "graphql",
  new LocalStrategy(
    {
      usernameField: "user_name",
      passwordField: "app_specific_key",
      session: false,
    },
    (user_name: string, app_specific_key: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) =>
      validateGraphQLAuth(user_name, app_specific_key, done)
  )
);
