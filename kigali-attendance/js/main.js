// ---------- 7. Start the page ----------
// First time on a new version: load the school list and make sure the admin account exists
function prepareData() {
  if (loadData("dataVersion", 0) !== 3) {
    saveData("students", {});       // the real list is loaded from seed.js
    saveData("attendance", {});
    saveData("dataVersion", 3);
  }

  var users = loadData("users", []);
  var hasAdmin = false;
  users.forEach(function (user) { if (user.role === "admin") { hasAdmin = true; } });
  if (!hasAdmin) {
    users.push({ username: "admin", password: "admin123", role: "admin", fullName: "School Admin" });
    saveData("users", users);
  }
}

function startPage() {
  prepareData();
  // fill the class dropdown
  classNames.forEach(function (name) {
    var option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    classSelect.appendChild(option);
  });

  // set today's date
  var today = new Date();
  var month = String(today.getMonth() + 1).padStart(2, "0");
  var day = String(today.getDate()).padStart(2, "0");
  dateInput.value = today.getFullYear() + "-" + month + "-" + day;

  // connect buttons to functions
  loginBtn.onclick = handleLoginClick;
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("homeBtn").onclick = showHome;
  document.getElementById("saveBtn").onclick = saveAttendance;
  document.getElementById("addBtn").onclick = addStudents;
  document.getElementById("editBtn").onclick = openEdit;
  document.getElementById("deleteBtn").onclick = openDeleteConfirm;
  document.getElementById("deleteYes").onclick = confirmDelete;
  document.getElementById("saveEditBtn").onclick = saveEdit;
  ["optionsCancel", "editCancel", "deleteCancel"].forEach(function (id) {
    document.getElementById(id).onclick = closeOptions;
  });
  document.getElementById("eyeBtn").onclick = togglePassword;
  document.getElementById("menuBtn").onclick = openSidebar;
  sideShade.onclick = closeSidebar;

  // pressing Enter in a login box works like the button
  [usernameInput, passwordInput].forEach(function (box) {
    box.onkeydown = function (event) { if (event.key === "Enter") { handleLoginClick(); } };
  });
  reportBtn.onclick = showReport;
  reportDate.onchange = drawReport;
  document.getElementById("printBtn").onclick = function () { window.print(); };
  classSelect.onchange = function () { openClass(classSelect.value); };
  accountsBtn.onclick = showAccounts;
  accountsView.onclick = accountClick;
  accountsView.onchange = accountChange;
  document.getElementById("createTeacherBtn").onclick = function () { createUser("teacher"); };
  document.getElementById("createAdminBtn").onclick = function () { createUser("admin"); };
  settingsBtn.onclick = showSettings;
  document.getElementById("changePassBtn").onclick = changeOwnPassword;

  // if a teacher was already logged in, go straight to the attendance page
  var savedUser = loadData("currentUser", "");
  if (savedUser !== "") { openApp(savedUser); }
}

startPage();
