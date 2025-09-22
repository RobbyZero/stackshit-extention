const vscode = require('vscode');
const { runStackShit } = require('./interpreter');

function activate(context) {
  const disposable = vscode.commands.registerCommand('stackshit.runFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor — open a .stk file first.');
      return;
    }

    const code = editor.document.getText();
    let output;
    try {
      output = runStackShit(code);
    } catch (err) {
      output = 'Runtime error: ' + err.message;
    }

    const channel = vscode.window.createOutputChannel('StackShit');
    channel.clear();
    channel.appendLine(output);
    channel.show(true);
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
