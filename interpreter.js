function preprocess(src) {
  const commands = new Set(['i','d','s','+','-','*','/','%','p','n','[',']']);
  const code = Array.from(src).filter(ch => commands.has(ch));
  const stack = [];
  const br = new Map();
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '[') stack.push(i);
    else if (code[i] === ']') {
      const j = stack.pop();
      if (j == null) throw new Error('Unmatched ] at ' + i);
      br.set(i, j); br.set(j, i);
    }
  }
  if (stack.length) throw new Error('Unmatched [ at ' + stack.pop());
  return { code, br };
}

class VM {
  constructor(code, br) {
    this.code = code;
    this.br = br;
    this.pc = 0;
    this.stack = [];
    this.out = '';
    this.halted = false;
    this.error = null;
  }
  top() { return this.stack[this.stack.length - 1]; }
  topOrThrow() {
    if (!this.stack.length) throw new Error('Stack underflow');
    return this.top();
  }
  push(v) { this.stack.push(v | 0); }
  pop() {
    if (!this.stack.length) throw new Error('Stack underflow');
    return this.stack.pop();
  }
  step() {
    if (this.halted) return;
    if (this.pc < 0 || this.pc >= this.code.length) { this.halted = true; return; }
    const op = this.code[this.pc++];
    try {
      switch (op) {
        case 'i': this.push(1); break;
        case 'd': { const a = this.pop(); this.push(a); this.push(a); } break;
        case 's': { const a = this.pop(), b = this.pop(); this.push(a); this.push(b); } break;
        case '+': { const a = this.pop(), b = this.pop(); this.push((a + b) | 0); } break;
        case '-': { const a = this.pop(), b = this.pop(); this.push((b - a) | 0); } break;
        case '*': { const a = this.pop(), b = this.pop(); this.push((b * a) | 0); } break;
        case '/': { const a = this.pop(), b = this.pop(); this.push(a === 0 ? 0 : ((b / a) | 0)); } break;
        case '%': { const a = this.pop(), b = this.pop(); this.push(a === 0 ? 0 : (b % a) | 0); } break;
        case 'p': { const a = this.pop(); this.out += String.fromCharCode((a & 0xFF)); } break;
        case 'n': { const a = this.pop(); this.out += String(a); } break;
        case '[': if ((this.topOrThrow() | 0) === 0) { this.pc = this.br.get(this.pc - 1) + 1; } break;
        case ']': if ((this.topOrThrow() | 0) !== 0) { this.pc = this.br.get(this.pc - 1) + 1; } break;
      }
    } catch (e) { this.halted = true; this.error = e.message; }
    if (this.pc >= this.code.length) this.halted = true;
  }
  run() {
    while (!this.halted) {
      this.step();
    }
    if (this.error) throw new Error(this.error);
    return this.out;
  }
}

function runStackShit(source) {
  const { code, br } = preprocess(source);
  const vm = new VM(code, br);
  return vm.run();
}

module.exports = { runStackShit };
