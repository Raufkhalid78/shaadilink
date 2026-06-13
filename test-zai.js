const ZAI = require('z-ai-web-dev-sdk').default;

async function run() {
  try {
    const zai = await ZAI.create();
    console.log('SDK Initialized.');
    const completion = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [{ role: 'user', content: 'Say hello' }],
      thinking: { type: 'disabled' }
    });
    console.log('Full response:', JSON.stringify(completion, null, 2));
  } catch (error) {
    console.error('ZAI Error:', error.message || error);
  }
}

run();
