const readline = require("readline/promises");
const { fork } = require("child_process");
const { stdin: input, stdout: output } = require('node:process');
const fs = require('fs');

// const rl = readLine.createInterface({ input, output, prompt: '> '});

// rl.prompt();
const spawnProcess = async () => {
  const child = fork("./node_modules/typescript/lib/tsserver.js", ["--useNodeIpc"], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  
  });

  const rl = readline.createInterface({ input, output});

  const server = new Server(child);
  child.on('error', err => console.error(err))
  child.on('message', data => server.handleResponse(data))

  child.send({
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
  }) 
  child.send({
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
  }) 
  child.send({
    "seq": 2,
    "type": "request",
    "command": "updateOpen",
    "arguments": {
      "changedFiles": [],
      "closedFiles": [],
      "openFiles": [
        {
          "file": "/Users/maurobalbi/Documents/repos/mal-ts-types/mal.ts",
          "projectRootPath": "/Users/maurobalbi/Documents/repos/mal-ts-types",
          "scriptKindName": "TS"
        }
      ]
    }
  })


  while(true) {
    const line = await rl.question("> ")
    const output = await server.eval(line.toString());
    console.log(output)
  }
}

class Server {
  constructor(child) {
    this._process = child;
    this._seq = 3;
    this._spanLength = 3;
    this._reqs = new Map();
  }

  eval(line) {
    let _line = line.replace('\n', "")
    _line = line.replaceAll('"', '\\"')

    const cmd = { "seq": this._seq, "type": "request", "command": "updateOpen", "arguments": { "changedFiles": [{ "fileName": "/Users/maurobalbi/Documents/repos/mal-ts-types/mal.ts", "textChanges": [{ "newText": _line, "start": { "line": 1, "offset": 15 }, "end": { "line": 1, "offset": 15 + this._spanLength } }] }], "closedFiles": [], "openFiles": [] } }
    this._spanLength = _line.length;
    this._process.send(cmd);
    this._process.send({ "seq": this._seq + 1, "type": "request", "command": "quickinfo", "arguments": { "file": "/Users/maurobalbi/Documents/repos/mal-ts-types/mal.ts", "line": 3, "offset": 9 } });
    return new Promise(resolve => {
      this._reqs.set(this._seq++, resolve);
    })
  }

  handleResponse(data) {
    const seq = data?.request_seq;
    if(seq > 2 && data.command === 'updateOpen') {
      this._seq++;
    }

    if(seq > 2 && data.command === 'quickinfo') {
      const resolve = this._reqs.get(seq - 1);
      resolve && resolve(data?.body?.displayString);
    }
  }
}

spawnProcess().then((here) => console.log(here)).catch(err => console.error(err))
