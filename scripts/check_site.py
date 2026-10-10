"""Check the maintained pages without a build tool or network dependency."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / 'index.html', ROOT / 'notes/index.html']


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = []
        self.references = []
        self.h1_count = 0
        self.errors = []
        self.feed(source)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'h1':
            self.h1_count += 1
        if tag == 'img' and not attrs.get('alt'):
            self.errors.append('Image missing alternative text')
        for key in ('href', 'src'):
            if attrs.get(key):
                self.references.append(attrs[key])


errors = []
for path in PAGES:
    source = path.read_text()
    page = Page(source)
    errors.extend(page.errors)
    if page.h1_count != 1:
        errors.append(f'{path.name}: expected one h1')
    for identifier, count in Counter(page.ids).items():
        if count != 1:
            errors.append(f'Duplicate id: {identifier}')
    for reference in page.references:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            continue
        target = path if not url.path else (ROOT if url.path.startswith('/') else path.parent) / unquote(url.path.lstrip('/'))
        if target.is_dir():
            target /= 'index.html'
        if not target.is_file():
            errors.append(f'Missing local target: {reference}')
        elif url.fragment and target.suffix == '.html':
            if url.fragment not in Page(target.read_text()).ids:
                errors.append(f'Missing anchor: {reference}')
    if '[Research description]' in source or '[Project story' in source:
        errors.append('Draft placeholder found')

for css in (ROOT / 'assets/profile').glob('*.css'):
    for reference in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text()):
        if not (css.parent / reference).is_file():
            errors.append(f'Missing CSS asset: {reference}')

if errors:
    raise SystemExit('\n'.join(errors))
print('PASS: maintained pages, local assets, anchor targets, unique IDs, and image alt text')
