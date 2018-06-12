function formatJson(json) {
  // FIXME modify api to serve well formated informations
  json = json.conferences[0];
  var data = {};
  var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (var i = 0; i < days.length; i++) {
    if (days[i] != "friday") data[days[i]] = [];
  }

  var roomsLen = json.rooms.length;
  for (var i = 0; i < roomsLen; i++) {
    var room = json.rooms[i];
    var evLen = room.events.length;

    for (var j = 0; j < evLen; j++) {
      var ev = room.events[j];

      var date = new Date(ev.start_time);
      var day = days[date.getDay()];
      var daypart;

      if (data[day][ev.track_id] === undefined) {
        data[day][ev.track_id] = {
          track: json.tracks[ev.track_id - 1],
          morning: [],
          afternoon: []
        };
      }

      if (date.getUTCHours() <= 12) {
        daypart = data[day][ev.track_id].morning;
      } else {
        daypart = data[day][ev.track_id].afternoon;
      }

      ev.date = date.getUTCHours() * 100 + date.getUTCMinutes();
      var daypartLen = daypart.length;
      if (daypartLen === 0) {
        daypart.push(ev);
      } else {
        for (var a = 0; a < daypartLen; a++) {
          if (daypart[a].date > ev.date) {
            daypart.splice(a - 1, 0, ev);
          }
        }
      }
    }
  }

  for (var day in data) {
    if (data.hasOwnProperty(day)) {
      buildTable(data[day], day);
    }
  }

}

function buildTable(data, day) {
  var tbody = document.querySelector("table");
  var doc = document.createElement("tbody");
  doc.classList.add("overflow");
  doc.id = day;
  if (day != "saturday") {
    doc.classList.add("hide");
  }

  for (var i = 0; i < data.length; i++) {
    if (data[i]) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.innerHTML = data[i].track.name;
      tr.appendChild(th);

      var morning = document.createElement("td");
      for (var j = 0; j < data[i].morning.length; j++) {
        morning.appendChild(buildArticle(data[i].morning[j]))
      }
      tr.appendChild(morning);

      var afternoon = document.createElement("td");
      for (var j = 0; j < data[i].afternoon.length; j++) {
        afternoon.appendChild(buildArticle(data[i].afternoon[j]))
      }
      tr.appendChild(afternoon);

      doc.appendChild(tr);
    }
  }
  tbody.appendChild(doc);
}

function buildArticle(ev) {
  var article = document.createElement("article");
  var title = document.createElement("h3");
  title.innerHTML = ev.title;
  var speaker = document.createElement("p");
  speaker.innerHTML = ev.speaker_names ;
  article.appendChild(title);
  article.appendChild(speaker);
  article.setAttribute("data-type", ev.event_type_id);

  return article;
}

var baseUrl = "https://2018.rmll.info/api/v1/conferences/rmll2018/";
readJSONFile(baseUrl, formatJson);

var daysbutton = document.querySelectorAll(".sheets a");
for (var i = 0; i < daysbutton.length; i++) {
  daysbutton[i].addEventListener("click", function (e) {
    document.querySelector("tbody:not(.hide)").classList.add("hide");
    document.getElementById(e.target.dataset.toggle).classList.remove("hide");
  });
}
