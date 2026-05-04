import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { getMode, getResolver } from "./helpers/form";
import { WizardContext } from "./helpers/hooks";
import { buildHashSteps, resolveHashStep, updateHash } from "./helpers/hash";
import {
  WizardProps,
  StepConfig as Step,
  WizardContextValues,
  WizardValues,
  Values,
} from "./types";

function Wizard({
  steps,
  onCompleted,
  onStepChanged,
  enableHash,
  header,
  wrapper,
  footer,
}: WizardProps) {
  const hashes = useMemo(() => {
    return enableHash ? buildHashSteps(steps) : {};
  }, [enableHash, steps]);

  const initialStep: Step = resolveHashStep(hashes) || steps[0];

  const [activeStep, setActiveStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Stores values for editable steps only. Read-only steps always source
  // their data from step.initialValues directly, never from this state.
  const [values, setValues] = useState<WizardValues>({});

  // Keep activeStep reference fresh whenever the steps array is replaced
  // (e.g. async initialValues arrive after mount). Without this, activeStep
  // holds the stale step object and the form reset never sees new data.
  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
    const freshStep = steps.find((s) => s.id === activeStep.id);
    if (freshStep && freshStep !== activeStep) {
      setActiveStep(freshStep);
    }
  }, [steps]);

  /**
   * Returns the values to pre-populate a step's form with.
   * - Read-only steps: always use step.initialValues (the server data).
   *   Never use values[step.id] for read-only steps because handleNext
   *   would have written empty disabled-form values there.
   * - Editable steps: use values[step.id] if the user has been there,
   *   otherwise fall back to step.initialValues.
   */
  function getStepValues(step: Step): Values {
    if (step.isReadOnly) {
      return step.initialValues ?? {};
    }
    return values[step.id] ?? step.initialValues ?? {};
  }

  const methods = useForm({
    defaultValues: getStepValues(activeStep),
    mode: getMode(activeStep),
    resolver: getResolver(activeStep, values),
  });

  const { reset } = methods;

  const currentIndex: number = steps.findIndex((s) => s.id === activeStep.id);
  const stepNumber: number = currentIndex + 1;
  const totalSteps: number = steps.length;
  const isFirstStep: boolean = stepNumber === 1;
  const isLastStep: boolean = stepNumber === totalSteps;

  /**
   * Reset form whenever active step changes OR its source data changes.
   * activeStep.initialValues covers async load for read-only steps.
   * values[activeStep.id] covers editable steps navigated back to.
   */
  const resetKey = activeStep.isReadOnly
    ? activeStep.initialValues
    : values[activeStep.id] ?? activeStep.initialValues;

  useEffect(() => {
    reset(getStepValues(activeStep));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep.id, resetKey, reset]);

  useEffect(() => {
    if (!enableHash) return;
    window.addEventListener("hashchange", handleHashChange);
    updateHash(hashes, activeStep);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeStep]);

  function handleHashChange() {
    const step = resolveHashStep(hashes);
    if (step?.id === activeStep.id) return;
    if (step) setActiveStep(step);
  }

  async function _getProceedingStep(
    remainingSteps: Step[],
    newValues: WizardValues,
    direction: number
  ): Promise<Step | undefined> {
    for (const step of remainingSteps) {
      if (step.shouldSkip === undefined) return step;
      const shouldSkip = await step.shouldSkip(newValues, direction);
      if (!shouldSkip) return step;
    }
    return undefined;
  }

  async function _resolveNextStep(newValues: WizardValues) {
    return _getProceedingStep(steps.slice(currentIndex + 1), newValues, 1);
  }

  async function _resolvePreviousStep(newValues: WizardValues) {
    return _getProceedingStep(steps.slice(0, currentIndex).reverse(), newValues, -1);
  }

  /**
   * Build the full allSteps map for onCompleted/onStepChanged.
   * Read-only steps use their initialValues; editable steps use saved values.
   */
  function buildAllSteps(editableValues: WizardValues): WizardValues {
    const all: WizardValues = {};
    stepsRef.current.forEach((step) => {
      if (step.isReadOnly) {
        all[step.id] = step.initialValues ?? {};
      } else {
        all[step.id] = editableValues[step.id] ?? step.initialValues ?? {};
      }
    });
    return all;
  }

  function handleCompleted(allSteps: WizardValues) {
    if (!onCompleted) return;
    let flat = {};
    Object.values(allSteps).forEach((v) => { flat = { ...flat, ...v }; });
    onCompleted(flat, allSteps);
  }

  async function handleNext(stepValues: Values) {
    try {
      if (activeStep.onSubmit) {
        setIsLoading(true);
        stepValues = await activeStep.onSubmit(stepValues, values);
        setIsLoading(false);
      }

      // Only persist values for editable steps
      const newValues = activeStep.isReadOnly
        ? { ...values }
        : { ...values, [activeStep.id]: { ...stepValues } };

      setValues(newValues);

      const allSteps = buildAllSteps(newValues);
      const nextStep = await _resolveNextStep(allSteps);

      if (!nextStep) {
        handleCompleted(allSteps);
        return;
      }

      if (onStepChanged) onStepChanged(activeStep, nextStep, allSteps);
      setActiveStep(nextStep as Step);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function handlePrevious(stepValues: Values) {
    const newValues = (activeStep.keepValuesOnPrevious ?? true) && !activeStep.isReadOnly
      ? { ...values, [activeStep.id]: { ...stepValues } }
      : { ...values };

    setValues(newValues);

    const allSteps = buildAllSteps(newValues);
    const previousStep = await _resolvePreviousStep(allSteps);
    if (!previousStep) return;

    if (onStepChanged) onStepChanged(activeStep, previousStep, allSteps);
    setActiveStep(previousStep as Step);
  }

  function updateStep(key: string, value: any) {
    setActiveStep({ ...activeStep, [key]: value });
  }

  const context: WizardContextValues = {
    values,
    setValues,
    setIsLoading,
    updateStep,
    goToPreviousStep: () => handlePrevious(methods.getValues()),
    goToNextStep: () => handleNext(methods.getValues()),
    goToStep: (index: number) => {
      const stepValues = methods.getValues();
      if (!activeStep.isReadOnly) {
        setValues((v) => ({ ...v, [activeStep.id]: { ...stepValues } }));
      }
      setActiveStep(steps[index]);
    },
    activeStep,
    stepNumber,
    totalSteps,
    isLoading,
    isFirstStep,
    isLastStep,
  };

  return (
    <WizardContext.Provider value={context}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleNext)}>
          {header}
          <div className="relative overflow-hidden w-full">
            <AnimatePresence mode="wait" custom={stepNumber}>
              <motion.div
                key={activeStep.id}
                custom={stepNumber}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {wrapper || activeStep.component}
              </motion.div>
            </AnimatePresence>
          </div>
          {footer}
        </form>
      </FormProvider>
    </WizardContext.Provider>
  );
}

export default Wizard;