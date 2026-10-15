// ---------- 6. Attendance ----------
function attendanceKey() {
  return classSelect.value + "|" + dateInput.value;     // example: "P1|2026-10-12"
}

function loadAttendance() {
  var records = loadData("attendance", {});
  absentIds = records[attendanceKey()] || [];
  addMessage.textContent = "";          // nothing saved = everyone present
  saveMessage.textContent = "";
  animateRows = true;      // rows slide in when a class is opened
  showStudents();
}

function toggleStudent(id) {
  lastToggled = id;                // so this circle does the pop animation
  var position = absentIds.indexOf(id);
  if (position === -1) {
    absentIds.push(id);          // was present, now absent
  } else {
    absentIds.splice(position, 1); // was absent, now present
  }
  saveMessage.textContent = "";
  showStudents();
}

function saveAttendance() {
  var records = loadData("attendance", {});
  records[attendanceKey()] = absentIds;
  saveData("attendance", records);
  saveMessage.textContent = "Saved for " + classSelect.value + " on " + dateInput.value + " \u2713";
}

function showStudents() {
  var list = getStudents(classSelect.value);
  studentList.innerHTML = "";

  if (list.length === 0) {
    studentList.innerHTML = '<div class="empty">No students yet. Add one below.</div>';
  }

  var absent = 0;

  list.forEach(function (student, index) {
    var isPresent = absentIds.indexOf(student.id) === -1;
    if (!isPresent) { absent = absent + 1; }

    var row = document.createElement("div");
    row.className = animateRows ? "row row-in" : "row";
    row.style.animationDelay = Math.min(index * 25, 500) + "ms";

    var idBox = document.createElement("div");
    idBox.className = "col-id";
    idBox.textContent = student.id;

    var nameBox = document.createElement("div");
    nameBox.className = "col-name";
    nameBox.textContent = student.name;
    holdForOptions(nameBox, student);   // hold or right-click the name: edit or delete

    var genderLetter = "?";
    var genderClass = "g-u";
    if (student.gender === "Male") { genderLetter = "M"; genderClass = "g-m"; }
    if (student.gender === "Female") { genderLetter = "F"; genderClass = "g-f"; }

    var genderBox = document.createElement("div");
    genderBox.className = "col-gender";
    var genderBtn = document.createElement("span");
    genderBtn.className = "gender " + genderClass;
    genderBtn.textContent = genderLetter;
    genderBox.appendChild(genderBtn);

    var presentBox = document.createElement("div");
    presentBox.className = "col-present";
    var circle = document.createElement("button");
    circle.className = isPresent ? "circle present" : "circle";
    if (student.id === lastToggled) { circle.classList.add("pop"); }
    circle.textContent = "\u2713";
    circle.title = isPresent ? "Present (click to mark absent)" : "Absent (click to mark present)";
    circle.onclick = function () { toggleStudent(student.id); };
    presentBox.appendChild(circle);


    row.appendChild(idBox);
    row.appendChild(nameBox);
    row.appendChild(genderBox);
    row.appendChild(presentBox);
    studentList.appendChild(row);
  });

  var total = list.length;
  summaryText.textContent = "Present: " + (total - absent) + "  |  Absent: " + absent + "  |  Total: " + total;
  animateRows = false;
  lastToggled = "";
}
