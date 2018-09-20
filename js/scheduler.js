//set time input fields
$('#time .time').timepicker({
    'timeFormat': 'H:i',
    'step': 15

});
//sync both time input fields
$('#time').datepair();

//selector for the days
$(document).ready(function() {
    $('.week').select2();

});
// if values already exist get them else create them
if (localStorage.timetable == null) {
    week = [];
    for (var i = 0; i <= 6; i++) {
        week[i] = [];
    }
} else {
    week = JSON.parse(localStorage.getItem("timetable"));
}

if (localStorage.pos == null) {
    pos = 0;
} else {
    pos = JSON.parse(localStorage.getItem("pos"));
}

//Resets everything
function reset() {
    localStorage.clear();
    delete week;
    pos = 0;
    $('#timetable').empty();
    week = [];
    for (var i = 0; i <= 6; i++) {
        week[i] = [];
    }
}


//get the inputs and correctly insert them into an array as a new row for each day slected
function saveInput() {
    if ($("#descr").val() == "") {
        $("#descr").css({
            backgroundColor: 'rgba(255,0,0,.2)'
        });

    };

    var descr = $("#descr").val();
    var start = $(".time.start").val();
    var end = $(".time.end").val();
    var day = $("#Day").val();
    var color = document.getElementById("color").value;
    var data = {
        description: descr,
        start: start,
        end: end,
        color: color,
        pos: pos
    };
    pos += 1;
    //inserts row according to the start value
    for (var i = 0; i < day.length; i++) {
        for (var x = 0; x < week[day[i]].length; x++) {
            if (week[day[i]][x].start >= data.start) {
                week[day[i]].splice(x, 0, data);
                break;
            } else if (x == week[day[i]].length - 1) {
                week[day[i]].push(data);
                break;
            }


        }
        if (week[day[i]].length == 0) {
            week[day[i]].push(data);
        }

    }
    localStorage.setItem("timetable", JSON.stringify(week));
    localStorage.setItem("pos", JSON.stringify(pos));

    create();
    $("#descr").val("");
    $(".time.start").val("");
    $(".time.end").val("");


}
//converts color to rgb format
function colorconverter(color) {
    return color.match(/[A-Za-z0-9]{2}/g).map(function(v) {
        return parseInt(v, 16)
    }).join(",");
}

function create() {
    d = new Date();
    n = d.getDay()
    if (week[n].length !== 0) {
        $('#timetable').empty();

        //new table with class attribut table-style
        tbl = $('<table> </table>').addClass('table-style');

        //reiterate all entries
        for (i = 0; i < week[n].length; i++) {
            if (week[n][i] != undefined) {
                //get backgorund color
                var color = colorconverter(week[n][i].color);
                //create new row
                var tr = $('<tr></tr>');


                //create first cell, set contet with class attribut "cell","info" and "pos" and append to the row
                var td1 = $('<td contentEditable></td>');
                td1.html(week[n][i].start + '</br>' + week[n][i].end).css({
                    backgroundColor: 'rgba(' + color + ', .2)',
                    outline: 'none'
                });
                td1.attr("data-cell-i", i).attr("data-cell-n", n).attr("data-cell-pos", week[n][i].pos);
                //if the time is changed afterweards, update it in the array
                $(td1).on('input', function() {

                    if ($(this).text().length == 10) {
                        var time = $(this).text();
                        var start = time.substring(0, 5);
                        var end = time.substring(5, 10);
                        var wlength = week.length
                        for (var i = 0; i < wlength; i++) {
                            for (var x = week[i].length - 1; x > -1; x--) {

                                if (week[i][x].pos == $(this).attr("data-cell-pos")) {

                                    week[i][x].start = start;
                                    week[i][x].end = end;
                                }
                            }
                        }
                        rearrange();
                        localStorage.setItem("timetable", JSON.stringify(week));
                        create();

                    }
                });
                td1.addClass('cell info').appendTo(tr);

                //create second cell, set contet with class attribut "cell","info" and "pos" and append to the row
                var td2 = $('<td contentEditable></td>');
                td2.html(week[n][i].description).css({
                    backgroundColor: 'rgba(' + color + ', .2)',
                    outline: 'none'
                });
                td2.attr("data-cell-i", i).attr("data-cell-n", n).attr("data-cell-pos", week[n][i].pos);
                //if the description is changed afterweards, update it in the array
                $(td2).on('input', function() {
                    var descr = $(this).text();
                    var wlength = week.length

                    for (var i = 0; i < wlength; i++) {
                        for (var x = week[i].length - 1; x > -1; x--) {
                            if (week[i][x].pos == $(this).attr("data-cell-pos")) {
                                week[i][x].description = descr;
                            }
                        }
                    }
                    localStorage.setItem("timetable", JSON.stringify(week));

                });
                td2.addClass('cell info').appendTo(tr);


                var td3 = $('<td>x</td>').css({
                    cursor: 'pointer',
                    backgroundColor: 'transparent '
                });;
                td3.attr("data-cell-i", i).attr("data-cell-n", n).attr("data-cell-pos", week[n][i].pos);
                //on click delete this row start all days
                td3.click(function() {

                    $(this).parent().remove();
                    var wlength = week.length
                    for (var i = 0; i < wlength; i++) {
                        for (var x = week[i].length - 1; x > -1; x--) {
                            if (week[i][x].pos == $(this).attr("data-cell-pos")) {
                                week[i].splice(x, 1)
                            }
                        }
                    }

                    localStorage.setItem("timetable", JSON.stringify(week));

                    create();
                });
                td3.addClass('cell info').appendTo(tr);

                //append row to the table
                tbl.append(tr)
            }
        }

        //apend timetable to the body
        $('#timetable').append(tbl);
    }
}
create()

//sorts week after lowest starting point to the highest staring point
function rearrange() {
    d = new Date();
    n = d.getDay()
    return week[n].sort(function(a, b) {
        var x = a.start;
        var y = b.start;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

//hide the div with the inputs
function hide() {
    $('.inputfield').slideToggle();
}
