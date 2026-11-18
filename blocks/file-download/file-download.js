/**
 * file-download: list of downloadable files with size and type.
 * Each row = one file: cell 1 = link to the file (link text = file name),
 * cell 2 (optional) = file size (e.g. "139 KB"), cell 3 (optional) = file type
 * (e.g. "application/pdf"). A missing type is derived from the file extension.
 * Renders the file properties (name, size, format) and a download button labelled with the
 * link title (fallback: "Download <EXT>").
 * A single cell holding the link plus extra paragraphs is also accepted.
 */

const TYPES = {
  pdf: 'application/pdf',
  zip: 'application/zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv',
  txt: 'text/plain',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

function extensionOf(href) {
  try {
    const { pathname } = new URL(href, window.location.href);
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : '';
  } catch (e) {
    return '';
  }
}

const LABELS = { filename: 'Filename', size: 'Size', format: 'Format' };

/** One property of the file (source .cmp-download__property): hidden label + value. */
function property(name, value) {
  const div = document.createElement('div');
  div.className = `file-download-property file-download-property-${name}`;
  const dt = document.createElement('dt');
  dt.className = 'file-download-label';
  dt.textContent = LABELS[name];
  const dd = document.createElement('dd');
  dd.className = 'file-download-value';
  dd.textContent = value;
  div.append(dt, dd);
  return div;
}

export default function decorate(block) {
  // plain divs, not ul/li: aside sections style lists as "up next" link lists
  const list = document.createElement('div');
  list.className = 'file-download-list';

  [...block.children].forEach((row) => {
    const link = row.querySelector('a[href]');
    if (!link) return;

    // all non-link text in the row, in order: [size, type]
    const extras = [...row.children]
      .flatMap((cell) => (cell.contains(link)
        ? [...cell.children].filter((el) => !el.contains(link))
        : [cell]))
      .map((el) => el.textContent.trim())
      .filter(Boolean);

    let [size, type] = extras;
    // authors may give only a type; detect it by the slash
    if (size && !type && size.includes('/')) {
      type = size;
      size = '';
    }
    const ext = extensionOf(link.href);
    if (!type && TYPES[ext]) type = TYPES[ext];
    const name = link.textContent.trim() || link.href.split('/').pop();

    // file properties (source .cmp-download__properties)
    const props = document.createElement('dl');
    props.className = 'file-download-properties';
    props.append(property('filename', name));
    if (size) props.append(property('size', size));
    if (type) props.append(property('format', type));

    // download action (source .cmp-download__action); label from the link title
    const label = (link.title || '').trim() || `Download ${ext ? ext.toUpperCase() : 'file'}`;
    const a = document.createElement('a');
    a.className = 'file-download-action';
    a.href = link.href;
    a.setAttribute('download', '');
    if (ext) a.dataset.ext = ext;
    const text = document.createElement('span');
    text.className = 'file-download-action-text';
    text.textContent = label;
    a.append(text);
    if (label !== name) a.setAttribute('aria-label', `${label}: ${name}`);

    const item = document.createElement('div');
    item.className = 'file-download-item';
    item.append(props, a);
    list.append(item);
  });

  block.replaceChildren(list);
}
