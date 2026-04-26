const state = {
  photos: [],
  category: '全部',
  keyword: '',
};

const grid = document.querySelector('#galleryGrid');
const emptyState = document.querySelector('#emptyState');
const filters = document.querySelector('#categoryFilters');
const searchInput = document.querySelector('#searchInput');
const dialog = document.querySelector('#photoDialog');
const closeDialog = document.querySelector('#closeDialog');
const dialogImage = document.querySelector('#dialogImage');
const dialogTitle = document.querySelector('#dialogTitle');
const dialogDesc = document.querySelector('#dialogDesc');
const dialogMeta = document.querySelector('#dialogMeta');

function normalizePath(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  return path;
}

function getCategories(photos) {
  return ['全部', ...new Set(photos.map(photo => photo.category || '未分类'))];
}

function renderFilters() {
  filters.innerHTML = '';
  getCategories(state.photos).forEach(category => {
    const button = document.createElement('button');
    button.className = `filter-btn${state.category === category ? ' active' : ''}`;
    button.type = 'button';
    button.textContent = category;
    button.addEventListener('click', () => {
      state.category = category;
      renderFilters();
      renderGallery();
    });
    filters.appendChild(button);
  });
}

function matchPhoto(photo) {
  const categoryMatched = state.category === '全部' || (photo.category || '未分类') === state.category;
  const keyword = state.keyword.trim().toLowerCase();
  if (!categoryMatched) return false;
  if (!keyword) return true;

  const text = [photo.title, photo.category, photo.desc, photo.date]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return text.includes(keyword);
}

function openPhoto(photo) {
  dialogImage.src = normalizePath(photo.image || photo.thumb);
  dialogImage.alt = photo.title || '照片';
  dialogTitle.textContent = photo.title || '未命名照片';
  dialogDesc.textContent = photo.desc || '';
  dialogMeta.textContent = [photo.category, photo.date].filter(Boolean).join(' · ');
  dialog.showModal();
}

function renderGallery() {
  const visiblePhotos = state.photos.filter(matchPhoto);
  grid.innerHTML = '';
  emptyState.hidden = visiblePhotos.length > 0;

  visiblePhotos.forEach(photo => {
    const article = document.createElement('article');
    article.className = 'card';
    article.tabIndex = 0;

    const img = document.createElement('img');
    img.className = 'card-image';
    img.loading = 'lazy';
    img.src = normalizePath(photo.thumb || photo.image);
    img.alt = photo.title || '照片';

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = photo.title || '未命名照片';

    const meta = document.createElement('p');
    meta.className = 'card-meta';
    meta.textContent = [photo.category || '未分类', photo.date].filter(Boolean).join(' · ');

    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = photo.desc || '';

    body.append(title, meta, desc);
    article.append(img, body);
    article.addEventListener('click', () => openPhoto(photo));
    article.addEventListener('keydown', event => {
      if (event.key === 'Enter') openPhoto(photo);
    });
    grid.appendChild(article);
  });
}

async function loadPhotos() {
  try {
    const response = await fetch('data/photos.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const photos = await response.json();
    state.photos = Array.isArray(photos) ? photos : [];
    renderFilters();
    renderGallery();
  } catch (error) {
    console.error('Failed to load photos:', error);
    grid.innerHTML = '';
    emptyState.hidden = false;
    emptyState.textContent = '相册数据加载失败，请检查 data/photos.json。';
  }
}

searchInput.addEventListener('input', event => {
  state.keyword = event.target.value;
  renderGallery();
});

closeDialog.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});

loadPhotos();
