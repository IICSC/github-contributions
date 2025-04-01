const createHeatmap = (data) => {
    const heatmapContainer = document.getElementById('heatmap');
    if (!heatmapContainer) {
        console.error('找不到热力图容器');
        return;
    }
    
    // 清空容器但保留已有内容的引用
    const oldHeader = heatmapContainer.querySelector('.heatmap-header');
    const oldYearSelector = heatmapContainer.querySelector('.year-selector');
    
    heatmapContainer.innerHTML = '';

    // 创建标题和图标
    const titleContainer = document.createElement('div');
    titleContainer.className = 'heatmap-header';

    const icon = document.createElement('span');
    icon.className = 'contribution-icon';
    icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path fill-rule="evenodd" d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 01-1.484.211c-.04-.282-.163-.547-.37-.847a8.695 8.695 0 00-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.75.75 0 01-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75zM6 15.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM5.75 12a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z"/>
    </svg>`;

    const title = document.createElement('h3');
    title.textContent = '贡献日历';
    title.className = 'heatmap-title';

    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);
    heatmapContainer.appendChild(titleContainer);
    
    // 检查数据是否有效
    if (!data || !data.contributions || data.contributions.length === 0) {
        console.error('热力图数据无效或为空');
        
        // 创建空的贡献日历
        const emptyCalendar = document.createElement('div');
        emptyCalendar.className = 'contribution-calendar';
        emptyCalendar.innerHTML = '<div class="empty-message">暂无贡献数据</div>';
        heatmapContainer.appendChild(emptyCalendar);
        
        return;
    }
    
    console.log('开始创建热力图，数据点数量:', data.contributions.length);

    // 按年份分组数据
    const yearlyData = {};
    data.contributions.forEach(day => {
        try {
            const date = new Date(day.date);
            if (isNaN(date.getTime())) {
                console.warn('忽略无效日期:', day.date);
                return;
            }
            
            const year = date.getFullYear();
            if (!yearlyData[year]) {
                yearlyData[year] = [];
            }
            yearlyData[year].push(day);
        } catch (e) {
            console.error('处理贡献数据时出错:', e);
        }
    });
    
    // 检查是否有有效的年份数据
    if (Object.keys(yearlyData).length === 0) {
        console.error('没有有效的年份数据');
        
        const emptyCalendar = document.createElement('div');
        emptyCalendar.className = 'contribution-calendar';
        emptyCalendar.innerHTML = '<div class="empty-message">无法解析贡献数据</div>';
        heatmapContainer.appendChild(emptyCalendar);
        
        return;
    }

    // 创建年份选择器
    const yearSelector = document.createElement('div');
    yearSelector.className = 'year-selector';

    const years = Object.keys(yearlyData).sort().reverse();
    console.log('可用年份:', years);
    
    if (years.length === 0) {
        console.error('未找到任何年份数据');
        return;
    }
    
    const latestYear = years[0];

    years.forEach((year, index) => {
        const yearBtn = document.createElement('button');
        yearBtn.textContent = year;
        yearBtn.className = 'year-btn';
        yearBtn.style.animationDelay = `${index * 0.1}s`;

        if (year === latestYear) {
            yearBtn.classList.add('active');
        }

        yearBtn.onclick = () => {
            document.querySelectorAll('.year-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            yearBtn.classList.add('active');
            showYearContributions(year, yearlyData[year]);
        };
        yearSelector.appendChild(yearBtn);
    });
    heatmapContainer.appendChild(yearSelector);

    // 创建日历容器
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'contribution-calendar';
    heatmapContainer.appendChild(calendarContainer);

    // 添加图例
    addLegend(heatmapContainer);

    // 立即显示最新年份的数据
    try {
        showYearContributions(latestYear, yearlyData[latestYear]);
    } catch (e) {
        console.error('显示年度贡献时出错:', e);
        calendarContainer.innerHTML = '<div class="empty-message">显示贡献数据时出错</div>';
    }
    
    console.log('热力图创建完成');
};

const showYearContributions = (year, contributions) => {
    const calendarContainer = document.querySelector('.contribution-calendar');
    calendarContainer.classList.add('fade-out');

    setTimeout(() => {
        calendarContainer.innerHTML = '';

        // 创建月份标签
        const monthLabels = document.createElement('div');
        monthLabels.className = 'month-labels';
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].forEach((month, index) => {
            const monthLabel = document.createElement('div');
            monthLabel.className = 'month-label';
            monthLabel.textContent = month + '月';
            monthLabel.style.left = `${index * 4.2 + 3}rem`;
            monthLabels.appendChild(monthLabel);
        });
        calendarContainer.appendChild(monthLabels);

        // 创建周标签
        const weekLabels = document.createElement('div');
        weekLabels.className = 'week-labels';
        ['日', '一', '二', '三', '四', '五', '六'].forEach(label => {
            const weekLabel = document.createElement('div');
            weekLabel.className = 'week-label';
            weekLabel.textContent = label;
            weekLabels.appendChild(weekLabel);
        });
        calendarContainer.appendChild(weekLabels);

        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'contribution-grid';

        // 调试日期格式问题
        console.log('贡献数据第一项:', contributions[0]);
        console.log('处理的年份:', year);

        // 处理数据 - 修复日期格式问题
        const contributionMap = new Map();
        
        // 检查是否有未来日期
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();
        const currentDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
        
        console.log('当前日期:', currentDateStr);
        
        // 按日期排序贡献数据
        const sortedContributions = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
        
        sortedContributions.forEach(day => {
            try {
                // 直接使用原始日期字符串，不进行时区转换
                contributionMap.set(day.date, day.count);
            } catch (e) {
                console.error('处理日期时出错:', day.date, e);
            }
        });

        // 生成当年所有日期并构建日历
        const yearNum = parseInt(year);
        const isLeapYearVal = isLeapYear(yearNum);
        const daysInYear = isLeapYearVal ? 366 : 365;
        
        console.log(`${year}年天数:`, daysInYear, isLeapYearVal ? '(闰年)' : '');

        // 获取该年第一天的星期
        const firstDayOfYear = new Date(yearNum, 0, 1);
        const firstDayWeekday = firstDayOfYear.getDay(); // 0 是星期日，1是星期一...
        
        console.log(`${year}年第一天是星期:`, firstDayWeekday);

        // 生成该年所有日期
        const allDates = [];
        
        // 添加上一年的日期以填充第一周
        for (let i = 0; i < firstDayWeekday; i++) {
            const prevYearDate = new Date(yearNum - 1, 11, 31 - firstDayWeekday + i + 1);
            allDates.push(prevYearDate);
        }
        
        // 添加当年所有日期
        for (let i = 1; i <= daysInYear; i++) {
            const currentDate = new Date(yearNum, 0, i);
            allDates.push(currentDate);
        }
        
        // 如果需要，添加下一年的日期以填充最后一周
        const lastDayOfYear = new Date(yearNum, 11, 31);
        const lastDayWeekday = lastDayOfYear.getDay();
        if (lastDayWeekday < 6) {
            for (let i = 1; i <= 6 - lastDayWeekday; i++) {
                const nextYearDate = new Date(yearNum + 1, 0, i);
                allDates.push(nextYearDate);
            }
        }
        
        console.log('日历总日期数:', allDates.length);

        // 创建日历网格
        const weeksCount = Math.ceil(allDates.length / 7);
        console.log('日历总周数:', weeksCount);
        
        // 以7x53的网格显示
        const grid = Array(7).fill().map(() => Array(weeksCount).fill(null));
        
        // 填充日期到网格
        allDates.forEach((date, index) => {
            const col = Math.floor(index / 7);
            const row = index % 7;
            grid[row][col] = date;
        });

        // 创建日历单元格
        grid.forEach((row, rowIndex) => {
            row.forEach((date, colIndex) => {
                if (!date) return;

                const cell = document.createElement('div');
                cell.className = 'contribution-cell';

                // 格式化日期为YYYY-MM-DD，与API返回格式一致
                const formattedYear = date.getFullYear();
                const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
                const formattedDay = String(date.getDate()).padStart(2, '0');
                const formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
                
                // 检查是否为未来日期
                const isFutureDate = formattedDate > currentDateStr;
                
                // 获取贡献数
                const count = isFutureDate ? 0 : (contributionMap.get(formattedDate) || 0);

                // 为调试添加日期属性
                cell.setAttribute('data-date', formattedDate);
                if (isFutureDate) {
                    cell.setAttribute('data-future', 'true');
                }
                
                // 设置贡献等级
                if (isFutureDate) {
                    cell.classList.add('future-date');
                    cell.classList.add('level-0');
                } else {
                    if (count === 0) cell.classList.add('level-0');
                    else if (count <= 3) cell.classList.add('level-1');
                    else if (count <= 6) cell.classList.add('level-2');
                    else if (count <= 9) cell.classList.add('level-3');
                    else cell.classList.add('level-4');
                }

                // 添加提示信息
                const displayDate = `${formattedYear}年${date.getMonth() + 1}月${date.getDate()}日`;
                cell.title = isFutureDate ? `${displayDate}: 未来日期` : `${displayDate}: ${count} 次贡献`;

                // 如果日期不在当前年份内，添加淡化效果
                if (formattedYear !== yearNum) {
                    cell.classList.add('outside-month');
                }

                // 添加动画延迟
                const delay = Math.min((rowIndex * weeksCount + colIndex) * 0.001, 0.3);
                cell.style.animationDelay = `${delay}s`;

                gridContainer.appendChild(cell);
            });
        });

        calendarContainer.appendChild(gridContainer);

        calendarContainer.classList.remove('fade-out');
        calendarContainer.classList.add('fade-in');

        setTimeout(() => {
            calendarContainer.classList.remove('fade-in');
        }, 300);
    }, 300);
};

// 辅助函数：判断是否为闰年
function isLeapYear(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}

const addLegend = (container) => {
    const legend = document.createElement('div');
    legend.className = 'contribution-legend';
    legend.innerHTML = `
        <span>贡献度: </span>
        <div class="legend-item">
            <div class="legend-color level-0"></div>
            <span>0</span>
        </div>
        <div class="legend-item">
            <div class="legend-color level-1"></div>
            <span>1-3</span>
        </div>
        <div class="legend-item">
            <div class="legend-color level-2"></div>
            <span>4-6</span>
        </div>
        <div class="legend-item">
            <div class="legend-color level-3"></div>
            <span>7-9</span>
        </div>
        <div class="legend-item">
            <div class="legend-color level-4"></div>
            <span>10+</span>
        </div>
    `;
    container.appendChild(legend);
};

// 假设我们从API获取数据后调用这个函数
fetch('https://github-contributions-api.jogruber.de/v4/WuXiaoMuer')
    .then(response => response.json())
    .then(data => createHeatmap(data))
    .catch(error => console.error('Error:', error)); 