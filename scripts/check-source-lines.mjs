import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parse as parseJavaScript } from '@babel/parser'
import { parse as parseVueComponent } from '@vue/compiler-sfc'

const MAX_LINES = 300
const MAX_LINE_LENGTH = 120
const ROOT = process.cwd()
const SOURCE_EXTENSIONS = new Set([
  '.vue', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.html', '.json', '.scss', '.sass', '.less',
])
const IGNORED_DIRECTORIES = new Set([
  '.git', 'node_modules', 'dist', 'dev-dist',
  'coverage', '.cache', '.vite',
])
const GENERATED_FILES = new Set(['package-lock.json'])

const JAVASCRIPT_EXTENSIONS = new Set([
  '.vue', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
])

function validateSingleConst(source, relativePath, lineOffset = 0) {
  const problems = []
  const ast = parseJavaScript(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript', 'jsx'],
  })
  const stack = [ast.program]

  while (stack.length) {
    const current = stack.pop()
    if (current?.type === 'VariableDeclaration' && current.kind === 'const') {
      const declaration = current.declarations[0]
      const invalidCount = current.declarations.length !== 1
      const invalidName = declaration?.id.type !== 'Identifier'

      if (invalidCount || invalidName) {
        const line = current.loc.start.line + lineOffset
        problems.push(`${relativePath}:${line}: use apenas um nome por const`)
      }
    }

    for (const child of Object.values(current || {})) {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item?.type) stack.push(item)
        }
      } else if (child?.type) {
        stack.push(child)
      }
    }
  }

  return problems
}

function inspectJavaScript(source, extension, relativePath) {
  try {
    if (extension !== '.vue') {
      return validateSingleConst(source, relativePath)
    }

    const vue = parseVueComponent(source, { filename: relativePath })
    const scripts = [vue.descriptor.script, vue.descriptor.scriptSetup]
    const problems = []

    for (const script of scripts.filter(Boolean)) {
      const lineOffset = script.loc.start.line - 1
      problems.push(...validateSingleConst(script.content, relativePath, lineOffset))
    }
    return problems
  } catch (error) {
    return [`${relativePath}: erro ao analisar declarações: ${error.message}`]
  }
}

async function inspectDirectory(directory) {
  const problems = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
      continue
    }

    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      problems.push(...(await inspectDirectory(filename)))
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (!entry.isFile() || !SOURCE_EXTENSIONS.has(extension)) {
      continue
    }
    if (GENERATED_FILES.has(entry.name)) {
      continue
    }

    const content = await readFile(filename, 'utf8')
    const lines = content.trimEnd().split(/\r?\n/)
    const relativePath = path.relative(ROOT, filename)

    if (JAVASCRIPT_EXTENSIONS.has(extension)) {
      problems.push(...inspectJavaScript(content, extension, relativePath))
    }

    if (lines.length > MAX_LINES) {
      problems.push(`${relativePath}: ${lines.length} linhas (máximo: ${MAX_LINES})`)
    }

    for (const entry of lines.entries()) {
      const index = entry[0]
      const line = entry[1]
      if (line.length > MAX_LINE_LENGTH) {
        problems.push(
          `${relativePath}:${index + 1}: ${line.length} caracteres ` +
          `(máximo: ${MAX_LINE_LENGTH})`,
        )
      }
    }
  }

  return problems
}

const problems = await inspectDirectory(ROOT)
if (problems.length) {
  for (const message of problems) {
    console.error(message)
  }
  process.exitCode = 1
} else {
  console.log(`Código validado: até ${MAX_LINES} linhas por arquivo.`)
  console.log(`Cada linha tem no máximo ${MAX_LINE_LENGTH} caracteres.`)
  console.log('Cada const declara exatamente um nome, sem desestruturação.')
  console.log('Arquivos .css não têm limite de linhas nem de caracteres.')
}