import { Dog } from './client.ts';

export type AppState = {
    dogsByPhoto: Map<string, Dog>;
    favourites: Set<string>;
    currentPhoto: string | undefined;
};

export function createState(): AppState {
    return {
        dogsByPhoto: new Map(),
        favourites: new Set(),
        currentPhoto: undefined,
    };
}

export function registerDog(state: AppState, dog: Dog): void {
    state.dogsByPhoto.set(dog.photo, dog);
}

export function registerDogs(state: AppState, dogs: Dog[]): void {
    for (const dog of dogs) registerDog(state, dog);
}

export function setCurrentDog(state: AppState, dog: Dog): void {
    state.currentPhoto = dog.photo;
}

export function isCurrentDog(state: AppState, photo: string): boolean {
    return state.currentPhoto === photo;
}

export function isFavourite(state: AppState, photo: string): boolean {
    return state.favourites.has(photo);
}

export function addFavourite(state: AppState, photo: string): void {
    state.favourites.add(photo);
}

export function removeFavourite(state: AppState, photo: string): void {
    state.favourites.delete(photo);
}

export function findDog(state: AppState, photo: string): Dog | undefined {
    return state.dogsByPhoto.get(photo);
}