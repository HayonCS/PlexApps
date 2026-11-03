export namespace Modes {
  export const InStorybook = (): boolean => {
    return `${process.env.STORYBOOK_MODE}` === "true";
  };

  export const InTest = (): boolean => {
    return `${process.env.NODE_ENV}` === "test";
  };
}
