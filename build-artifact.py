#!/usr/bin/env python3
"""
Build the single-file Claude Artifact preview of the Tell site.

The Claude Artifact sandbox wraps uploaded HTML in its own <!doctype>/<head>/
<body> skeleton and injects a small reset (including `img{max-width:100%}`),
so we cannot upload public/tell.html verbatim. This script extracts just the
head-tail (preconnect .. </style>) and the <body> innards, and — crucially —
inlines each mascot pose PNG exactly ONCE as a shared data-URI map, so the
page references a pose many times (fixed traveller + any inline uses) without
bloating the artifact. Output: tell-artifact.html (~6 MB), ready to publish.

Run from anywhere: `python3 build-artifact.py` (paths resolve to this repo).
"""
import re, base64, pathlib

HERE = pathlib.Path(__file__).resolve().parent
root = HERE / 'public'
src = (root / 'tell.html').read_text()

# Every mascot <img> carries data-pip="<pose>"; inline each unique pose once.
POSES = ['base', 'hero', 'sprint', 'proud', 'pen', 'relax', 'listen']

def datauri(name):
    b = (root / 'mascot' / f'pip-{name}.png').read_bytes()
    return 'data:image/png;base64,' + base64.b64encode(b).decode()

pip_map = '{' + ','.join(f"{p}:'{datauri(p)}'" for p in POSES) + '}'
src, n = re.subn(r'const PIP = null; /\*__PIP_MAP__\*/',
                 'const PIP = ' + pip_map + ';', src)
assert n == 1, f'PIP map placeholder not found (matched {n})'

head_keep = re.search(r'<link rel="preconnect".*?</style>', src, re.S).group(0)
body = re.search(r'<body>\n(.*)\n</body>', src, re.S).group(1)

out = '<title>Tell</title>\n' + head_keep + '\n' + body + '\n'
(HERE / 'tell-artifact.html').write_text(out)
print('pip poses inlined:', len(POSES))
print('bytes:', len(out), '(', round(len(out) / 1048576, 2), 'MB )')
print('wrote:', HERE / 'tell-artifact.html')
