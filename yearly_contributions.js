let yearlyChart = null;

const createYearlyChart = (data) => {
    // 获取当前日期，用于筛选未来日期
    const now = new Date();
    const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    console.log('年度图表当前日期:', currentDateStr);
    
    // 过滤掉未来日期和无效日期
    const validContributions = data.contributions.filter(day => {
        // 检查是否为有效日期
        const dateObj = new Date(day.date);
        if (isNaN(dateObj.getTime())) {
            console.warn('年度图表忽略无效日期:', day);
            return false;
        }
        
        // 检查是否为未来日期
        return day.date <= currentDateStr;
    });
    
    console.log('有效贡献数据条目数:', validContributions.length);

    // 计算总贡献（所有年份的总和）
    const totalContributions = validContributions.reduce((sum, day) => sum + day.count, 0);
    animateNumber('totalContributions', totalContributions);

    // 计算连续贡献
    calculateStreaks(validContributions);

    // 处理年度数据
    const yearlyData = {};
    validContributions.forEach(day => {
        // 从日期字符串中提取年份
        const year = day.date.split('-')[0];
        if (!yearlyData[year]) {
            yearlyData[year] = 0;
        }
        yearlyData[year] += day.count;
    });

    const years = Object.keys(yearlyData).sort();
    const contributions = years.map(year => yearlyData[year]);

    const ctx = document.getElementById('yearlyChart').getContext('2d');

    if (yearlyChart) {
        yearlyChart.destroy();
    }

    // 生成背景颜色渐变
    const backgroundColors = contributions.map(value => {
        // 根据贡献值计算颜色深浅
        const intensity = Math.min(Math.max(value / 500, 0.3), 0.9);
        return `rgba(46, 164, 79, ${intensity})`;
    });

    yearlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: '年度贡献数',
                data: contributions,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(46, 164, 79, 1)',
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 40
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
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].label + '年';
                        },
                        label: function(context) {
                            return `贡献数: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
};

// 计算连续贡献天数
const calculateStreaks = (contributions) => {
    // 确保数据非空
    if (!contributions || contributions.length === 0) {
        console.warn('计算连续贡献时发现空数据');
        animateNumber('currentStreak', 0);
        animateNumber('longestStreak', 0);
        return;
    }
    
    // 获取当前日期（不含时分秒）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 确保按日期排序，从最近到最早
    const sortedContributions = [...contributions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    console.log('计算连续贡献，共有数据点:', sortedContributions.length);
    console.log('最近的贡献日期:', sortedContributions[0]?.date);
    
    // 创建日期到贡献的映射
    const contributionMap = new Map();
    sortedContributions.forEach(item => {
        contributionMap.set(item.date, item.count);
    });
    
    // 计算当前连续贡献
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // 检查最近一次贡献是否是今天或昨天
    const latestContribution = sortedContributions[0];
    const latestDate = latestContribution ? new Date(latestContribution.date) : null;
    latestDate?.setHours(0, 0, 0, 0);
    
    const oneDayMs = 24 * 60 * 60 * 1000;
    const daysSinceLatest = latestDate ? Math.round((today - latestDate) / oneDayMs) : null;
    
    console.log('最新贡献距今天数:', daysSinceLatest);
    
    // 如果最近的贡献不是今天或昨天，当前连续贡献为0
    if (daysSinceLatest === null || daysSinceLatest > 1) {
        console.log('最新贡献不是今天或昨天，当前连续为0');
        currentStreak = 0;
    } else {
        // 从最近的贡献日期开始往前检查
        let streakEndDate = new Date(latestDate);
        
        // 如果最新贡献是昨天而不是今天，那么从昨天开始检查
        if (daysSinceLatest === 1) {
            console.log('最新贡献是昨天');
            streakEndDate = new Date(latestDate);
        } else {
            console.log('最新贡献是今天');
        }
        
        let keepCounting = true;
        
        while (keepCounting) {
            // 格式化日期为YYYY-MM-DD (使用UTC避免时区问题)
            const year = streakEndDate.getFullYear();
            const month = String(streakEndDate.getMonth() + 1).padStart(2, '0');
            const day = String(streakEndDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const count = contributionMap.get(dateStr) || 0;
            
            if (count > 0) {
                currentStreak++;
                console.log(`${dateStr} 有贡献，当前连续: ${currentStreak}`);
                
                // 前一天 (使用setDate以正确处理月份和年份边界)
                streakEndDate.setDate(streakEndDate.getDate() - 1);
            } else {
                console.log(`${dateStr} 无贡献，当前连续中断`);
                keepCounting = false;
            }
        }
    }
    
    // 计算最长连续贡献
    let longestStreak = 0;
    let currentLength = 0;
    let previousDate = null;
    
    // 按日期排序，从最早到最近
    const chronologicalContributions = [...contributions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    for (let i = 0; i < chronologicalContributions.length; i++) {
        const day = chronologicalContributions[i];
        const currentDate = new Date(day.date);
        currentDate.setHours(0, 0, 0, 0);
        
        // 检查是否是连续的日期
        if (previousDate) {
            const diffDays = Math.round((currentDate - previousDate) / oneDayMs);
            
            if (diffDays > 1) {
                // 连续中断，重置当前记录
                currentLength = 0;
            }
        }
        
        if (day.count > 0) {
            currentLength++;
            longestStreak = Math.max(longestStreak, currentLength);
        } else {
            currentLength = 0;
        }
        
        previousDate = currentDate;
    }
    
    // 确保最长连续贡献至少与当前连续贡献一样多
    longestStreak = Math.max(longestStreak, currentStreak);
    
    // 更新统计数据
    animateNumber('currentStreak', currentStreak);
    animateNumber('longestStreak', longestStreak);
    
    console.log(`当前连续贡献: ${currentStreak}天, 最长连续贡献: ${longestStreak}天`);
};

// 数字动画函数
const animateNumber = (elementId, target) => {
    const element = document.getElementById(elementId);
    const duration = 1500;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= target) ||
            (increment < 0 && current <= target)) {
            element.textContent = target;
            return;
        }
        element.textContent = Math.round(current);
        requestAnimationFrame(animate);
    };

    animate();
};

// 重置统计数据
const resetStats = () => {
    // 清空所有统计数据
    ['totalContributions', 'currentStreak', 'longestStreak'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.animation = 'none';
            element.offsetHeight; // 触发重排
            element.style.animation = null;
            element.textContent = '0';
        }
    });
    
    // 清空图表
    if (yearlyChart) {
        yearlyChart.destroy();
        yearlyChart = null;
    }
    
    // 清空月度图表
    if (window.monthlyChart) {
        window.monthlyChart.destroy();
        window.monthlyChart = null;
    }
    
    console.log('所有统计数据已重置');
};

// 刷新数据的函数
const refreshData = () => {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('请输入用户名');
        return;
    }

    // 更新用户头像
    const userAvatar = document.getElementById('userAvatar');
    userAvatar.src = `https://github.com/${username}.png`;
    userAvatar.style.animation = 'none';
    userAvatar.offsetHeight; // 触发重排
    userAvatar.style.animation = 'scaleIn 0.3s ease';

    const refreshBtn = document.getElementById('refreshBtn');
    const spinner = refreshBtn.querySelector('.loading-spinner');
    const buttonText = refreshBtn.querySelector('.button-text');

    refreshBtn.disabled = true;
    spinner.style.display = 'block';
    buttonText.textContent = '加载中...';

    // 先重置统计数字，但不清空图表
    ['totalContributions', 'currentStreak', 'longestStreak'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '0';
        }
    });

    // 添加调试信息
    console.log('开始请求GitHub贡献数据:', username);

    // 更新用户访问计数
    const userCounter = document.querySelector('.user-counter .counter-image');
    if (userCounter) {
        userCounter.src = `https://profile-counter.glitch.me/${username}/count.svg`;
    }

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
        .then(response => {
            if (!response.ok) {
                console.error('API响应错误:', response.status, response.statusText);
                throw new Error(`API响应错误: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('已获得数据:', data);
            
            // 检查数据格式是否正确
            if (!data || !data.contributions || !Array.isArray(data.contributions) || data.contributions.length === 0) {
                console.error('数据格式错误或为空:', data);
                throw new Error('获取的数据格式不正确或为空');
            }
            
            // 检查是否有invalid date
            if (data.contributions.some(item => !item.date || isNaN(new Date(item.date).getTime()))) {
                console.error('数据中包含无效日期');
                // 修复日期格式
                data.contributions = data.contributions.filter(item => {
                    if (!item.date || isNaN(new Date(item.date).getTime())) {
                        console.warn('跳过无效日期:', item);
                        return false;
                    }
                    return true;
                });
                
                if (data.contributions.length === 0) {
                    throw new Error('过滤无效日期后没有可用数据');
                }
            }
            
            // 更新图表和热力图
            createYearlyChart(data);
            createHeatmap(data);
            
            // 调用月度图表创建函数
            if (window.createMonthlyChart) {
                window.createMonthlyChart(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('获取数据时出错: ' + (error.message || '请检查用户名并稍后重试'));
            resetStats();
        })
        .finally(() => {
            refreshBtn.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = '刷新数据';
        });
};

// 修改错误提示
const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <svg class="error-icon" viewBox="0 0 16 16" width="16" height="16">
            <path fill-rule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm0-1.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zm-.75-2.75a.75.75 0 001.5 0v-4a.75.75 0 00-1.5 0v4zm.75-6.5a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
        <span>${message}</span>
    `;

    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const inputSection = document.querySelector('.input-section');
    inputSection.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
};

// 添加事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 刷新按钮点击事件
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }
    
    // 用户名输入框回车键提交
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                refreshData();
            }
        });
    }
    
    // 页面加载时获取默认用户数据
    setTimeout(() => {
        refreshData();
    }, 100);
    
    console.log('事件监听器已设置');
});

// 添加导航栏自动隐藏
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        navbar?.classList.add('hidden');
    } else {
        navbar?.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
}); 