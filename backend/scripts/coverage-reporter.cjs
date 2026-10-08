const fs = require('node:fs');
const path = require('node:path');
const thresholds = require('../coverage.config.json');
const { spec, lcov } = require('node:test/reporters');
const { Readable, compose } = require('node:stream');

const backend = path.resolve(__dirname, '..');
const metrics = [
  'totalLineCount',
  'coveredLineCount',
  'coveredLinePercent',
  'totalBranchCount',
  'coveredBranchCount',
  'coveredBranchPercent',
  'totalFunctionCount',
  'coveredFunctionCount',
  'coveredFunctionPercent',
];
function counts(value) {
  const result = {};
  for (const metric of metrics) {
    if (!Number.isFinite(value[metric]))
      throw new Error(`Metrica de cobertura invalida: ${metric}`);
    result[metric] = value[metric];
  }
  return result;
}

function createReport(summary) {
  const expected = fs
    .readdirSync(path.join(backend, 'src'), { recursive: true })
    .filter((file) => file.endsWith('.js'))
    .map((file) => 'src/' + file.replaceAll('\\', '/'))
    .sort();
  const files = summary.files
    .map((file) => ({
      path: path.relative(backend, file.path).replaceAll('\\', '/'),
      ...counts(file),
      uncoveredBranches: file.branches
        .filter((branch) => branch.count === 0)
        .map((branch) => branch.line),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  // Un archivo nuevo sin cargar no aparece en V8: rechazar un denominador incompleto.
  if (
    !expected.length ||
    JSON.stringify(expected) !== JSON.stringify(files.map((file) => file.path).sort())
  ) {
    throw new Error('El informe debe incluir todos y solo los modulos JavaScript de src/.');
  }
  return {
    scope: 'backend/src/**/*.js',
    node: process.version,
    thresholds,
    totals: counts(summary.totals),
    files,
  };
}

async function* observe(source) {
  for await (const event of source) {
    if (event.type !== 'test:coverage') {
      yield event;
      continue;
    }
    const report = createReport(event.data.summary);
    const output = path.join(backend, 'coverage');
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
    let lcovText = '';
    for await (const chunk of Readable.from([event]).pipe(lcov())) lcovText += chunk;
    fs.writeFileSync(path.join(output, 'lcov.info'), lcovText);
    const percent = report.totals.coveredLinePercent.toFixed(2);
    fs.writeFileSync(
      path.join(output, 'badge.svg'),
      `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="20" role="img" aria-label="src line coverage: ${percent}%"><title>src line coverage: ${percent}%</title><rect width="112" height="20" fill="#555"/><rect x="112" width="68" height="20" fill="#007ec6"/><g fill="#fff" font-family="Verdana,sans-serif" font-size="11" text-anchor="middle"><text x="56" y="14">src lines</text><text x="146" y="14">${percent}%</text></g></svg>\n`
    );
    yield event;
  }
}

async function* reporter(source) {
  yield* compose(source, observe, spec());
}

module.exports = reporter;
module.exports.createReport = createReport;
