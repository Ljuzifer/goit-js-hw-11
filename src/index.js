import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import _ from 'lodash';

const getEl = el => document.querySelector(el);

const gallery = getEl('.gallery');
const form = getEl('#search-form');
const formBtn = getEl('#search-form button');
const formInput = getEl('#search-form input');
const loading = getEl('.loading');

let pageCounter = 1;
let pagesCount = 1;
let inputValue = '';
let perPage = 40;

const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

formInput.addEventListener('input', event => {
  inputValue = event.target.value;
  if (inputValue.length > 0) {
    formBtn.removeAttribute('disabled');
    formBtn.style.cursor = 'pointer';
  } else {
    formBtn.setAttribute('disabled');
  }
});

const getImages = value => {
  return axios.get('https://pixabay.com/api/', {
    params: {
      key: '38110129-67a9a84d818f0afdbf48a1e7d',
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: pageCounter,
      per_page: perPage,
    },
  });
};

form.addEventListener('submit', event => {
  event.preventDefault();

  const anime = document.querySelector('canvas');
  anime.style.display = 'none';

  gallery.innerHTML = '';
  pageCounter = 1;
  getImages(inputValue)
    .then(res => {
      const { hits, totalHits } = res.data;
      pagesCount = Math.ceil(totalHits / perPage);
      if (hits.length === 0) {
        gallery.innerHTML = '';
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      gallery.insertAdjacentHTML('beforeend', galleryMarkup(hits));
      lightBox.refresh();
    })
    .catch(error => console.log(error));
});

const galleryMarkup = data => {
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

const loadMoreHandler = () => {
  pageCounter++;

  getImages(inputValue).then(res => {
    const { hits } = res.data;
    loading.classList.add('show');
    gallery.insertAdjacentHTML('beforeend', galleryMarkup(hits));
    lightBox.refresh();
    loading.classList.remove('show');
    if (pagesCount === pageCounter) {
      return Notiflix.Notify.failure(
        `We're sorry, but you've reached the end of search results.`
      );
    }
  });
};

window.addEventListener(
  'scroll',
  _.debounce(() => {
    let clientViewportHeight = document.querySelector('body').clientHeight;
    let position = clientViewportHeight - window.scrollY;
    if (
      position - window.innerHeight <= clientViewportHeight * 0.1 &&
      pageCounter < pagesCount
    ) {
      loadMoreHandler(pageCounter);
    }
  }, 300)
);
