/**
 * geo-check.js
 *
 * [已禁用 - DISABLED]
 *
 * 历史用途：曾根据访客 IP 地理位置（country_code === 'US'）将美国用户
 *           重定向到 access-denied.html，以规避 DMCA 风险。
 *
 * 禁用原因：Googlebot / Bingbot 等搜索引擎爬虫均从美国 IP 发起抓取，
 *           该地理拦截会导致爬虫被重定向到"访问受限"页面，使全站
 *           （含 /wiki/ 等公开路由）无法被正常索引。
 *
 * 当前状态：本站为公开项目站点，ZERO 地理限制。本文件保留为空操作
 *           存根（no-op stub），仅为兼容仍引用 <script src="geo-check.js">
 *           的历史页面而存在，不再执行任何检测或重定向。
 *
 * 修改日期：2026-06-20
 */

(function() {
    'use strict';

    // 公共 API（全部为空操作，保持向后兼容，避免引用页面报错）
    window.GeoChecker = {
        check: function() {
            // 不做任何地理检测，直接放行
            return Promise.resolve({ bypassed: true, disabled: true });
        },
        bypass: function() {
            // 空操作（已无需绕过）
        },
        clearBypass: function() {
            // 空操作
        }
    };

    // 不自动执行任何拦截逻辑
})();
