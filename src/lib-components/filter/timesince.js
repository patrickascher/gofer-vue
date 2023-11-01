import moment from 'moment'

export function timeSince (value) {
    if (!value) return '';

    const now = moment();
    const date = moment(value);
    const diff = now.diff(date, 'seconds');

    if (diff < 60) {
        return `${diff} second${diff > 1 ? 's' : ''} ago`;
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diff < 604800) {
        const days = Math.floor(diff / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diff < 2419200) {
        const weeks = Math.floor(diff / 604800);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diff < 29030400) {
        const months = Math.floor(diff / 2419200);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(diff / 29030400);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}