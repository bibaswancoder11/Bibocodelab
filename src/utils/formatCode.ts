/**
 * Lightweight in-browser code formatter for HTML, CSS, and JavaScript
 */
export function formatCode(code: string, language: string): string {
  if (!code.trim()) return '';

  if (language === 'html') {
    return formatHtml(code);
  } else if (language === 'css') {
    return formatCss(code);
  } else if (language === 'javascript') {
    return formatJs(code);
  } else if (language === 'json') {
    try {
      return JSON.stringify(JSON.parse(code), null, 2);
    } catch {
      return code;
    }
  }
  return code;
}

function formatHtml(html: string): string {
  const tokens = html
    .replace(/>\s*</g, '><')
    .replace(/</g, '\n<')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  let indent = 0;
  const selfClosing = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  const formatted: string[] = [];

  for (let line of tokens) {
    line = line.trim();
    const isClosing = /^<\//.test(line);
    const isSelfClosing = selfClosing.some((tag) => new RegExp(`^<${tag}[\\s>]`, 'i').test(line)) || /\/>$/.test(line);
    const isComment = /^<!--/.test(line);

    if (isClosing) {
      indent = Math.max(0, indent - 1);
    }

    formatted.push('  '.repeat(indent) + line);

    if (!isClosing && !isSelfClosing && !isComment && /^<[a-zA-Z0-9_-]+/.test(line)) {
      indent++;
    }
  }

  return formatted.join('\n');
}

function formatCss(css: string): string {
  let formatted = '';
  let indent = 0;
  const clean = css.replace(/\s+/g, ' ').trim();

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '{') {
      indent++;
      formatted = formatted.trimEnd() + ' {\n' + '  '.repeat(indent);
    } else if (char === '}') {
      indent = Math.max(0, indent - 1);
      formatted = formatted.trimEnd() + '\n' + '  '.repeat(indent) + '}\n\n' + '  '.repeat(indent);
    } else if (char === ';') {
      formatted += ';\n' + '  '.repeat(indent);
    } else if (char === ':') {
      formatted += ': ';
    } else {
      formatted += char;
    }
  }

  return formatted
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatJs(js: string): string {
  const lines = js.split('\n');
  let indent = 0;
  const formatted: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push('');
      continue;
    }

    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }

    formatted.push('  '.repeat(indent) + trimmed);

    // Count open/close braces
    const opens = (trimmed.match(/[{[(]/g) || []).length;
    const closes = (trimmed.match(/[}\])]/g) || []).length;
    indent += opens - closes;
    if (indent < 0) indent = 0;
  }

  return formatted.join('\n');
}
