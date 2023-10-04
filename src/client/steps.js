import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import has from 'lodash/has';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';

export const STEPS = mapValues({
  0: {
    key: 'find',
    can: {
      next: (state) => state.form.find?.length > 0,
      options: true,
      find: true,
      replace: false,
    },
  },
  1: {
    key: 'previewReplace',
    can: {
      next: (state) => state.form.replace?.length > 0,
      options: false,
      find: false,
      replace: true,
    }
  },
  2: {
    key: 'replace',
    can: {
      next: true,
      options: false,
      find: false,
      replace: true,
    },
  },
  3: {
    key: 'replaced',
    can: {
      next: false,
      options: false,
      find: false,
      replace: false,
    }
  }
}, (value, index) => ({ ...value, index }));

export const useStep = () => {
  const stepIndex = useSelector(state => state.form.step);
  return useMemo(() => STEPS[stepIndex], [stepIndex]);
};

export const useCan = (key) => useSelector((state) => {
  const stepIndex = state.form.step;
  const step = STEPS[stepIndex];

  if (!has(step.can, key)) {
    console.warn(`Tried to access missing rule ${key} in step[${stepIndex}].can`);
    return false;
  }

  const rule = get(step.can, key);
  if (typeof rule === 'boolean') return rule;
  if (typeof rule === 'function') return rule(state);

  console.warn(`Unexpected rule type for step[${stepIndex}].can[${key}]`)
  return rule;
});