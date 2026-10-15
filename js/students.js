// ---------- 5. Students ----------
// Each student is saved as an object: { id: "P1-001", name: "Uwase Aline" }

function classCode(className) {
  // "Nursery 1" becomes "N1", "P3 Blue" becomes "P3B", "P3 Green" becomes "P3G", "P1" stays "P1"
  return className.replace("Nursery ", "N").replace(" Blue", "B").replace(" Green", "G");
}

function makeId(className, list) {
  // find the biggest number already used in this class, then add 1
  var biggest = 0;
  list.forEach(function (student) {
    var number = parseInt(student.id.split("-")[1], 10);
    if (number > biggest) { biggest = number; }
  });
  return classCode(className) + "-" + String(biggest + 1).padStart(3, "0");
}

function getStudents(className) {
  var allStudents = loadData("students", {});
  var list = allStudents[className];
  var changed = false;

  if (!list) {
    list = (seedStudents[className] || []).slice();     // the school list the first time
    changed = true;
  }

  // make sure every student is an object with an id (old saved data had only names)
  var fixedList = [];
  list.forEach(function (item) {
    if (typeof item === "string") {
      fixedList.push({ id: makeId(className, fixedList), name: item });
      changed = true;
    } else {
      fixedList.push(item);
    }
  });

  if (changed) {
    allStudents[className] = fixedList;
    saveData("students", allStudents);
  }
  // always show students in alphabetical order, A to Z
  fixedList.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return fixedList;
}

function addStudents() {
  var lines = newStudents.value.split("\n");     // one student on each line
  var list = getStudents(classSelect.value);

  // names already in this class (small letters, so "Eric" and "eric" count as the same)
  var existing = list.map(function (student) { return student.name.toLowerCase(); });
  var newOnes = [];
  var skipped = 0;

  lines.forEach(function (line) {
    var name = line.replace(/\s+/g, " ").trim();   // remove extra spaces
    if (name === "") { return; }                   // ignore empty lines

    // a line can end with ", M" or ", F" to give the gender
    var gender = "";
    var parts = name.split(",");
    if (parts.length > 1) {
      var last = parts[parts.length - 1].trim().toLowerCase();
      if (last === "m" || last === "male" || last === "boy") { gender = "Male"; }
      if (last === "f" || last === "female" || last === "girl") { gender = "Female"; }
      if (gender !== "") { name = parts.slice(0, -1).join(",").trim(); }
    }

    if (existing.indexOf(name.toLowerCase()) !== -1) {
      skipped = skipped + 1;                       // already in the class or typed twice
      return;
    }
    existing.push(name.toLowerCase());
    newOnes.push({ name: name, gender: gender });
  });

  if (newOnes.length === 0 && skipped === 0) {
    addMessage.textContent = "Type at least one name.";
    return;
  }

  // put the new names in A to Z order, then give each one its ID
  newOnes.sort(function (a, b) { return a.name.localeCompare(b.name); });
  newOnes.forEach(function (one) {
    list.push({ id: makeId(classSelect.value, list), name: one.name, gender: one.gender });
  });

  var allStudents = loadData("students", {});
  allStudents[classSelect.value] = list;
  saveData("students", allStudents);

  newStudents.value = "";
  showStudents();

  addMessage.textContent = "Added " + newOnes.length + " student(s).";
  if (skipped > 0) {
    addMessage.textContent = addMessage.textContent + " Skipped " + skipped + " already in the class.";
  }
}

function removeStudent(student) {
  var list = getStudents(classSelect.value);
  var allStudents = loadData("students", {});
  allStudents[classSelect.value] = list.filter(function (s) { return s.id !== student.id; });
  saveData("students", allStudents);
  absentIds = absentIds.filter(function (id) { return id !== student.id; });
  showStudents();
}

// ---------- The student options box ----------
// It opens when a student name is held (phone) or right-clicked (PC)
var studentInBox = null;     // the student whose options are open

// show only one panel of the box: "optionsPanel", "editPanel" or "deletePanel"
function showPanel(panelId) {
  ["optionsPanel", "editPanel", "deletePanel"].forEach(function (id) {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(panelId).classList.remove("hidden");
}

function openOptions(student) {
  studentInBox = student;
  document.getElementById("optionsName").textContent = student.name;
  document.getElementById("optionsInfo").textContent = student.id + "  |  " + classSelect.value;
  showPanel("optionsPanel");
  optionsBox.classList.remove("hidden");
}

function closeOptions() {
  optionsBox.classList.add("hidden");
  studentInBox = null;
}

function openEdit() {
  editName.value = studentInBox.name;
  editGender.value = studentInBox.gender;      // "Male", "Female" or "" (not set)
  editError.textContent = "";
  showPanel("editPanel");
}

function saveEdit() {
  var newName = editName.value.replace(/\s+/g, " ").trim();
  if (newName === "") { editError.textContent = "Please type the name."; return; }

  var list = getStudents(classSelect.value);
  for (var i = 0; i < list.length; i++) {
    if (list[i].id !== studentInBox.id && list[i].name.toLowerCase() === newName.toLowerCase()) {
      editError.textContent = "Another student already has this name.";
      return;
    }
  }

  list.forEach(function (student) {
    if (student.id === studentInBox.id) {
      student.name = newName;
      student.gender = editGender.value;
    }
  });
  var allStudents = loadData("students", {});
  allStudents[classSelect.value] = list;
  saveData("students", allStudents);

  closeOptions();
  showStudents();
}

function openDeleteConfirm() {
  deleteText.textContent = "Delete " + studentInBox.name + " (" + studentInBox.id + ")? This cannot be undone.";
  showPanel("deletePanel");
}

function confirmDelete() {
  removeStudent(studentInBox);
  closeOptions();
}

// Hold the student name (phone) or right-click it (PC) to open the options box
function holdForOptions(element, student) {
  var timer = null;

  // PC: right-click
  element.oncontextmenu = function (event) {
    event.preventDefault();          // stop the browser's own menu
    openOptions(student);
  };

  // phone: touch and hold for 0.6 seconds
  element.ontouchstart = function () {
    timer = setTimeout(function () { openOptions(student); }, 600);
  };
  element.ontouchend = function () { clearTimeout(timer); };
  element.ontouchmove = function () { clearTimeout(timer); };
  element.ontouchcancel = function () { clearTimeout(timer); };
}
