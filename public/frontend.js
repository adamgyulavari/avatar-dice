import DiceBox from "./dice.js";

const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("username");
const main = document.getElementById("main");
const mainActions = document.getElementById("main-actions");
const detail = document.getElementById("detail");
const progress = document.getElementById("progress");
const userContainer = document.getElementById("users");
const rollBtn = document.getElementById("rollBtn");

let currentUser = null;
let Box = null;
const currentUserBoxes = {};
const colors = {
  waterPanuq: "#00d9ff",
  air: "#636363",
  water: "#2063e9",
  tech: "#7028ed",
  earth: "#c4c427",
  fire: "#d81128",
};
const GM = 'gm';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
const createCard = (username, bending) => {
  const actions =
    currentUser.toLowerCase() === GM
      ? `<a href="#" class="remove btn btn-danger btn-sm" data-username="${username}">remove</a>`
      : "";
  const item = document.createElement("div");
  item.innerHTML = `<div class="card col position-relative box-container">
    <img src="/images/${capitalizeFirstLetter(
      username
    )}.jpeg" class="card-img-top" alt="${username}">
    <div class="card-body">
      <h5 class="card-title">${username}</h5>
      ${actions}
    </div>
    <div id="image-${username}" class="position-absolute box-container"></div>
  </div>`;
  userContainer.appendChild(item);
  const color = username === "Panuq" ? colors.waterPanuq : colors[bending];
  const Box = new DiceBox(`#image-${username}`, {
    theme_customColorset: {
      background: color,
      foreground: "#ffffff",
      texture: "marble", // marble | ice
      material: "wood", // metal | glass | plastic | wood
    },
    light_intensity: 1,
    gravity_multiplier: 600,
    baseScale: 100,
    strength: 2,
    onRollComplete: (results) => {
      progress.classList.add("d-none");
      detail.classList.remove("d-none");
      rollBtn.removeAttribute("disabled");
    },
  });
  Box.initialize()
    .then()
    .catch((e) => console.error(e));
  currentUserBoxes[username] = Box;
};

const renderUsers = (users) => {
  userContainer.innerHTML = "";
  Object.entries(users)
    .filter(([user, _]) => user.toLowerCase() !== GM)
    .forEach(([user, bending]) => {
      createCard(user, bending);
    });
};

userContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove")) {
    socket.emit("logout", event.target.getAttribute("data-username"));
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const checked = document.querySelector(".btn-check:checked");
  if (input.value && checked && checked.value) {
    currentUser = input.value;
    socket.emit("login", {
      user: currentUser,
      bending: checked.value,
    });
    input.value = "";
    checked.removeAttribute("checked");
  }
});

socket.on("logged in", () => {
  const login = document.getElementById("login");
  login.classList.add("d-none");
  main.classList.remove("d-none");
  if (currentUser.toLowerCase() === GM) {
    mainActions.classList.add("d-none");
  } else {
    mainActions.classList.remove("d-none");
  }
});
socket.on("invalid", () => {
  input.classList.add("is-invalid");
});

socket.on("users", (users) => {
  console.log({ users });
  renderUsers(users);
});
socket.on("rolled", ({ user, sum, result, bending }) => {
  progress.innerHTML = `${user} rolls...`;
  progress.classList.remove("d-none");
  detail.classList.add("d-none");
  detail.innerHTML = `${user} rolled <strong>${sum}</strong>!`;
  roll(user, result);
});
socket.on("logout", (user) => {
  if (user === currentUser) {
    currentUser = null;
    main.classList.add("d-none");
    login.classList.remove("d-none");
    Box = null;
  }
});

const roll = (user, result) => {
  rollBtn.setAttribute("disabled", "disabled");
  currentUserBoxes[user].roll(result);
};

rollBtn.addEventListener("click", () => {
  socket.emit("roll");
});
