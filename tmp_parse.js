const fs = require('fs');
const ts = require('typescript');
const path = 'src/App.tsx';
const sourceText = fs.readFileSync(path, 'utf8');
const sf = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const diagnostics = ts.getPreEmitDiagnostics(sf);
for (const d of diagnostics) {
  const { line, character } = sf.getLineAndCharacterOfPosition(d.start || 0);
  console.log(`${line + 1}:${character + 1} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
}
