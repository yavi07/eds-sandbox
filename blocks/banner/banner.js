function isCSSColor(value) {
  return value && window.CSS && window.CSS.supports('background-color', value);
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  const imageCell = cells[0];
  const textCell = cells[1];
  const colorCell = cells[2];

  const image = imageCell?.querySelector('picture, img');
  const banner = document.createElement('div');
  banner.className = 'banner-content';

  if (image) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'banner-image';
    imageWrapper.append(image);
    banner.append(imageWrapper);
  }

  if (textCell) {
    const textWrapper = document.createElement('div');
    textWrapper.className = 'banner-text';
    textWrapper.append(...textCell.childNodes);
    banner.append(textWrapper);
  }

  if (colorCell && isCSSColor(colorCell.textContent.trim())) {
    banner.style.backgroundColor = colorCell.textContent.trim();
  }

  block.replaceChildren(banner);
}
