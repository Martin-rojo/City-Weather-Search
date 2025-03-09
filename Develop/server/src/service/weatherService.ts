import dotenv from 'dotenv';
dotenv.config();

interface IWeather {
    city: string;
    date: string;
    tempF: number;
    windSpeed: number;
    humidity: number;
    iconDescription: string;
    icon: string;
}

interface ICoordinates {
    lat: number;
    lon: number;
}

interface IWeatherResponse {
    list: Array<{
        dt_txt: string;
        main: {
            temp: number;
            humidity: number;
        };
        wind: {
            speed: number;
        };
        weather: Array<{
            description: string;
            icon: string;
        }>;
    }>;
}

class Weather implements IWeather {
    city: string;
    date: string;
    tempF: number;
    windSpeed: number;
    humidity: number;
    iconDescription: string;
    icon: string;

    constructor(
        city: string,
        date: string,
        tempF: number,
        windSpeed: number,
        humidity: number,
        iconDescription: string,
        icon: string
    ) {
        this.city = city;
        this.date = date;
        this.tempF = tempF;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
        this.iconDescription = iconDescription;
        this.icon = icon;
    }
}

class WeatherService {
    private baseURL: string;
    private apiKey: string;
    private city: string;

    constructor() {
        this.baseURL = process.env.API_BASE_URL || "";
        this.apiKey = process.env.API_KEY || "";
        this.city = "";
    }

    private async fetchLocationData(query: string): Promise<any> {
        const response = await fetch(query);

        if (!response.ok) {
            throw new Error("City not found");
        }
        
        const data = await response.json();
        if (!data.length) {
            throw new Error("City not found");
        }
        
        return data[0];
    }

    private destructureLocationData(locationData: any): ICoordinates {
        if (!locationData.lat || !locationData.lon) {
            throw new Error("Invalid location data");
        }
        return {
            lat: locationData.lat,
            lon: locationData.lon,
        };
    }

    private buildGeocodeQuery(city: string): string {
        return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
    }

    private buildWeatherQuery(coordinates: ICoordinates): string {
        return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
    }

    private async fetchAndDestructureLocationData(city: string): Promise<ICoordinates> {
        const url = this.buildGeocodeQuery(city);
        const locationData = await this.fetchLocationData(url);
        return this.destructureLocationData(locationData);
    }

    private async fetchWeatherData(coordinates: ICoordinates): Promise<IWeatherResponse> {
        const url = this.buildWeatherQuery(coordinates);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        if (!data.list) {
            throw new Error("Invalid weather data received");
        }

        return data as IWeatherResponse;
    }

    private parseCurrentWeather(response: IWeatherResponse, city: string): Weather {
        const current = response.list[0];
        return new Weather(
            city,
            current.dt_txt,
            current.main.temp,
            current.wind.speed,
            current.main.humidity,
            current.weather[0].description,
            current.weather[0].icon
        );
    }

    private buildForecastArray(currentWeather: Weather, weatherData: IWeatherResponse["list"]): Weather[] {
        const forecast = [currentWeather];
        const filteredWeatherData = weatherData.filter(data => 
            data.dt_txt.includes("12:00:00")
        );

        filteredWeatherData.forEach(data => {
            forecast.push(new Weather(
                this.city,
                data.dt_txt,
                data.main.temp,
                data.wind.speed,
                data.main.humidity,
                data.weather[0].description,
                data.weather[0].icon
            ));
        });

        return forecast;
    }

    async getWeatherForCity(city: string): Promise<Weather[]> {
        try {
            if (!this.apiKey) {
                throw new Error("API key not configured");
            }
            
            this.city = city;
            const coordinates = await this.fetchAndDestructureLocationData(city);
            const weatherData = await this.fetchWeatherData(coordinates);
            const currentWeather = this.parseCurrentWeather(weatherData, city);
            return this.buildForecastArray(currentWeather, weatherData.list);
        } catch (error: any) {
            throw new Error(`Failed to get weather for ${city}: ${error.message}`);
        }
    }
}

export default new WeatherService();