/**
 * Grist Media Viewer Widget
 * Copyright 2026 Said Hamadou (isaytoo)
 * Licensed under the Apache License, Version 2.0
 * https://github.com/isaytoo/grist-media-viewer-widget
 */

// =============================================================================
// STATE
// =============================================================================
var mediaItems = [];
var currentIndex = 0;
var zoomLevel = 1;
var rotation = 0;
var imgOffsetX = 0;
var imgOffsetY = 0;
var isDragging = false;
var dragStartX = 0;
var dragStartY = 0;
var galleryVisible = false;

// =============================================================================
// TYPE DETECTION
// =============================================================================
function detectType(url) {
  if (!url) return 'unknown';
  var u = url.toLowerCase().split('?')[0];
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tiff|avif)$/.test(u)) return 'image';
  if (/\.pdf$/.test(u)) return 'pdf';
  if (/\.(mp4|webm|ogg|ogv|mov|avi|mkv)$/.test(u)) return 'video';
  if (/\.(mp3|wav|flac|aac|m4a|opus)$/.test(u)) return 'audio';
  if (/\.(txt|md|csv|json|xml|yaml|yml|log|js|ts|py|html|css)$/.test(u)) return 'text';
  if (url.includes('image') || url.includes('photo') || url.includes('img')) return 'image';
  if (url.includes('pdf')) return 'pdf';
  return 'image';
}

function getFileName(url) {
  try {
    var parts = url.split('/');
    var name = parts[parts.length - 1].split('?')[0];
    return decodeURIComponent(name) || url;
  } catch (e) { return url; }
}

function typeIcon(type) {
  var icons = { image: '🖼️', pdf: '📄', video: '🎬', audio: '🎵', text: '📝', unknown: '📎' };
  return icons[type] || '📎';
}

// =============================================================================
// PARSE URLS FROM A VALUE
// =============================================================================
function parseUrls(value) {
  if (!value) return [];
  var str = String(value);
  // Match http(s) URLs
  var regex = /https?:\/\/[^\s"',\]]+/g;
  var matches = str.match(regex);
  if (matches && matches.length > 0) return matches;
  // Try as plain URL without protocol
  str = str.trim();
  if (str.length > 0) return [str];
  return [];
}

// =============================================================================
// SHOW / HIDE ELEMENTS
// =============================================================================
function hideAll() {
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('img-container').style.display = 'none';
  document.getElementById('pdf-viewer').style.display = 'none';
  document.getElementById('video-viewer').style.display = 'none';
  document.getElementById('audio-container').style.display = 'none';
  document.getElementById('text-viewer').style.display = 'none';
  // Stop video/audio
  var v = document.getElementById('video-viewer');
  v.pause(); v.src = '';
  var a = document.getElementById('audio-viewer');
  a.pause(); a.src = '';
}

function showEmpty(msg) {
  hideAll();
  var el = document.getElementById('empty-state');
  el.style.display = 'flex';
  el.querySelector('p').textContent = msg || 'Sélectionnez une ligne dans Grist';
  setImageControls(false);
  document.getElementById('btn-download').disabled = true;
  document.getElementById('file-type-badge').style.display = 'none';
  document.getElementById('file-info').textContent = 'Aucun fichier';
  document.getElementById('nav-info').style.display = 'none';
  document.getElementById('btn-prev').disabled = true;
  document.getElementById('btn-next').disabled = true;
  document.getElementById('btn-gallery').style.display = 'none';
}

function setImageControls(enabled) {
  var btns = document.querySelectorAll('.img-ctrl');
  btns.forEach(function(b) {
    b.disabled = !enabled;
    b.style.display = enabled ? '' : 'none';
  });
}

// =============================================================================
// RENDER ITEM
// =============================================================================
function renderItem(index) {
  if (!mediaItems.length) { showEmpty(); return; }
  if (index < 0) index = 0;
  if (index >= mediaItems.length) index = mediaItems.length - 1;
  currentIndex = index;

  var item = mediaItems[currentIndex];
  hideAll();

  // Toolbar info
  document.getElementById('file-info').textContent = item.name;
  var badge = document.getElementById('file-type-badge');
  badge.textContent = item.type.toUpperCase();
  badge.style.display = 'inline-block';
  document.getElementById('btn-download').disabled = false;

  // Nav buttons
  var navInfo = document.getElementById('nav-info');
  if (mediaItems.length > 1) {
    navInfo.textContent = (currentIndex + 1) + ' / ' + mediaItems.length;
    navInfo.style.display = 'inline';
    document.getElementById('btn-prev').disabled = false;
    document.getElementById('btn-next').disabled = false;
    document.getElementById('btn-gallery').style.display = '';
  } else {
    navInfo.style.display = 'none';
    document.getElementById('btn-prev').disabled = true;
    document.getElementById('btn-next').disabled = true;
    document.getElementById('btn-gallery').style.display = 'none';
  }

  updateGalleryActive();

  switch (item.type) {
    case 'image':  renderImage(item.url); break;
    case 'pdf':    renderPDF(item.url); break;
    case 'video':  renderVideo(item.url); break;
    case 'audio':  renderAudio(item.url); break;
    case 'text':   renderText(item.url); break;
    default:       renderImage(item.url); break;
  }
}

// --- IMAGE ---
function renderImage(url) {
  setImageControls(true);
  document.getElementById('img-container').style.display = 'flex';
  zoomLevel = 1; rotation = 0; imgOffsetX = 0; imgOffsetY = 0;
  var img = document.getElementById('img-viewer');
  img.src = url;
  img.style.transform = '';
  img.onload = function() { fitImage(); };
  img.onerror = function() {
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('empty-state').querySelector('p').textContent = 'Impossible de charger : ' + url;
    document.getElementById('img-container').style.display = 'none';
  };
  updateZoomLabel();
}

function fitImage() {
  var container = document.getElementById('img-container');
  var img = document.getElementById('img-viewer');
  if (!img.naturalWidth) return;
  var cw = container.clientWidth - 20;
  var ch = container.clientHeight - 20;
  var scaleX = cw / img.naturalWidth;
  var scaleY = ch / img.naturalHeight;
  zoomLevel = Math.min(scaleX, scaleY, 1);
  imgOffsetX = 0; imgOffsetY = 0;
  applyImageTransform();
}

function applyImageTransform() {
  var img = document.getElementById('img-viewer');
  img.style.transform = 'translate(' + imgOffsetX + 'px, ' + imgOffsetY + 'px) scale(' + zoomLevel + ') rotate(' + rotation + 'deg)';
  updateZoomLabel();
}

function updateZoomLabel() {
  document.getElementById('zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
}

// --- PDF ---
function renderPDF(url) {
  setImageControls(false);
  var iframe = document.getElementById('pdf-viewer');
  iframe.style.display = 'block';
  iframe.src = url;
}

// --- VIDEO ---
function renderVideo(url) {
  setImageControls(false);
  var v = document.getElementById('video-viewer');
  v.style.display = 'block';
  v.src = url;
}

// --- AUDIO ---
function renderAudio(url) {
  setImageControls(false);
  var c = document.getElementById('audio-container');
  c.style.display = 'flex';
  var a = document.getElementById('audio-viewer');
  a.src = url;
  // Show filename as title
  document.getElementById('audio-icon').textContent = '🎵';
}

// --- TEXT ---
function renderText(url) {
  setImageControls(false);
  var el = document.getElementById('text-viewer');
  el.style.display = 'block';
  el.textContent = 'Chargement...';
  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(t) { el.textContent = t; })
    .catch(function() { el.textContent = 'Impossible de charger le fichier texte.'; });
}

// =============================================================================
// GALLERY
// =============================================================================
function buildGallery() {
  var gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  if (mediaItems.length <= 1) {
    gallery.classList.add('hidden');
    galleryVisible = false;
    document.getElementById('btn-gallery').classList.remove('active');
    return;
  }
  mediaItems.forEach(function(item, i) {
    var thumb = document.createElement('div');
    thumb.className = 'thumb' + (i === currentIndex ? ' active' : '');
    thumb.title = item.name;
    if (item.type === 'image') {
      var img = document.createElement('img');
      img.src = item.url;
      img.alt = item.name;
      thumb.appendChild(img);
    } else {
      thumb.textContent = typeIcon(item.type);
    }
    var num = document.createElement('span');
    num.className = 'thumb-num';
    num.textContent = i + 1;
    thumb.appendChild(num);
    thumb.addEventListener('click', function() { renderItem(i); });
    gallery.appendChild(thumb);
  });
}

function updateGalleryActive() {
  var thumbs = document.querySelectorAll('#gallery .thumb');
  thumbs.forEach(function(t, i) {
    t.classList.toggle('active', i === currentIndex);
  });
  // Scroll active thumb into view
  if (thumbs[currentIndex]) {
    thumbs[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function toggleGallery() {
  galleryVisible = !galleryVisible;
  var gallery = document.getElementById('gallery');
  gallery.classList.toggle('hidden', !galleryVisible);
  document.getElementById('btn-gallery').classList.toggle('active', galleryVisible);
}

// =============================================================================
// NAVIGATION
// =============================================================================
function navigate(dir) {
  var next = currentIndex + dir;
  if (next < 0) next = mediaItems.length - 1;
  if (next >= mediaItems.length) next = 0;
  renderItem(next);
  // Sync fullscreen if open
  var fsOverlay = document.getElementById('fullscreen-overlay');
  if (fsOverlay.classList.contains('active')) {
    var item = mediaItems[currentIndex];
    if (item && item.type === 'image') {
      document.getElementById('fs-img').src = item.url;
      document.getElementById('fs-counter').textContent = (currentIndex + 1) + ' / ' + mediaItems.length;
    }
  }
}

// =============================================================================
// ZOOM / ROTATION
// =============================================================================
function zoomIn() { zoomLevel = Math.min(zoomLevel * 1.25, 10); applyImageTransform(); }
function zoomOut() { zoomLevel = Math.max(zoomLevel / 1.25, 0.05); applyImageTransform(); }
function zoomFit() { fitImage(); }
function rotateLeft() { rotation = (rotation - 90 + 360) % 360; applyImageTransform(); }
function rotateRight() { rotation = (rotation + 90) % 360; applyImageTransform(); }

// Mouse wheel zoom
document.getElementById('img-container').addEventListener('wheel', function(e) {
  e.preventDefault();
  if (e.deltaY < 0) zoomIn(); else zoomOut();
}, { passive: false });

// Drag to pan image
document.getElementById('img-container').addEventListener('mousedown', function(e) {
  isDragging = true;
  dragStartX = e.clientX - imgOffsetX;
  dragStartY = e.clientY - imgOffsetY;
  document.getElementById('img-container').classList.add('dragging');
});
document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  imgOffsetX = e.clientX - dragStartX;
  imgOffsetY = e.clientY - dragStartY;
  applyImageTransform();
});
document.addEventListener('mouseup', function() {
  isDragging = false;
  document.getElementById('img-container').classList.remove('dragging');
});

// =============================================================================
// FULLSCREEN
// =============================================================================
function openFullscreen() {
  var item = mediaItems[currentIndex];
  if (!item || item.type !== 'image') return;
  var overlay = document.getElementById('fullscreen-overlay');
  overlay.classList.add('active');
  document.getElementById('fs-img').src = item.url;
  document.getElementById('fs-counter').textContent =
    mediaItems.length > 1 ? (currentIndex + 1) + ' / ' + mediaItems.length : '';
  document.getElementById('fs-nav').style.display = mediaItems.length > 1 ? 'flex' : 'none';
}
function closeFullscreen() {
  document.getElementById('fullscreen-overlay').classList.remove('active');
}
document.getElementById('fullscreen-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeFullscreen();
});
document.addEventListener('keydown', function(e) {
  var fsActive = document.getElementById('fullscreen-overlay').classList.contains('active');
  if (e.key === 'Escape') closeFullscreen();
  if (e.key === 'ArrowRight') navigate(1);
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === '+' || e.key === '=') zoomIn();
  if (e.key === '-') zoomOut();
  if (e.key === 'f' || e.key === 'F') { if (!fsActive) openFullscreen(); }
});

// =============================================================================
// DOWNLOAD
// =============================================================================
function downloadCurrent() {
  var item = mediaItems[currentIndex];
  if (!item) return;
  var a = document.createElement('a');
  a.href = item.url;
  a.download = item.name;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// =============================================================================
// TOUCH / SWIPE
// =============================================================================
var touchStartX = 0;
document.getElementById('viewer-area').addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('viewer-area').addEventListener('touchend', function(e) {
  var dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 80) {
    navigate(dx < 0 ? 1 : -1);
  }
}, { passive: true });
// Show swipe hint on mobile
if ('ontouchstart' in window) {
  var hint = document.getElementById('swipe-hint');
  if (hint) hint.style.display = 'block';
}

// =============================================================================
// TOOLBAR BINDINGS
// =============================================================================
document.getElementById('btn-prev').addEventListener('click', function() { navigate(-1); });
document.getElementById('btn-next').addEventListener('click', function() { navigate(1); });
document.getElementById('btn-zoom-in').addEventListener('click', zoomIn);
document.getElementById('btn-zoom-out').addEventListener('click', zoomOut);
document.getElementById('btn-zoom-fit').addEventListener('click', zoomFit);
document.getElementById('btn-rotate-l').addEventListener('click', rotateLeft);
document.getElementById('btn-rotate-r').addEventListener('click', rotateRight);
document.getElementById('btn-fullscreen').addEventListener('click', openFullscreen);
document.getElementById('btn-download').addEventListener('click', downloadCurrent);
document.getElementById('btn-gallery').addEventListener('click', toggleGallery);

// =============================================================================
// GRIST INTEGRATION
// =============================================================================
grist.ready({
  columns: [
    { name: 'FileUrl', title: 'URL du fichier', type: 'Text', optional: false },
    { name: 'FileName', title: 'Nom du fichier', type: 'Text', optional: true },
  ],
  requiredAccess: 'read table',
});

grist.onNewRecord(function() {
  mediaItems = [];
  showEmpty('Aucun enregistrement sélectionné');
  buildGallery();
});

grist.onRecord(function(record) {
  var mapped = grist.mapColumnNames(record);

  // Get URL value — try mapped first, fallback to any column with URL-like content
  var urlValue = null;
  if (mapped && mapped.FileUrl) {
    urlValue = mapped.FileUrl;
  } else {
    // Fallback: scan all columns for URL content
    var keys = Object.keys(record).filter(function(k) { return k !== 'id'; });
    for (var i = 0; i < keys.length; i++) {
      var v = String(record[keys[i]] || '');
      if (v.match(/https?:\/\//)) { urlValue = v; break; }
    }
  }

  if (!urlValue) {
    document.getElementById('setup-screen').classList.add('active');
    return;
  }
  document.getElementById('setup-screen').classList.remove('active');

  var urls = parseUrls(urlValue);
  if (urls.length === 0) {
    showEmpty('Aucune URL valide trouvée dans ce champ');
    buildGallery();
    return;
  }

  // Build media items
  mediaItems = urls.map(function(url, idx) {
    var nameFromRecord = (mapped && mapped.FileName) ? String(mapped.FileName) : null;
    return {
      url: url,
      name: (urls.length === 1 && nameFromRecord) ? nameFromRecord : getFileName(url),
      type: detectType(url)
    };
  });

  buildGallery();
  renderItem(0);
});
