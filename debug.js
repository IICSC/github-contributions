// 调试脚本 - 可通过浏览器控制台运行
// 使用方法: 打开浏览器控制台，复制粘贴此脚本并执行

(function() {
    console.log("=== GitHub贡献统计调试工具 ===");
    console.log("浏览器时区信息:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log("时区偏移量(小时):", -new Date().getTimezoneOffset() / 60);
    
    // 测试日期
    const testDate = new Date();
    console.log("当前日期:", testDate.toISOString());
    console.log("本地日期格式:", testDate.toLocaleDateString());
    
    // 测试API请求
    const testUsername = document.getElementById('username').value.trim() || 'WuXiaoMuer';
    console.log("测试用户名:", testUsername);
    
    fetch(`https://github-contributions-api.jogruber.de/v4/${testUsername}`)
        .then(response => {
            console.log("API响应状态:", response.status, response.statusText);
            return response.json();
        })
        .then(data => {
            console.log("API返回数据:", data);
            
            if (data && data.contributions && data.contributions.length > 0) {
                const firstItem = data.contributions[0];
                const lastItem = data.contributions[data.contributions.length - 1];
                
                console.log("第一条贡献记录:", firstItem);
                console.log("最后一条贡献记录:", lastItem);
                
                // 检查日期范围
                const startDate = new Date(data.contributions[0].date);
                const endDate = new Date(data.contributions[data.contributions.length - 1].date);
                
                console.log("贡献日期范围:", startDate.toISOString(), "至", endDate.toISOString());
                console.log("总贡献天数:", data.contributions.length);
                
                // 按年份统计
                const yearCounts = {};
                data.contributions.forEach(item => {
                    const year = new Date(item.date).getFullYear();
                    if (!yearCounts[year]) {
                        yearCounts[year] = 0;
                    }
                    yearCounts[year]++;
                });
                
                console.log("各年份贡献天数:", yearCounts);
                
                // 检查是否有无效日期
                const invalidDates = data.contributions.filter(item => 
                    !item.date || isNaN(new Date(item.date).getTime())
                );
                
                if (invalidDates.length > 0) {
                    console.error("发现无效日期:", invalidDates);
                } else {
                    console.log("未发现无效日期");
                }
                
                // 显示热力图中的日期匹配情况
                if (typeof isLeapYear === 'function') {
                    // 检查当前年份
                    const currentYear = new Date().getFullYear();
                    console.log(`${currentYear}是${isLeapYear(currentYear) ? '闰年' : '平年'}`);
                    
                    // 检查某个特定年份的日期
                    const targetYear = 2024;
                    const daysInYear = isLeapYear(targetYear) ? 366 : 365;
                    console.log(`${targetYear}年共${daysInYear}天`);
                    
                    // 检查API返回的2024年数据
                    const year2024Data = data.contributions.filter(item => 
                        item.date.startsWith('2024-')
                    );
                    
                    console.log(`API返回的${targetYear}年数据:`, year2024Data.length, "条");
                }
            } else {
                console.error("API返回的数据格式不正确或为空");
            }
        })
        .catch(error => {
            console.error("API请求失败:", error);
        });
        
    // 检查DOM元素
    console.log("热力图容器:", document.getElementById('heatmap'));
    console.log("月度图表容器:", document.getElementById('monthlyChart'));
    console.log("年度图表容器:", document.getElementById('yearlyChart'));
})(); 