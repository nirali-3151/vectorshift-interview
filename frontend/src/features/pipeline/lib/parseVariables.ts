// parseVariables.ts
// Finds {{ variable }} references in a template string.
// --------------------------------------------------

// Deliberately strict: the inner text must be a single JavaScript identifier,
// so `{{ a.b }}`, `{{ 1st }}`, and a stray `{{` cannot spawn a handle.
const variablePattern = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

const invalidVariablePattern = /\{\{([^}]*)\}\}/g;

// Reserved words fit the identifier grammar but cannot name a variable, so
// `{{ class }}` is a typo rather than an input. Includes the strict-mode and
// contextually reserved words, since a template has no way to opt out of them.
const reservedWords = new Set([
  'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'implements', 'import', 'in',
  'instanceof', 'interface', 'let', 'new', 'null', 'package', 'private',
  'protected', 'public', 'return', 'static', 'super', 'switch', 'this',
  'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
]);

const validIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// Returns each distinct name once, in the order it first appears.
export const parseVariables = (text: unknown): string[] => {
  if (typeof text !== 'string') return [];

  const names = new Set<string>();
  for (const [, name] of text.matchAll(variablePattern)) {
    if (!reservedWords.has(name)) names.add(name);
  }

  return [...names];
};

export const findTemplateSyntaxIssues = (text: unknown): string[] => {
  if (typeof text !== 'string' || text.length === 0) return [];

  const issues: string[] = [];

  if (text.includes('{{') && !text.includes('}}')) {
    issues.push('Unclosed {{ — add a closing }}');
  }

  for (const match of text.matchAll(invalidVariablePattern)) {
    const inner = match[1]?.trim() ?? '';
    if (validIdentifier.test(inner) && reservedWords.has(inner)) {
      issues.push(`'{{ ${inner} }}' uses a reserved word`);
    } else if (!validIdentifier.test(inner)) {
      issues.push(`'{{ ${inner} }}' is not a valid variable name`);
    }
  }

  const openCount = (text.match(/\{\{/g) ?? []).length;
  const closeCount = (text.match(/\}\}/g) ?? []).length;
  if (openCount !== closeCount && openCount > 0 && closeCount > 0) {
    issues.push('Mismatched {{ and }} brackets');
  }

  return issues;
};
