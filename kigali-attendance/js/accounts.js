// ---------- 9. Accounts (admin only) ----------
// The admin creates the class teachers (and chooses their class) and the other admins.

function showAccounts() {
  homeView.classList.add("hidden");
  attendanceView.classList.add("hidden");
  reportView.classList.add("hidden");
  settingsView.classList.add("hidden");
  accountsView.classList.remove("hidden");
  setPage("accounts", "accountsBtn");
  drawAccounts();
}

// a green message, or a red one when isError is true
function accountMessage(text, isError) {
  accountMsg.textContent = text;
  accountMsg.className = isError ? "error" : "message";
}

// the <option> list of all the classes
function classOptions(selected) {
  var html = (selected === "") ? '<option value="">- choose a class -</option>' : "";
  classNames.forEach(function (name) {
    html += '<option value="' + esc(name) + '"' + (name === selected ? " selected" : "") + ">" + esc(name) + "</option>";
  });
  return html;
}

function drawAccounts() {
  var users = loadData("users", []);
  var teacherRows = "";
  var adminRows = "";

  users.forEach(function (user) {
    var who = esc(user.username);
    var buttons = '<button class="small-btn" data-action="reset" data-user="' + who + '">Reset password</button>';
    if (user.username !== currentUser) {
      buttons += '<button class="small-btn danger" data-action="delete" data-user="' + who + '">Delete</button>';
    }

    if (user.role === "admin") {
      adminRows += "<tr><td>" + esc(user.fullName || "") + "</td><td>" + who + "</td><td>" + buttons + "</td></tr>";
    } else {
      teacherRows += "<tr><td>" + esc(user.fullName || "") + "</td><td>" + who + "</td>";
      teacherRows += '<td><select data-action="class" data-user="' + who + '">' + classOptions(user.className || "") + "</select></td>";
      teacherRows += "<td>" + buttons + "</td></tr>";
    }
  });

  teacherList.innerHTML = (teacherRows === "") ? '<p class="report-note">No class teachers yet.</p>' :
    '<div class="scroll"><table class="acc-table"><tr><th>FULL NAME</th><th>USERNAME</th><th>CLASS</th><th></th></tr>' + teacherRows + "</table></div>";
  adminList.innerHTML = '<div class="scroll"><table class="acc-table"><tr><th>FULL NAME</th><th>USERNAME</th><th></th></tr>' + adminRows + "</table></div>";
  tClass.innerHTML = classOptions("");
}

function createUser(role) {
  var fullNameBox = (role === "admin") ? aFullName : tFullName;
  var usernameBox = (role === "admin") ? aUsername : tUsername;
  var passwordBox = (role === "admin") ? aPassword : tPassword;

  var fullName = fullNameBox.value.replace(/\s+/g, " ").trim();
  var username = usernameBox.value.trim();
  var password = passwordBox.value;
  var className = (role === "teacher") ? tClass.value : "";

  if (fullName === "" || username === "" || password === "") { accountMessage("Please fill in all the boxes.", true); return; }
  if (role === "teacher" && className === "") { accountMessage("Please choose the class of this teacher.", true); return; }
  if (password.length < 4) { accountMessage("The password must have at least 4 characters.", true); return; }
  if (getUser(username) !== null) { accountMessage("This username is already used.", true); return; }

  var users = loadData("users", []);
  var newUser = { username: username, password: password, role: role, fullName: fullName };
  if (role === "teacher") { newUser.className = className; }
  users.push(newUser);
  saveData("users", users);

  fullNameBox.value = "";
  usernameBox.value = "";
  passwordBox.value = "";
  drawAccounts();
  accountMessage("Account created: " + fullName + (role === "teacher" ? " (class " + className + ")" : " (admin)") + ".", false);
}

function deleteUser(username) {
  if (username === currentUser) { return; }          // you cannot delete yourself
  if (!confirm("Delete the account " + username + "?")) { return; }
  var users = loadData("users", []).filter(function (user) { return user.username !== username; });
  saveData("users", users);
  drawAccounts();
  accountMessage("Account deleted: " + username + ".", false);
}

function resetPassword(username) {
  var newPassword = prompt("New password for " + username + " (at least 4 characters):");
  if (newPassword === null) { return; }               // cancelled
  if (newPassword.length < 4) { accountMessage("The password must have at least 4 characters.", true); return; }
  var users = loadData("users", []);
  users.forEach(function (user) { if (user.username === username) { user.password = newPassword; } });
  saveData("users", users);
  accountMessage("Password changed for " + username + ".", false);
}

function changeClass(username, className) {
  var users = loadData("users", []);
  users.forEach(function (user) { if (user.username === username) { user.className = className; } });
  saveData("users", users);
  accountMessage("Class of " + username + " is now " + (className === "" ? "not set" : className) + ".", false);
}

// one click handler for all the buttons of the page
function accountClick(event) {
  var action = event.target.getAttribute("data-action");
  var username = event.target.getAttribute("data-user");
  if (action === "delete") { deleteUser(username); }
  if (action === "reset") { resetPassword(username); }
}

// the class list of a teacher changed
function accountChange(event) {
  if (event.target.getAttribute("data-action") === "class") {
    changeClass(event.target.getAttribute("data-user"), event.target.value);
  }
}
