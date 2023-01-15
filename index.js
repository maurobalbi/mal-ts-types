const readLine = require("readline");
const { spawn } = require("child_process");
const { stdin: input, stdout: output } = require('node:process');

const rl = readLine.createInterface({ input, output, prompt: '> '});

rl.prompt();


child = spawn("./node_modules/typescript/bin/tsserver")

rl.on("line", line => {child.stdin.write(evalLine(line.toString()))});

child.stdin.setEncoding('utf-8');

child.stdin.write(JSON.stringify({
  "seq": 0,
  "type": "request",
  "command": "configure",
  "arguments": {
    "hostInfo": "vscode",
    "preferences": {
      "providePrefixAndSuffixTextForRename": true,
      "allowRenameOfImportPath": true,
      "includePackageJsonAutoImports": "auto"
    },
    "watchOptions": {}
  }
}) + '\n' + JSON.stringify({
  "seq": 1,
  "type": "request",
  "command": "compilerOptionsForInferredProjects",
  "arguments": {
    "options": {
      "module": "ESNext",
      "moduleResolution": "Node",
      "target": "ES2020",
      "jsx": "react",
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "sourceMap": true,
      "allowJs": true,
      "allowSyntheticDefaultImports": true,
      "allowNonTsExtensions": true,
      "resolveJsonModule": true
    }
  }
}) + '\n' + JSON.stringify({
  "seq": 2,
  "type": "request",
  "command": "updateOpen",
  "arguments": {
    "changedFiles": [],
    "closedFiles": [],
    "openFiles": [
      {
        "file": "/Users/maurobalbi/Documents/repos/mal-ts-types/mal.ts",
        "fileContent": "type input = \"abc\"\n\ntype output = Repl<input>\n\ntype Read<T> = T;\n\ntype Eval<T> = T;\n\ntype Print <T> = T;\n\ntype Repl<T> = Print<Eval<Read<T>>>;",
        "projectRootPath": "/Users/maurobalbi/Documents/repos/mal-ts-types",
        "scriptKindName": "TS"
      }
    ]
  }
}) + '\n' + JSON.stringify({
  "seq": 14,
  "type": "request",
  "command": "quickinfo",
  "arguments": {
    "file": "/Users/maurobalbi/Documents/repos/mal-ts-types/mal.ts",
    "line": 1,
    "offset": 7
  }
}) + '\n') 

const evalLine = line => {
  return JSON.stringify({ "seq": 71, "type": "request", "command": "updateOpen", "arguments": { "changedFiles": [{ "fileName": "/Users/maurobalbi/Documents/repos/mal-ts-types/mal.ts", "textChanges": [{ "newText": "a", "start": { "line": 1, "offset": 15 }, "end": { "line": 1, "offset": 18 } }] }], "closedFiles": [], "openFiles": [] } }) + '\n' + JSON.stringify({ "seq": 58, "type": "request", "command": "quickinfo", "arguments": { "file": "/Users/maurobalbi/Documents/repos/mal-ts-types/mal.ts", "line": 3, "offset": 9 } }) + '\n'
}

child.stdout.on('data', (data) => {
  const responses = data.toString().split('\n');

  for (const res of responses) {
    const parsedData = parseData(res);
    let displayString = "";
    try{
      displayString = parsedData.body.displayString;
      console.log(displayString.split('type input = ')[1].slice(1, -1))
    }
    catch(e){
      console.log(e)
    }
  }
});

const parseData = (line) => {
  try {
    return JSON.parse(line);
  }
  catch (e) {
    return null
  }
}

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

child.on('error', (err) => {
  console.error('Failed to start subprocess.');
});