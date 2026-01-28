function hoursBetween(date1, date2) {
  const diff = new Date(date2) - new Date(date1);
  return diff / (1000 * 60 * 60);
}

module.exports = { hoursBetween };
