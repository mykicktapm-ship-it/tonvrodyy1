// This type declaration provides a minimal module definition for the `three` package.
// Without it, TypeScript will complain that it cannot find declaration files for
// the CommonJS build of three (e.g. `three.cjs`).  When using three via
// @react-three/fiber in a Vite + React project, this file tells the compiler
// that the module exists and exports any types from the published package.
// Declare the `three` module so that TypeScript does not complain about
// missing type definitions.  This declaration makes all exports from
// `three` of type `any`, which is sufficient for the usage in this project.
declare module 'three' {
  const value: any;
  export = value;
}