import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ICity {
    id: string;
    name: string;
}

class City implements ICity {
    id: string;
    name: string;

    constructor(name: string) {
        this.id = uuidv4();
        this.name = name;
    }
}

class HistoryService {
    private historyFile: string;

    constructor() {
        this.historyFile = path.join(__dirname, "../../db/db.json");
    }

    private async read(): Promise<ICity[]> {
        try {
            await fs.access(this.historyFile).catch(() => 
                fs.writeFile(this.historyFile, '[]')
            );
            const data = await fs.readFile(this.historyFile, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading search history:", error);
            return [];
        }
    }

    private async write(cities: ICity[]): Promise<void> {
        try {
            await fs.writeFile(
                this.historyFile, 
                JSON.stringify(cities, null, 2)
            );
        } catch (error) {
            console.error("Error writing search history:", error);
            throw error;
        }
    }

    async getCities(): Promise<ICity[]> {
        return await this.read();
    }

    async addCity(cityName: string): Promise<ICity> {
        const cities = await this.read();
        const newCity = new City(cityName);
        cities.push(newCity);
        await this.write(cities);
        return newCity;
    }

    async removeCity(id: string): Promise<boolean> {
        const cities = await this.read();
        const filteredCities = cities.filter(city => city.id !== id);
        if (cities.length === filteredCities.length) return false;
        await this.write(filteredCities);
        return true;
    }
}

export default new HistoryService();