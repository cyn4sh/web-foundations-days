const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusEl = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let allUsers = [];

async function loadUsers() {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading users...";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    allUsers = data;
    renderUsers(allUsers);
    statusEl.textContent = `Loaded ${allUsers.length} users.`;
  } catch (error) {
    statusEl.textContent = "Failed to load users. Please try again.";
  } finally {
    loadBtn.disabled = false;
  }
}

function renderUsers(list) {
  usersList.textContent = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    usersList.appendChild(li);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");

    const nameEl = document.createElement("p");
    nameEl.textContent = user.name;

    const emailEl = document.createElement("p");
    emailEl.textContent = user.email;

    const cityEl = document.createElement("p");
    cityEl.textContent = user.address.city;

    const companyEl = document.createElement("p");
    companyEl.textContent = user.company.name;

    li.appendChild(nameEl);
    li.appendChild(emailEl);
    li.appendChild(cityEl);
    li.appendChild(companyEl);
    usersList.appendChild(li);
  });
}

loadBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const term = filterInput.value.trim().toLowerCase();
  const filtered = allUsers.filter((user) =>
    user.name.toLowerCase().includes(term),
  );
  renderUsers(filtered);
});
