// ---------- 4. Login (accounts are created by the admin) ----------
function getUser(username) {
  var users = loadData("users", []);
  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() === String(username).toLowerCase()) { return users[i]; }
  }
  return null;
}

// "Uwase Mireille" becomes "UM"
function initials(fullName) {
  var words = fullName.trim().split(" ");
  if (words.length > 1) { return (words[0][0] + words[1][0]).toUpperCase(); }
  return fullName.substring(0, 2).toUpperCase();
}

function handleLoginClick() {
  var username = usernameInput.value.trim();
  var password = passwordInput.value;
  loginError.textContent = "";

  if (username === "" || password === "") {
    loginError.textContent = "Please fill in all fields.";
    return;
  }

  var user = getUser(username);
  if (user === null || user.password !== password) {
    loginError.textContent = "Wrong username or password.";
    return;
  }
  openApp(user.username);
}

function openApp(username) {
  var user = getUser(username);
  if (user === null) { return; }

  currentUser = user.username;
  currentRole = user.role || "teacher";
  currentClass = user.className || "";

  // a class teacher must have a class
  if (currentRole === "teacher" && currentClass === "") {
    loginError.textContent = "No class is assigned to this account. Please ask the admin.";
    return;
  }

  var shownName = user.fullName || user.username;
  saveData("currentUser", user.username);
  teacherName.textContent = shownName;
  avatar.textContent = initials(shownName);

  if (currentRole === "admin") {
    roleLabel.textContent = "Admin";
    homeLabel.textContent = "Home";
    reportLabel.textContent = "Report";
    accountsBtn.classList.remove("hidden");      // only the admin sees Accounts
  } else {
    roleLabel.textContent = "Class teacher - " + currentClass;
    homeLabel.textContent = "My Class";
    reportLabel.textContent = "Class Report";
    accountsBtn.classList.add("hidden");
  }

  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");
  if (currentRole === "admin") { showReport(); } else { showHome(); }
}

function logout() {
  currentUser = "";
  currentRole = "";
  currentClass = "";
  saveData("currentUser", "");
  usernameInput.value = "";
  passwordInput.value = "";
  passwordInput.type = "password";
  loginError.textContent = "";
  appPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

// show or hide the password (the eye button)
function togglePassword() {
  passwordInput.type = (passwordInput.type === "password") ? "text" : "password";
}
