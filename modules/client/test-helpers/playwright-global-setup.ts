import { promises as fs } from "fs";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const E2E_LOGIN_USERNAME = process.env.E2E_LOGIN_USERNAME ?? "bill.brasky";

async function setupAuthentication() {
  // Call the login API directly — avoids any dependency on AUTH_LOCAL being
  // baked into the client bundle at build time, and any flakiness in the
  // login UI flow.
  const res = await fetch(`${BASE_URL}/auth/login?username=${encodeURIComponent(E2E_LOGIN_USERNAME)}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(
      `Login API returned ${res.status} for user "${E2E_LOGIN_USERNAME}". ` +
        `Is the server running and is AUTH_LOCAL=true?`
    );
  }
  const { token } = (await res.json()) as { token: string };

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: BASE_URL,
        localStorage: [{ name: "AUTH_TOKEN", value: token }],
      },
    ],
  };

  await fs.writeFile("./.auth-state.json", JSON.stringify(storageState));
}

export default async function globalSetup() {
  await setupAuthentication();
}
