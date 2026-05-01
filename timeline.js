window.timelineData = [
            {
                date: "2026年4月29日",
                title: "新增文章 · 真白花音告别",
                desc: "发布文章《再见了，我的白菜——写给真白花音的告别》，纪念B站第一日V真白花音于5月1日正式毕业的说～ 🌷"
            },
            {
                date: "2026年4月29日",
                title: "帮助中心改为 Cloudflare 错误码说明",
                desc: "将帮助中心的错误码说明统一为 Cloudflare 相关错误，移除了自定义错误码，更准确地反映本站使用的CDN架构的说～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年4月23日",
                title: "新建游戏 - 迪克打飞机",
                desc: "新增小游戏《迪克打飞机》，躲避敌人弹幕并收集能量，挑战最高分纪录！现已上线游戏区，快去试试吧～ (✧ω✧)"
            },
            {
                date: "2026年4月20日",
                title: "新增广告位",
                desc: "在网站底部和侧边加入不影响阅读的轻量广告位，用于补贴服务器和域名成本，感谢小伙伴们的支持～ (｡•ᴗ•｡)❤"
            },
            {
                date: "2026年4月19日",
                title: "修改blog逻辑",
                desc: "重构博客文章加载和分享逻辑，优化导航体验，修复部分页面跳转错误，整体阅读流畅度提升的说～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年4月8日",
                title: "与google analytics对接",
                desc: "成功将网站流量数据接入google analytics，便于后续的数据分析和用户行为研究的说～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年4月5日",
                title: "安全加固 · SEO移除 · 性能优化 · 新增状态页面",
                desc: "进行全面安全审计，移除硬编码密码并改为哈希验证；删除所有SEO文件和meta标签；收紧CSP策略；添加实时状态查看页面 (status.html)；优化DNS预解析和CSS异步加载的说～ (๑>ᴗ<๑)"
            },
            {
                date: "2026年4月3日",
                title: "换了个域名",
                desc: "将网站域名从 ciallo0721-cmd.github.io 更换为 https://91vip.xn--32v.ink/，提升了网站的专业形象和访问速度的说～ (๑•̀ㅂ•́)و✧"
            },
            {
                date: "2026年4月2日",
                title: "整理网站上的游戏",
                desc: "对网站上的游戏进行了整理和分类，更新了游戏预览的链接和描述，提升了用户浏览体验的说～ (◕‿◕✿)"
            },
            {
                date: "2026年4月1日",
                title: "更新网站图标",
                desc: "更新了网站的 favicon 和多个社交平台的图标，采用了更符合二次元风格的设计，提升了整体视觉一致性和品牌形象的说～ (๑˃̵ᴗ˂̵)و"
            },
            {
                date: "2026年3月31日",
                title: "添加后台 · 修复已知问题 · 修复SEO爬虫误判",
                desc: "上线后台管理系统 admin.html，修复多个已知 Bug 并完善网站细节，优化 SEO 爬虫检测逻辑，提升搜索引擎友好度和用户体验的说～ (๑>ᴗ<๑)"
            }
        ];

        // 渲染时间线（使用DOM创建防止XSS）
        function escapeHtml(str) {
            var d = document.createElement('div');
            d.textContent = String(str);
            return d.innerHTML;
        }
        function renderTimeline() {
            var list = document.getElementById('timelineList');
            if (!list || !window.timelineData) return;
            list.innerHTML = window.timelineData.map(function(item, i) {
                var safeDate  = escapeHtml(item.date  || '');
                var safeTitle = escapeHtml(item.title || '');
                var safeDesc  = item.desc ? escapeHtml(item.desc) : '';
                return '<div class="timeline-item" style="animation-delay:' + (i * 0.08) + 's">'
                    + '<div class="timeline-date"><i class="fas fa-calendar-alt" style="margin-right:6px;"></i>' + safeDate + '</div>'
                    + '<div class="timeline-content">'
                    + '<div class="timeline-title">' + safeTitle + '</div>'
                    + (safeDesc ? '<p class="timeline-desc">' + safeDesc + '</p>' : '')
                    + '</div></div>';
            }).join('');
        }
        document.addEventListener('DOMContentLoaded', renderTimeline);