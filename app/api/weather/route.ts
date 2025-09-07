import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  // For demo purposes, we'll return mock data since we don't have OpenWeatherMap API key
  // In production, you would use: const API_KEY = process.env.OPENWEATHER_API_KEY
  // and make a real API call to: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`

  try {
    // Mock weather data for demonstration
    const mockWeatherData = {
      location: city.charAt(0).toUpperCase() + city.slice(1),
      temperature: Math.floor(Math.random() * 30) + 5, // Random temp between 5-35°C
      description: ["sunny", "cloudy", "rainy", "partly cloudy", "overcast"][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 40) + 40, // Random humidity 40-80%
      windSpeed: Math.floor(Math.random() * 15) + 2, // Random wind 2-17 m/s
      visibility: Math.floor(Math.random() * 8) + 2, // Random visibility 2-10 km
      icon: ["01d", "02d", "03d", "04d", "09d", "10d"][Math.floor(Math.random() * 6)],
    }

    return NextResponse.json(mockWeatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

/* 
To use real weather data, uncomment and modify this code:

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get('city')
  const API_KEY = process.env.OPENWEATHER_API_KEY

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 })
    }

    const data = await response.json()

    const weatherData = {
      location: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      visibility: Math.round(data.visibility / 1000),
      icon: data.weather[0].icon
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
*/
