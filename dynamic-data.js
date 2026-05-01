// ⚠️ 此文件由 GitHub Actions 自动生成，请勿手动修改
// 上次更新：2026-04-30 19:35:06（北京时间）
window.dynamicData = {
    // 当前时间信息
    currentTime: {
        datetime: "2026-04-30 19:35:06",
        date: "2026-04-30",
        time: "19:35",
        timestamp: 1777548906,
        timezone: "Asia/Shanghai (UTC+8)"
    },
    // 站点统计
    siteStats: {
        articles: 14,
        totalWords: 33404,
        daysRunning: 193,
        siteStartDate: "2025-10-20",
        totalCommits: 2,
        latestCommit: "3461e6d fix: 修复推荐文章/上一篇下一篇链接路径 blog/id/id 双重叠加 bug",
        siteStatus: "正常"
    },
    // 版本信息
    version: {
        generatedAt: "2026-04-30 19:35:06",
        workflowRun: "25163128586",
        workflowRunNumber: "6"
    }
};

// 生成"站点已运行 X 天"的动态显示函数
window.getSiteAge = function() {
    // 从 2025-10-20 起算，实时计算
    var start = new Date('2025-10-20T00:00:00+08:00');
    var now = new Date();
    return Math.floor((now - start) / 86400000) + ' 天';
};

// 生成"当前有 X 篇文章"的动态显示函数
window.getArticleCount = function() {
    return 14;
};

// 获取格式化的最后更新时间
window.getLastUpdate = function() {
    if (window.dynamicData && window.dynamicData.currentTime) {
        return window.dynamicData.currentTime.datetime;
    }
    return "未知";
};
