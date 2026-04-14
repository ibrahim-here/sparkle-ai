const API_KEY = "AIzaSyCesDni8dIbRNEEpnoqb0NeGjQMb8ndj-8";
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listAllModels() {
  try {
    const response = await fetch(URL);
    const data = await response.json();
    console.log("Available Models:");
    if (data.models) {
      data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
      console.log("No models returned. Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

listAllModels();
