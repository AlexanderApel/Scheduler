//set time input fields
$('#time .time').timepicker({
    'timeFormat': 'H:i',
    'step': 15

})
//sync both time input fields
$('#time').datepair()

//selector for the days
$(document).ready(function() {
    $('.week').select2()

})
var checkBox = document.getElementById("show_week")

// if values already exist get them else create them
if (localStorage.timetable == null) {
    week = []
    for (var i = 0; i <= 6; i++) {
        week[i] = []
    }
} else {
    week = JSON.parse(localStorage.getItem("timetable"))
}

if (localStorage.checkBox != null) {

    checkBox.checked = JSON.parse(localStorage.getItem("checkBox"))
}

if (localStorage.pos == null) {
    pos = 0
} else {
    pos = JSON.parse(localStorage.getItem("pos"))
}

//Resets everything
function reset() {
    localStorage.clear()
    delete week
    pos = 0
    $('#timetable').empty()
    week = []
    for (var i = 0; i <= 6; i++) {
        week[i] = []
    }
}


//get the inputs and correctly insert them into an array as a new row for each day slected
function saveInput() {
    if ($("#descr").val() == "") {
        $("#descr").css({
            backgroundColor: 'rgba(255,0,0,.2)'
        })
    }

    var descr = $("#descr").val()
    var start = $(".time.start").val()
    var end = $(".time.end").val()
    var day = $("#Day").val()
    var color = document.getElementById("color").value
    var data = {
        description: descr,
        start: start,
        end: end,
        color: color,
        pos: pos
    }
    pos += 1
    //inserts row according to the start value
    for (var i = 0; i < day.length; i++) {
        for (var x = 0; x < week[day[i]].length; x++) {
            if (week[day[i]][x].start >= data.start) {
                week[day[i]].splice(x, 0, data)
                break
            } else if (x == week[day[i]].length - 1) {
                week[day[i]].push(data)
                break
            }


        }
        if (week[day[i]].length == 0) {
            week[day[i]].push(data)
        }

    }
    //safe everything in localStorage
    localStorage.setItem("timetable", JSON.stringify(week))
    localStorage.setItem("pos", JSON.stringify(pos))

    create()
    //clear input fields
    $("#descr").val("")
    $(".time.start").val("")
    $(".time.end").val("")


}
//converts color to rgb format
function colorconverter(color) {
    return color.match(/[A-Za-z0-9]{2}/g).map(function(v) {
        return parseInt(v, 16)
    }).join(",")
}
//create the timetable
function create() {

    DaysOfWeek = 1
    localStorage.setItem("checkBox", JSON.stringify(checkBox.checked))
    if (checkBox.checked == true) {
        //every day will be added to the viewport and a column with the corresponding day is added
        DaysOfWeek = 7
    }

    $('#timetable').empty()
    //new table with class attribut table-style

    for (n = 0; n < DaysOfWeek; n++) {
        tbl = $('<table> </table>').addClass('table-style')
        if (checkBox.checked == false) {
            d = new Date()
            n = d.getDay()

            //only the current day will be displayed
        }
        if (week[n].length !== 0) {

            //reiterate all entries
            for (i = 0; i < week[n].length; i++) {
                if (week[n][i] != undefined) {
                    //get backgorund color
                    var color = colorconverter(week[n][i].color)
                    //create new row
                    var tr = $('<tr></tr>')

                    //create first cell, set contet with class attribut "cell","info" and "pos" and append to the row
                    //If show week is checked add the corresponding day to the table as a new column
                    if (checkBox.checked == true) {
                        var td0 = $('<td contentEditable></td>')
                        WeekNumberToString = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                        td0.html(WeekNumberToString[n]).css({
                            backgroundColor: 'rgba(' + color + ', .2)',
                            outline: 'none',
                            width: '10%',
                            maxWidth: '0'
                        })
                        td0.attr("data-cell-i", i).attr("data-cell-n", n).attr("data-cell-pos", week[n][i].pos)
                        //if the day is changed afterweards, update it in the array
                        $(td0).on('input', function() {
                            switch ($(this).text()) {
                                case "Mon":
                                    day = 1
                                    break
                                case "Tue":
                                    day = 2
                                    break
                                case "Wed":
                                    day = 3
                                    break
                                case "Thu":
                                    day = 4
                                    break
                                case "Fri":
                                    day = 5
                                    break
                                case "Sat":
                                    day = 6
                                    break
                                case "Sun":
                                    day = 0
                                    break
                                default:
                                    day = -1
                                    break
                            }
                            if (day > -1) {
                                $(this).parent().remove()
                                //add the old entry to the new day
                                week[day].push(week[$(this).attr("data-cell-n")][$(this).attr("data-cell-i")])
                                //remove the old entry
                                week[$(this).attr("data-cell-n")].splice($(this).attr("data-cell-i"), 1)

                                rearrange()
                                localStorage.setItem("timetable", JSON.stringify(week))
                                create()

                            }
                        })
                        td0.addClass('cell info').appendTo(tr)
                    }
                    var td1 = $('<td contentEditable></td>')
                    td1.html(week[n][i].start + '</br>' + week[n][i].end).css({
                        backgroundColor: 'rgba(' + color + ', .2)',
                        outline: 'none',
                        width: '20%',
                        maxWidth: '0',
                        minWidth: '20%'
                    })
                    td1.attr("data-cell-i", i).attr("data-cell-n", n).attr("data-cell-pos", week[n][i].pos)
                    //if the time is changed afterweards, update it in the array
                    $(td1).on('input', function() {
                        if ($(this).text().length == 10) {
                            var time = $(this).text()
                            var start = time.substring(0, 5)
                            var end = time.substring(5, 10)
                            var wlength = week.length

                            for (var i = 0; i < wlength; i++) {
                                for (var x = week[i].length - 1; x > -1; x--) {
                                    if (week[i][x].pos == $(this).attr("data-cell-pos")) {
                                        week[i][x].start = start
                                        week[i][x].end = end
                                    }
                                }
                            }
                            rearrange()
                            localStorage.setItem("timetable", JSON.stringify(week))
                            create()

                        }
                    })
                    td1.addClass('cell info').appendTo(tr)

                    //create second cell, set contet with class attribut "cell","info" and "pos" and append to the row
                    var td2 = $('<td contentEditable></td>')
                    td2.html(week[n][i].description).css({
                        backgroundColor: 'rgba(' + color + ', .2)',
                        outline: 'none',
                        width: '50%',
                        maxWidth: '0',
                        fontSize: 'auto'
                    })
                    td2.attr("data-cell-i", i).attr("data-cell-n", n).attr("data-cell-pos", week[n][i].pos)
                    //if the description is changed afterweards, update it in the array

                    $(td2).on('input', function() {
                        var descr = $(this).text()
                        week[$(this).attr("data-cell-n")][$(this).attr("data-cell-i")].description = descr
                        var wlength = week.length

                        //update the description of all entries which were created for multiple days
                        //to edit every entry independently use the next line and comment the following loop
                        //week[$(this).attr("data-cell-n")][$(this).attr("data-cell-i")].description = descr

                        for (var i = 0; i < wlength; i++) {
                            for (var x = week[i].length - 1; x > -1; x--) {
                                if (week[i][x].pos == $(this).attr("data-cell-pos")) {
                                    week[i][x].description = descr
                                }
                            }
                        }

                        localStorage.setItem("timetable", JSON.stringify(week))

                    })
                    td2.addClass('cell info').appendTo(tr)


                    var td3 = $('<td>x</td>').css({
                        cursor: 'pointer',
                        backgroundColor: 'transparent ',
                        width: '2%'
                    })
                    td3.attr("data-cell-i", i).attr("data-cell-n", n).attr("data-cell-pos", week[n][i].pos)

                    //on click delete this row
                    td3.click(function() {

                        $(this).parent().remove()

                        week[$(this).attr("data-cell-n")].splice($(this).attr("data-cell-i"), 1)

                        localStorage.setItem("timetable", JSON.stringify(week))

                        create()
                    })
                    td3.addClass('cell info').appendTo(tr)



                    //append row to the table
                    tbl.append(tr)
                }
            }

            //apend timetable to the body
            $('#timetable').append(tbl)
        }
    }
}
create()

//sorts each day of the week after lowest starting point to the highest staring point
function rearrange() {
    for (n = 0; n < week.length; n++) {
        week[n].sort(function(a, b) {
            var x = a.start
            var y = b.start
            return ((x < y) ? -1 : ((x > y) ? 1 : 0))
        })
    }
}

//hide the div with the inputs
function hide() {
    $('.inputfield').slideToggle()
}
