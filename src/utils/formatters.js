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
