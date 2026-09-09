import { HTTPDogsClient, Dog } from './client/index.ts'

function appendDog(main: HTMLDivElement, dog: Dog): void {
    const img = document.createElement('img');
    const breed = document.createElement('h3');
    img.src = dog.photo;
    breed.innerText = dog.breed;

    main.replaceChildren(img, breed);
}

function appendItems(list: HTMLUListElement, dogs: Dog[]): void {
    const fragment = document.createDocumentFragment();

    for (const dog of dogs) {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = dog.photo;
        img.alt = dog.breed;
        li.appendChild(img)
        fragment.appendChild(li);
    }

    list.appendChild(fragment); // one DOM write, not one per item
}

async function main() {
    const client = new HTTPDogsClient();
    const dog = await client.getRandomDog();
    const randomDogs = await client.getRandomDogs();
  const dogEl = document.querySelector<HTMLDivElement>('.dog');
  const thumbnailEl = document.querySelector<HTMLUListElement>('.thumbnail');

  if (!dogEl || !thumbnailEl) return;

    appendDog(dogEl, dog);
    appendItems(thumbnailEl, randomDogs);

    thumbnailEl.addEventListener('click', (e) => {
        if (e.target instanceof HTMLImageElement && e.target.tagName === 'IMG') {
            const dog = new Dog(e.target.src);

            appendDog(dogEl, dog);
        }
    })
}

document.addEventListener("DOMContentLoaded", main);
