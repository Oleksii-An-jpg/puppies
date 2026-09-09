export class DogApiError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'DogApiError';
    }
}

export class Dog {
    readonly breed: string;

    constructor(private url: string) {
        const match = url.match(/\/breeds\/(?<breed>[^/]+)\//);
        if (!match?.groups) {
            throw new DogApiError(`Unrecognized dog photo URL format: ${url}`);
        }
        this.breed = match.groups.breed;
    }

    get photo(): string {
        return this.url;
    }
}

type DogCeoResponse = { status: string; message: string };
type DogCeoListResponse = { status: string; message: string[] };

export class HTTPDogsClient {
    private static baseURL = 'https://dog.ceo';

    private async fetchJson<T>(path: string): Promise<T> {
        let response: Response;
        try {
            response = await fetch(new URL(path, HTTPDogsClient.baseURL));
        } catch (cause) {
            throw new DogApiError('Could not reach the dog API — check your connection.', cause);
        }

        if (!response.ok) {
            throw new DogApiError(`Dog API responded with ${response.status}`);
        }

        return response.json();
    }

    public async getRandomDog(): Promise<Dog> {
        const data = await this.fetchJson<DogCeoResponse>('/api/breeds/image/random');
        return new Dog(data.message);
    }

    public async getRandomDogs(count: number = 10): Promise<Dog[]> {
        const data = await this.fetchJson<DogCeoListResponse>(`/api/breeds/image/random/${count}`);
        return data.message.map(url => new Dog(url));
    }
}