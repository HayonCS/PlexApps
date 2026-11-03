# OpsManager

## Saving memory maps

- Edit the current, unreleased working copy, then select **Save** or press **Ctrl+S**
  (**Cmd+S** on macOS). Save includes the cell currently being edited and updates
  the same internal revision; it does not create or release a revision.
- The editor displays **Unsaved changes**, **Saving…**, and **Saved**. Editing and
  undo/redo are temporarily disabled while saving. Successful Save establishes a
  new undo checkpoint; failed saves retain the draft and its history.
- Leaving a map with unsaved changes offers **Save and leave**, **Discard**, or
  **Cancel**. Selecting another cell in the same map does not prompt.
- If another user changes the map, Save preserves your local draft and reports a
  conflict instead of overwriting their changes. **Reload** requires confirmation
  because it discards the draft. Older restored drafts without a server token
  must also be explicitly reloaded before saving.
- Commands without parameters and ambiguous legacy database mappings cannot be
  saved with the current document format. Errors leave the draft intact.

Persistence uses the existing Apollo, Redux, and Knex packages and requires no
database migration. See [the save API documentation](modules/domain-services/memory-map-save/README.md)
for validation, permissions, and concurrency details.

## Setup and Build.

1. Install git and clone the repo on the host machine

   - Download and install git from here: https://git-scm.com/download
   - **Important: Make sure that you choose the installer option to not change the line endings when checking in or out. If you clone this repo on a Windows machine and git for Windows changes the line endings you will get errors while following the instructions in this document. If you've already installed git for Windows and aren't sure if you have the correct setting, modify `.gitconfig` in your users folder and set `autocrlf=false`.**

   - Generate your public and private RSA key pair

     - Open a terminal window on the host machine and run: `ssh-keygen -t rsa-sha2-512`
     - Accept the default file path (i.e. `C:\Users\your.name\.ssh`)
     - Use an empty pass-phrase
     - Copy the contents of the `id_rsa.pub` file as a new public SSH key in DevOps: https://dev.azure.com/gentex/_usersSettings/keys
     - You can also follow these work instructions: https://confluence.gentex.com/display/SES/Azure+DevOps+Work+Instructions

   - Clone the repo: `git clone git@ssh.dev.azure.com:v3/gentex/gtm_core_software/opsmanager`

2. Setup Docker Development Environment

   - All development should be done inside a Docker container. This allows for a consistent development environment across Mac/Linux/Windows and prevents issues with needing multiple versions of Node, npm, etc...

   - On Windows, Docker should be run inside a WSL2 environment:

     - [Install WSL2 on Windows](https://docs.microsoft.com/en-us/windows/wsl/install)

     - [Running Docker inside WSL2](docker/WSL2.md)

3. Setup the docker containers and build them.

   - Open a WSL2 terminal and navigate to the cloned OpsManager repository on the host machine: i.e. `/mnt/c/dev/opsmanager`

   - Ensure the Docker service is running with the command: `sudo service docker start`

   - Run `docker-compose up -d` from the root of the project. This will build all the Docker images (if they don't exist) and start up the Docker containers.

   - Now, run `docker-compose exec dev /bin/bash -l`. This will give you a bash prompt within the main dev container along with instructions for adding the SSH key for that container into DevOps.

   - In that bash prompt, run `project-init`, cloning the repo in the container and installing its necessary dependencies.

   - Copy `.env.example` to `.env`. This will define your environment variables while running and testing the app in the Docker container.

## Configure Git

You will need to setup your gitconfig so that git can author your commit messages. Create a file named `gitconfig` inside `/home/dev/config/` and add the following information:

```
[core]
autocrlf = false
[user]
email = youremail@gentex.com
name = FirstName LastName
```

You can either create and edit the `gitconfig` file with [vim](https://coderwall.com/p/adv71w/basic-vim-commands-for-getting-started), or you can run these commands to do the basic setup:

```
git config --file /home/dev/config/gitconfig user.name "John Doe"
git config --file /home/dev/config/gitconfig user.email johndoe@example.com
```

#### User-specific Configuration/Customizations

The `~/config` directory contains the following configuration files that can be customized:

```
bashrc
gitconfig
vimrc
```

## Connecting to the Docker Container from Visual Studio Code

- Add the [Remote Development extension pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) in VSCode.
- On the left toolbar in VSCode, click on `Remote Explorer`.
- Select `WSL Targets` from the drop down at the top. Select the `Ubuntu` distribution and click the Connect button. The tooltip should say `Connect To WSL`. This will open a new instance of VSCode inside the WSL2 environment. You can close your old instance of VSCode.
- Click on `Remote Explorer` in the left toolbar again. This time select `Containers` from the drop down at the top. A list should populate showing all the Docker containers running in the WSL2 environment.
- Click on the main development container, i.e. `/tpe_dev_1`.
- Click the button on the selected container that looks like a new window icon. The tooltip should say `Attach to Container`.
- This will open a new instance of VSCode. You can close your old instance of VSCode.
- Select `Open folder...` and choose `/home/dev/app`. You now have a TPE Linux development environment within a Docker container running inside WSL2 on Windows.
- If you open a terminal in VSCode, it will now give you a prompt with direct access to the dev container and the Linux filesystem.

## Seeding Memory Map Data.

The first thing you might want to do is get the schema for the tests databases setup and fill them with fake data. This is made easy by running the following command assuming you are connected to the Gentex network in order to pull data from the development database for local use.

- `yarn initial` - Sets up the local database with the correct schema, create databases and print seed directions.

After running this command you'll notice it prints out a path to the SEED-DB-DATA.md file. If you follow those directions you should be able to fill the newly created database with fake data based off of the development database.

- ### Yarn commands used to build and run the project.

- `yarn build` - Build the codebase including utility scripts and generated types.

- `yarn dev` - Start both the vite client dev server and node backend server. The client code runs on port 3000 and the server side code runs on port 3001.

## VSCode Notes

### Extensions

- In your instance of VSCode that is connected to the container, install these required workspace extensions: `ESLint` and `Prettier`
- Recommended: Install the extension: `GitLens` for version control history to be displayed while you are editing a file
- Recommended: Install the extension `Todo Tree` so that code comments that contain `TODO` will show up in an easy to view list.
- Recommended: Install the extension `Code Spell Checker` so that you can catch your spelling mistakes. This spell checking extension is integrated with the project.
- Finally, you should personalize your VSCode environment with font and icon extensions such as `One Monokai Theme`, or `vscode-icons`.

### Settings

- Turn on automatic code formatting after a save by enabling the setting `editor.formatOnSave`. This requires an extension like `Prettier` to have been installed.
- Set `Prettier` as the default formatter under the setting `editor.defaultFormatter`
- Ensure that VSCode is using the same version of TypeScript for intellisense that is being used to compile the code. Enable the setting `typescript.enablePromptUseWorkspaceTsdk`. This will cause VSCode to prompt you to switch to use the same version of typescript for its built in language server that matches the installed npm typescript package.

## Development Process

- The git workflow for this project has been defined here: https://dev.azure.com/gentex/gtm_core_software/_wiki/wikis/GTM-Core-Software.wiki/2572/Git-Workflow
- Branches for new development are always created off of the `develop` branch (**NEVER** `prod` or `qa`)
- By default, the `develop` branch is checked out when you first clone the repo. Make sure that you create a new branch before making any changes. All changes to `develop` must go through a [Pull Request](https://confluence.gentex.com/display/SES/Azure+DevOps+Pull+Request+Work+Instruction) in DevOps.
- To see how your current branch compares to `develop` before you create a Pull Request, run `yarn git:behind`. This will also do a `git fetch`.
- It is good practice to continually merge `develop` back into your branches as you are working. This will help you to avoid merge conflicts when you create a PR.

### Developer Notes

- The `project-init` script installed a git `pre-push hook` that checks the code for formatting (`Prettier`), runs a linter (`ESLint`), checks for type errors with the TypeScript compiler (`tsc`), and even runs a spell checker (`cspell`). All these checks must pass before you can push your changes to the remote repository. You can skip these checks with `git push --no-verify` but that is not recommended. To perform these steps manually run `yarn prepush`.
- Run `yarn prettier:fix` and `yarn lint:fix` to automatically fix formatting and linting issues.
- For this project, we have decided not to check in the generated GraphQL types. This means that you'll need to run `yarn build` before you begin viewing or editing the source code, lest you see spurious type errors and failed imports.
- Running `yarn && yarn build` is recommended every time you switch branches, especially if there are changes to `package.json` or any of the type or schema definition files.

## CI/CD

```
CI/CD = Continuous Integration / Continuous Deployment. It means that every time you do a git push, your changes will be compiled, tested, and possibly deployed to an endpoint.
```

Our DevOps build and deployment pipeline is defined inside of `azure-pipelines.yml` and `azure-pipelines-templates/deploy.yml`.

### Continuous Integration

Every push made to a branch in the `opsmanager` repository results in an automatic `CI build` on a DevOps [build agent](https://dev.azure.com/gentex/gtm_core_software/_settings/agentqueues).

A `CI build` consists of doing a git checkout of the source tree and running `docker-compose.yml` on a build agent. The build agent then attaches to the running `dev` container and builds the project and runs the unit tests. This is the same process used when developing the app locally.

```
WARNING: We use DevOps build agents from the container pool (https://dev.azure.com/gentex/gtm_core_software/_settings/agentqueues?queueId=306&view=agents). This means that the agents themselves are Docker containers possibly running on the same host machine. This could be a problem because local volumes and exposed ports in docker-compose are shared among all running containers on the same host machine. CI builds could randomly fail if commits on two or more branches occur at relatively the same time and both agents are running on the same host. To mitigate this, we default all CI builds to a specific build agent so that our builds become serialized on a single host. To run a parallel build you can choose a different build agent when you manually invoke a build on DevOps.
```

### Continuous Deployment

The `develop`, `prod` and `qa` branches are special in that they will only accept commits from a merge after a Pull Request is completed. If the `CI build` of one of these branches is successful, then the `push` and `deployment` steps will run:

- The `push` step consists of a build agent creating a new Docker image from `docker/deployment/[dev|qa|prod]/Dockerfile` and publishing it on our [gpm feed](https://gpm.gentex.com/containers?ContainerSearch=opsmanager&orderBy=Date&descending=true).

- The `deploy` step consists of a build agent using [Helm](https://helm.sh/) to start a Docker container from the published image inside of [Rancher](https://rancher.com/). Depending on if the build came from `develop`, `prod` or `qa`, Rancher will be configured to associate the running container with the appropriate URL endpoint.

## Deployed Endpoints

The officially deployed OpsManager application is hosted on a [Production Kubernetes cluster](https://rancher.gentex.com/) managed by [Rancher](https://rancher.com/):

- https://opsmanager.gentex.com

The deployed QA and Dev applications are hosted on a [Development Kubernetes cluster](https://rancherdev.gentex.com/):

- https://opsmanager-dev.gentex.com
- https://opsmanager-qa.gentex.com

You can find the Docker images for all deployed apps on [gpm](https://gpm.gentex.com/containers/registry?feedId=40).

## Release Process

1.  Create a Release Candidate:

    - Create a `release/x.y.z` branch from `develop`
    - Update `CHANGELOG.md` in the release branch

2.  Create Work Items:

    - Create dev, qa, and prod `x.y.z` work items in [DevOps](https://dev.azure.com/gentex/gtm_core_software/_backlogs/backlog/gtm_core_software%20Team/Stories/?showParents=true) under the `CI/CD` feature with a link to the `release/x.y.z` branch and an `"x.y.z"` DevOps tag.

3.  Create Pull Requests and link work items (include a link to the changelog in each PR description):

    - Create a PR named `x.y.z dev` that will merge `release/x.y.z` into `develop`. Add development team as optional reviewers.
    - Create a PR named `x.y.z qa` that will merge `release/x.y.z` into `qa`. Add users as optional reviewers. Include link to dev endpoint for testing.
    - Create a PR named `x.y.z prod` that will merge `release/x.y.z` into `prod`.

4.  Complete the `develop` PR and work item - **DO NOT** delete the `release/x.y.z` branch!

    - Wait for pipeline to build, test and deploy `dev`: https://opsmanager-dev.gentex.com/dashboard
    - Have all developers who contributed changes test out the site
    - If there are any issues, fix them in the `release/x.y.z` branch and create a new `dev` PR and work item

5.  Complete the `qa` PR and work item - **DO NOT** delete the `release/x.y.z` branch!

    - Wait for pipeline to build, test and deploy `qa`: https://opsmanager-qa.gentex.com/dashboard
    - Have all users who requested changes test out the site
    - If there are any issues, fix them in the `release/x.y.z` branch and create a new `dev` PR **AND** a new `qa` PR and work items

6.  Complete the `prod` PR and work item - **DELETE** the `release/x.y.z` branch:

    - Wait for pipeline to build, test and deploy `prod`: https://opsmanager.gentex.com/dashboard
    - Tag the git commit that merged the `release/x.y.z` branch into `prod` as `"x.y.z-tpe"`
    - Have the developer who completed the `prod` PR test out the site
    - If there are any `deployment` issues at this point, create a new `release/x.y.z` branch, increment the patch version number and repeat this [release process](#release-process)
    - If any bugs or missing features are discovered at this point, create a new feature branch off of `develop` and restart the [development process](#development-process)
    - Notify all users of changes

## Running the app while developing

This repository contains a [React](https://reactjs.org/)/[Redux](https://redux.js.org/)/[GraphQL](https://graphql.org/) based app that uses [Redis](https://redis.io/commands) for caching and [Bull](https://github.com/OptimalBits/bull) for job queuing.

- Run `yarn dev` to start the hot-reloading [Vite](https://vite.dev/) dev server, which can be visited on port http://localhost:3000.
- Run `yarn dev:local` to start the server on port http://localhost:3001 without vite and hot-reloading. This will consume less resources than `yarn dev` if developing on a laptop.
- To see the the interactive [StoryBook](https://storybook.js.org/) style guide and components, run `yarn dev:storybook` and visit http://localhost:9001.
- To play with [GraphQL](https://graphql.org/) queries and see the schema, visit http://localhost:3000/graphiql. Only available when `APP_ENDPOINT` !== `prod`.
- To view the simulated [Subversion](https://subversion.apache.org/) repositories, visit http://localhost/svn. `username:user password:password`
- To see the [Bull](https://github.com/OptimalBits/bull) job queue, visit http://localhost:3000/arena
- You can use [Telnet](https://tools.ietf.org/html/rfc854) to inspect and modify the redis cache: `telnet redis 6379`
- You can use the [sqlcmd](https://github.com/microsoft/go-sqlcmd) command-line query tool for inspecting the SQL Server databases. Example: `sqlcmd -d production`.  
  The sqlcmd command line docs are here (https://learn.microsoft.com/en-us/sql/tools/sqlcmd/sqlcmd-utility?view=sql-server-ver17&tabs=go%2Cwindows-support&pivots=cs1-bash). Make sure to select the ODBC variant of the tool.
- To run automated tests, use `yarn test` (all Vitest projects), `yarn test:jsdom`, or `yarn test:node`.

## Playwright End-to-End Testing

This project uses [Playwright](https://playwright.dev/) for browser-based end-to-end tests of core user flows in the web application.

### Where Playwright tests live

- Playwright tests use the `*.playwright.ts` naming pattern.
- Most tests are currently under `modules/client/**/__tests__/`.
- The global Playwright configuration is in `playwright.config.ts`.

### Local usage

- Run all Playwright tests:

```
yarn playwright:test
```

- Open Playwright codegen while the app is running (useful for generating selectors and test steps):

```
yarn playwright:codegen
```

### How tests run in this project

- Playwright starts the app using the configured web server command: `cross-env AUTH_LOCAL=true yarn dev`.
- Tests run headless in CI and local container environments.
- On failures, screenshots are automatically captured into the Playwright output directory (`test-results`).

### CI behavior in Azure DevOps

- The Azure pipeline can run Playwright e2e tests using the `runEndToEndTests` parameter in `azure-pipelines.yml`.
- JUnit output is generated and published with other test results so failures appear in the Azure DevOps Tests tab.
- Playwright artifacts (including failure screenshots) are copied from the container and published as a pipeline artifact (`playwright-e2e-artifacts`).

To view failure screenshots for a build:

1. Open the pipeline run in Azure DevOps.
2. Open `Artifacts`.
3. Download or browse `playwright-e2e-artifacts`.
4. Open files in the Playwright `test-results` folders.

## Console logging

- Use `console.log()` for temporary debug output only. These will be flagged by the linter as errors.
- Use `console.info()` for permanent output messages. Use these sparingly, especially in client code as they can impact performance of the browser.
- Use `console.warn()` or `console.error()` for serious failure conditions that impact the functionality of the app if they occur.

## Configurable debug output

As an alternative to console logging, consider using the [debug](https://www.npmjs.com/package/debug) npm package:

```
import * as Debug from "debug";
const debug = Debug("save");
debug("inserting", unsavedElementRecords.length, "element records");
```

You can then set the `DEBUG` environment variable to match one or more of the Debug objects that have been created, or you can specify `\*` for everything. For example, to run the unit tests with `save` and `db` debug output enabled:

```
cross-env NODE_ENV=test DEBUG='save db' jest --forceExit
```

This approach allows you to turn on or off debug output. It also allows you to create categories of log messages, for example you can turn on only the output from the database persistence layer, or you can choose to see only socket.io messages.

As a rule of thumb, use `Debug` to create layers of logging that you can turn or off while developing the `server` code. Use `console.info()` for rare messages in the `client` code or in npm scripts.

## Data Sources

This app uses several external data sources which have been simulated in the composed Docker environment:

- SQLServer is used to host MemoryMap databases
- Subversion is used to host commandset files.

Run the following commands to `clean` the data sources:

- Run `yarn db:drop` to drop "simulated" SQLServer databases
- Run `yarn svn:clean` to remove all "simulated" subversion repos
- Run `yarn clean` to execute all the above commands in one shot

Run the following commands to `seed` the data sources (requires that `yarn initial` has been run previously):

- Run `yarn db:seed` to fill the "simulated" SQLServer databases with lookup tables and fake user data and memory maps.
- Run `yarn svn:seed` to create an svn repository with sample commandset data for unit testing.
- Run `yarn seed` to execute all the above commands in one shot
- Run `yarn recreate` to clean and then seed

### Databases

The local dev MemoryMap databases exist on a Microsoft SQL Server instance pre-configured to run in the `opsmanager_sql-server` Docker container.

To connect via a client tool like [Table Plus](https://tableplus.com/):

- Host: localhost
- Port: 1433
- Username: SA
- Password: YourStrongPassw0rd

Note: If you are having trouble connecting to the sql-server instance with MS Sequel Server Management Studio, try
the following connection parameters:

- Database: 127.0.0.1\sql-server, 1433
- Username: SA
- Password: YourStrongPassw0rd

Databases created by the seeding scripts:

- `memorymap`: Simulates the `/memorymap` DB endpoint in the running app.
- `test-memorymap`: Used for running tests.

## Tech Stack

This project is a single-page webapp using the following [technologies](https://dev.azure.com/gentex/gtm_core_software/_wiki/wikis/GTM-Core-Software.wiki/2568/Tech-Stack-Professional-Development.md):

- [TypeScript](https://www.typescriptlang.org) – A type-safe variant of JavaScript from Microsoft which reduces errors and improves IDE/editor support over regular JavaScript.
- [Node.js](https://nodejs.org/en/about/) – Powers our server, and is pinned to the latest LTS release.
- [Express](https://expressjs.com) – Our HTTP server, which is lightly used only to host our GraphQL API.
- [GraphQL](http://graphql.org) – An alternative to REST which supports a demand-driven architecture. Our GraphQL server is [Apollo GraphQL server](http://dev.apollodata.com/tools/graphql-server/).
- [Redis](https://redis.io) – A key/value store used for caching and pub/sub by the server. Also hosts the [Bull](https://github.com/OptimalBits/bull) job queue.
- [Vite](https://vite.dev/) – Builds our application for our various deployment targets.
- [Vitest](https://vitest.dev/) - For unit and component testing.
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro) - For React component testing
- [React Storybook](https://storybook.js.org/) - For component documentation, style guides, and [StoryShots](https://www.npmjs.com/package/@storybook/addon-storyshots)

## Code Organization

This repository is structured to encourage a view of the whole repository as one application. The client and server are just different entry points, and we use vite to elide libraries and code that are irrelevant to a particular entry point.

### Directories:

- `entry` – Contains the primary entry points of the application. If you want to see what happens when you start up the client or server, start there. These are also the entry points for vite.
- `vite` - Contains a vite configuration for each entry point.
- `modules` - Contains all of the code. Each module is a self-contained concept that may be used by other modules, command-line scripts, etc.
- `config` - Contains configuration files for the various environments that we deploy to. Used by the [Node-config](https://www.npmjs.com/package/config) npm package. Most settings can be controlled via environment variables - see `config/default.cjs`.
- `dist` - Where vite stores compiled slices of the app.

### Modules:

- `client` – React/redux front-end.
- `db` – Core knex database connection helpers
- `records` – Database record types and repositories, with base record and repository classes in `record`. Depends on `db`
- `graphql` – Graphql schema and implementation. Depends on `records` and `db`
- `server` – Express.js server that serves the client and graphql api. Depends on `graphql`
- `helpers` – Generic helpers that can be used in any other module – no dependencies
- `atomic-object` – Core architecture, including the cache port, hexagonal library, job runner, logging and KNEX wrapper

An overview of the architecture can be found here: https://dev.azure.com/gentex/gtm_core_software/_wiki/wikis/GTM-Core-Software.wiki/2640/Architecture-Overview

### Features:

- [Undo \ Redo](modules/client/redux/undox/README.md)
- [Web Workers](modules/client/web-workers/README.md)

## Environment Variables

This app is set up as a [12-factor app](https://12factor.net/), configurable via environment variables.

The [dotenv](https://www.npmjs.com/package/dotenv) npm package is used to pre-load environment variables from the `.env` file at the root of the project. These environment variables will be automatically set on the Node process that is running our server and will be available via `process.env` calls.

When deployed to [Kubernetes](https://rancherdev.gentex.com/), the environment variables are defined inside one of several `manifests/app-values.yml` files (depending on if the endpoint is `production`, `qa` or `development`) and the `secrets` are stored in [Rancher](https://rancher.com/) directly.

You can use the `define` property in the vite config to put environment variables in `process.env` for use in client code running in the browser. For an example of this, see `/vite/client.config.js`.

#### List of Environment Variables:

- `NODE_ENV` – `test`, `development`, or `production`. Defaults to `development`. Unit tests will only run if this is set to `test`. Determines which [Node-config](https://www.npmjs.com/package/config) file to load from the `/config` folder.
- `PORT` – Port for the server to bind to. Defaults to `3001`. GraphQL Subscriptions also use this port.
- `WEB_CONCURRENCY` – Number of server workers to use in clustered mode. Clustering disabled if value is 1.
- `WORKER_CONCURRENCY`- The number of jobs that can be processing simultaneous. Defaults to be the same as `WEB_CONCURRENCY`.
- `DATABASE_SERVER` - The Microsoft SQL Server host name.
- `DATABASE_NAME` - The name of the MemoryMapMemoryMap database on the server.
- `SVN_URL`- The Subversion server base URL, i.e. `http://vcs.gentex.com/svn/sandbox`.
- `SVN_REPO` - The name of the top level folder in the SVN repo that contains configuration data, i.e. `config-data`.
- `SMB_DOMAIN` - The network domain where the samba share lives, i.e. `gentex.com`.
- `SMB_SHARE` - The network path of a shared samba folder, i.e. `\\znas1.gentex.com\Production`.
- `SMB_VERSIONED_LIBRARY_BASEPATH` - The name of the folder on the samba share where the versioned DCIGen libraries live, i.e. `TM\Libraries`.
- `REDIS_URL` - The endpoint of the Redis server.
- `AUTH_LOCAL` - When true, authentication will only require that you enter the name of an active Gentex employee.
- `APP_ENDPOINT` - The type of endpoint the app is deployed to: `dev`, `qa`, or `prod`. Note that `graphiql` is disabled on the `prod` endpoint.

## Config Files

This app uses the [Node-config](https://www.npmjs.com/package/config) npm package to manage hierarchical configurations of server deployments.

Inside the `/config` folder at the root of the project are various configuration files named after each deployment type:

- default.cjs
- development.cjs
- production.cjs
- test.cjs

The `default.cjs` file contains the default settings for all deployments. The default settings can be overwritten by the deployment file that is currently in use.

The current deployment is set by the `NODE_ENV` environment variable, and the value should match one of the config filenames without a file extension, i.e. `"production"`.

Note that most of the values for the settings defined in the configuration files should come from environment variables to adhere to the principles of a [12-factor app](https://12factor.net/).

You can access configuration settings from server code in the following way:

```
const config = require("config");
const PROXY_HOST = config.get("server.apiHost");
```

Based on the value of the `NODE_ENV` environment variable, the `config` object returned by `require("config")` will contain either unique or overridden settings from the matching deployment configuration file in the `/config` folder. This is how we can configure the server to behave differently when we are developing versus when we are deployed to production.

## Development build

To do a normal development build, run `yarn build`. This will use the settings from `config/development.cjs`. The app will run un-optimized, but you will have access to things like breakpoints, source maps, and browser debugging tools for React and Redux.

In a development build, you control the use of local or Microsoft authentication by changing the `AUTH_LOCAL` environment variable in the `.env` file.

## Production build with Microsoft authentication

To do a production build with Microsoft authentication, run `yarn build:production` which will do the following:

```
NODE_ENV=production AUTH_LOCAL=false yarn build
```

This will build the entire app into `./dist/` and Vite will optimize and bundle client files for production deployment. There are also optimizations that are enabled by React, so you should see that the app runs faster and is more responsive. See `/config/production.cjs` for differences in the production deployment configuration.

Microsoft authentication will require you to sign in with your Gentex credentials.

```
NOTE: You will have to set the following environment variables in your .env file to the correct values in order to use Microsoft Authentication:

OAUTH_APP_ID=rancher_secret
OAUTH_APP_PASSWORD=rancher_secret
OATH_TENANT_ID=rancher_secret

Also note that if you are using the Vite dev server with hot-reloading on port 3000, you will also need to change OAUTH_REDIRECT_URI to use port 3000:
OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Production build with local authentication

To do a production build with local authentication, run `yarn build:local` which will do the following:

```
NODE_ENV=production AUTH_LOCAL=true yarn build
```

Local authentication will only require that you enter the name of a valid Gentex employee. No password is required. This mode is for development only.

## Running development builds

Run `yarn dev` to start the Vite dev server. This will enable hot-reloading of the server and client when files are modified inside the code editor:

- This will do a development build, equivalent to `yarn build`.
- The Vite dev server will run on port http://localhost:3000 and [nodemon](https://www.npmjs.com/package/nodemon) will watch for server file changes. The server process is rebuilt in watch mode and restarted when dependencies change.
- The dev client should connect to the Vite dev server on port http://localhost:3000 to enable hot reloading of the page whenever a client file changes.
- In a development build, you control the use of local or Microsoft authentication by changing the `AUTH_LOCAL` environment variable in the `.env` file.

## Running production builds

Run `yarn server:local` or `yarn server:production` to manually start the `express server` on port http://localhost:3001 without automatic recompilation or hot-client reloading:

- This will take up far fewer system resources and is useful for those times when you don't need to modify the codebase and just want to quickly run the app.
- You will need to pair these with the matching `yarn build:production` or `yarn build:local` to properly run the app with or without local authentication.
- For convenience, you can combine the build and run steps with `yarn dev:local` or `yarn dev:production`.

## User Info API's

By default, when developing locally the app will use the `rest-endpoint` container to mock out the real API's for returning user information.

```
When using the local rest-endpoints container, the user information returned will always be for "John.Smith" and that will be who appears to be logged into the App, regardless of what name you typed in for Local Authentication or if you are using Microsoft Authentication.
```

If you are on the Gentex Corporate network, you can change your your `.env` file to point at the real REST API's:

```
MES_SECURITY_ENDPOINT=http://zvm-msgprod.gentex.com/SecurityWeb/api/v1/
MES_USER_PICTURE=https://api.gentex.com/user/image/v1/
MES_EMPLOYEE_DIRECTORY=https://api.gentex.com/employeedemo/v1/employees/
```

Note that changing these will have an effect on logging in. When using Local Authentication, the username you enter will have to be a valid gentex employee, otherwise the calls to these API's will return errors and Local Authentication will fail. When using Microsoft Authentication, your own user info will be queried.

```
NOTE: Be careful of where your DATABASE_SERVER environment variables are pointing when using REST API overrides. After a successful login, the users table in each database (PROD, ENG) will be updated (or a new user will be inserted) with the information from the REST API's provided.
```

## Redis

Our server is using [Redis](https://redis.io) to provide a variety of services:

- As an in-memory [cache](https://redis.io/topics/client-side-caching) for fast retrieval of MemoryMaps and User Setting information.
- As a [key/value](https://redis.com/nosql/key-value-databases) store for holding user data like recently opened MemoryMaps.
- As a [pub/sub](https://redis.io/topics/pubsub) service for asynchronous messaging between server and client (such as MemoryMap Lockout updates).
- As a host for the [Bull](https://github.com/OptimalBits/bull) job runner.

If you want to connect to the local instance of Redis with a tool like `TablePlus`:

```
Host: `localhost` Port: `6379`
```

Make sure you run the `wsl_port_forwarding.py` script on the host system.

Occasionally, the Redis instances on the deployed endpoints may be need to be flushed. This could be required if the schema used to store data in Redis changes.
There should be nothing stored in Redis used for long term data retention. It should be able to be cleared without risk of breaking the app or losing MemoryMap data.
Worst case scenario, after clearing Redis the MemoryMap and User Setting info have to be re-cached resulting in longer load times in the client.
Our deployed Redis instances are configured such that the commands for deleting keys have been intentionally removed, and data is not preserved across container re-deployments.
So the only way to clear the data is to redeploy the Redis PODs in Rancher on each endpoint.

## Caching

Our server uses a `cache` implementation that stores entries as `gzipped` values in `Redis`. It uses a [caching algorithm](https://spin.atomicobject.com/2018/02/12/coordinated-cache-refill-redis-node) developed by [Atomic Object](https://atomicobject.com).

See `/modules/atomic-object/cache/index.ts` for implementation details.

Example of use:

```
    const keywords = await ctx.get(CachePort).get({
    key: "keywords",
    func: async () => {
      const repo = ctx.get(SubversionPort).repo();

      const interfaceFile = await repo.getFileContents({
        path: "/reserved-words.ipp",
      });

      return parseReservedKeywords(interfaceFile.contents);
    },
    settings: {
      maxAgeMs,
      minAgeMs,
      graceMs,
    },
  });

  //As long as the cache is hit sometime before the max age, the cached value is considered valid.
  //If between min and max age, the cached value will be returned while the cached value gets recomputed on the server (asynchronous cache refill).
  //A time to live (ttl) is stored along with the value. It will be reset when the cached value is recomputed.
  export const maxAgeMs = 1000 * 60 * 60 * 24 * 14; //If the cached value is beyond this age, the cached value is always considered invalid and it will get recomputed
  export const minAgeMs = 1000 * 60 * 60 * 24 * 7; //If the cached value is below this age, it will not even be checked to see if it needs to be recomputed

  //A grace period begins as soon as the value starts being recomputed
  //The grace period duration should be the maximum amount of time it takes to recompute the cached value
  //While in the grace period, the cached value will be returned and asynchronous cache refills will be prevented
  export const graceMs = 1000 * 60 * 5;
```

## Undo / Redo

Our application uses a vendor branch of the [Undox](modules/client/redux/undox/README.md) library that we have modified and pulled into our codebase.
We wrap a Redux `MemoryMapDocument` reducer with an Undox object to provide automatic undo \ redo support. Dispatching `Document` actions like you normally would is enough to make those actions `un-doable` or `re-doable` using `Undox`.

The only edge case is when you want to `batch` multiple dispatches into a single undo\redo action. In that case, DO NOT dispatch using the `batchActions` method from the `redux-batched-actions` middleware library. Even though we have configured our `Redux Store` to support it, this will cause multiple actions to be added to the `Undox` stack, which is typically not what you want when batching. Instead, use the `group` method from `Undox`:

```
import { group } from "client/redux/undox";
dispatch(group(arrayOfActions));
```

Note: `batchActions` is appropriate to use if you want to combine multiple `Editor` actions into a single dispatch to be more efficient, since the `Editor` state is not part of `Undox`.

We also support the following `Document Selectors`:

- canUndo: TRUE if there are any un-doable actions on the Undox stack.
- canRedo: TRUE if there are any re-doable actions on the Undox stack.
- undoxHistory: An array of the current Actions on the Undox stack. Useful for debugging.
- undoxIndex: The Undox stack pointer. Increments whenever a Document action is dispatched. Decrements when the Undox Undo method is invoked.
- undoxHoldIndex: A value that the stack pointer is not allowed to go less than. Useful for capping un-doable actions at a certain point in the stack, i.e. Memory Map Document load.

To completely clear the `Undox` stack:

```
dispatch(clearUndox());
```

## Tests

We are using [Vitest](https://vitest.dev/) for unit and component testing, and collocating tests with the modules they are testing.

Test files are generally located in a `__tests__` directory near the code under test.

## Running Tests

- Run all test projects:

```
yarn test
```

- Run only browser-like (jsdom) tests:

```
yarn test:jsdom
```

- Run only Node-focused tests:

```
yarn test:node
```

- Open the Vitest UI for interactive test debugging:

```
yarn test:visual
```

We are using a combination of the following tools to do component testing:

### [React Testing Library](https://www.npmjs.com/package/@testing-library/react)

This library lets us write unit tests to check for the [existence](https://testing-library.com/docs/dom-testing-library/api-queries#queries) of components on the page and to interact with them in the same way a user would, i.e. by only being able to access the rendered DOM (the HTML output) and send events.

[Why React Testing Library?](https://www.youtube.com/watch?v=JKOwJUM4_RM&feature=youtu.be)
Unlike other component testing libraries like [Enzyme](https://testing-library.com/docs/react-testing-library/faq), React Testing Library makes it hard to write tests that depend on the internal implementation details of your components. Instead, it encourages you to test your components in the same way that users will use them, primarily by interacting with the rendered DOM and not the internal state.

[Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

[How to use React Testing Library](https://www.robinwieruch.de/react-testing-library) ([CheatSheet](https://testing-library.com/docs/dom-testing-library/cheatsheet))

- To use the `React Testing Library`, add the following imports to your .test file:

```
import { render, screen } from "@testing-library/react";
```

- You can find elements in your components by [label](https://testing-library.com/docs/dom-testing-library/api-queries#bylabeltext), [placeholder](https://testing-library.com/docs/dom-testing-library/api-queries#byplaceholdertext), [text contents](https://testing-library.com/docs/dom-testing-library/api-queries#bytext), [alt text](https://testing-library.com/docs/dom-testing-library/api-queries#byalttext), [title](https://testing-library.com/docs/dom-testing-library/api-queries#bytitle), [display value](https://testing-library.com/docs/dom-testing-library/api-queries#bydisplayvalue), [role](https://testing-library.com/docs/dom-testing-library/api-queries#byrole), or [test ID](https://testing-library.com/docs/dom-testing-library/api-queries#bytestid):
  - `getBy` variants return an error if an element isn't there
  - `queryBy` variants let you check for elements that aren't there because the return can be null
  - `findBy` variants are used for asynchronous elements which will be there eventually
  - [Which query should I use?](https://testing-library.com/docs/guide-which-query)
- To simulate user interaction, you can [Fire Events](https://testing-library.com/docs/dom-testing-library/api-events) on the elements you get back from one of the find methods above. The full list of events are available [here](https://github.com/testing-library/dom-testing-library/blob/master/src/event-map.js).
- To simulate higher level user interactions and to be able to express actions that more closely resemble what a user would do on the page, we are using [@testing-library/user-event](https://github.com/testing-library/user-event) to extend the events we can send. This requires you to import `user-event` in your .test file:

```
import userEvent from '@testing-library/user-event'
```

- We are using [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) matchers via Vitest to add useful DOM assertions. This allows us to write asserts (expect statements) that are concise and self-documenting, as well as allowing us to avoid writing repetitive code. This requires you to import the matcher setup in the test environment:

```
import "@testing-library/jest-dom/vitest";
```

- The main lint configuration is in `eslint.config.mjs`.

### Component testing philosophy:

There are two users of your React components: 1) The end user interacting with your web page, and 2) The developer using the component API to render it on the page. Write tests that mimic how these two users will interact with your components!

- When writing component tests, remember to [avoid the unit-test user](https://kentcdodds.com/blog/avoid-the-test-user).
- Do not write tests that depend on implementation details like React state. Write tests that interact with the DOM that is presented to the user.
- Most of the time, write tests for the highest level parent component that makes sense. Test the child components as part of the parent.
- [Make your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)

## Linting

We are using [ESLint](https://eslint.org/) for linting. It is ran during the build process and prior to running unit tests. It is also integrated into the IDE.

Note about disabling the linter with `eslint-disable`:

- Avoid `/*eslint-disable*/` at the top of files. Use `//eslint-disable-next-line` instead.
- Try not to use `eslint-disable-next-line react-hooks/exhaustive-deps` if possible:
  - https://dev.to/wkrueger/never-ignore-the-exhaustive-deps-rule-2ap8
  - https://typeofnan.dev/you-probably-shouldnt-ignore-react-hooks-exhaustive-deps-warnings/

## Style guide

We are using [React Storybook](https://storybook.js.org/) to generate a style guide for our react components.

You can run the style guide with `yarn dev:storybook`

## GraphQL and Code Generation

We're generating type definitions from our graphql schema, queries, and mutations. This allows us to get static type safety between our graphql code and typescript implementations.

To enable this, we're storing all graphql code in individual `.graphql` files. Our build process and dev server look for these and use them to generate the appropriate type definitions.

### Server

The file `modules/graphql/schema-types.ts` is generated by `graphql-code-generator` from `schema.graphql` and any other `.graphql` file in the `graphql` module.

`schema-types` exports interfaces for all graphql `type`s in the schema, including e.g. `Query`.

For example, if we have the following schema:

```graphql
type User {
  id: Int!
  name: String!
  email: String!
}

type Query {
  usersById(id: Int!): [User]!
}
```

`schema-types.ts` will contain definitions for:

- `Query` – containing the return types for each query
- `UsersByIdQueryArgs` – the expected arguments for the `usersById` query
- `User` – the straightforward typescript definition for `User`.

Note that we make liberal use of `!` in the query definition to disallow `null` values as appropriate. `!` should **not** be used when the operation may fail. `Graphql` prefers `null` returns in that case in most circumstances.

To make use of these types, we import them into our `modules/graphql/index.ts` for our resolver definition.

In particular, we would define our `usersById` resolver as:

```ts
 usersById(obj: {}, args: UsersByIdQueryArgs, context: Context): Promise<Query['usersById']> {
   ...
 }
```

Note that we use `UsersByIdQueryArgs` to tell typescript that this should be consistent with the defined schema arguments. We could use an inline type or separate interface, but doing so would defeat TypeScript's ability to tell us when we change the schema that our implementation is no longer compatible.

Similarly, we define the return type to be `Promise<Query['usersById']>`. `Query['usersById']` is TypeScript syntax that means "whatever tye type of `usersById` on in the `Query` type is". By using this type subscripting syntax, we get static validation that our resolver is compatible with our schema.

### GraphQL in the client

In the client we generate types for our graphql queries and mutations.

Given a `.graphql` file containing the query:

```graphql
query Users($foo: Int!) {
  usersById(id: $foo) {
    id
    name
  }
}
```

Entries will be added to `modules/client/graphql-types.ts`:

```typescript
export interface UsersQueryVariables {
  foo: number;
}

export interface UsersQuery {
  (TBD);
  // Returns all of the users in the system (canned results)
  usersById: Array<{
    id: number;
    name: string;
  }>;
}
```

The types and query can be used with Apollo by `require`-ing the `.graphql` file directly from typescript and passing it in where a query is expected. The `UsersQuery`

```typescript
export async function fetchUsers(id: number): Promise<UsersQuery["usersById"]> {
  const vars: UsersQueryVariables = {
    foo: id,
  };
  const result = await graphqlClient.query<UsersQuery>({
    query: require("./Answer.graphql"),
    variables: vars,
  });

  return result.data.usersById;
}
```

### Graphql building

The `build:graphql` task generates all type files. It:

1.  Generates `modules/graphql/schema.json` from the `schema.graphql`. This is used by subsequent steps.
2.  Generates `schema-types.ts` in the graphql module
3.  Generates `graphql-types.ts` in the client

The `dev:graphql` task – which is run automatically by `dev` – watches for changes to any `.graphql` file and reruns `build:graphql`
