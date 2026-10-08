const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const thresholds = require('../coverage.config.json');

const backend = path.resolve(__dirname, '..');
const output = path.join(backend, 'coverage');
fs.mkdirSync(output, { recursive: true });
// Eliminar solo salidas conocidas impide reutilizar métricas de una ejecución anterior.
for (const name of ['lcov.info', 'summary.json', 'badge.svg']) {
  const file = path.resolve(output, name);
  if (path.dirname(file) !== output) throw new Error('Salida fuera de coverage/');
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
const files = fs
  .readdirSync(path.join(backend, 'test'))
  .filter((name) => name.endsWith('.test.js'))
  .sort();
if (!files.length) throw new Error('No hay pruebas para medir cobertura.');
const result = spawnSync(
  process.execPath,
  [
    '--test',
    '--experimental-test-coverage',
    '--test-coverage-include=src/**/*.js',
    '--test-coverage-exclude=**/node_modules/**',
    `--test-coverage-lines=${thresholds.lines}`,
    `--test-coverage-branches=${thresholds.branches}`,
    `--test-coverage-functions=${thresholds.functions}`,
    '--test-reporter=./scripts/coverage-reporter.cjs',
    '--test-reporter-destination=stdout',
    ...files.map((name) => path.join('test', name)),
  ],
  { cwd: backend, stdio: 'inherit', windowsHide: true }
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
for (const name of ['lcov.info', 'summary.json', 'badge.svg']) {
  if (!fs.existsSync(path.join(output, name))) throw new Error(`Falta el informe ${name}`);
}
const lcov = fs.readFileSync(path.join(output, 'lcov.info'), 'utf8');
fs.writeFileSync(
  path.join(output, 'lcov.info'),
  lcov.replace(/^SF:(.+)$/gm, (_, file) => 'SF:' + file.replaceAll('\\', '/'))
);
const summary = JSON.parse(fs.readFileSync(path.join(output, 'summary.json'), 'utf8'));
if (process.env.GITHUB_STEP_SUMMARY) {
  const totals = summary.totals;
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## Cobertura de backend/src\n\n| Lineas | Ramas | Funciones |\n| --- | --- | --- |\n| ${totals.coveredLinePercent.toFixed(2)}% | ${totals.coveredBranchPercent.toFixed(2)}% | ${totals.coveredFunctionPercent.toFixed(2)}% |\n\n${summary.files.length} modulos incluidos. Informes en el artefacto backend-coverage.\n`
  );
}
