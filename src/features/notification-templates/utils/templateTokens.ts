export const extractTokens = (text: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const tokens = new Set<string>();
  let match;
  while ((match = regex.exec(text)) !== null) {
    tokens.add(match[1]);
  }
  return Array.from(tokens);
};

export const insertAtCaret = (
  currentValue: string,
  caretStart: number,
  caretEnd: number,
  token: string
): { value: string; caret: number } => {
  const insertText = `{{${token}}}`;
  const newValue =
    currentValue.substring(0, caretStart) +
    insertText +
    currentValue.substring(caretEnd);
  return { value: newValue, caret: caretStart + insertText.length };
};

export const characterCount = (text: string): number => {
  return text.length;
};
