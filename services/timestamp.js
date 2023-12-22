// timestamp.js
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.getHours()}:${
    (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
  }`;
}
module.exports = {
  formatTimestamp,
};
