require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { AssemblyAI } = require("assemblyai");
const os = require('os');

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
// app.use(cors());
const app = express();
app.use(express.json());

const interfaces = os.networkInterfaces();

let ip;
for (let devName in interfaces) {
  let iface = interfaces[devName];

  for (let i = 0; i < iface.length; i++) {
    let alias = iface[i];
    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
      ip = alias.address;
    }
  }
}
// Set file upload destination for temp storage.
// Must use dest, otherwise files will be stored in memory.
// const upload = multer({ dest: "temp" });

app.post("/transcript", async (req, res) => {
  try {
    const {audioFile} = req.body;
    const transcript = await client.transcripts.create({
      audio_url: audioFile
    });
    if (transcript.status === 'error') {
      return res.status(500).json(transcript);
    }
    
    return res.json(transcript.text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const uploadUrl = await client.files.upload(req.file.path);
//     await fs.rm(req.file.path); // Remove file from temp storage.
//     res.json(uploadUrl);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


const port = 8000;

app.set('port', port);
const server = app.listen(app.get('port'), ip, () => {
  console.log(`Server is running on ${ip}:${server.address().port}`);
});