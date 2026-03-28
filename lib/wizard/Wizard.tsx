import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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

  // 🔥 FIX: hydrate wizard state from initialValues
  const [values, setValues] = useState<WizardValues>(() => {
    const initial: WizardValues = {};

    steps.forEach((step) => {
      if (step.initialValues) {
        initial[step.id] = step.initialValues;
      }
    });

    return initial;
  });

  const defaultValues = useMemo(() => {
    return getInitialValues(activeStep);
  }, [activeStep, values]);

  const methods = useForm({
    defaultValues,
    mode: getMode(activeStep),
    resolver: getResolver(activeStep, values),
    shouldUnregister: true,
  });

  const { reset } = methods;

  const currentIndex: number = steps.findIndex(
    (s) => s.id === activeStep.id
  );
  const stepNumber: number = currentIndex + 1;
  const totalSteps: number = steps.length;
  const isFirstStep: boolean = stepNumber === 1;
  const isLastStep: boolean = stepNumber === totalSteps;

  // 🔥 ensure form resets correctly on step/value change
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!enableHash) return;

    window.addEventListener("hashchange", handleHashChange);
    updateHash(hashes, activeStep);

    return () =>
      window.removeEventListener("hashchange", handleHashChange);
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
    let proceedingStep;

    for (let idx = 0; idx < remainingSteps.length; ++idx) {
      const step = remainingSteps[idx];

      if (step.shouldSkip === undefined) {
        proceedingStep = step;
        break;
      }

      const shouldSkip = await step.shouldSkip(newValues, direction);

      if (!shouldSkip) {
        proceedingStep = step;
        break;
      }
    }

    return proceedingStep;
  }

  async function _resolveNextStep(
    newValues: WizardValues
  ): Promise<Step | undefined> {
    const remainingSteps = steps.slice(currentIndex + 1);
    return _getProceedingStep(remainingSteps, newValues, 1);
  }

  async function _resolvePreviousStep(
    newValues: WizardValues
  ): Promise<Step | undefined> {
    const remainingSteps = steps.slice(0, currentIndex).reverse();
    return _getProceedingStep(remainingSteps, newValues, -1);
  }

  function handleCompleted(values: WizardValues) {
    if (!onCompleted) return;

    let result = {};

    Object.keys(values).forEach((stepId: string | number) => {
      result = { ...result, ...values[stepId] };
    });

    onCompleted(result);
  }

  async function handleNext(stepValues: Values) {
    try {
      if (activeStep.onSubmit) {
        setIsLoading(true);
        stepValues = await activeStep.onSubmit(stepValues, values);
        setIsLoading(false);
      }

      const wizardValues = {
        ...values,
        [activeStep.id]: { ...stepValues },
      };

      setValues(wizardValues);

      const nextStep = await _resolveNextStep(wizardValues);

      if (!nextStep) {
        handleCompleted(wizardValues);
        return;
      }

      if (onStepChanged) {
        onStepChanged(activeStep, nextStep, wizardValues);
      }

      // ✅ FIX: safe cast
      setActiveStep(nextStep as Step);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function handlePrevious(stepValues: Values) {
    let wizardValues = null;

    if (activeStep.keepValuesOnPrevious ?? true) {
      wizardValues = {
        ...values,
        [activeStep.id]: { ...stepValues },
      };
      setValues(wizardValues);
    }

    wizardValues = wizardValues || values;

    const previousStep = await _resolvePreviousStep(wizardValues);

    if (!previousStep) return;

    if (onStepChanged) {
      onStepChanged(activeStep, previousStep, wizardValues);
    }

    // ✅ FIX: safe cast
    setActiveStep(previousStep as Step);
  }

  function updateStep(key: string, value: any) {
    setActiveStep({ ...activeStep, [key]: value });
  }

  function getInitialValues(step: Step) {
    return values[step.id] || step.initialValues || {};
  }

  const context: WizardContextValues = {
    values,
    setValues,
    setIsLoading,
    updateStep,
    goToPreviousStep: () => handlePrevious(methods.getValues()),
    goToNextStep: () => handleNext(methods.getValues()),
    goToStep: (index: number) => setActiveStep(steps[index]),
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
          {wrapper || activeStep.component}
          {footer}
        </form>
      </FormProvider>
    </WizardContext.Provider>
  );
}

export default Wizard;