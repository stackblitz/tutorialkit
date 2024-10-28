/// <reference path="../.astro/types.d.ts" />
/// <reference types="@tutorialkit/astro/types" />
/// <reference types="astro/client" />

// copied from packages/astro/src/default/env-default.d.ts
// TODO: should probably be exposed by astro/types instead?
declare namespace App {
  interface Locals {
    tk: {
      lesson: import('@tutorialkit/types').Lesson<any>;
    };
  }
}
