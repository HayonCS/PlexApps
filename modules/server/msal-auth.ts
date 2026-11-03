import { ConfidentialClientApplication, AuthorizationCodeRequest, AuthenticationResult } from "@azure/msal-node";
import { Router, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { msalConfig, REDIRECT_URI, SCOPES } from "./msal-config";
import { jwtConfig } from "./jwt-config";
import { buildContext } from "./context";
import * as db from "db";
import { Email, isEmail, isUserName, OpsManagerUser, UserNameOrEmail } from "modules/helpers/user-information";

const msalInstance = new ConfidentialClientApplication(msalConfig);

const ctx = buildContext({ db: db.getConnection() });

export const msalAuthRouter = Router();

/**
 * Looks up user in OpsManager groups and returns user info if found
 */
async function lookupOpsManagerUser(usernameOrEmail: UserNameOrEmail): Promise<OpsManagerUser> {
  const authorMembers = await ctx.activeDirectory.getActiveDirectoryGroupMembers("OpsManager Author");

  if (authorMembers) {
    const authorMatch = authorMembers.find((member) => {
      if (isUserName(usernameOrEmail)) {
        return member["accountName"]?.toLowerCase() === usernameOrEmail.toLowerCase();
      } else {
        return member["email"]?.toLowerCase() === usernameOrEmail;
      }
    });

    if (authorMatch) {
      return {
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
        readOnly: process.env.READ_ONLY_MODE === "true",
      };
    }
  }

  const readOnlyMembers = await ctx.activeDirectory.getActiveDirectoryGroupMembers("OpsManager User");

  const readOnlyUserMatch = readOnlyMembers.find((member) => {
    if (isUserName(usernameOrEmail)) {
      return member["accountName"]?.toLowerCase() === usernameOrEmail.toLowerCase();
    } else {
      if (isEmail(usernameOrEmail)) {
        return member["email"]?.toLowerCase() === usernameOrEmail;
      }
    }
  });

  if (readOnlyUserMatch) {
    return {
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
    };
  }

  throw new Error(`The specified user "${usernameOrEmail}" does not have permissions to access OpsManager.`);
}

function extractUserEmail(response: AuthenticationResult): Email | undefined {
  // Try account username first, then idTokenClaims
  if (response.account?.username) {
    return response.account.username as Email;
  }

  const claims = response.idTokenClaims as Record<string, unknown> | undefined;
  if (claims?.preferred_username && typeof claims.preferred_username === "string") {
    return claims.preferred_username as Email;
  }

  return undefined;
}

const handleLogin: RequestHandler = (req, res, next) => {
  (async () => {
    try {
      console.info("🔐 MSAL login initiated, redirect URI:", REDIRECT_URI);
      const authCodeUrlParameters = {
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
      };

      const authUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ auth: false, reason: "Authentication error" });
    }
  })().catch(next);
};

msalAuthRouter.get("/login", handleLogin);

const handleCallback: RequestHandler = (req, res, next) => {
  (async () => {
    console.info("🔐 MSAL callback hit - method:", req.method);

    // Support both GET (query params) and POST (body)
    const code = req.query.code || req.body?.code;
    const error = req.query.error || req.body?.error;
    const error_description = req.query.error_description || req.body?.error_description;

    if (error) {
      console.error("Azure AD error:", error, error_description);
      res.status(401).json({ auth: false, reason: error_description || error });
      return;
    }

    if (!code) {
      console.error("MSAL callback: No authorization code. Query:", req.query, "Body:", req.body);
      res.status(400).json({ auth: false, reason: "Authorization code not found" });
      return;
    }

    const tokenRequest: AuthorizationCodeRequest = {
      code: code as string,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
    };

    try {
      const response = await msalInstance.acquireTokenByCode(tokenRequest);

      // Extract user email from the token
      const userEmail = extractUserEmail(response);

      if (!userEmail) {
        res.status(401).json({ auth: false, reason: "Could not extract user email from token" });
        return;
      }

      // Validate user has OpsManager access
      const user = await lookupOpsManagerUser(userEmail);

      // Issue JWT cookie and redirect to app
      const token = jwt.sign(user, jwtConfig.secret);
      console.info("🔐 MSAL SSO Login successful for:", userEmail);
      res.cookie("app-jwt-cookie", token, {
        httpOnly: false, // Client JS needs to read this cookie
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      res.redirect("/");
    } catch (error) {
      console.error("Error during MSAL authentication:", error);
      const errorMessage = error instanceof Error ? error.message : "Token acquisition failed";
      res.status(401).json({ auth: false, reason: errorMessage });
    }
  })().catch(next);
};

msalAuthRouter.get("/callback", handleCallback);
msalAuthRouter.post("/callback", handleCallback);

const handleApiLogin: RequestHandler = (req, res, next) => {
  (async () => {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ auth: false, reason: "Authorization code required" });
      return;
    }

    const tokenRequest: AuthorizationCodeRequest = {
      code,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
    };

    try {
      const response = await msalInstance.acquireTokenByCode(tokenRequest);

      const userEmail = extractUserEmail(response);

      if (!userEmail) {
        res.status(401).json({ auth: false, reason: "Could not extract user email from token" });
        return;
      }

      const user = await lookupOpsManagerUser(userEmail);

      res.status(200).json({
        auth: true,
        token: jwt.sign(user, jwtConfig.secret),
      });
    } catch (error) {
      console.error("Error during MSAL login:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      res.status(401).json({ auth: false, reason: errorMessage });
    }
  })().catch(next);
};

msalAuthRouter.post("/login", handleApiLogin);

export { lookupOpsManagerUser };
