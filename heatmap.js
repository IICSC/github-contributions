const createHeatmap = (data) => {
    const heatmapContainer = document.getElementById('heatmap');
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

    // 按年份分组数据
    const yearlyData = {};
    data.contributions.forEach(day => {
        const year = new Date(day.date).getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = [];
        }
        yearlyData[year].push(day);
    });

    // 创建年份选择器
    const yearSelector = document.createElement('div');
    yearSelector.className = 'year-selector';

    const years = Object.keys(yearlyData).sort().reverse();
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
    showYearContributions(latestYear, yearlyData[latestYear]);
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

        // 处理数据
        const contributionMap = new Map(
            contributions.map(day => {
                // 转换为本地时间
                const date = new Date(day.date);
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                return [localDate.toISOString().split('T')[0], day.count];
            })
        );

        // 计算该年第一天是星期几
        const firstDay = new Date(year, 0, 1);
        const startOffset = firstDay.getDay();

        // 计算上一年的最后几天
        const lastYearDays = [];
        for (let i = startOffset - 1; i >= 0; i--) {
            const date = new Date(year, 0, -i);
            // 转换为本地时间
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            lastYearDays.push(localDate);
        }

        // 生成所有日期
        const allDates = [
            ...lastYearDays,
            ...Array.from({ length: 365 }, (_, i) => {
                const date = new Date(year, 0, i + 1);
                // 转换为本地时间
                return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            })
        ];

        // 创建7x53的网格
        const grid = Array(7).fill().map(() => Array(53).fill(null));

        // 填充日期到网格
        allDates.forEach((date, index) => {
            const col = Math.floor(index / 7);
            const row = index % 7;
            grid[row][col] = date;
        });

        // 根据网格创建格子
        grid.forEach((row, rowIndex) => {
            row.forEach((date, colIndex) => {
                if (!date) return;

                const cell = document.createElement('div');
                cell.className = 'contribution-cell';

                const dateStr = date.toISOString().split('T')[0];
                const count = contributionMap.get(dateStr) || 0;

                // 设置贡献等级
                if (count === 0) cell.classList.add('level-0');
                else if (count <= 3) cell.classList.add('level-1');
                else if (count <= 6) cell.classList.add('level-2');
                else if (count <= 9) cell.classList.add('level-3');
                else cell.classList.add('level-4');

                // 添加提示信息
                const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
                cell.title = `${formattedDate}: ${count} 次贡献`;

                // 如果日期不在当前年份内，添加淡化效果
                if (date.getFullYear() !== parseInt(year)) {
                    cell.classList.add('outside-month');
                }

                // 添加动画延迟
                const delay = Math.min((rowIndex * 53 + colIndex) * 0.001, 0.3);
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