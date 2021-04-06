
const calculateDate = dateScrapped => {
  var dateCalculated = new Date();

  if (dateScrapped.includes("now")) {
    return dateCalculated.toLocaleString();
  } else if (dateScrapped.includes("min")) {
    var mins = dateScrapped.substr(0, dateScrapped.indexOf(" "));
    dateCalculated.setMinutes(dateCalculated.getMinutes() - mins);
    return dateCalculated.toLocaleString();
  } else if (dateScrapped.includes("hr")) {
    var hours = dateScrapped.substr(0, dateScrapped.indexOf(" "));
    dateCalculated.setHours(dateCalculated.getHours() - hours);
    return dateCalculated.toLocaleString();
  } else if (dateScrapped.includes("Yesterday")) {
    //  Yesterday at 11:48 AM
    dateCalculated.setHours(dateCalculated.getHours() - 24);
    dateCalculated.setHours(0);
    dateCalculated.setMinutes(0);
    dateCalculated.setSeconds(0);
    var date = dateScrapped.split(" ");
    var hours = date[2].split(":")[0];
    var mins = date[2].split(":")[1];
    var mode = date[3];
    if (mode === "PM") {
      hours = parseInt(hours) + 12;
    }
    dateCalculated.setHours(hours);
    dateCalculated.setMinutes(mins);

    return dateCalculated.toLocaleString();
  } else if (dateScrapped.includes(",")) {
    // December 17, 2020 at 11:24 PM

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    var date = dateScrapped.split(" ");
    var month = date[0];
    var day = date[1].split(",")[0];
    var year = date[2];
    var hours = date[4].split(":")[0];
    var mins = date[4].split(":")[1];
    var mode = date[5];

    if (mode === "PM") {
      hours = parseInt(hours) + 12;
    }
    var result = new Date(year, months.indexOf(month), day, hours, mins);

    return result.toLocaleString();
  } else {
    //  March 31 at 4:01 PM

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    var date = dateScrapped.split(" ");
    var month = date[0];
    var day = date[1];
    var hours = date[3].split(":")[0];
    var mins = date[3].split(":")[1];
    var mode = date[4];

    if (mode === "PM") {
      hours = parseInt(hours) + 12;
    }

    var result = new Date(
      dateCalculated.getFullYear(),
      months.indexOf(month),
      day,
      hours,
      mins
    );
    
    return result.toLocaleString();
  }
};


module.exports = calculateDate;
