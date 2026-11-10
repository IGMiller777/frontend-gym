import ts from 'typescript'

/** Strict settings used for lesson examples and coding tasks: what a modern project would use. */
export const checkOptions: ts.CompilerOptions = {
  strict: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
  // tsx examples import `react` and use the automatic JSX runtime, as a Vite + React project does.
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  noEmit: true,
  types: [],
}

/**
 * Type-checks in-memory TypeScript modules in one program and returns the diagnostics per file
 * ("line:col message"). Files without import/export are still treated as separate modules.
 */
export function typeCheck(files: Record<string, string>, options: ts.CompilerOptions = checkOptions): Record<string, string[]> {
  const sources = Object.fromEntries(Object.entries(files).map(([name, code]) => [name, `${code}\nexport {}\n`]))
  const host = ts.createCompilerHost(options)
  const read = host.getSourceFile.bind(host)
  host.getSourceFile = (name, lang) => (name in sources ? ts.createSourceFile(name, sources[name], lang) : read(name, lang))
  const program = ts.createProgram(Object.keys(sources), options, host)
  const out: Record<string, string[]> = Object.fromEntries(Object.keys(files).map((f) => [f, []]))
  for (const d of ts.getPreEmitDiagnostics(program)) {
    const name = d.file?.fileName ?? '(global)'
    const pos = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : null
    ;(out[name] ??= []).push(`${pos ? `${pos.line + 1}:${pos.character + 1} ` : ''}${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`)
  }
  return out
}

/** TypeScript → JavaScript without type checking (types are erased), for running examples. */
export function stripTypes(code: string): string {
  return ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true } }).outputText
}
