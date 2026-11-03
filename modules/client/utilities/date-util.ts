export const dateToString = (date: Date) => {
  let d = new Date(date);
  // d.setHours(d.getHours() + 4);
  const str =
    d.getFullYear() +
    "-" +
    (d.getMonth() < 9 ? "0" : "") +
    (d.getMonth() + 1) +
    "-" +
    (d.getDate() < 10 ? "0" : "") +
    d.getDate();
  return str;
};

export function dateTimeToString(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  const hr = (hours < 10 ? "0" : "") + hours;
  const min = (minutes < 10 ? "0" : "") + minutes;
  const sec = (seconds < 10 ? "0" : "") + seconds;
  const ms = (milliseconds < 10 ? "00" : milliseconds < 100 ? "0" : "") + milliseconds;
  const dateStr = `${year}-${(month < 10 ? "0" : "") + month}-${(day < 10 ? "0" : "") + day}`;
  const timeStr = `${hr}:${min}:${sec}.${ms}`;
  return dateStr + ", " + timeStr;
}

export function dateTimeToISOString(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  const hr = (hours < 10 ? "0" : "") + hours;
  const min = (minutes < 10 ? "0" : "") + minutes;
  const sec = (seconds < 10 ? "0" : "") + seconds;
  const ms = (milliseconds < 10 ? "00" : milliseconds < 100 ? "0" : "") + milliseconds;
  const dateStr = `${year}-${(month < 10 ? "0" : "") + month}-${(day < 10 ? "0" : "") + day}`;
  const timeStr = `${hr}:${min}:${sec}.${ms}`;
  return dateStr + "T" + timeStr + "Z";
}

export const getHHMMSS = (minutes: number) => {
  const mins = Math.abs(minutes);
  const m = Math.floor(mins % 60);
  const h = (mins - (mins % 60)) / 60;
  const s = Math.floor(((mins % 60) - m) * 60);
  const label =
    (minutes < 0 ? "-" : "") + (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  return label;
};

export function dateTimeToStringExport(date: Date) {
  let d = new Date(date);
  const timezone = d.getTimezoneOffset() / 60;
  console.info(`TimeZone: ${timezone}`);
  d.setHours(d.getHours() + timezone * 2);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const milliseconds = d.getMilliseconds();
  const hr = (hours < 10 ? "0" : "") + hours;
  const min = (minutes < 10 ? "0" : "") + minutes;
  const sec = (seconds < 10 ? "0" : "") + seconds;
  const ms = (milliseconds < 10 ? "00" : milliseconds < 100 ? "0" : "") + milliseconds;
  const dateStr = `${year}-${(month < 10 ? "0" : "") + month}-${(day < 10 ? "0" : "") + day}`;
  const timeStr = `${hr}:${min}:${sec}.${ms}`;
  console.info(dateStr + ", " + timeStr);
  return dateStr + ", " + timeStr;
}
