## Web Workers Guide

Web Workers (WW) are separated sections of Javascript/Typescript that are run in separate
code space. It's very similar to how threads work except it uses message passing as the
primary way to trigger "work to happen". They are a client-side mechanism. Characteristics
of WW:

1. Client-Side (i.e. runs in browser)
2. Uses message passing to request work be done.

This document covers the architecture of how this is set up in Test Plan Editor. Due to
limitations in WW and Webpack, we rely on only one WW where we register various "workers"
that do functionally specific work. For example, there is a "changelog" set of work that
can be done.

This document also includes a couple of reference links for research purposes.

## Architecture

The basic setup for Test Plan Editor is to have a single Web Worker. Developers can imagine
this to be an external service (like a REST endpoint, etc.) where we make requests and it
comes back with results. This section is divided into three sections: messages, client, and
worker. In my mind I think of the "worker" section as a server-like abstraction.

### Messages

Under `modules/client/web-workers/messages` is where developers can find the message
groupings. They should each have a subdirectory based on the functionality that will
be done. For example: texteditor, changelog, and test. The test category is used to
verify that the WW is doing something.

Each message grouping should end up producing one union type with all of the message
types held within. For example, look at:

- `modules/client/web-workers/messages/texteditor/texteditor-messages.ts`
- texteditor-messages.ts contains `TextEditorMessages`
- `TextEditorMessages` is added to: `modules/client/web-workers/messages/index.ts`
- `WorkerMessages` now contains `TextEditorMessages`.

All message types must include the following members:

- `message_type` - This is either `request`, `response`, or `error`.
- `type` - This is a unique identifier of an action to perform.
- `worker_id` - The name of the worker that should get this request.

Message types can then contain any number of other members.

### Client

Client functions are those that issue a request to the "worker" side and then handle
the result in a callback. For example here is a function that would invoke a test function
where it's wrapped by the client function:

```
export const handleTest = (cb: (() => void)) => {
  WebWorkerManager.getInstance().postMessage({
    message_type: "request",
    type: "test",
    worker_id: "test"
  },
  (resultMessage: WorkerMessages) => {
    cb();
  });
}
```

This replaced the old syntax where we would construct a Worker and manually set up an
onmessage and perform a postMessage. In both mechanisms the user would always have to
pass a callback in that would do some work when the result is obtained.

For examples of some of the client functions, look at:

`modules/client/texteditor/handlers`

### Worker

Installing new code for a worker is very straightforward and simple- mainly because it
is forced to be. Any worker that is added should be fairly self contained. This means that
the code (and code it uses) cannot be interacting with redux, external graphql calls, etc.
All data must be provided to the worker via messages. Workers should also be structured
such that they take a message then return a message.

The minimal example of this is:

`modules/client/testplan-utils/changelog-worker`

There is a single function there that takes a message and then returns a message:

```
import { generateChangeLog } from "./changelog-utils";

export const ChangeLogWorker = (msg: WorkerMessages): WorkerMessages => {
  if (msg.worker_id === "changelog") {
    if (msg.message_type === "request" && msg.type === "generate") {
      return {
        message_type: "response",
        worker_id: "changelog",
        type: "generate",
        text: generateChangeLog({
          pristine: msg.pristine,
          modified: msg.modified,
        }),
      };
    }
  }

  return {
    message_type: "error",
    worker_id: "changelog",
    type: "generate",
    text: "Unhandled message type provided to ChangeLogWorker.",
  };
};

```

Notice that this code uses `generateChangeLog`; this is fine because generateChangeLog
does not interact with Redux or Apollo and it is a completely self-contained algorithm.

The reason we have such strict data rules about what can be used as a Worker is because
of how WW are implemented. Please see the research section for more details.

Once a Worker function is created that takes a message and returns a message, it must
be added to a switch statement inside of the master web worker. The master web worker is
found at:

`modules/client/web-workers/TestPlanEditor.webworker.ts`

Inside of that code there is a switch statement that inspects the `worker_id` of the
message. Using that `worker_id` it can route messages specifically to that Worker. This
code is purposefully under-engineered because of how WW's operate.
