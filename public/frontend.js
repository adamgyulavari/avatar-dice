import DiceBox from "./dice.js";

const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('login', {
            user: input.value,
            bending: ''
        });
        input.value = '';
    }
});
socket.on('users', (users) => {
    messages.innerHTML = "";
    console.log({users})
    Object.entries(users).forEach(([user, bending])=> {
        const item = document.createElement('li');
        item.textContent = user;
        messages.appendChild(item);
    });
});
socket.on('rolled', ({user, result}) => {
    console.log('rolled', result)
    roll(result);
});

const Box = new DiceBox("#board", {
    theme_customColorset: {
      // background: [
      //   "#00ffcb",
      //   "#ff6600",
      //   "#1d66af",
      //   "#7028ed",
      //   "#c4c427",
      //   "#d81128"
      // ], // randomly assigned colors
      background: "#00ffcb",
      foreground: "#ffffff",
      texture: "marble", // marble | ice
      material: "wood" // metal | glass | plastic | wood
    },
    light_intensity: 1,
    gravity_multiplier: 600,
    baseScale: 100,
    strength: 2,
    onRollComplete: (results) => {
      console.log(`I've got results :>> `, results);
    }
  });

  const roll = (result) => {
    // dynamically update the dice theme on each roll
    const colors = [
        "#00ffcb",
        "#ff6600",
        "#1d66af",
        "#7028ed",
        "#c4c427",
        "#d81128"
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];    
      Box.updateConfig({
        theme_customColorset: {
          background: randomColor,
          foreground: "#ffffff",
          texture: "marble", // marble | ice
          material: "metal" // metal | glass | plastic | wood
        }
      });
      Box.roll(result);
  }
  
  Box.initialize()
    .then()
    .catch((e) => console.error(e));
  
  const rollBtn = document.getElementById("rollBtn");
  rollBtn.addEventListener("click", () => {
    socket.emit("roll")
  });