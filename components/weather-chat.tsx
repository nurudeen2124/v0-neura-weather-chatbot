"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, Eye } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  weatherData?: WeatherData
  timestamp: Date
}

interface WeatherData {
  location: string
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  visibility: number
  icon: string
}

export function WeatherChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm Neura Weather 🌦️ Ask me about the weather in any city around the world!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: any } = {
      "01d": Sun,
      "01n": Sun,
      "02d": Cloud,
      "02n": Cloud,
      "03d": Cloud,
      "03n": Cloud,
      "04d": Cloud,
      "04n": Cloud,
      "09d": CloudRain,
      "09n": CloudRain,
      "10d": CloudRain,
      "10n": CloudRain,
      "11d": CloudRain,
      "11n": CloudRain,
      "13d": CloudSnow,
      "13n": CloudSnow,
      "50d": Wind,
      "50n": Wind,
    }
    return iconMap[iconCode] || Cloud
  }

  const extractCityFromMessage = (message: string): string => {
    // Simple regex to extract city names from common patterns
    const patterns = [
      /weather in ([^?]+)/i,
      /weather for ([^?]+)/i,
      /weather at ([^?]+)/i,
      /how.*weather.*in ([^?]+)/i,
      /what.*weather.*in ([^?]+)/i,
      /temperature in ([^?]+)/i,
      /forecast for ([^?]+)/i,
    ]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    // If no pattern matches, assume the last word(s) might be the city
    const words = message.split(" ")
    if (words.length >= 2) {
      return words.slice(-2).join(" ")
    }

    return words[words.length - 1] || ""
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Extract city from user message
      const city = extractCityFromMessage(input)

      if (!city) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content:
            "I couldn't identify a city in your message. Please try asking like 'What's the weather in London?' or 'How's the weather in New York?'",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        setIsLoading(false)
        return
      }

      // Call weather API
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const data = await response.json()

      if (data.error) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: `Sorry, I couldn't find weather data for "${city}". Please check the city name and try again.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: `Here's the current weather for ${data.location}:`,
          weatherData: data,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I'm having trouble getting weather data right now. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Cloud className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Neura Weather</h1>
            <p className="text-sm text-muted-foreground">Your AI weather assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>

              {/* Weather Data Card */}
              {message.weatherData && (
                <Card className="mt-3 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {(() => {
                        const IconComponent = getWeatherIcon(message.weatherData.icon)
                        return <IconComponent className="w-8 h-8 text-accent" />
                      })()}
                      <div>
                        <h3 className="font-semibold text-card-foreground">{message.weatherData.location}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{message.weatherData.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-accent" />
                        <span className="text-sm text-card-foreground">{message.weatherData.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-accent" />
                        <span className="text-sm text-card-foreground">{message.weatherData.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-accent" />
                        <span className="text-sm text-card-foreground">{message.weatherData.windSpeed} m/s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-accent" />
                        <span className="text-sm text-card-foreground">{message.weatherData.visibility} km</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">Getting weather data...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about weather in any city..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Try: "What's the weather in London?" or "How's the weather in Tokyo?"
        </p>
      </div>
    </div>
  )
}
