"use strict";

(function () {
  var showConfirm = function showConfirm(
      message,
      confirmCallback,
      title,
      buttonLabels
    ) {
      var _ref, _ref1;
      if (
        ((_ref = window.navigator) != null
          ? (_ref1 = _ref.notification) != null
            ? _ref1.confirm
            : void 0
          : void 0) != null
      ) {
        window.navigator.notification.confirm(
          message,
          confirmCallback,
          title,
          buttonLabels
        );
      } else {
        confirmCallback.call(this, confirm(message) ? 1 : 2);
      }
    },
    _superClass = Backbone.Model.prototype,
    _syncMethodForModels = {
      sync: function sync() {
        return Backbone.ajaxSync.apply(this, arguments);
      },
    },
    AbstractModel = Backbone.Model.extend(_syncMethodForModels).extend({
      destroy: function destroy(options) {
        options = options || {};
        if (this.collection) {
          options.contentType = "application/json";
          options.data = JSON.stringify({
            client_guid: this.collection && this.collection.client_guid,
          });
        }
        // super call
        return Backbone.Model.prototype.destroy.call(this, options);
      },
    }),
    AbstractCollection = Backbone.Collection.extend(_syncMethodForModels),
    ConfigModel = AbstractModel.extend({
      defaults: {
        is_checkin: false,
        is_checkin_today: true,
      },
      initialize: function initialize(attributes, options) {
        options = options || {};
      },
    }),
    AbstractView = Backbone.View.extend({
      getTodaydate: function () {
        var today = new Date(),
          timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
          options = { timeZone: timeZone },
          dateCheck = today.toLocaleDateString("en-AU", options),
          c = dateCheck.split("/");
        return new Date(c[2], parseInt(c[1]) - 1, c[0]);
      },
      timeConvertor: function (time) {
        var PM = time.match("pm") ? true : false;
        time = time.split(":");
        var min = time[1];
        if (PM) {
          if (time[0] == "12") {
            var hour = parseInt(time[0], 10);
          } else {
            var hour = 12 + parseInt(time[0], 10);
          }
          min = min.replace("pm", "");
        } else {
          if (time[0] == "12") {
            var hour = 0;
          } else {
            var hour = time[0];
          }
          min = min.replace("am", "");
        }
        return hour + ":" + min;
      },
      getMinutes: function (str) {
        var time = str.split(":");
        return time[0] * 60 + time[1] * 1;
      },
      getMinutesNow: function () {
        var timeNow = new Date();
        return timeNow.getHours() * 60 + timeNow.getMinutes();
      },
      currentTimeIsBetweenFromToTime: function (time_from, time_to) {
        var now = this.getMinutesNow();
        var start = this.getMinutes(time_from);
        var end = this.getMinutes(time_to);
        if (start > end) end += getMinutes("24:00");
        return now > start && now < end;
      },
      checkWeekDatesWithCurrentDate: function (
        days,
        date,
        allday,
        time_from,
        time_to
      ) {
        //var dates = this.getWeekDates(days);
        var status = false;
        var current_day = date.getDay();
        if (allday == 1) {
          days = ["0", "1", "2", "3", "4", "5", "6"];
        }
        if (_.indexOf(days, current_day.toString()) != -1) {
          status = true;
        } else {
          return false;
        }
        if (allday == 1) {
          status = true;
        }
        if (
          time_from &&
          time_to &&
          time_from != undefined &&
          time_to != undefined
        ) {
          time_from = this.timeConvertor(time_from);
          time_to = this.timeConvertor(time_to);
          status = this.currentTimeIsBetweenFromToTime(time_from, time_to);
        }
        return status;
      },
      getMonthDates: function (
        month_dates,
        date,
        allday,
        time_from,
        time_to,
        int = ""
      ) {
        if (allday == 1) {
          var day = [];
          for (var x = 1; x <= 31; x++) {
            day.push(x);
          }
          month_dates = day;
        }

        var current_date = date.getDate();
        var status = false;
        if (int == "int") {
          var index = _.indexOf(month_dates, current_date);
        } else {
          var index = _.indexOf(month_dates, current_date.toString());
        }
        if (index != -1) {
          status = true;
        } else {
          return false;
        }
        if (
          time_from &&
          time_to &&
          time_from != undefined &&
          time_to != undefined
        ) {
          time_from = this.timeConvertor(time_from);
          time_to = this.timeConvertor(time_to);
          status = this.currentTimeIsBetweenFromToTime(time_from, time_to);
        }
        return status;
      },
      UpdateGetWeeksInMonth: function (year, month) {
        const weeks = [],
          firstDate = new Date(year, month, 1),
          lastDate = new Date(year, month + 1, 0),
          numDays = lastDate.getDate();

        let dayOfWeekCounter = firstDate.getDay();

        for (let date = 1; date <= numDays; date++) {
          if (dayOfWeekCounter === 0 || weeks.length === 0) {
            weeks.push([]);
          }
          weeks[weeks.length - 1][dayOfWeekCounter] = date;
          dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
        }
        var a_weeks = [];
        weeks.filter((w) => !!w.length).map((w) => w);
        var su = [],
          mo = [],
          tu = [],
          we = [],
          th = [],
          fr = [],
          sa = [];
        for (let day = 0; day < weeks.length; day++) {
          if (weeks[day][0]) {
            su.push(weeks[day][0]);
          }
          if (weeks[day][1]) {
            mo.push(weeks[day][1]);
          }
          if (weeks[day][2]) {
            tu.push(weeks[day][2]);
          }
          if (weeks[day][3]) {
            we.push(weeks[day][3]);
          }
          if (weeks[day][4]) {
            th.push(weeks[day][4]);
          }
          if (weeks[day][5]) {
            fr.push(weeks[day][5]);
          }
          if (weeks[day][6]) {
            sa.push(weeks[day][6]);
          }
        }
        a_weeks.push(su);
        a_weeks.push(mo);
        a_weeks.push(tu);
        a_weeks.push(we);
        a_weeks.push(th);
        a_weeks.push(fr);
        a_weeks.push(sa);
        return a_weeks;
      },
      getMonthlyDay: function (month_days, date, allday, time_from, time_to) {
        var year = date.getFullYear(),
          month = date.getMonth(),
          u_weeks = this.UpdateGetWeeksInMonth(year, month),
          status = false,
          self = this,
          month_dates = [];
        _.each(month_days, function (week_day, index) {
          var week_day_array = week_day.split(",");
          var day = week_day_array[0];
          var week_number = week_day_array[1];
          var currentday = u_weeks[day];
          var o_week_number =
            week_number == "-1" ? currentday.length - 1 : week_number - 1;
          var currentdate = currentday[o_week_number];
          month_dates.push(currentdate);
        });
        month_dates.sort(function (a, b) {
          return a - b;
        });
        status = this.getMonthDates(
          month_dates.toString(),
          date,
          allday,
          time_from,
          time_to,
          "int"
        );
        return status;
      },
      checkDrawDate: function () {
        var content = this.checkInNode().get("content"),
          type_of_days = content.type_of_days,
          allday = content.allday,
          week_days = _.without(content.week_days, ""),
          month_dates = _.without(content.month_dates, ""),
          month_days = _.without(content.month_days, ""),
          everyday = _.without(content.everyday, ""),
          time_from = content.time_from,
          time_to = content.time_to,
          status = true,
          date = this.getTodaydate(),
          $this = this;
        switch (type_of_days) {
          case "weekly":
            console.log("Weekly");
            if (week_days.length > 0) {
              status = this.checkWeekDatesWithCurrentDate(
                week_days,
                $this.getTodaydate(),
                allday,
                time_from,
                time_to
              );
            }
            break;
          case "monthly_day":
            console.log("monthly_day");
            if (month_dates.length > 0) {
              status = this.getMonthDates(
                month_dates,
                $this.getTodaydate(),
                allday,
                time_from,
                time_to
              );
            }
            break;
          case "monthly":
            console.log("monthly");
            if (month_days.length > 0) {
              status = this.getMonthlyDay(
                month_days,
                $this.getTodaydate(),
                allday,
                time_from,
                time_to
              );
            }
            break;
          case "everyday":
            console.log("everyday");
            if (everyday.length > 0) {
              status = this.checkWeekDatesWithCurrentDate(
                everyday,
                $this.getTodaydate(),
                allday,
                time_from,
                time_to
              );
            }
            break;
          default:
            status = true;
        }

        console.log("status", status);
        this.configmodel.set("is_checkin_today", status);
        return status;
      },
    }),
    AppView = AbstractView.extend({
      _connected: false,
      initialize: function initialize(options) {
        options = options || {};
        this.node = options.node;
        this.checkInPageId = options.checkInPageId;
        this.configmodel = options.configmodel;

        var $this = this;
        var is_checkin_today = $this.checkDrawDate();

        if (is_checkin_today) {
          var content = $this.checkInNode().get("content");
          var getPositionOptions = {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 0,
          };
          if (content.available_location === "1") {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function (position) {
                  var data = {};
                  data.lat = position.coords.latitude;
                  data.lng = position.coords.longitude;
                  var radius = content.radius;
                  var radius_km = radius / 1000;
                  var distance = $this.distanceCal(
                    data.lat,
                    data.lng,
                    content.latitude,
                    content.longitude,
                    "K"
                  );
                  if (radius_km >= distance) {
                    //TO DO FUNCTION
                    $this.checkIn($this);
                    console.log("You are in venue");
                    $(".check-in-popup").show();
                    $this.render();
                  } else {
                    $(".isCheckInBtn").removeClass("disableCheckInBtn");
                    $.mobile.hidePageLoadingMsg();
                    showConfirm(
                      "You must be in the venue to Check-in",
                      function () {
                        //TO DO FUNCTION
                      },
                      "NOT IN CHECK-IN LOCATION",
                      "OK"
                    );
                  }
                },
                function (err) {
                  $(".isCheckInBtn").removeClass("disableCheckInBtn");
                  $.mobile.hidePageLoadingMsg();
                  showConfirm(
                    "Error getting current position: " +
                      err.code +
                      ": " +
                      err.message,
                    function () {
                      //TO DO FUNCTION
                    },
                    "Error",
                    "OK"
                  );
                },
                getPositionOptions
              );
            } else {
              $(".isCheckInBtn").removeClass("disableCheckInBtn");
              $.mobile.hidePageLoadingMsg();
              alert("Geolocation is not supported by this browser.");
            }
          } else {
            $this.checkIn($this);
            $(".check-in-popup").show();
            $this.render();
          }
        } else {
          $(".check-in-popup").show();
          $this.render();
          $.mobile.hidePageLoadingMsg();
        }
      },
      render: function () {
        var lastdate = this.getLastDate();

        var content = this.checkInNode().get("content");
        var is_checkin_today = this.configmodel.get("is_checkin_today");

        var is_checkin = this.configmodel.get("is_checkin");

        var html = '<div id="chec-in-section">';
        html += '<div id="close">X</div>';
        html += '<div class="last-check-in">';
        html += content.header_html.replace("data-src", "src");
        if (is_checkin_today) {
          if (!is_checkin) {
            html +=
              '<label id="last_date">' +
              content.already_submitted_html +
              "</label>";
          } else {
            html +=
              '<label id="last_date">' + content.submitted_html + "</label>";
          }

          html += "<span >" + lastdate.pdateString + "</span>";
          html += "<span >" + lastdate.sdateString + "</span>";
        } else {
          var checkin_error_message =
            content.checkin_error_message ||
            "Check-In not allowed today for this venue";

          html += "<span>" + checkin_error_message + ".</span>";
        }

        html += "<br>";
        html += "<span>" + content.footer_html + "</span>";
        html += "</div>";
        html += "</div>";
        this.$el.html(html);
        return this;
      },
      checkIn: function ($this) {
        var lastdate = $this.getLastDate();
        console.log("lastdate  >>>>>>>>>>>>>>>", lastdate);
        var current_date = new Date();
        var last_date = lastdate ? lastdate.lastDate : "";
        if (last_date) {
          last_date.setHours(0, 0, 0, 0);
          current_date.setHours(0, 0, 0, 0);
          console.log("current_date", current_date);
          console.log("last_date", last_date);
          if (current_date == last_date) {
            console.log("CheckOut");
            $this.checkAlreadyCheckedOut();
          }
        }
        if (current_date > last_date || !last_date) {
          console.log("check in");
          $this.checkInNode().create({
            action: "Check In",
          });
          $this.configmodel.set("is_checkin", true);
          //setTimeout(function () {
          $(".isCheckInBtn").removeClass("disableCheckInBtn");
          $.mobile.hidePageLoadingMsg();
          //}, 3000);
        } else {
          $(".isCheckInBtn").removeClass("disableCheckInBtn");
          $.mobile.hidePageLoadingMsg();
        }
      },
      distanceCal: function (lat1, lon1, lat2, lon2, unit) {
        if (lat1 == lat2 && lon1 == lon2) {
          return 0;
        } else {
          var radlat1 = (Math.PI * lat1) / 180;
          var radlat2 = (Math.PI * lat2) / 180;
          var theta = lon1 - lon2;
          var radtheta = (Math.PI * theta) / 180;
          var dist =
            Math.sin(radlat1) * Math.sin(radlat2) +
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          if (dist > 1) {
            dist = 1;
          }
          dist = Math.acos(dist);
          dist = (dist * 180) / Math.PI;
          dist = dist * 60 * 1.1515;
          if (unit == "K") {
            dist = dist * 1.609344;
          }
          if (unit == "N") {
            dist = dist * 0.8684;
          }
          return dist;
        }
      },
      checkInEnable: function () {
        console.log("checkInEnable");
      },
      events: {
        "click #close": "closePopUP",
      },
      closePopUP: function () {
        console.log("closePopUP");
        $(".check-in-popup").hide();
      },
      checkInNode: function () {
        var checkInNodedata = this.node.collection.where({
          _id: parseInt(this.checkInPageId),
          _type: "node",
        });
        return checkInNodedata[0] ? checkInNodedata[0] : "";
      },
      getCheckInNodeData: function () {
        var nodedata = [];
        var nodedata_1 = this.node.collection.where({
          node_id: parseInt(this.checkInPageId),
          _type: "nodedata",
        });
        var nodedata_2 = this.node.collection.where({
          node_id: this.checkInPageId.toString(),
          _type: "nodedata",
        });
        _.each(nodedata_1, function (node1, index) {
          nodedata.push(node1);
        });
        _.each(nodedata_2, function (node2, index) {
          nodedata.push(node2);
        });
        return nodedata;
      },
      getLastDate: function () {
        var nodadata = this.getCheckInNodeData();
        if (nodadata.length != 0) {
          nodadata.sort(function (a, b) {
            return (
              new Date(a.get("updated_at")) - new Date(b.get("updated_at"))
            );
          });
          var updated_at = nodadata[nodadata.length - 1].get("updated_at");
          var sdateString, pdateString, dateString;
          var dateString = new Date(updated_at).toString();
          var pdateString = dateString.split(" ").slice(0, 5).join(" ");
          var sdateString = dateString.split(" ").slice(5).join(" ");
          return {
            pdateString: pdateString,
            sdateString: sdateString,
            lastDate: new Date(updated_at),
          };
        } else {
          return false;
        }
      },
      checkAlreadyCheckedOut: function () {
        this.configmodel.set("is_checkin", false);
      },
    });

  this.getStartCheckInAppFunction = function (view, node) {
    var content =
      node._attributes == undefined
        ? node.get("content")
        : node._attributes.content;
    var nodeindex = node.collection.get("nodeindex");
    var nodeIndexArray = nodeindex.get("nodes");
    console.log("nodeIndexArray", nodeIndexArray[content.checkinpage]);
    var node_link = nodeIndexArray[content.checkinpage]
      ? nodeIndexArray[content.checkinpage].name
      : "";
    if (node_link) {
      view.$("a[href='" + node_link + "']").addClass("isCheckInBtn");
      // need to pass in view and node to get this working.
      view.$(".isCheckInBtn").click(function (e) {
        node.collection.fetch();
        $.mobile.showPageLoadingMsg("a", "Check-in.....");
        $(".isCheckInBtn").addClass("disableCheckInBtn");
        setTimeout(function () {
          var configmodel = new ConfigModel({ is_checkin: false });
          var app = new AppView({
            el: view.$(".check-in-popup")[0],
            node: node,
            configmodel: configmodel,
            checkInPageId: content.checkinpage,
          });
          window.view = view;
          window.app = app;
        }, 3000);
        return false;
      });
    }
  };
}.call(window));
