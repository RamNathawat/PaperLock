import { StepConfig as Step } from "../types";

interface StepHash {
  [hash: string]: Step;
}

export function buildHashSteps(steps: Step[]): StepHash {
  return steps.reduce((acc, step) => {
    const hash = step.id.toLowerCase().replace(/\s+/g, "-");
    acc[hash] = step;
    return acc;
  }, {} as StepHash);
}

export function resolveHashStep(hashes: StepHash): Step | undefined {
  if (typeof window === "undefined") return undefined;
  const hash = window.location.hash.slice(1);
  return hashes[hash];
}

export function updateHash(hashes: StepHash, activeStep: Step) {
  if (typeof window === "undefined") return;
  const hash = Object.keys(hashes).find((h) => hashes[h].id === activeStep.id);
  if (hash) {
    window.location.hash = hash;
  }
}
