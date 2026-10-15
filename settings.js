// ---------- 10. Settings (every user: admin or class teacher) ----------

function showSettings() {
  homeView.classList.add("hidden");
  attendanceView.classList.add("hidden");
  reportView.classList.add("hidden");
  accountsView.classList.add("hidden");
  settingsView.classList.remove("hidden");
  setPage("settings", "settingsBtn");

  var user = getUser(currentUser);
  document.getElementById("setName").textContent = user.fullName || user.username;
  document.getElementById("setUser").textContent = user.username;
  document.getElementById("setRole").textContent = (currentRole === "admin") ? "Admin" : "Class teacher - " + currentClass;
  settingsMsg.textContent = "";
}

// a green message, or a red one when isError is true
function settingsMessage(text, isError) {
  settingsMsg.textContent = text;
  settingsMsg.className = isError ? "error" : "message";
}

function changeOwnPassword() {
  var user = getUser(currentUser);

  if (curPassword.value !== user.password) { settingsMessage("The current password is wrong.", true); return; }
  if (newPassword.value.length < 4) { settingsMessage("The new password must have at least 4 characters.", true); return; }
  if (newPassword.value !== newPassword2.value) { settingsMessage("The two new passwords are not the same.", true); return; }
  if (newPassword.value === curPassword.value) { settingsMessage("The new password must be different from the old one.", true); return; }

  var users = loadData("users", []);
  users.forEach(function (u) {
    if (u.username === user.username) { u.password = newPassword.value; }
  });
  saveData("users", users);

  curPassword.value = "";
  newPassword.value = "";
  newPassword2.value = "";
  settingsMessage("Your password was changed.", false);
}
