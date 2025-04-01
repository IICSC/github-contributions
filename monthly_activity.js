const processMonthlyData = (contributions) => {
    const monthlyData = {};

    // 添加调试信息
    console.log('开始处理月度数据，总条目数:', contributions?.length || 0);
    
    // 检查数据是否有效
    if (!contributions || !Array.isArray(contributions) || contributions.length === 0) {
        console.warn('月度数据为空或无效');
        return {};
    }
    
    // 获取当前日期，用于筛选未来日期
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    
    console.log('月度图表当前日期:', currentDateStr);

    // 按日期排序
    const sortedContributions = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

    sortedContributions.forEach(day => {
        try {
            // 检查是否为未来日期
            if (day.date > currentDateStr) {
                // 跳过未来日期
                return;
            }
            
            // 检查日期有效性
            const dateObj = new Date(day.date);
            if (isNaN(dateObj.getTime())) {
                console.warn('月度图表忽略无效日期:', day);
                return;
            }

            // 提取年月
            const [yearStr, monthStr] = day.date.split('-');
            const monthKey = `${yearStr}-${monthStr}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += day.count;
        } catch (e) {
            console.error('处理月度数据时出错:', e, day);
        }
    });

    // 按时间顺序排序月份
    const sortedData = {};
    Object.keys(monthlyData)
        .sort()
        .forEach(key => {
            sortedData[key] = monthlyData[key];
        });

    console.log('月度数据处理完成，月份数:', Object.keys(sortedData).length);
    return sortedData;
};

document.addEventListener('DOMContentLoaded', () => {
    // monthly_activity.js中的图表将通过refreshData函数触发创建
    // 此处不需要直接初始化
    console.log('月度活动图表模块已加载');
});

window.createMonthlyChart = (data) => {
    if (!data || !data.contributions || !Array.isArray(data.contributions)) {
        console.error('月度图表创建失败: 无效数据格式', data);
        return;
    }

    console.log('开始创建月度图表');
    const ctx = document.getElementById('monthlyChart')?.getContext('2d');
    if (!ctx) {
        console.error('找不到月度图表canvas元素');
        return;
    }

    try {
        const monthlyData = processMonthlyData(data.contributions);
        
        if (window.monthlyChart) {
            window.monthlyChart.destroy();
        }
        
        const labels = Object.keys(monthlyData);
        const values = Object.values(monthlyData);
        
        if (labels.length === 0) {
            console.warn('没有月度数据可显示');
            return;
        }
        
        // 格式化标签，将YYYY-MM转换为YYYY年MM月
        const formattedLabels = labels.map(label => {
            const [year, month] = label.split('-');
            return `${year}年${parseInt(month)}月`;
        });
        
        // 生成背景颜色渐变
        const backgroundColors = values.map((value, index) => {
            // 根据贡献值计算颜色深浅
            const alpha = Math.min(Math.max(value / 100, 0.1), 0.5);
            return `rgba(75, 192, 192, ${alpha})`;
        });
        
        window.monthlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: [{
                    label: '月度贡献',
                    data: values,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: backgroundColors,
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `贡献数: ${context.raw}`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('月度图表创建成功');
    } catch (e) {
        console.error('创建月度图表时出错:', e);
    }
}; 