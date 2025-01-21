let yearlyChart = null;

const createYearlyChart = (data) => {
    // 计算总贡献（所有年份的总和）
    const totalContributions = data.contributions.reduce((sum, day) => sum + day.count, 0);
    animateNumber('totalContributions', totalContributions);

    // 计算连续贡献
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // 按日期排序，确保是按时间顺序计算
    const sortedContributions = [...data.contributions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    sortedContributions.forEach(day => {
        if (day.count > 0) {
            tempStreak++;
            currentStreak = tempStreak;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    });

    // 更新统计数据
    animateNumber('currentStreak', currentStreak);
    animateNumber('longestStreak', longestStreak);

    // 处理年度数据
    const yearlyData = {};
    data.contributions.forEach(day => {
        const year = new Date(day.date).getFullYear();
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

    yearlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: '年度贡献数',
                data: contributions,
                backgroundColor: 'rgba(46, 164, 79, 0.6)',
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
                }
            }
        }
    });
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

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.contributions && data.contributions.length > 0) {
                createYearlyChart(data);
                createHeatmap(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('请输入正确的用户名');
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

// 重置统计数据
const resetStats = () => {
    ['totalContributions', 'currentStreak', 'longestStreak'].forEach(id => {
        const element = document.getElementById(id);
        element.style.animation = 'none';
        element.offsetHeight; // 触发重排
        element.style.animation = null;
        element.textContent = '0';
    });
};

// 添加事件监听
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    // 页面加载时获取默认用户数据
    refreshData();
});

// 添加导航栏自动隐藏
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
}); 