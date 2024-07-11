export function interpolateString(template: string, variables: Record<string, string | number>) {
  for (const [variable, value] of Object.entries(variables)) {
    template = template.replace(`\${${variable}}`, value.toString());
  }

  return template;
}
