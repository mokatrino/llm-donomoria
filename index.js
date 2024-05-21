let chatLog = [{ 
  role: "system",
  content: "You are a chatbot that only continues the dream of the user. You are allowed to respond only in emojis. You always say minimum 3 sentences."
}];
let isGenerating = false;
let inputBox; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('👋 Hello! Type a message and press Enter to chat.');
  textAlign(LEFT, TOP);
  textSize(16);
  fill(0);
  
  inputBox = createInput();
  inputBox.position(20, height - 40);
}

function keyPressed() {
  if (keyCode === ENTER) {
    sendMessage();
    console.log(chatLog);
  }
}

async function sendMessage() {
  let userMessage = getInputValue();
  if (userMessage === '') return;

  chatLog.push({ role: 'user', content: userMessage });
  inputBox.value('');
  isGenerating = true;

  try {
    let botMessage = await generateBotResponse(userMessage);
    chatLog.push({ role: 'assistant', content: botMessage });
  } catch (error) {
    console.error("Error generating bot response:", error);
    chatLog.push({ role: 'assistant', content: "Sorry, something went wrong." });
  } finally {
    isGenerating = false;
  }
}

async function generateBotResponse(userMessage) {
  let response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama3",
      stream: false,
      options: {
        temperature: 0.1,
        seed: 23
      },
      messages: [
        ...chatLog,
        { 
          role: "user",
          content: userMessage
        }
      ]
    })
  });
  let data = await response.json();

  return data.message.content;
}

function draw() {
  background(255);
  let yOffset = 10;
  chatLog.forEach((message) => {
    if(message.role === 'system') {
     return;
    }
    textAlign(LEFT);
    text(`${message.role === 'assistant'  ? "bot" : message.role}: ${message.content}`, 20, yOffset);
    yOffset += 20; 
  });
  if (isGenerating) {
    textAlign(CENTER);
    text("Bot is typing...", width / 2, height - 80);
  }
}

function getInputValue() {
  return inputBox.value();
}
