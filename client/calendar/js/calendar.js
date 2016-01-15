Template.calendar.onRendered(function () { //calendar loading
    if (!this._rendered) {
        this._rendered = true;
        var date = new Date();
        localStorage.setItem("selectedDate", $.format.date(date, "M d yyyy"));
        localStorage.setItem("displayDate", $.format.date(date, "M d yyyy"));
        loadCalendar(date, true);
        var otherDate = getDate(date.getDate() - 1, 1);
        var today = new Date();
        $("#calFeedHead").text("Day " + today.getDOY());
    }
    getCalFeed(otherDate);
});

Template.calendar.onDestroyed(function () {
    feedStage.destroyChildren(); // Cleanup canvas
    feedStage.destroy();
})

Template.calendar.events({
    'click .datepicker-td': function (event) {
        //console.log(e.currentTarget.innerHTML);
        var element = event.currentTarget.childNodes[0];
        var parent = element.parentNode;
        $(".selectedDate").removeClass("selectedDate");
        $(parent).addClass("selectedDate");
        var day = element.innerHTML;
        var date = getDate(day - 1, 1);
        localStorage.setItem("selectedDate", $.format.date(date, "M d yyyy"));
        setCalText(date, false, true);
        getCalFeed(date);
    },
    'click #monthPrev': function () {
        var date = getDate(-7, 1);
        loadCalendar(date, false);
    },
    'click #monthNext': function () {
        var date = getDate(7, 28);
        loadCalendar(date, false);
    },
    'click #yearPrev': function () {
        var date = getDate(-100);
        loadCalendar(date, false);
    },
    'click #yearNext': function () {
        var date = getDate(100);
        loadCalendar(date, false);
    }
});

function loadCalendar(date, shouldSelect) { //load the calendar
    var tbody = $(".datepicker-body");
    tbody.empty();
    var day = 01;
    if (shouldSelect) { //if this is true, want to highlight the current date
        day = date.getDate();
    }
    var month = date.getMonth(); // read the current month
    var year = date.getFullYear(); // read the current year
    var dt = new Date(year, month, 01);//Year , month,date format
    var first_day = dt.getDay(); //, first day of present month
    dt.setMonth(month + 1, 0); // Set to next month and one day backward.
    var last_date = dt.getDate(); // Last date of present month
    var dy = 1; // day variable for adjustment of starting date.
    var string = "";
    var numAdded = 0; //count actual days added. 
    var selectedDay = 0;
    if (!shouldSelect) {
        var selectedDate = new Date(localStorage.getItem("selectedDate"));
        console.log(selectedDate);
        var selectedMonth = selectedDate.getMonth();
        var selectedYear = selectedDate.getFullYear();
        var curMonth = dt.getMonth();
        var curYear = dt.getFullYear();
        if (selectedMonth == curMonth && selectedYear == curYear) {
            selectedDay = selectedDate.getDate();
        }
    }
    for (i = 0; i <= 41; i++) {
        if ((i % 7) == 0) {
            string = string.concat("</tr><tr>");
        } // if week is over then start a new line
        if ((i >= first_day) && (dy <= last_date)) {
            numAdded += 1;
            var classString = "";
            if (numAdded == day && shouldSelect) {
                string = string.concat("<td class=selectedDate><a href=''>" + dy + "</a></td>");
            }
            else if (selectedDay != 0 && numAdded == selectedDay) {
                string = string.concat("<td class=selectedDate><a href=''>" + dy + "</a></td>");
            }
            else {
                string = string.concat("<td class=datepicker-td><a href=''>" + dy + "</a></td>");
            }
            dy = dy + 1;
        }
        else {
            string = string.concat("<td class=empty> </td>");
        } // Blank dates.
    }
    string.concat("</tr>")
    tbody.append(string);
    $(".selectedDate").addClass("datepicker-td");
    dt.setDate(day);
    setCalText(dt, true, shouldSelect);
}
function getCalFeed(date) { //show posts for a given day
    var startDate = new Date(date);
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    var dateMidnight = new Date(startDate);
    dateMidnight.setHours(23);
    dateMidnight.setMinutes(59);
    dateMidnight.setSeconds(59);
    feedStage = {};
    renderFeed('#calFeed', 'calFeed-container', 'single',
        Thoughts.find({
            $and: [
                {
                    "createdAt": {
                        $gt: startDate,
                        $lt: dateMidnight
                    }
                },
                {
                    $or: [
                        {"userId": Meteor.userId()},
                        {"collectedBy": Meteor.userId()}
                    ]
                }
            ]
        }, {sort: {createdAt: -1}}).fetch()
    );
}

function setCalText(date, setCal, setHead) { //set calendar feed header + calendar month/year
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var year = date.getFullYear().toString();
    var month = monthNames[date.getMonth()];
    var day = date.getDate();
    if (setCal) {
        $("#monthTitle").text(month);
        $("#yearTitle").text(year);
    }
    if (setHead) {
        $("#calFeedHead").text("Day " + (date.getDOY()));
    }
}
//get date for previous or next month
//val is number of days to change by
//dateToSet is day to set to (1 for previous, 28 for next)
function getDate(val, string) {
    var calendarDate = localStorage.getItem("displayDate");
    calendarDate = new Date(calendarDate);
    if (string) {
        calendarDate.setDate(string);
    }
    var newDate = new Date(1970, 0, 1);
    newDate.setSeconds(calendarDate / 1000);
    if (val) {
        if (Math.abs(val) == 100) { //this means set year
            newDate.setYear(newDate.getYear() + val / 100 + 1900);
        } else {
            newDate.setDate(newDate.getDate() + val);
        }
    } else {
        newDate.setDate(newDate.getDate());
    }
    localStorage.setItem("displayDate", $.format.date(newDate, "M d yyyy"));
    return newDate;
}

Date.prototype.getDOY = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((this - onejan) / 86400000);
}
