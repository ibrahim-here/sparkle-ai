const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";

async function testModel(modelName) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: modelName,
            max_tokens: 10,
            messages: [{ role: "user", content: "hi" }]
        })
    });
    console.log(modelName + ": " + response.status);
    if(response.status !== 200) {
        console.log("   ", await response.text());
    } else {
        const body = await response.json();
        console.log("   ", body.content[0].text);
    }
}

async function run() {
    await testModel("claude-sonnet-4-6");
}

run();
