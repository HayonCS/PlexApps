## Prerequisites

- Authenticated users only.
- You need to have the URI of the Gentex Freshservice REST API.
- You need to have the API Key(s) for the Freshservice endpoint.

# Introduction

The Freshservice domain service allows the creation and retrieval of Freshservice tickets for Gentex.

This document covers [How Freshservice Works](#how-it-works),
[How Tickets/Requests Work](#how-tickets-work),
[Where To Handle Tickets](#where-to-handle), and
[Query/Mutation Examples](#query-mutation-examples).

<h1 id="how-it-works">How Freshservice Works</h1>

This section explains how Freshservice works as a whole: Gentex Freshservice API, How Tickets Work, and Endpoints and Ticket Handling.

<h2>Gentex Freshservice API</h2>

The Gentex Freshservice API is a gateway for the official Freshservice API.
This is to put different authentication parameters in front of the official API.
This also means the Gentex API and the Freshservice API are the exact same 1:1.

NOTE: Only Tickets, Service Requests, and Requesters are available for use in the API.

The Documentation for the Freshservice API can be found here:

[Freshservice API Documentation](https://api.freshservice.com/)

Corresponding Gentex API endpoints:

- api.gentex.com/freshservice/
- apidev.gentex.com/freshservice/
- apiqa.gentex.com/freshservice/

Pathing Syntax:

- api.gentex.com/freshservice/servicerequests/{catalog_id}/place_request    - POST call for creating service request
- api.gentex.com/freshservice/servicerequests/                              - GET

## The API Key

An API Key is needed to perform calls on the Freshservice API.
This key must be passed in the Header as `KeyId` to perform a call.

For use in the TPE app, these API Keys are stored and used as secrets in Rancher as `FRESHSERVICE_API_KEY`.
The keys themselves are stored and maintained in the Gentex Password Manager as a password of the user account 'GTMCoreSoftware' under its respective 'Kong' resource.

## Updating the API Keys

To update these API keys, the developer requires access to:

- An Azure account that has access to the Gentex Password Manager (passwords.gentex.com)
- Rancher access to modify secrets.

### Step 1: Retrieve API Key

- Navigate to passwords.gentex.com and log into an account that has read access.
- Select `All My Passwords` on the left side of the screen (if not already viewing all passwords).
- In the list of `Resources`, select the respective `Kong` resource. (`Kong Dev` for DEV or `Kong Prod` for PROD).
- This should show a popup of user accounts under this resource.
- Copy the `Password` under the user account `GTMCoreSoftware`. This is the API Key.
- Save this key in your `.env` file as the variable `FRESHSERVICE_API_KEY`.

### Step 2: Modify Rancher Secrets

- Open Rancher.
- Navigate to the Secrets page.
- Edit the secret called `FRESHSERVICE_API_KEY` and paste the API Key above into this.
- Do this for both PROD and NON-PROD Rancher.

### Step 3: Restart

- The developer will need to redeploy the workload in Rancher for this change to take effect. This secret is provided to the Node server via an environment variable. The redeploy will restart the Node server and have it reload its environment variables.

<h2 id="how-tickets-work">How Tickets Work</h2>

Service requests are created via a POST call, providing the API key and body.
A catalog ID is required to create a service request.
These catalog IDs are unique to Freshservice prod and dev endpoints respectively.
A catalog ID in the dev sandbox will not be the same in prod. In fact, they are basically two separate systems.
Anything created in the sandbox will have to manually be created in the prod version.

Example of creating service request (for TPE):
```http
POST /freshservice/servicerequests/214/place_request HTTP/1.1
Host: api.gentex.com
KeyId: __API_KEY_HERE__
Content-Type: application/json
Content-Length: 210

{
    "email": "john.lock@gentex.com",
    "quantity": 1,
    "custom_fields": {
        "summary": "This is a summary...",
        "details": "These are the details of the request...",
        "application_software": "Test Plan Editor (TPE)"
    }
}
```

These custom field properties directly correlate to the field variable names of the service request (created in the admin panel).

<h2 id="where-to-handle">Endpoints and Ticket Handling</h2>

The Gentex Freshservice API has 3 endpoints, each corresponding to PROD, DEV, and QA.
All Freshservice requests/tickets are managed through Freshservice's front-end dashboard.
To access the dashboard for ticket management, you need will need a Freshservice account license.

Tickets created with the PROD endpoint can be found and
managed in the main Freshservice dashboard: [Dashboard PROD](https://gentex.freshservice.com/a/dashboard/)

Tickets created with either the DEV or QA endpoint can be found and
managed in the Sandbox Freshservice dashboard: [Dashboard Sandbox](https://gentex-fs-sandbox.freshservice.com/)
