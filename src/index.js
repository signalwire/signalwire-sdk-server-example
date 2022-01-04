require("dotenv").config();
const process = require('process')

const auth = {
  username: process.env.SIGNALWIRE_PROJECT_ID, // Project-ID
  password: process.env.SIGNALWIRE_API_TOKEN, // API token
};
const apiurl = `https://${process.env.SIGNALWIRE_SPACE_URL}/api/video/`;

const modPassword = process.env.MOD_PASSWORD

const permissions = [
  "room.self.audio_mute",
  "room.self.audio_unmute",
  "room.self.video_mute",
  "room.self.video_unmute",
  "room.self.deaf",
  "room.self.undeaf",
  "room.self.set_input_volume",
  "room.self.set_output_volume",
  "room.self.set_input_sensitivity",
  "room.list_available_layouts",
];

const modPermissions = [
  "room.hide_video_muted",
  "room.show_video_muted",
  "room.recording",
  "room.set_layout",
  "room.member.audio_mute",
  "room.member.audio_unmute",
  "room.member.deaf",
  "room.member.undeaf",
  "room.member.remove",
  "room.member.set_input_sensitivity",
  "room.member.set_input_volume",
  "room.member.set_output_volume",
  "room.member.video_mute",
  "room.member.video_unmute",
];

// Basic express boilerplate
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());
// End basic express boilerplate

app.get('/', async (req, res) => {
  res.send('The server is running. Look at the output in the console for instructions.')
})

// Endpoint to request token for video call
app.post("/get_token", async (req, res) => {
  const { user_name, room_name, mod_password } = req.body;
  console.log("Name: ", user_name);
  console.log("Room: ", room_name);

  const isModerator = modPassword === mod_password
  const tokenPermissions = isModerator ? [...permissions, ...modPermissions] : permissions

  console.log(tokenPermissions)

  try {
    const response = await axios.post(
      apiurl + "/room_tokens",
      {
        user_name,
        room_name: room_name,
        permissions: tokenPermissions,
      },
      { auth }
    );

    const token = response.data?.token;
    console.log(
      "Token:",
      token.length < 7 ? token : token.substring(0, 6) + "..."
    );

    return res.json({
      token: token,
      permissions: tokenPermissions
    });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

async function start(port) {
  app.listen(port, () => {
    console.log("Server listening at port", port);
  });
}

process.on('SIGINT', () => {
  process.exit(0)
})

if (!process.env.SIGNALWIRE_PROJECT_ID || !process.env.SIGNALWIRE_API_TOKEN || !process.env.SIGNALWIRE_SPACE_URL || !process.env.MOD_PASSWORD) {
  console.error("The application is not configured yet. Please set the following environment variables:")
  console.error(" - SIGNALWIRE_PROJECT_ID")
  console.error(" - SIGNALWIRE_API_TOKEN")
  console.error(" - SIGNALWIRE_SPACE_URL")
  console.error(" - MOD_PASSWORD \t (a password to get tokens with mod permissions)")
  process.exit(1)
}

console.log("=== SignalWire SDK Demo Server ===")
console.log("")
console.log("This server allows SignalWire JavaScript SDK clients to obtain Video Room Tokens.")
console.log("It implements very basic (and unsafe) authentication: a secret password is provided as an environment variable, and room tokens specifying that password get assigned moderator permissions.")
console.log("In real settings, you would implement your own server, and emit tokens only after actual user authentication.")
console.log("⚠️ Please don't use this in production!")
console.log("")
console.log("To use this server, install the SignalWire JavaScript SDK and, in the browser, fetch a token as follows:")
console.log(`
----

    const response = await fetch('http://localhost:5000/get_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_name: 'guest',
        room_name: 'office',
        mod_password: undefined  // (or MOD_PASSWORD)
      })
    })

    const token = (await response.json()).token
    console.log(token)

----
`)

// Start the server
start(5000);
