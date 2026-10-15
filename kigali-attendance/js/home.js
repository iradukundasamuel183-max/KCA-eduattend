// ---------- 4b. Home page (all classes) ----------
function getTodayString() {
  var today = new Date();
  var month = String(today.getMonth() + 1).padStart(2, "0");
  var day = String(today.getDate()).padStart(2, "0");
  return today.getFullYear() + "-" + month + "-" + day;
}

function showHome() {
  if (currentRole === "teacher") { openClass(currentClass); return; }   // a teacher goes straight to his or her class
  attendanceView.classList.add("hidden");
  reportView.classList.add("hidden");
  accountsView.classList.add("hidden");
  settingsView.classList.add("hidden");
  setPage("classes", "homeBtn");
  homeView.classList.remove("hidden");
  dateInput.value = getTodayString();
  document.getElementById("welcomeName").textContent = currentUser;
  document.getElementById("todayText").textContent = new Date().toDateString();

  nurseryGrid.innerHTML = "";
  primaryGrid.innerHTML = "";
  var records = loadData("attendance", {});

  classNames.forEach(function (name, index) {
    var count = getStudents(name).length;

    // a class is "marked" if attendance was saved for it today
    var isMarked = records[name + "|" + dateInput.value] !== undefined;

    var card = document.createElement("button");
    card.className = "class-card";
    card.style.animationDelay = (index * 40) + "ms";   // cards appear one after another

    var nameBox = document.createElement("div");
    nameBox.className = "name";
    nameBox.textContent = name;

    var countBox = document.createElement("div");
    countBox.className = "count";
    countBox.textContent = count + " students";

    var tag = document.createElement("span");
    tag.className = isMarked ? "tag done" : "tag todo";
    tag.textContent = isMarked ? "Marked today \u2713" : "Not marked yet";

    card.appendChild(nameBox);
    card.appendChild(countBox);
    card.appendChild(tag);
    card.onclick = function () { openClass(name); };

    if (name.indexOf("Nursery") === 0) {
      card.classList.add("nursery");
      nurseryGrid.appendChild(card);
    } else {
      primaryGrid.appendChild(card);
    }
  });

}

function openClass(name) {
  if (currentRole === "teacher" && name !== currentClass) { return; }   // a teacher opens only his or her class
  classSelect.value = name;
  classTitle.textContent = name + " - Attendance";
  if (currentRole === "teacher") { classSelect.classList.add("hidden"); } else { classSelect.classList.remove("hidden"); }
  dateInput.value = getTodayString();   // the date is always today
  document.getElementById("todayLabel").textContent = new Date().toDateString();
  homeView.classList.add("hidden");
  reportView.classList.add("hidden");
  accountsView.classList.add("hidden");
  settingsView.classList.add("hidden");
  setPage(name.toLowerCase() + "-attendance", "homeBtn");
  attendanceView.classList.remove("hidden");
  loadAttendance();
}

// ---------- Left menu (sidebar) ----------
// shows the page name in the top bar and highlights the menu button of the page
function setPage(pageTitle, activeButtonId) {
  pageName.textContent = pageTitle;
  homeBtn.classList.remove("active");
  reportBtn.classList.remove("active");
  accountsBtn.classList.remove("active");
  settingsBtn.classList.remove("active");
  document.getElementById(activeButtonId).classList.add("active");
  closeSidebar();
}

// on a phone the menu slides in from the left
function openSidebar() {
  sidebar.classList.add("open");
  sideShade.classList.add("open");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sideShade.classList.remove("open");
}
