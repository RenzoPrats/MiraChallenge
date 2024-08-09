# WeatherWiseBot
This program is a chatbot that informs users whether the weather is suitable for going outside. It provides weather information based on a user's specified location. 

You can get weather information by making a POST request to the following endpoint:
* POST http://localhost:3000/api/chat

The request should include a JSON object with the location specified in the following format:
{
  location: city, country
}

## Running the Application:
You can run in the frontend and backend project folder using:
```shell
npm install
npm run dev
```

## Notes
Ensure that the .env file in the backend directory contains the necessary environment variables, such as your OpenAI API key and OpenWeather API key.
