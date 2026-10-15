// ---------- 1. Basic data ----------
var classNames = ["Nursery 1", "Nursery 2", "Nursery 3", "P1", "P2", "P3 Blue", "P3 Green", "P4 Blue", "P4 Green", "P5 Blue", "P5 Green", "P6 Blue", "P6 Green"];
var nurseryCount = 3;           // the first 3 classes are the Nursery section, the rest are Primary

var isRegisterMode = false;   // false = login screen, true = register screen
var currentUser = "";         // name of the teacher who is logged in
var absentIds = [];         // ids of students marked absent right now

// ---------- 2. Save and load helpers (browser storage) ----------
function loadData(key, defaultValue) {
  try {
    var text = localStorage.getItem(key);
    if (text === null) { return defaultValue; }
    return JSON.parse(text);
  } catch (error) {
    return defaultValue;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log("Could not save", error);
  }
}
var currentRole = "";          // "admin" or "teacher"
var animateRows = false;      // true = rows slide in (only when a class is opened)
var lastToggled = "";         // id of the student just tapped (for the pop animation)
var currentClass = "";         // the class of a class teacher (empty for the admin)
