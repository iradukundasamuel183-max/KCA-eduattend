// ---------- 8. Report: a dashboard on top, the school's Excel-style table at the bottom ----------

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var cardDelay = 0;          // each card appears a little after the one before it

function icon(paths) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths + "</svg>";
}
var ICON_USERS = icon('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M17 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2.5.5 4 2.3 4 5.5"/>');
var ICON_CHECK = icon('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>');
var ICON_CROSS = icon('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>');

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");   // keeps names safe in HTML
}

function percent(part, whole) {
  if (whole === 0) { return 0; }
  return Math.round(part / whole * 1000) / 10;                       // one decimal, like 98.8
}

function ordinal(n) {
  if (n % 100 >= 11 && n % 100 <= 13) { return n + "th"; }
  if (n % 10 === 1) { return n + "st"; }
  if (n % 10 === 2) { return n + "nd"; }
  if (n % 10 === 3) { return n + "rd"; }
  return n + "th";
}

// "2026-10-13" from a Date object
function isoOf(dateObject) {
  var month = String(dateObject.getMonth() + 1).padStart(2, "0");
  var day = String(dateObject.getDate()).padStart(2, "0");
  return dateObject.getFullYear() + "-" + month + "-" + day;
}

// the colour of an attendance rate: green (95 and more), amber (85 and more), red (less)
function rateColor(rate) {
  if (rate >= 95) { return "green"; }
  if (rate >= 85) { return "amber"; }
  return "red";
}

// count the boys and girls in a list of students
function countGender(students) {
  var counts = { boys: 0, girls: 0, total: students.length };
  students.forEach(function (student) {
    if (student.gender === "Male") { counts.boys = counts.boys + 1; }
    if (student.gender === "Female") { counts.girls = counts.girls + 1; }
  });
  return counts;
}

// a number that counts up from 0 (animation)
function countUp(element) {
  var target = parseFloat(element.getAttribute("data-to"));
  var hasDecimal = element.getAttribute("data-dec") === "1";
  var startTime = null;

  function step(time) {
    if (startTime === null) { startTime = time; }
    var progress = Math.min((time - startTime) / 900, 1);
    var value = target * progress;
    element.textContent = hasDecimal ? value.toFixed(1) : Math.round(value);
    if (progress < 1) { requestAnimationFrame(step); }
  }
  requestAnimationFrame(step);
}

// bars, rings and the trend columns grow from 0 to their value (animation)
function animateBars() {
  reportBox.querySelectorAll("[data-w]").forEach(function (bar) { bar.style.width = bar.getAttribute("data-w") + "%"; });
  reportBox.querySelectorAll("[data-h]").forEach(function (bar) { bar.style.height = bar.getAttribute("data-h") + "%"; });
  reportBox.querySelectorAll("[data-pct]").forEach(function (arc) { arc.style.strokeDasharray = arc.getAttribute("data-pct") + " 100"; });
}

function showReport() {
  homeView.classList.add("hidden");
  attendanceView.classList.add("hidden");
  accountsView.classList.add("hidden");
  settingsView.classList.add("hidden");
  reportView.classList.remove("hidden");
  setPage("daily-report", "reportBtn");
  if (reportDate.value === "") { reportDate.value = getTodayString(); }
  drawReport();
}

// ----- the numbers -----

// the numbers of every class on one date
function collectReport(date, classList) {
  var records = loadData("attendance", {});
  var perClass = [];
  var absentList = [];

  classList.forEach(function (name) {
    var students = getStudents(name);
    var absentOfClass = records[name + "|" + date];
    var info = { name: name, size: countGender(students), marked: absentOfClass !== undefined, present: { boys: 0, girls: 0, total: 0 } };

    if (info.marked) {
      var presentStudents = students.filter(function (s) { return absentOfClass.indexOf(s.id) === -1; });
      info.present = countGender(presentStudents);
      students.forEach(function (s) {
        if (absentOfClass.indexOf(s.id) !== -1) { absentList.push({ id: s.id, name: s.name, className: name }); }
      });
    }
    perClass.push(info);
  });
  return { perClass: perClass, absentList: absentList };
}

// add up a list of classes (only the classes with saved attendance count for "present")
function sumClasses(list) {
  var sum = { sizeB: 0, sizeG: 0, sizeT: 0, presB: 0, presG: 0, presT: 0, marked: 0, markedB: 0, markedG: 0 };
  list.forEach(function (c) {
    sum.sizeB += c.size.boys;
    sum.sizeG += c.size.girls;
    sum.sizeT += c.size.total;
    if (c.marked) {
      sum.presB += c.present.boys;
      sum.presG += c.present.girls;
      sum.presT += c.present.total;
      sum.marked += c.size.total;
      sum.markedB += c.size.boys;
      sum.markedG += c.size.girls;
    }
  });
  return sum;
}

// attendance rate of one day, or -1 when nothing was saved that day
function dayRate(date, classList) {
  var sum = sumClasses(collectReport(date, classList).perClass);
  if (sum.marked === 0) { return -1; }
  return percent(sum.presT, sum.marked);
}

// the 7 days that end on the chosen date
function lastDays(date) {
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

// ----- small pieces of HTML -----

function card(title, body, extraClass) {
  cardDelay = cardDelay + 70;
  return '<div class="rcard ' + (extraClass || "") + '" style="animation-delay: ' + cardDelay + 'ms"><h3>' + title + "</h3>" + body + "</div>";
}

function kpi(label, valueHtml, sub, visual) {
  cardDelay = cardDelay + 70;
  return '<div class="kpi" style="animation-delay: ' + cardDelay + 'ms">' + visual + '<div><div class="kpi-label">' + label + '</div><div class="kpi-value">' + valueHtml + '</div><div class="kpi-sub">' + sub + "</div></div></div>";
}

function countSpan(number, hasDecimal) {
  return '<span class="count" data-to="' + number + '"' + (hasDecimal ? ' data-dec="1"' : "") + ">0</span>";
}

// a ring that fills up to "rate" percent
function ringSvg(rate, extraClass) {
  return '<svg viewBox="0 0 36 36" class="ring ' + extraClass + '"><circle class="ring-bg" cx="18" cy="18" r="15.9155"></circle><circle class="ring-arc" cx="18" cy="18" r="15.9155" data-pct="' + rate + '" style="stroke-dasharray: 0 100"></circle></svg>';
}

// one line with a label, a bar and a text
function barRow(label, rate, text, color) {
  return '<div class="bar-row"><div class="bar-label">' + esc(label) + '</div><div class="bar-track"><div class="bar-fill ' + color + '" data-w="' + rate + '"></div></div><div class="bar-text">' + text + "</div></div>";
}

function genderRow(label, present, total, color) {
  if (total === 0) { return barRow(label, 0, "-", color); }
  var rate = percent(present, total);
  return barRow(label, rate, present + " of " + total + " &bull; " + rate + "%", color);
}

function sectionRow(label, sum) {
  if (sum.marked === 0) { return barRow(label, 0, "not marked yet", "grey"); }
  var rate = percent(sum.presT, sum.marked);
  return barRow(label, rate, sum.presT + " of " + sum.marked + " &bull; " + rate + "%", rateColor(rate));
}

// ----- the Excel-style table -----

function buildTable(perClass, dateText) {
  var sections = [];
  if (currentRole === "teacher") {
    var css = (classNames.indexOf(currentClass) < nurseryCount) ? "nursery" : "primary";
    sections.push({ title: "MY CLASS", css: css, list: perClass });
  } else {
    sections.push({ title: "NURSERY SECTION", css: "nursery", list: perClass.slice(0, nurseryCount) });
    sections.push({ title: "PRIMARY SECTION", css: "primary", list: perClass.slice(nurseryCount) });
  }

  var rows = "";
  sections.forEach(function (section) {
    var sum = sumClasses(section.list);
    var any = sum.marked > 0;
    var span = section.list.length;
    function sectionCell(value) {
      return '<td class="' + section.css + '" rowspan="' + span + '">' + value + "</td>";
    }

    section.list.forEach(function (c, i) {
      var row = "<tr>";
      if (i === 0) { row += sectionCell("<b>" + section.title + "</b>"); }
      row += '<td class="cname">' + esc(c.name) + "</td><td>" + c.size.boys + "</td><td>" + c.size.girls + "</td><td><b>" + c.size.total + "</b></td>";
      if (i === 0) { row += sectionCell(sum.sizeB) + sectionCell(sum.sizeG) + sectionCell("<b>" + sum.sizeT + "</b>"); }
      if (c.marked) {
        row += "<td>" + c.present.boys + "</td><td>" + c.present.girls + "</td><td><b>" + c.present.total + "</b></td>";
      } else {
        row += '<td class="dash">-</td><td class="dash">-</td><td class="dash">-</td>';
      }
      if (i === 0) {
        row += sectionCell(any ? sum.presB : "-") + sectionCell(any ? sum.presG : "-") + sectionCell(any ? "<b>" + sum.presT + "</b>" : "-");
        row += sectionCell(any ? "<b>" + percent(sum.presT, sum.marked) + "</b>" : "-");
      }
      rows += row + "</tr>";
    });
  });

  var grand = sumClasses(perClass);
  var total = '<tr class="total"><td colspan="2">GENERAL TOTAL</td><td colspan="3"></td>';
  total += "<td>" + grand.sizeB + "</td><td>" + grand.sizeG + "</td><td>" + grand.sizeT + '</td><td colspan="3"></td>';
  if (grand.marked > 0) {
    total += "<td>" + grand.presB + "</td><td>" + grand.presG + "</td><td>" + grand.presT + "</td><td>" + percent(grand.presT, grand.marked) + "</td>";
  } else {
    total += '<td colspan="4">-</td>';
  }
  total += "</tr>";

  var head = '<tr><th colspan="8" class="blank"></th><th colspan="7" class="yellow">DAILY ATTENDANCE OF THE ' + dateText + "</th></tr>";
  head += '<tr><th colspan="2" class="blank"></th><th colspan="3" class="yellow">CLASS SIZE</th><th colspan="3" class="yellow">SECTION SIZE</th>';
  head += '<th colspan="3" class="yellow">CLASS ATTENDANCE</th><th colspan="4" class="yellow">SECTION ATTENDANCE</th></tr>';
  head += '<tr class="navy"><th colspan="2">Classes</th>';
  head += "<th>BOYS</th><th>GIRLS</th><th>Total</th><th>BOYS</th><th>GIRLS</th><th>Total</th>";
  head += "<th>BOYS</th><th>GIRLS</th><th>Total</th><th>BOYS</th><th>GIRLS</th><th>Total</th><th>%</th></tr>";
  return '<table class="report">' + head + rows + total + "</table>";
}

// ----- the whole report -----

function drawReport() {
  var date = reportDate.value;
  if (date === "") { return; }
  cardDelay = 0;

  var isTeacher = (currentRole === "teacher");
  var classList = isTeacher ? [currentClass] : classNames;      // a teacher sees only his or her class
  var data = collectReport(date, classList);
  var all = sumClasses(data.perClass);
  var hasData = all.marked > 0;
  var rate = percent(all.presT, all.marked);
  var absentTotal = all.marked - all.presT;

  var parts = date.split("-");
  var day = parseInt(parts[2], 10);
  var monthNumber = parseInt(parts[1], 10);
  var longDate = ordinal(day) + " " + monthNames[monthNumber - 1] + " " + parts[0];
  var scopeName = isTeacher ? currentClass : "Whole school";

  var html = '<div class="rhead"><h2>Daily Attendance Report</h2><p>Kigali Christian Academy &bull; ' + esc(scopeName) + " &bull; " + longDate + "</p></div>";

  // classes that did not save attendance yet
  var notMarked = [];
  data.perClass.forEach(function (c) { if (!c.marked) { notMarked.push(c.name); } });
  if (!hasData) {
    html += '<div class="notice">No attendance has been saved for this date yet.</div>';
  } else if (notMarked.length > 0) {
    html += '<div class="notice">Waiting for ' + notMarked.length + " class(es) to save attendance: " + notMarked.map(esc).join(", ") + ".</div>";
  }

  // 4 number cards
  var sizeText = isTeacher ? "Class " + esc(currentClass) : classNames.length + " classes";
  html += '<div class="kpis">';
  html += kpi("Total students", countSpan(all.sizeT, false), sizeText, '<div class="kpi-icon blue">' + ICON_USERS + "</div>");
  html += kpi("Present", countSpan(all.presT, false), hasData ? "of " + all.marked + " in marked classes" : "no data yet", '<div class="kpi-icon green">' + ICON_CHECK + "</div>");
  html += kpi("Absent", countSpan(absentTotal, false), hasData ? percent(absentTotal, all.marked) + "% of marked classes" : "no data yet", '<div class="kpi-icon orange">' + ICON_CROSS + "</div>");
  html += kpi("Attendance rate", countSpan(rate, true) + "%", hasData ? "present on this day" : "no data yet", ringSvg(hasData ? rate : 0, "small"));
  html += "</div>";

  // big ring + boys and girls
  var donut = '<div class="donut">' + ringSvg(hasData ? rate : 0, "donut");
  donut += '<div class="donut-center"><b>' + (hasData ? rate + "%" : "-") + "</b><small>Present</small></div></div>";
  donut += '<div class="legend"><span><i class="dot blue"></i>Present ' + all.presT + '</span><span><i class="dot orange"></i>Absent ' + absentTotal + "</span></div>";

  var gender = genderRow("Boys", all.presB, all.markedB, "blue") + genderRow("Girls", all.presG, all.markedG, "pink");
  gender += '<p class="mini">Class size: ' + all.sizeB + " boys and " + all.sizeG + " girls</p>";
  html += '<div class="row2">' + card("Attendance overview", donut, "center") + card("Boys and girls present", gender, "") + "</div>";

  // the last 7 days
  var trend = '<div class="trend">';
  lastDays(date).forEach(function (d) {
    var iso = isoOf(d);
    var r = dayRate(iso, classList);
    trend += '<div class="tcol' + (iso === date ? " selected" : "") + '"><div class="tval">' + (r < 0 ? "-" : r + "%") + "</div>";
    trend += '<div class="tbarwrap"><div class="tbar ' + (r < 0 ? "" : rateColor(r)) + '" data-h="' + (r < 0 ? 0 : r) + '"></div></div>';
    trend += '<div class="tday">' + dayNames[d.getDay()] + "<br>" + d.getDate() + "</div></div>";
  });
  trend += "</div>";

  if (isTeacher) {
    html += card("Last 7 days", trend, "");
  } else {
    var nursery = sumClasses(data.perClass.slice(0, nurseryCount));
    var primary = sumClasses(data.perClass.slice(nurseryCount));
    html += '<div class="row2">' + card("Last 7 days", trend, "") + card("Sections", sectionRow("Nursery", nursery) + sectionRow("Primary", primary), "") + "</div>";

    var classBars = "";
    data.perClass.forEach(function (c) {
      if (c.marked) {
        var r = percent(c.present.total, c.size.total);
        classBars += barRow(c.name, r, c.present.total + "/" + c.size.total + " &bull; " + r + "%", rateColor(r));
      } else {
        classBars += barRow(c.name, 0, "not marked yet", "grey");
      }
    });
    html += card("Attendance by class", classBars, "");
  }

  // absent students
  var absentHtml = "";
  if (!hasData) {
    absentHtml = '<p class="mini">No attendance saved for this date yet.</p>';
  } else if (data.absentList.length === 0) {
    absentHtml = '<p class="mini">Everyone is present. Great!</p>';
  } else {
    absentHtml = '<div class="absent-grid">';
    data.absentList.forEach(function (s) {
      absentHtml += '<div class="absent-item"><div class="avatar-sm">' + esc(initials(s.name)) + "</div><div><b>" + esc(s.name) + "</b><br><small>" + esc(s.id) + '</small></div><span class="chip">' + esc(s.className) + "</span></div>";
    });
    absentHtml += "</div>";
  }
  html += card("Absent students <small>(" + data.absentList.length + ")</small>", absentHtml, "");

  var noGender = all.sizeT - all.sizeB - all.sizeG;
  if (noGender > 0) {
    html += '<p class="mini">' + noGender + " student(s) have no gender yet, so they are counted in Total only. Hold (or right-click) the student name and choose Edit to set it.</p>";
  }

  // the school's table
  var dateText = ordinal(day) + " / " + monthNumber + " / " + parts[0];
  html += card("Detailed report <small>(school format, for printing)</small>", '<div class="scroll">' + buildTable(data.perClass, dateText) + "</div>", "");

  reportBox.innerHTML = html;

  // animations
  reportBox.querySelectorAll(".count").forEach(countUp);
  setTimeout(animateBars, 80);
}
