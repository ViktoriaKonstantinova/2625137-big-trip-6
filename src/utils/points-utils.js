import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

function toDate(date) {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    return new Date(date);
  }
  return new Date(date);
}

export function formatDate(date, format) {
  const d = toDate(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  if (format === 'd/m/y H:i') {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  if (format === 'MMM D') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
  if (format === 'HH:mm') {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return dayjs(d).format(format);
}

export function formatDuration(dateFrom, dateTo) {
  const diff = new Date(dateTo) - new Date(dateFrom);
  if (diff < 0) {
    return '00M';
  }
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  const remainMinutes = minutes % 60;

  if (days > 0) {
    return `${String(days).padStart(2, '0')}D ${String(remainHours).padStart(2, '0')}H ${String(remainMinutes).padStart(2, '0')}M`;
  }
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}H ${String(remainMinutes).padStart(2, '0')}M`;
  }
  return `${String(minutes).padStart(2, '0')}M`;
}

export function isFuturePoint(point) {
  return dayjs(toDate(point.dateFrom)).isAfter(dayjs());
}

export function isExpiredPoint(point) {
  return dayjs(toDate(point.dateTo)).isBefore(dayjs());
}

export function isActualPoint(point) {
  const now = dayjs();
  return dayjs(toDate(point.dateFrom)).isBefore(now) && dayjs(toDate(point.dateTo)).isAfter(now);
}

export function isEscapeKey(evt) {
  return evt.key === 'Escape' || evt.key === 'Esc';
}
