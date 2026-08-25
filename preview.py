#!/usr/bin/env python3
"""Local preview of the Matvero storefront.

Serves SourceCode.html with the Gomag-hosted theme/100.css and theme/100.js
swapped for the local Site.css / Site.js, so an edit shows up on refresh.
Theme CSS/JS, jQuery, fonts and images still come from Gomag's CDN, exactly
as they do on the live site.

    python3 preview.py [port]     # default 8080  ->  http://localhost:8080
"""

import http.server
import os
import re
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(ROOT, 'SourceCode.html')
LOCAL = {'/Site.css': 'Site.css', '/Site.js': 'Site.js'}


def mtime(name):
    """Cache-buster so the browser never serves a stale Site.css/Site.js."""
    try:
        return int(os.path.getmtime(os.path.join(ROOT, name)))
    except OSError:
        return 0


def build_page():
    with open(SOURCE, encoding='utf-8') as fh:
        html = fh.read()
    # The live page loads the customizations from the Gomag domain; point both
    # the preload hint and the real tag at the working copies in this repo.
    html = re.sub(r'https?://matvero\.gomag\.ro/theme/100\.css[^"\']*',
                  '/Site.css?t=%d' % mtime('Site.css'), html)
    html = re.sub(r'https?://matvero\.gomag\.ro/theme/100\.js[^"\']*',
                  '/Site.js?t=%d' % mtime('Site.js'), html)
    return html.encode('utf-8')


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0]
        if path in ('/', '/index.html'):
            return self._send(build_page(), 'text/html; charset=utf-8')
        if path == '/mobile-frame.html':
            try:
                with open(os.path.join(ROOT, 'mobile-frame.html'), 'rb') as fh:
                    return self._send(fh.read(), 'text/html; charset=utf-8')
            except OSError:
                return self.send_error(404, 'missing mobile-frame.html')
        if path in LOCAL:
            ctype = 'text/css' if path.endswith('.css') else 'application/javascript'
            try:
                with open(os.path.join(ROOT, LOCAL[path]), 'rb') as fh:
                    return self._send(fh.read(), ctype + '; charset=utf-8')
            except OSError:
                return self.send_error(404, 'missing %s' % LOCAL[path])
        return self.send_error(404)

    def _send(self, body, ctype):
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', port), Handler) as srv:
        print('Matvero preview  ->  http://localhost:%d   (Ctrl+C to stop)' % port)
        srv.serve_forever()
