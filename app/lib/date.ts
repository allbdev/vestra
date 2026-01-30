export function getDefaultDateRange() {
    const now = new Date();
    const year = now.getFullYear();
    const startDate = new Date(year, 0, 1); // Jan 1
    const endDate = new Date(year, 11, 31); // Dec 31

    return {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
    };
}
