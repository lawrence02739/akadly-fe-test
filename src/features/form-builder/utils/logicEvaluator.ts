import type { LogicRule, LogicOperator } from '../types/form-builder.types';

export const evaluateCondition = (operator: LogicOperator, targetValue: any, actualValue: any): boolean => {
  if (actualValue === undefined || actualValue === null) actualValue = '';
  
  const targetStr = String(targetValue || '').toLowerCase();
  const actualStr = String(actualValue).toLowerCase();
  const actualNum = Number(actualValue);
  const targetNum = Number(targetValue);

  switch (operator) {
    case 'EQUALS': return actualStr === targetStr;
    case 'NOT_EQUALS': return actualStr !== targetStr;
    case 'CONTAINS': return actualStr.includes(targetStr);
    case 'NOT_CONTAINS': return !actualStr.includes(targetStr);
    case 'GREATER_THAN': return !isNaN(actualNum) && !isNaN(targetNum) && actualNum > targetNum;
    case 'LESS_THAN': return !isNaN(actualNum) && !isNaN(targetNum) && actualNum < targetNum;
    case 'EMPTY': return actualStr.trim() === '';
    case 'NOT_EMPTY': return actualStr.trim() !== '';
    default: return false;
  }
};

export const evaluateRule = (rule: LogicRule, responses: Record<string, any>): boolean => {
  if (!rule.conditions || rule.conditions.length === 0) return false;

  const results = rule.conditions.map(cond => {
    const actualValue = responses[cond.questionId];
    return evaluateCondition(cond.operator, cond.value, actualValue);
  });

  if (rule.conditionOperator === 'OR') {
    return results.some(r => r);
  }
  return results.every(r => r);
};

export const getLogicActions = (rules: LogicRule[], responses: Record<string, any>) => {
  const actionsToApply: LogicRule[] = [];
  
  for (const rule of rules) {
    if (evaluateRule(rule, responses)) {
      actionsToApply.push(rule);
    }
  }
  
  return actionsToApply;
};
