function isCSSColor(value) {
  return value && window.CSS && window.CSS.supports('background-color', value);
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const remainingCells = cells.filter((cell) => cell !== imageCell);
  const colorCell = [...remainingCells].reverse().find((cell) => (
    isCSSColor(cell.textContent.trim())
  ));
  const textCell = remainingCells.find((cell) => cell !== colorCell);
  const image = imageCell && imageCell.querySelector('picture, img');
  const content = document.createElement('div');
  content.className = image ? 'banner-content has-image' : 'banner-content';

  if (image) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'banner-image';
    imageWrapper.append(image);
    content.append(imageWrapper);
  }

  if (textCell) {
    const textWrapper = document.createElement('div');
    textWrapper.className = 'banner-text';
    textWrapper.append(...textCell.childNodes);
    content.append(textWrapper);
  }

  if (colorCell) {
    content.style.setProperty('--banner-background-color', colorCell.textContent.trim());
  }

  block.replaceChildren(content);
}
