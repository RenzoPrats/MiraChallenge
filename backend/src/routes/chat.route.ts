import express from "express";
import OpenAI from "openai";
import axios from "axios";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";

const router = express.Router();
let client: OpenAI;
let thread: Thread;

/** Handle require action */
async function handleRequiresAction(run: Run): Promise<any> {
  try {
    // Check if there are tools that require outputs
    if (
      run.required_action &&
      run.required_action.submit_tool_outputs &&
      run.required_action.submit_tool_outputs.tool_calls
    ) {
      // Loop through each tool in the required action section
      const toolOutputs: any =
        run.required_action.submit_tool_outputs.tool_calls
          .map((tool) => {
            if (tool.function.name === "get_weather") {
              return {
                tool_call_id: tool.id,
                output: getWeather(tool.function.arguments),
              };
            }
          })
          .filter((output) => output !== undefined); // Filter out undefined outputs

      // Submit all tool outputs at once after collecting them in a list
      if (toolOutputs.length > 0) {
        run = await client.beta.threads.runs.submitToolOutputsAndPoll(
          thread.id,
          run.id,
          { tool_outputs: toolOutputs }
        );
      }

      // Check status after submitting tool outputs
      return handleRunStatus(run);
    }
  } catch (error: any) {
    throw new Error("Could not handle required action: " + error.message);
  }
}

/** Handle run status */
async function handleRunStatus(run: Run) {
  try {
    // Check if run status
    if (run.status === "completed") {
      let messages = await client.beta.threads.messages.list(thread.id);
      return messages.data;
    } else if (run.status === "requires_action") {
      return await handleRequiresAction(run);
    } else {
      throw new Error("Run did not complete");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

/** Decide if should go outside */
async function shouldGoOutside(message: string) {
  try {
    // setup openAI api
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // retrieve assistant
    const assistantId = process.env.ASSISTANT_ID ?? "";
    const assistant = await client.beta.assistants.retrieve(assistantId);

    if (!assistant) {
      throw new Error("Assistant not found");
    }

    // create thread
    thread = await client.beta.threads.create();

    // send a message to the thread
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // run thread
    let run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    return await handleRunStatus(run);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Function to fetch weather data from OpenWeatherAPI
async function getWeather(location: string) {
  try {
    const city = location.split(",")[0];
    const country = location.split(",")[1];
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;
    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    // checking conditions to go out
    // Temperature feels like <25 Celcius
    // Humidity <80%
    // Rain 0
    // Wind <5
    let message = "";
    if (
      weatherData.main.feels_like < 25 &&
      weatherData.main.humidity < 80 &&
      weatherData.weather.main !== "Rain" &&
      weatherData.wind.speed < 5
    ) {
      message = "good_weather";
    } else {
      message = "bad_weather";
    }
    return { success: true, message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/** Route to check if the weather is good */
router.post("/", async (req, res) => {
  const { location } = req.body;
  try {
    if (!location) {
      throw new Error("No location provided");
    }
    const message = `Get the weather in ${location}`;
    const answer = await shouldGoOutside(message);
    return res.status(200).send({ message: answer });
  } catch (error: any) {
    if (error.message === "No location provided") {
      return res.status(500).send({ message: error.message });
    }
    const data = await getWeather(location);
    if (data.success) {
      return res.status(200).send({ message: data.message });
    } else {
      return res
        .status(500)
        .send({ message: "Internal server error: " + data.message });
    }
  }
});

export default router;
