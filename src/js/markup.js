export const galleryMarkup = data => {
  return data
    .map(
      photo => `<a href='${photo.largeImageURL}' class='gallery__link'>
    <img class='gallery__image' src='${photo.webformatURL}' alt='${photo.tags}' loading='lazy' />
    <div class='info'>
      <p class='info-item likes'>${photo.likes}</p>
      <p class='info-item views'>${photo.views}</p>
      <p class='info-item comments'>${photo.comments}</p>
      <p class='info-item downloads'>${photo.downloads}</p>
    </div>
    </a>
  `
    )
    .join('');
};
