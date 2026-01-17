// articles-data.js 更新后内容
window.articlesData = {
    articles: [
        {
            id: 1,
            title: "UTAU教程：从调音到发布完全指南",
            excerpt: "学习如何使用UTAU进行歌声合成，从基础调音到高级技巧，完整指南带你入门。",
            date: "2025-12-28",
            tags: ["UTAU", "虚拟歌姬", "调音", "歌声合成", "教程", "音乐制作"],
            fileName: "1.html",
            readTime: 15,
            featured: true
        },
        {
            id: 2,
            title: "Unity 2D角色移动系统完全指南",
            excerpt: "从零开始构建一个完整的2D角色移动系统，包含平滑移动、跳跃、冲刺和动画控制。",
            date: "2025-12-29",
            tags: ["Unity", "2D游戏开发", "角色移动", "C#编程", "游戏物理"],
            fileName: "2.html",
            readTime: 20,
            featured: true
        },
        {
            id: 3,
            title: "2.5头身小人绘画全攻略：从基础到头发细节",
            excerpt: "本教程将详细讲解如何绘制可爱的2.5头身小人，涵盖比例结构、面部表情、头发与呆毛绘制技巧，适合初学者和有一定基础的画手。",
            date: "2025-12-30",
            tags: ["绘画教程", "Q版人物", "2.5头身", "头发绘制", "呆毛技巧", "角色设计"],
            fileName: "3.html",
            readTime: 15,
            featured: true,
        },
        {
            id: 4,
            title: "关于为什么主页变成了这样",
            excerpt: "网站被攻击、性能问题大揭秘！详细解释网站主页暂时变成公告页面的原因，以及维护到1月18日的恢复计划。",
            date: "2026-01-10",
            tags: ["网站公告", "被攻击", "性能优化", "DDoS攻击", "维护", "GitHub Pages", "未来计划"],
            fileName: "4.html",
            readTime: 15,
            featured: true,
        },
        {
            id: 5,
            title: "主页大更新",
            excerpt: "修复了加载时间过长的问题,更新音乐播放器",
            date: "2026-01-13",
            tags: ["主页", "更新", "新设计", "用户体验", "功能改进"],
            fileName: "5.html",
            readTime: 7,
            featured: true,
        },
        {
            id: 6,
            title: "闲聊",
            excerpt: "......",
            date: "2026-01-13",
            tags: ["闲聊"],
            fileName: "6.html",
            readTime: 4,
            featured: true,
        },
        {
              id: 7,
              title: "新歌姬发布",
              excerpt: "新歌姬发布：沙雕の贤者V2 正式上线！",
              date: "2026-01-17",
              tags: ["UTAU","虚拟歌姬","沙雕の贤者","音源发布"],
              fileName: "7.html",
              readTime: 3,
              featured: true,
       },
    ],
    
    getSortedArticles: function() {
        return [...this.articles].sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    getArticleById: function(id) {
        return this.articles.find(article => article.id === id);
    },
    
    getAdjacentArticles: function(id) {
        const sorted = this.getSortedArticles();
        const index = sorted.findIndex(article => article.id === id);
        
        return {
            prev: index < sorted.length - 1 ? sorted[index + 1] : null,
            next: index > 0 ? sorted[index - 1] : null
        };
    },
    
    getFeaturedArticles: function(excludeId = null, limit = 3) {
        let filtered = this.getSortedArticles();
        
        if (excludeId) {
            filtered = filtered.filter(article => article.id !== excludeId);
        }
        
        return filtered.slice(0, limit);
    }
};