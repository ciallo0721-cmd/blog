/**
 * paywall.js - 付费墙核心系统
 * 
 * 功能：
 * 1. 获取访客真实公网IP（通过 api.ipify.org）
 * 2. 加载白名单IP列表
 * 3. 验证访客是否有权访问指定付费文章
 * 4. 24小时缓存已验证IP
 */

const PAYWALL_CONFIG = {
    IP_API_URL: 'https://api.ipify.org?format=json',
    WHITELIST_URL: '../whitelist.json',
    CACHE_KEY: 'paywall_verified_ip',
    CACHE_TTL: 24 * 60 * 60 * 1000 // 24小时（毫秒）
};

/**
 * 获取访客公网IP
 * 优先从缓存读取，缓存过期则重新获取
 * @returns {Promise<string>} 访客IP地址
 */
async function getVisitorIP() {
    // 检查localStorage缓存
    try {
        const cached = localStorage.getItem(PAYWALL_CONFIG.CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            if (data.ip && data.expires && Date.now() < data.expires) {
                return data.ip;
            }
        }
    } catch (e) {
        console.error('[paywall] 读取IP缓存失败:', e);
    }

    // 从api.ipify.org获取IP
    try {
        const response = await fetch(PAYWALL_CONFIG.IP_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const ip = data.ip;

        // 写入缓存
        const cacheData = {
            ip: ip,
            expires: Date.now() + PAYWALL_CONFIG.CACHE_TTL
        };
        try {
            localStorage.setItem(PAYWALL_CONFIG.CACHE_KEY, JSON.stringify(cacheData));
        } catch (e) {
            console.error('[paywall] 写入IP缓存失败:', e);
        }

        return ip;
    } catch (e) {
        console.error('[paywall] 获取访客IP失败:', e);
        return null;
    }
}

/**
 * 加载白名单IP列表
 * @returns {Promise<string[]>} 白名单IP数组
 */
async function loadWhitelist() {
    try {
        const response = await fetch(PAYWALL_CONFIG.WHITELIST_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.ips || !Array.isArray(data.ips)) {
            throw new Error('白名单数据格式无效');
        }
        return data.ips.map(entry => entry.ip);
    } catch (e) {
        console.error('[paywall] 加载白名单失败:', e);
        return [];
    }
}

/**
 * 检查访客是否有权访问指定付费文章
 * - 如果IP在白名单中 → 放行，返回 true
 * - 如果不在 → 跳转到402拦截页面，不返回
 * 
 * @param {string} articleId - 文章标识符（用于402页面的article参数）
 * @param {string} [articleTitle] - 文章标题（用于402页面显示）
 * @param {string} [articlePrice] - 文章价格（用于402页面显示）
 * @returns {Promise<boolean>} 返回 true 表示有权访问
 */
async function checkAccess(articleId, articleTitle, articlePrice) {
    try {
        const visitorIP = await getVisitorIP();
        if (!visitorIP) {
            console.error('[paywall] 无法获取访客IP，默认拦截');
            redirectTo402(articleId, articleTitle, articlePrice, 'unknown');
            return false;
        }

        const whitelist = await loadWhitelist();
        if (whitelist.length === 0) {
            console.warn('[paywall] 白名单为空，默认拦截');
            redirectTo402(articleId, articleTitle, articlePrice, visitorIP);
            return false;
        }

        if (whitelist.includes(visitorIP)) {
            console.log('[paywall] IP白名单验证通过:', visitorIP);
            return true;
        }

        console.log('[paywall] IP不在白名单中，拦截:', visitorIP);
        redirectTo402(articleId, articleTitle, articlePrice, visitorIP);
        return false;
    } catch (e) {
        console.error('[paywall] 访问检查异常:', e);
        redirectTo402(articleId, articleTitle, articlePrice, 'error');
        return false;
    }
}

/**
 * 跳转到402付费拦截页面
 * @param {string} articleId - 文章ID
 * @param {string} [articleTitle] - 文章标题
 * @param {string} [articlePrice] - 文章价格
 * @param {string} visitorIP - 访客IP
 */
function redirectTo402(articleId, articleTitle, articlePrice, visitorIP) {
    const params = new URLSearchParams();
    if (articleTitle) params.set('article', articleTitle);
    if (articlePrice) params.set('price', articlePrice);
    if (visitorIP) params.set('ip', visitorIP);

    const queryString = params.toString();
    const redirectURL = queryString
        ? `../../402.html?${queryString}`
        : '../../402.html';

    window.location.href = redirectURL;
}

// 导出函数供其他页面使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getVisitorIP, checkAccess, loadWhitelist };
}
