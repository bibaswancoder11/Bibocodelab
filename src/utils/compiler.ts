export interface ExtraProjectFile {
  name: string;
  content: string;
  language: 'html' | 'css' | 'javascript' | 'json';
}

/**
 * Bundles HTML, CSS, and JavaScript into a complete executable document
 * with an advanced console & error interception harness.
 */
export function buildExecutableDocument(
  html: string,
  css: string,
  js: string,
  runId: number,
  extraFiles: ExtraProjectFile[] = []
): string {
  // Combine all CSS (primary + extra CSS files)
  const extraCss = extraFiles
    .filter((f) => f.language === 'css' || f.name.endsWith('.css'))
    .map((f) => `/* ${f.name} */\n${f.content}`)
    .join('\n\n');
  const fullCss = [css, extraCss].filter(Boolean).join('\n\n');

  // Combine all JS (primary + extra JS files)
  const extraJs = extraFiles
    .filter((f) => f.language === 'javascript' || f.name.endsWith('.js'))
    .map((f) => `// ${f.name}\n${f.content}`)
    .join('\n\n');
  const fullJs = [js, extraJs].filter(Boolean).join('\n\n');

  // Safe script tag escaping to prevent premature script tag closures
  const sanitizedJs = fullJs.replace(/<\/script/gi, '<\\/script');

  // Embed any custom JSON files into window.__DATA__
  const jsonFiles = extraFiles.filter((f) => f.language === 'json' || f.name.endsWith('.json'));
  const jsonEmbedding =
    jsonFiles.length > 0
      ? `<script>
    window.__DATA__ = window.__DATA__ || {};
    ${jsonFiles
      .map(
        (f) => `try { window.__DATA__[${JSON.stringify(f.name)}] = ${f.content.trim() || 'null'}; } catch(e){}`
      )
      .join('\n    ')}
  </script>`
      : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* User Custom CSS */
    ${fullCss}
  </style>
</head>
<body>
  <script>
    (function() {
      const RUN_ID = ${runId};

      function serialize(val) {
        if (val === undefined) return 'undefined';
        if (val === null) return 'null';
        if (typeof val === 'function') return '[Function: ' + (val.name || 'anonymous') + ']';
        if (val instanceof Error) return val.name + ': ' + val.message + (val.stack ? '\\n' + val.stack : '');
        if (val instanceof Element) return '<' + val.tagName.toLowerCase() + (val.id ? '#' + val.id : '') + (val.className ? '.' + val.className.split(' ').join('.') : '') + '>';
        if (typeof val === 'object') {
          try {
            return JSON.stringify(val, null, 2);
          } catch (e) {
            return Object.prototype.toString.call(val);
          }
        }
        return String(val);
      }

      function sendToParent(type, args) {
        try {
          const serialized = args.map(serialize);
          window.parent.postMessage({
            source: 'bibocodelab-runner',
            runId: RUN_ID,
            type: type,
            messages: serialized,
            time: new Date().toLocaleTimeString()
          }, '*');
        } catch (err) {
          // Fallback
        }
      }

      // Preserve native console
      const origLog = console.log.bind(console);
      const origInfo = console.info.bind(console);
      const origWarn = console.warn.bind(console);
      const origError = console.error.bind(console);

      console.log = function(...args) {
        origLog(...args);
        sendToParent('log', args);
      };

      console.info = function(...args) {
        origInfo(...args);
        sendToParent('info', args);
      };

      console.warn = function(...args) {
        origWarn(...args);
        sendToParent('warn', args);
      };

      console.error = function(...args) {
        origError(...args);
        sendToParent('error', args);
      };

      // Uncaught global errors
      window.addEventListener('error', function(event) {
        sendToParent('error', [event.message + (event.filename ? ' (' + event.filename + ':' + event.lineno + ')' : '')]);
      });

      // Unhandled Promise Rejections
      window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason;
        sendToParent('error', ['Unhandled Promise Rejection: ' + (reason instanceof Error ? reason.message : String(reason))]);
      });

      // Interactive REPL from parent console
      window.addEventListener('message', function(event) {
        if (!event.data || event.data.target !== 'bibocodelab-eval') return;
        const code = event.data.code;
        try {
          const result = window.eval(code);
          sendToParent('log', ['=> ' + serialize(result)]);
        } catch (err) {
          sendToParent('error', ['Evaluation Error: ' + err.message]);
        }
      });
    })();
  </script>

  ${jsonEmbedding}

  ${html}

  <script>
    try {
      ${sanitizedJs}
    } catch (runtimeError) {
      console.error(runtimeError.name + ': ' + runtimeError.message);
    }
  </script>
</body>
</html>`;
}
