// articles-data.js - 文章数据源
// 由 admin.py 管理，请勿手动修改
// 最后更新：2026-05-01 05:07:59

window.articlesData = {
    articles: [
        {
            id: 14,
            title: "再见，白菜",
            excerpt: "2026年5月1日，真白花音正式毕业了。再见，我的第一个V，再见，白菜。",
            date: "2026-05-01",
            tags: ["VTuber", "真白花音", "毕业", "告别"],
            fileName: "14/",
            readTime: 2,
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
        if (excludeId) filtered = filtered.filter(article => article.id !== excludeId);
        return filtered.slice(0, limit);
    }
};