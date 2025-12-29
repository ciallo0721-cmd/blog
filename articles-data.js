// articles-data.js
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
        }
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