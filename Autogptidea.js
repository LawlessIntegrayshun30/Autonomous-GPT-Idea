const { app, BrowserWindow, ipcMain } = require('electron');
const { dialog } = require('electron');
const dotenv = require('dotenv');
const openai = require('openai'); // Assuming you have installed the OpenAI library

dotenv.config(); // Load environment variables

// Set up OpenAI client
const openaiClient = new openai({
  apiKey: process.env.OPENAI_API_KEY, 
});

// Create the main window
function createMainWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration
      contextIsolation: false, // Disable context isolation (for simplicity)
    },
  });

  // Load the index.html file
  win.loadFile('index.html');

  // Handle messages from the renderer process
  ipcMain.on('chat-message', async (event, message) => {
    try {
      const response = await openaiClient.completions.create({
        model: "text-davinci-003", // Choose a Chat-GPT model
        prompt: message, 
        max_tokens: 1000, // Adjust as needed
        temperature: 0.7, // Adjust as needed
      });

      event.reply('chat-response', response.choices[0].text);
    } catch (error) {
      console.error('Error sending message:', error);
      event.reply('chat-error', error.message);
    }
  });

  // Handle settings updates
  ipcMain.on('update-settings', (event, settings) => {
    // Update the .env file or your settings storage mechanism
    console.log('Settings updated:', settings);
  });
}

app.whenReady().then(() => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
