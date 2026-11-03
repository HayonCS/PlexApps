import * as fs from "fs";
import * as path from "path";

const rootDirectory = path.resolve(__dirname, "../modules/client/texteditor");

const contents = fs.readFileSync(`${rootDirectory}/TextEditor.statemachine`, {
  encoding: "utf8",
});

type TypeBundle = {
  name: string;
  type: string;
};

type TransitionLine = {
  source: string;
  destination: string;
  transition: string;
  extraMembers?: Array<TypeBundle> | undefined;
};

type StateInfo = {
  name: string;
  extraMembers: Array<TypeBundle>;
  transitions: Array<string>;
};

type TransitionInfo = {
  name: string;
  extraMembers: Array<TypeBundle>;
};

const lines = contents.split("\n");
const regex1 = /([^-]+)->[^\S]*([^\s]+)[^\S]on[^\S]([a-zA-Z_1-9]+)/;
const regex2 = /([^-]+)->[^\S]*([^\s]+)[^\S]on[^\S]([a-zA-Z_1-9]+)[^{]*{/;

const ConsumeWithExtraTypeBundle = (
  lines: Array<string>,
  index: number
): { transitionLine: TransitionLine; nextLine: number } | undefined => {
  const result = regex2.exec(lines[index]);

  if (result === null) {
    return undefined;
  }

  let extraMembers: Array<TypeBundle> = [];
  let nextLine: number = index + 1;
  for (var j = index + 1; j < lines.length; ++j) {
    const value = lines[j].trim();
    if (value !== "}") {
      const values = value.split(" ");
      if (values.length >= 2) {
        extraMembers = extraMembers.concat({
          name: values[0].trim(),
          type: value.substring(values[0].length).trim(),
        });
      }
    } else {
      nextLine = j;
      break;
    }
  }

  return {
    transitionLine: {
      source: result[1].trim(),
      destination: result[2].trim(),
      transition: result[3].trim(),
      extraMembers,
    },
    nextLine,
  };
};

const Consume = (
  lines: Array<string>,
  index: number
): { transitionLine: TransitionLine; nextLine: number } | undefined => {
  const result = regex1.exec(lines[index]);

  if (result === null) {
    return undefined;
  }

  return {
    transitionLine: {
      source: result[1].trim(),
      destination: result[2].trim(),
      transition: result[3].trim(),
    },
    nextLine: index,
  };
};

//===========================================================================================
// Step 1: Parse
//===========================================================================================
let transitionLines: Array<TransitionLine> = [];
for (var i = 0; i < lines.length; ++i) {
  if (lines[i].trim().startsWith("//")) {
    // Ignore! These are comments.
    continue;
  }

  if (regex2.exec(lines[i])) {
    const consumeInfo = ConsumeWithExtraTypeBundle(lines, i);
    if (consumeInfo) {
      transitionLines = transitionLines.concat(consumeInfo.transitionLine);
      i = consumeInfo.nextLine;
    }
  } else if (regex1.exec(lines[i])) {
    const consumeInfo = Consume(lines, i);
    if (consumeInfo) {
      transitionLines = transitionLines.concat(consumeInfo.transitionLine);
      i = consumeInfo.nextLine;
    }
  }
}

//===========================================================================================
// Step 2: Combine Into Types
//===========================================================================================
const CombineExtraMembers = (
  em1_: Array<TypeBundle>,
  em2_: Array<TypeBundle>
) => {
  const em1 = em1_.reduce((acc, current) => {
    acc[current.name] = current;
    return acc;
  }, {} as { [id: string]: TypeBundle });
  const em2 = em2_.reduce((acc, current) => {
    acc[current.name] = current;
    return acc;
  }, {} as { [id: string]: TypeBundle });

  const combined = Object.keys(em2).reduce((acc, name) => {
    acc[name] = em2[name];
    return acc;
  }, em1);

  return Object.values(combined);
};

let states: { [id: string]: StateInfo } = {};
let transitions: { [id: string]: TransitionInfo } = {};

transitions = transitionLines.reduce((acc, tl: TransitionLine) => {
  const inContainer: Array<TypeBundle> = acc[tl.transition]?.extraMembers ?? [];
  const current: Array<TypeBundle> = tl.extraMembers ?? [];
  const combined: Array<TypeBundle> = CombineExtraMembers(inContainer, current);

  acc[tl.transition] = {
    name: tl.transition,
    extraMembers: combined,
  };

  return acc;
}, {} as { [id: string]: TransitionInfo });

const CollectTransitions = (
  stateName: string,
  tls: Array<TransitionLine>
): Array<string> => {
  return tls.reduce((acc, currentTL) => {
    if (currentTL.source === stateName) {
      acc = acc.concat(currentTL.transition);
    }
    return acc;
  }, [] as Array<string>);
};

const GetDestinationState = (
  stateName: string,
  transitionName: string,
  transitionLines: Array<TransitionLine>
) => {
  for (var tl of transitionLines) {
    if (tl.source === stateName && tl.transition === transitionName) {
      return tl.destination;
    }
  }

  return "";
};

const GetExtraMembers = (
  stateName: string,
  states: { [id: string]: StateInfo }
) => {
  const s = states[stateName];
  return s.extraMembers.reduce((acc, mem) => {
    acc += `                ${mem.name}: (transition as any).${mem.name} as ${
      mem.type
    },${"\n"}`;
    return acc;
  }, "");
};

states = transitionLines.reduce((acc, tl: TransitionLine) => {
  const transitionToUse = transitions[tl.transition];
  const inContainer: Array<TypeBundle> =
    acc[tl.destination]?.extraMembers ?? [];
  const current: Array<TypeBundle> = transitionToUse.extraMembers;
  const combined: Array<TypeBundle> = CombineExtraMembers(inContainer, current);

  const sourceTransitions = CollectTransitions(tl.source, transitionLines);

  acc[tl.destination] = {
    name: tl.destination,
    extraMembers: combined,
    transitions: acc[tl.destination]?.transitions,
  };

  acc[tl.source] = {
    name: tl.source,
    extraMembers: acc[tl.source]?.extraMembers ?? [],
    transitions: sourceTransitions,
  };

  return acc;
}, {} as { [id: string]: StateInfo });

//===========================================================================================
// Step 3: Output TextEditorState.gen.ts
//===========================================================================================
let textEditorState = `// The following has been generated, please do not directly modify.
// Original source code found in TextEditor.statemachine.

import { Domain } from "graphql-api/server-types.gen";

export namespace TextEditorState {

const IsDevelopment = \`$\{process.env.NODE_ENV}\` === "development";
const IsStoryBook = \`$\{process.env.STORYBOOK_MODE}\` === "true";

`;

textEditorState += `
export type State = 
`;

textEditorState = Object.keys(states)
  .sort()
  .reduce((acc, stateName) => {
    const extraMembers = states[stateName].extraMembers.reduce(
      (acc2, em: TypeBundle) => {
        acc2 += `    ${em.name}: ${em.type};
`;
        return acc2;
      },
      "\n"
    );

    acc += `| { 
    type: "${stateName}"; 
    text: string;${extraMembers}}
`;
    return acc;
  }, textEditorState);

textEditorState += ";\n";

textEditorState += `
export type Transition = 
`;

textEditorState = Object.keys(transitions)
  .sort()
  .reduce((acc, transitionName) => {
    const extraMembers = transitions[transitionName].extraMembers.reduce(
      (acc2, em: TypeBundle) => {
        acc2 += `    ${em.name}: ${em.type};
`;
        return acc2;
      },
      "\n"
    );

    acc += `| { 
    type: "${transitionName}"; 
    text: string;${extraMembers}}
`;
    return acc;
  }, textEditorState);

textEditorState += ";\n";

textEditorState += `export const initialState: State = { type: "initial", text: "" };
export const TransitionException = (startState: string, transition: string) => 
    \`\${startState} does not contain a transition for \${transition}.\`;
`;

textEditorState = Object.keys(states).reduce((acc, stateName) => {
  acc += `
const Transition_${stateName} = (state: State, transition: Transition, message_?: (msg:string) => void) : State => {
    const transitionName = \`\${transition.type}\`;
    const message = message_ || ((_msg: string) => {});
    switch(transitionName) {`;

  acc = Object.keys(transitions)
    .sort()
    .reduce((acc2, transitionName) => {
      const transitionIndex = states[stateName]?.transitions?.indexOf(
        transitionName
      );

      if (transitionIndex !== undefined && transitionIndex >= 0) {
        acc2 += `${"\n"}        case "${transitionName}": ${"\n"}`;
        const destinationState = GetDestinationState(
          stateName,
          transitionName,
          transitionLines
        );

        const extraMembers = GetExtraMembers(destinationState, states);

        acc2 += `            message("${stateName} -> ${destinationState} on ${transitionName}  text_size=" + transition.text.length);${"\n"}`;
        acc2 += `            return { 
                type: "${destinationState}",
                text: transition.text,
${extraMembers}
        };${"\n"}`;
      }
      return acc2;
    }, acc);

  acc += `    };
    if (IsDevelopment && !IsStoryBook) {
        throw new Error(TransitionException(state.type, transition.type));
    } else {
        return state; 
    }
};
`;
  return acc;
}, textEditorState);

textEditorState += `export const Apply = (
  state: State,
  transition: Transition,
  message?: (msg: string) => void
): State => {
    const source = \`\${state.type}\`;
    switch(source) {`;

textEditorState = Object.keys(states).reduce((acc, stateName) => {
  acc += `
        case "${stateName}": return Transition_${stateName}(state, transition, message);`;
  return acc;
}, textEditorState);

textEditorState += `
    };
    if (IsDevelopment && !IsStoryBook) {
        throw new Error(\`Apply does not recognize state \${source}\`);
    } else {
      return state;
    }
`;

textEditorState += "}; // End of Apply\n";

textEditorState += "} // End of TextEditorState";

fs.writeFileSync(`${rootDirectory}/TextEditorState.gen.ts`, textEditorState, {
  encoding: "utf8",
});

//===========================================================================================
// Step 4: Output TextEditorState.gen.test.ts
//===========================================================================================
let test = `// The following has been generated, please do not directly modify.
// Original source code found in TextEditor.statemachine.

import { TextEditorState } from "../TextEditorState.gen";
import { Domain } from "graphql-api/server-types.gen";

describe("TextEditorState transitions", () => {

`;

const GetExtraTestValues = (extraMembers: Array<TypeBundle>) => {
  return extraMembers.reduce((acc, em) => {
    acc += em.name + ": ";
    if (em.type === "Domain") {
      acc += "Domain.Production";
    } else if (em.type === "string") {
      acc += '""';
    } else if (em.type === "number") {
      acc += "0";
    } else {
      acc += "undefined";
    }
    acc += ", ";

    return acc;
  }, "");
};

const GetExtraStateTestValues = (state: StateInfo) => {
  return GetExtraTestValues(state.extraMembers);
};

const GetExtraTransitionTestValues = (transition: TransitionInfo) => {
  return GetExtraTestValues(transition.extraMembers);
};

test = Object.keys(states)
  .sort()
  .reduce((acc, sourceStateName, stateIndex) => {
    const sourceState = states[sourceStateName];
    if (sourceState === undefined) {
      return acc;
    }

    if (
      sourceState.transitions !== undefined &&
      sourceState.transitions.length > 0
    ) {
      acc = sourceState.transitions.reduce(
        (acc2, currentTransition, transitionIndex) => {
          const transitionLine = transitionLines.find(
            (value: TransitionLine): boolean => {
              return (
                value.source === sourceStateName &&
                value.transition === currentTransition
              );
            }
          );

          const transition = transitions[currentTransition];

          if (transitionLine) {
            const extraStateMembers = GetExtraStateTestValues(sourceState);
            const extraTransitionMembers = GetExtraTransitionTestValues(
              transition
            );
            const sourceStateString = `{ type: "${sourceStateName}", text: "", ${extraStateMembers}}`;
            const transitionString = `{ type: "${currentTransition}", text: "", ${extraTransitionMembers}}`;

            acc2 += `
    it("${transitionLine.source} -> ${transitionLine.destination} on ${transitionLine.transition} (${stateIndex}, ${transitionIndex})", () => {
      const destination = TextEditorState.Apply( 
        ${sourceStateString},
        ${transitionString} 
      );
      expect(destination).toBeTruthy();
      expect(destination.type).toEqual("${transitionLine.destination}");
    });
          `;
          }
          return acc2;
        },
        acc
      );
    }

    return acc;
  }, test);

test += "});";

fs.writeFileSync(
  `${rootDirectory}/tests/TextEditorState-generated.test.ts`,
  test
);

//===========================================================================================
// Step 5: GraphViz Output
//===========================================================================================
let gv = transitionLines.reduce((acc, currentLine) => {
  acc +=
    "    " +
    currentLine.source +
    " -> " +
    currentLine.destination +
    ' [label="' +
    currentLine.transition +
    '"]\n';

  return acc;
}, "digraph TextEditorState {\n");

gv += "}";

fs.writeFileSync(`${rootDirectory}/TextEditorState.gen.dot`, gv);
// dot.exe Filename.dot -Tpng -o Filename.png
