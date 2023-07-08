import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import _ from 'lodash';
// import OnlyScroll from 'only-scrollbar';

// const scroll = new OnlyScroll(document.querySelector('body'));
// scroll.scrollContainer();

import { galleryMarkup } from './js/markup';
import { refs } from './js/refs';
import { handleHideAnime } from './js/anime';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38110129-67a9a84d818f0afdbf48a1e7d';

let pageCounter = 1;
let pagesCount = 1;
let inputValue = '';
let perPage = 40;

const options = {
  timeout: 8000,
};

const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 100,
});

refs.formInputRef.addEventListener('keydown', e => {
  if (refs.formBtnRef.hasAttribute('disabled') && e.code === 'Space') {
    e.target.value = '';
    return Notiflix.Notify.failure(
      `Sorry, but don't start with ${e.code}-key and enter valid word! ;)`
    );
  }
});

refs.formInputRef.addEventListener('input', async e => {
  inputEl = e.target.value.trim();
  if (inputEl.length === 0) {
    refs.formBtnRef.setAttribute('disabled', 'disabled');
  } else if (inputEl.length > 0) {
    refs.formBtnRef.removeAttribute('disabled');
    refs.formBtnRef.style.cursor = 'pointer';
  }

  return;
});

const getImages = async value => {
  const imageThumb = await axios.get(`${BASE_URL}`, {
    params: {
      key: API_KEY,
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: pageCounter,
      per_page: perPage,
    },
  });
  console.log(imageThumb);
  return imageThumb;
};

refs.formRef.addEventListener('submit', async e => {
  e.preventDefault();
  handleHideAnime();

  refs.galleryRef.innerHTML = '';
  pageCounter = 1;
  inputValue = refs.formInputRef.value.trim();
  await getImages(inputValue)
    .then(res => {
      const { hits, totalHits } = res.data;
      pagesCount = Math.ceil(totalHits / perPage);
      if (hits.length === 0) {
        refs.galleryRef.innerHTML = '';
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          options
        );
      } else if (pagesCount === pageCounter) {
        refs.galleryRef.innerHTML = '';
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        refs.galleryRef.insertAdjacentHTML('beforeend', galleryMarkup(hits));
        lightBox.refresh();
        return Notiflix.Notify.failure(
          `We're sorry, but you've reached the end of search results.`,
          options
        );
      }
      refs.galleryRef.insertAdjacentHTML('beforeend', galleryMarkup(hits));
      lightBox.refresh();
      return Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    })
    .catch(error => {
      console.log(error.code);
      return Notiflix.Notify.failure(
        'Oops, something went wrong! ' + `Error is ${error.message}`
      );
    });
});

const loadMoreHandler = () => {
  pageCounter++;

  getImages(inputValue).then(res => {
    const { hits } = res.data;

    refs.galleryRef.insertAdjacentHTML('beforeend', galleryMarkup(hits));
    lightBox.refresh();

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
  }, 200)
);
