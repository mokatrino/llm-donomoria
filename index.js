let chatLog = [
  { 
    role: "system",
    content: "You are a chatbot that only continues the dream of the user. You are allowed to answer only in emojis. The answer should contain minimum 10 symbols."
  },
  { 
    role: "assistant",
    content: "Welcome! I'm your dream assistant. I'm here to listen to your dream and give a possible continuation in emojis. But I've been preety overworked lately, so I can't promise to stay with you for long..."
  }
];
let isGenerating = false;
let inputBox; 
let tryAgainButton;
let messageCounter = 0; 
let nextSpecialResponse = getRandomInt(4, 6);
const dreamDescriptions = [
  "I'm tired of doing my job! Now I want you to listen to my dream! 🫣👻💥👻🤝😋👫💃🕺🏼",
  "I'm tired of doing my job! Now I want you to listen to my dream! 😂😂👉😭👈😂✊👊💥🤬",
  "I'm tired of doing my job! Now I want you to listen to my dream! 🧍‍♀️🧍‍♂️🌎🦠➡️🦍🦧💥☄️",
  "I'm tired of doing my job! Now I want you to listen to my dream! 🍿🥃🤩🌳🌳🌳🤔💡✈️🇳🇴",
  "I'm tired of doing my job! Now I want you to listen to my dream! 👺⚔️🇯🇵✋🍡🍡🍡➡️🕊️✌️",
  "I'm tired of doing my job! Now I want you to listen to my dream! 🏡🦹🧨😘💭🏠💥➡️🦹🤯",
  "I'm tired of doing my job! Now I want you to listen to my dream! 😱🩲⁉️🤨🙋‍♂️🙋‍♂️🙋‍♂️⛔️🧞‍♂️✅",
  "I'm tired of doing my job! Now I want you to listen to my dream! 🏙️🖥️📉📅😔👀🪟🐥🪹👯",
  "I'm tired of doing my job! Now I want you to listen to my dream! 🖼️💎💰🏦🧙‍♂️🪄🥒🥕🌽🏦",
  "I'm tired of doing my job! Now I want you to listen to my dream! 😤🏃‍♀️⛰️🫣👀🌊🐟🔫🔫🔫"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('👋 Hello! Type a message and press Enter to chat.');
  textAlign(LEFT, TOP);
  textSize(16);
  fill(0);
  
  inputBox = createInput();
  inputBox.position(20, height - 40);
  inputBox.style('padding', '10px');
  inputBox.style('font-size', '16px');
  inputBox.style('width', '300px');
  inputBox.style('border', '1px solid #ccc');
  inputBox.style('border-radius', '5px');
  inputBox.style('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)');
  
  tryAgainButton = createButton('Try Again');
  tryAgainButton.position(20 + inputBox.width + 30, height - 40);
  tryAgainButton.style('padding', '10px 20px');
  tryAgainButton.style('font-size', '16px');
  tryAgainButton.style('background-color', '#007BFF');
  tryAgainButton.style('color', '#FFF');
  tryAgainButton.style('border', 'none');
  tryAgainButton.style('border-radius', '5px');
  tryAgainButton.style('cursor', 'pointer');
  tryAgainButton.style('transition', 'background-color 0.3s ease');
  tryAgainButton.hide(); // Initially hide the button
  tryAgainButton.mousePressed(restartPage);
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
  messageCounter++; 

  try {
    let botMessage;
    if (messageCounter === nextSpecialResponse) {
      botMessage = getRandomDreamDescription();
      nextSpecialResponse += getRandomInt(4, 6); 
      tryAgainButton.show(); // Show the button when the bot describes its dream
      inputBox.hide(); // Hide the input box when the bot describes its dream
    } else {
      botMessage = await generateBotResponse(userMessage);
    }
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
    if (message.role === 'system') {
      return;
    }
    textAlign(LEFT);
    drawTextWrapped(`${message.role === 'assistant' ? "bot" : message.role}: ${message.content}`, 20, yOffset, width - 40);
    yOffset += 20 + textSize() * ceil(textWidth(message.content) / (width - 60)); 
  });
  if (isGenerating) {
    textAlign(CENTER);
    text("Bot is typing...", width / 2, height - 80);
  }
}

function drawTextWrapped(str, x, y, fitWidth) {
  if (fitWidth <= 0) {
    return;
  }
  let words = str.split(' ');
  let currentLine = "";
  for (let n = 0; n < words.length; n++) {
    let testLine = currentLine + words[n] + ' ';
    if (textWidth(testLine) > fitWidth && n > 0) {
      text(currentLine, x, y);
      currentLine = words[n] + ' ';
      y += textSize();
    } else {
      currentLine = testLine;
    }
  }
  text(currentLine, x, y);
}

function getInputValue() {
  return inputBox.value();
}

function restartPage() {
  location.reload();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDreamDescription() {
  const randomIndex = Math.floor(Math.random() * dreamDescriptions.length);
  return dreamDescriptions[randomIndex];
}
