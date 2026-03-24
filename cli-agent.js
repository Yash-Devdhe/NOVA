/**
 * NOVA CLI Agent - Terminal Chat Interface
 * Paste this code into VSCode and run with: node cli-agent.js
 * Type "weather in mumbai" or "directions from home to office" 
 */

const readline = require('readline');
const { getWeather, getDirections } = require('./api-helpers'); // Copy API helpers below

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

console.log('🚀 NOVA CLI Agent Ready!');
console.log('Examples: "weather in mumbai", "directions from Delhi to Agra"');
console.log('Type "exit" to quit\n');

rl.prompt();

rl.on('line', async (input) => {
  const query = input.trim().toLowerCase();
  
  if (query === 'exit') {
    console.log('👋 Goodbye!');
    rl.close();
    return;
  }

  try {
    let response;
    
    // Natural language parsing
    if (query.includes('weather') || query.includes('temperature')) {
      const cityMatch = query.match(/in\s+([a-zA-Z\\s]+)/i);
      const city = cityMatch ? cityMatch[1].trim() : 'Mumbai';
      console.log(`🌤️ Checking weather in ${city}...\n`);
      response = await getWeather(city);
      console.log(`\n${JSON.stringify(response, null, 2)}\n`);
    } 
    else if (query.includes('direction') || query.includes('route')) {
      const parts = query.split(/from|to/i);
      if (parts.length >= 3) {
        const origin = parts[1].trim();
        const destination = parts[2].trim();
        console.log(`🗺️ Getting directions from "${origin}" to "${destination}"...\n`);
        response = await getDirections(origin, destination);
        console.log(`\n${JSON.stringify(response, null, 2)}\n`);
      } else {
        console.log('Please use: "directions from [origin] to [destination]"\n');
      }
    } 
    else {
      console.log('🤖 Available: weather in [city], directions from [place] to [place]\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
  
  rl.prompt();
}).on('close', () => {
  process.exit(0);
});

// API Helpers - Copy your API keys here
async function getWeather(city, apiKey = process.env.OPENWEATHER_API_KEY || 'demo') {
  // Demo response for testing - replace with real API call
  return {
    city,
    temperature: Math.floor(Math.random() * 20 + 20),
    condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
    humidity: Math.floor(Math.random() * 30 + 40),
    wind: Math.floor(Math.random() * 10 + 5),
    timestamp: new Date().toLocaleString()
  };
}

async function getDirections(origin, destination, apiKey = process.env.GOOGLE_MAPS_API_KEY) {
  // Demo response for testing
  return {
    origin,
    destination,
    distance: `${Math.floor(Math.random() * 50 + 10)} km`,
    duration: `${Math.floor(Math.random() * 60 + 30)} mins`,
    steps: [
      'Head north on Main Street',
      'Turn left onto Highway 101',
      'Take exit 123 toward Destination',
      'Arrive at destination'
    ],
    timestamp: new Date().toLocaleString()
  };
}

console.log('✅ CLI Agent loaded! Paste into VSCode terminal and run: node cli-agent.js\n');
