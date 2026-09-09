import { HTTPDogsClient, Dog, DogApiError } from './client.ts';
import * as State from './state.ts';
import type { AppState } from './state.ts';

const FAVOURITE_ADD_LABEL = '➕';
const FAVOURITE_REMOVE_LABEL = '➖';
const THUMBNAIL_LIMIT = 10;

function createDogImage(dog: Dog): HTMLImageElement {
    const img = document.createElement('img');
    img.src = dog.photo;
    img.alt = dog.breed;
    return img;
}

function replaceDog(dogEl: HTMLDivElement, dog: Dog, isFavourite: boolean): void {
    const img = createDogImage(dog);
    const breed = document.createElement('h3');
    breed.innerText = dog.breed;
    const favourite = document.createElement('button');
    favourite.type = 'button';
    favourite.classList.add('favourite');
    favourite.setAttribute('aria-label', 'Add to favourites');
    favourite.toggleAttribute('disabled', isFavourite);
    favourite.innerText = FAVOURITE_ADD_LABEL;

    dogEl.replaceChildren(img, favourite, breed);
}

function appendFavourite(favouritesEl: HTMLUListElement, dog: Dog): void {
    const li = document.createElement('li');
    const img = createDogImage(dog);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.classList.add('remove');
    remove.setAttribute('aria-label', `Remove ${dog.breed} from favourites`);
    remove.innerText = FAVOURITE_REMOVE_LABEL;

    li.append(img, remove);
    favouritesEl.appendChild(li);
}

function appendThumbnails(list: HTMLUListElement, dogs: Dog[]): void {
    const fragment = document.createDocumentFragment();

    for (const dog of dogs) {
        const li = document.createElement('li');
        li.appendChild(createDogImage(dog));
        fragment.appendChild(li);
    }

    list.appendChild(fragment);
}

function markActiveThumbnail(thumbnailEl: HTMLUListElement, currentPhoto: string | undefined): void {
    for (const img of Array.from(thumbnailEl.querySelectorAll('img'))) {
        img.classList.toggle('active', img.src === currentPhoto);
    }
}

function showError(target: HTMLElement, message: string): void {
    const p = document.createElement('p');
    p.classList.add('error');
    p.innerText = message;
    target.replaceChildren(p);
}

function wireEvents(
    state: AppState,
    dogEl: HTMLDivElement,
    thumbnailEl: HTMLUListElement,
    favouritesEl: HTMLUListElement,
): void {
    thumbnailEl.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLImageElement)) return;
        if (State.isCurrentDog(state, e.target.src)) return;

        const clickedDog = State.findDog(state, e.target.src);
        if (!clickedDog) return;

        State.setCurrentDog(state, clickedDog);
        replaceDog(dogEl, clickedDog, State.isFavourite(state, clickedDog.photo));
        markActiveThumbnail(thumbnailEl, state.currentPhoto);
    });

    dogEl.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLButtonElement)) return;
        const img = e.target.previousElementSibling;
        if (!(img instanceof HTMLImageElement) || State.isFavourite(state, img.src)) return;

        const favDog = State.findDog(state, img.src);
        if (!favDog) return;

        State.addFavourite(state, favDog.photo);
        appendFavourite(favouritesEl, favDog);
        e.target.toggleAttribute('disabled', true);
    });

    favouritesEl.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLButtonElement) || !e.target.parentElement) return;
        const img = e.target.previousElementSibling;
        if (!(img instanceof HTMLImageElement)) return;

        favouritesEl.removeChild(e.target.parentElement);
        State.removeFavourite(state, img.src);

        if (State.isCurrentDog(state, img.src)) {
            dogEl.querySelector('button')?.toggleAttribute('disabled', false);
        }
    });
}

async function main(): Promise<void> {
    const dogEl = document.querySelector<HTMLDivElement>('.dog');
    const thumbnailEl = document.querySelector<HTMLUListElement>('.thumbnail');
    const favouritesEl = document.querySelector<HTMLUListElement>('.favourites');

    if (!dogEl || !thumbnailEl || !favouritesEl) return;

    const client = new HTTPDogsClient();
    const state = State.createState();

    wireEvents(state, dogEl, thumbnailEl, favouritesEl);

    let dog: Dog;
    try {
        dog = await client.getRandomDog();
        State.registerDog(state, dog);
        State.setCurrentDog(state, dog);
        replaceDog(dogEl, dog, State.isFavourite(state, dog.photo));
    } catch (err) {
        const message = err instanceof DogApiError ? err.message : 'Could not load a dog. Try refreshing.';
        showError(dogEl, message);
        return;
    }

    try {
        // NOTE: minus one is because we fetch random dog first and put it into the list
        const randomDogs = await client.getRandomDogs(THUMBNAIL_LIMIT - 1);
        State.registerDogs(state, randomDogs);

        const thumbnails = randomDogs.some(d => d.photo === dog.photo)
            ? randomDogs
            : [dog, ...randomDogs];

        appendThumbnails(thumbnailEl, thumbnails);
        markActiveThumbnail(thumbnailEl, state.currentPhoto);
    } catch (err) {
        const message = err instanceof DogApiError ? err.message : 'Could not load more dogs.';
        showError(thumbnailEl, message);
    }
}

document.addEventListener('DOMContentLoaded', main);