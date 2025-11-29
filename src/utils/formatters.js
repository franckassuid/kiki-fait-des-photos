export const formatExposureTime = (value) => {
    if (!value) return '';

    // If it's already a string with '/', return it
    if (typeof value === 'string' && value.includes('/')) return value;

    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return value;

    if (num >= 1) return num + 's';

    const denominator = Math.round(1 / num);
    return `1/${denominator}s`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    // Format: "YYYY:MM:DD HH:MM:SS"
    const parts = dateString.split(' ');
    if (parts.length === 0) return dateString;

    const dateParts = parts[0].split(':');
    if (dateParts.length !== 3) return dateString;

    const [year, month, day] = dateParts;
    return `${day}/${month}/${year}`;
};
