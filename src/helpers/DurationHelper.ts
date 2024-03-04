const DurationHelper = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours} saat ${remainingMinutes} dakika`;
    } else {
        return `${remainingMinutes} dakika`;
    }
}

export default DurationHelper;
