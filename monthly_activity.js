const processMonthlyData = (contributions) => {
    const monthlyData = {};
    
    contributions.forEach(day => {
        const date = new Date(day.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()+1}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += day.count;
    });
    
    return monthlyData;
};

const ctx = document.getElementById('monthlyChart').getContext('2d');
const monthlyData = processMonthlyData(data.contributions);

new Chart(ctx, {
    type: 'line',
    data: {
        labels: Object.keys(monthlyData),
        datasets: [{
            label: '月度贡献',
            data: Object.values(monthlyData),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    }
}); 