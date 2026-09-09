export class Dog {
    public breed: string;
    public photo: string;
    constructor(message: string) {
        const match = message.match(/\/breeds\/(?<breed>[^/]+)\//);

        if (!match?.groups) {
            throw new Error('[Dog]: message is not valid')
        }

        const { breed } = match.groups;
        this.breed = breed;
        this.photo = message;
    }
}

const LIMIT = 10;

function sampleRandom<T>(arr: T[], n: number = LIMIT): T[] {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function sampleOne<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export class HTTPDogsClient {
    private static baseURL = 'https://dog.ceo'

    async getRandomDog() {
        const url = new URL('/api/breeds/image/random', HTTPDogsClient.baseURL);

        const json = await fetch(url).then(res => res.json());
        return new Dog(json.message);
    }

    async getRandomDogs() {
        const url = new URL('/api/breeds/list/all', HTTPDogsClient.baseURL);
        const json = await fetch(url).then(res => res.json());

        const random = sampleRandom(Object.keys(json.message).filter(breed => breed.length));

        const messages = await Promise.all(random.map(async (breed) => {
            const url = new URL(`/api/breed/${breed}/images`, HTTPDogsClient.baseURL);
            const json = await fetch(url).then(res => res.json());
            return sampleOne<string>(json.message);
        }));

        return messages.map((message) => new Dog(message));
    }
}
