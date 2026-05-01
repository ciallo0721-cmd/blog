/**
 * IP 地理检测脚本
 * 用于检测访问者是否来自美国，如果是则重定向到拒绝访问页面
 * 
 * 使用方式：
 * 1. 将此脚本放在 index.html 的 <head> 中（验证流程之前）
 * 2. 或者，在验证流程的 initVerification() 函数开始时调用 checkGeoLocation()
 * 
 * 注意：此脚本使用免费 IP 地理 API，可能有速率限制。
 * 生产环境建议使用 Cloudflare IP 地理定位或自建后端 API。
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        // 免费 IP 地理 API（可替换为您自己的后端 API）
        apiUrl: 'https://ipapi.co/json/',
        // 拒绝访问页面
        denyPage: './access-denied.html?from=us',
        // 是否启用检测（可以通过 URL 参数 ?bypass_geo=1 绕过）
        enabled: true,
        // 超时时间（毫秒）
        timeout: 3000
    };

    /**
     * 检查是否应该跳过地理检测
     */
    function shouldBypass() {
        // URL 参数绕过（用于测试）
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('bypass_geo') === '1') {
            console.log('地理检测已通过 URL 参数绕过');
            return true;
        }

        // localStorage 缓存绕过（如果用户之前已确认）
        if (localStorage.getItem('geo_bypass') === 'true') {
            console.log('地理检测已通过 localStorage 绕过');
            return true;
        }

        return false;
    }

    /**
     * 检测 IP 地理位置
     */
    function checkGeoLocation() {
        // 检查是否应该跳过
        if (!CONFIG.enabled || shouldBypass()) {
            return Promise.resolve({ bypassed: true });
        }

        console.log('开始 IP 地理检测...');

        // 创建超时 Promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('请求超时')), CONFIG.timeout);
        });

        // 发起 IP 地理 API 请求
        const fetchPromise = fetch(CONFIG.apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('API 响应错误: ' + response.status);
                }
                return response.json();
            });

        // 竞争：取最快的结果（或超时）
        return Promise.race([fetchPromise, timeoutPromise])
            .then(data => {
                console.log('IP 地理检测结果:', data);
                return data;
            })
            .catch(error => {
                console.warn('IP 地理检测失败（将允许访问）:', error.message);
                // 检测失败时，默认允许访问（避免误拦）
                return { error: true, message: error.message };
            });
    }

    /**
     * 处理地理检测结果
     */
    function handleGeoResult(data) {
        // 如果跳过或失败，允许访问
        if (data.bypassed || data.error) {
            console.log('允许访问（跳过检测或检测失败）');
            return;
        }

        // 检查是否来自美国
        const countryCode = (data.country_code || data.country || '').toUpperCase();
        const countryName = data.country_name || data.country_name || 'Unknown';

        console.log('访问者国家:', countryCode, countryName);

        if (countryCode === 'US') {
            console.log('检测到美国 IP，重定向到拒绝访问页面');
            window.location.href = CONFIG.denyPage;
            return;
        }

        // 非美国用户，允许访问
        console.log('非美国 IP，允许访问');
    }

    /**
     * 公共 API
     */
    window.GeoChecker = {
        /**
         * 执行地理检测
         * @returns {Promise} 检测结果
         */
        check: function() {
            return checkGeoLocation().then(handleGeoResult);
        },

        /**
         * 手动绕过地理检测（用于测试）
         */
        bypass: function() {
            localStorage.setItem('geo_bypass', 'true');
            console.log('已设置地理检测绕过，刷新页面生效');
        },

        /**
         * 清除绕过设置
         */
        clearBypass: function() {
            localStorage.removeItem('geo_bypass');
            console.log('已清除地理检测绕过设置');
        }
    };

    // 自动执行（如果脚本在 <head> 中加载）
    // 注意：如果验证流程在 GeoChecker 之前执行，需要手动调用 GeoChecker.check()
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 延迟执行，避免阻塞页面加载
            setTimeout(() => {
                window.GeoChecker.check();
            }, 100);
        });
    } else {
        // DOM 已加载，立即执行
        setTimeout(() => {
            window.GeoChecker.check();
        }, 100);
    }

})();

/**
 * 使用说明：
 * 
 * 1. 将此脚本保存为 `geo-check.js`，放在网站根目录
 * 2. 在 `index.html` 的 `<head>` 中添加：
 *    <script src="./geo-check.js"></script>
 * 3. 或者，在验证流程开始前手动调用：
 *    window.GeoChecker.check().then(() => {
 *        // 检测完成后，启动验证流程
 *        initVerification();
 *    });
 * 
 * 测试：
 * - 绕过检测：访问 index.html?bypass_geo=1
 * - 控制台手动绕过：GeoChecker.bypass()
 * - 清除绕过：GeoChecker.clearBypass()
 */
