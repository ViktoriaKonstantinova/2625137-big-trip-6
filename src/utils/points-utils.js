function isFuturePoint(point) {
  const now = new Date();
  const pointDate = new Date(point.dateFrom);
  return pointDate > now;
}

function isExpiredPoint(point) {
  const now = new Date();
  const pointDate = new Date(point.dateTo);
  return pointDate < now;
}

function isActualPoint(point) {
  const now = new Date();
  const startDate = new Date(point.dateFrom);
  const endDate = new Date(point.dateTo);
  return startDate <= now && endDate >= now;
}

export { isFuturePoint, isExpiredPoint, isActualPoint };
