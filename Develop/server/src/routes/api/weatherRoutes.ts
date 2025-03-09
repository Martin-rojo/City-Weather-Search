import { Router, type Request, type Response } from 'express';
const router = Router();
import WeatherService from '../../service/weatherService.js';
import HistoryService from '../../service/historyService.js';

// Get weather data for a city
router.post('/', async (req: Request, res: Response) => {
  try {
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    await HistoryService.addCity(cityName);
    return res.json(weatherData);  // Added return statement
  } catch (error:any) {
    return res.status(500).json({ error: error.message });  // Added return statement
  }
});

// Get search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    return res.json(history);  // Added return statement
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching history' });  // Added return statement
  }
});

// Delete city from history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await HistoryService.removeCity(id);
    if (success) {
      return res.json({ message: 'City removed from history' });  // Added return statement
    } else {
      return res.status(404).json({ error: 'City not found' });  // Added return statement
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error removing city' });  // Added return statement
  }
});

export default router;