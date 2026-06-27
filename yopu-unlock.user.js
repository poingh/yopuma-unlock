// ==UserScript==
// @name         有谱么播放限制解除 (稳定版)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  解除yopu.co乐谱15秒播放限制
// @author       poingh
// @match        https://yopu.co/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://cdn.jsdelivr.net/gh/poingh/yopuma-unlock/yopu-unlock.user.js
// @updateURL    https://cdn.jsdelivr.net/gh/poingh/yopuma-unlock/yopu-unlock.user.js
// ==/UserScript==

(function() {
    'use strict';

    let showTip = true;

    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(handler, delay, ...args) {
        if (delay >= 14000 && delay <= 16000) {
            console.log('[解除脚本] 已拦截15秒限制定时器');
            return;
        }
        return originalSetTimeout(handler, delay, ...args);
    };

    const interceptPause = () => {
        document.querySelectorAll('audio, video').forEach(media => {
            if (media.dataset.pauseIntercepted === 'true') return;
            const originalPause = media.pause;
            media.pause = function() {
                const stack = new Error().stack;
                if (stack && (stack.includes('setTimeout') || stack.includes('setInterval'))) {
                    console.log('[解除脚本] 已拦截自动暂停');
                    return;
                }
                return originalPause.apply(this, arguments);
            };
            media.dataset.pauseIntercepted = 'true';
        });
    };

    const observer = new MutationObserver(() => interceptPause());
    window.addEventListener('load', () => {
        interceptPause();
        observer.observe(document.body, { childList: true, subtree: true });
    });

    const style = document.createElement('style');
    style.textContent = `
        .unlock-tip {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: #0f0;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 9999;
            font-family: sans-serif;
            pointer-events: none;
            opacity: 0.8;
            transition: opacity 0.3s;
        }
        .unlock-tip.hidden {
            opacity: 0;
        }
        .unlock-toggle {
            position: fixed;
            bottom: 10px;
            right: 160px;
            background: rgba(0,0,0,0.6);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 11px;
            z-index: 9999;
            cursor: pointer;
            font-family: sans-serif;
            user-select: none;
            transition: all 0.3s;
        }
        .unlock-toggle:hover {
            background: rgba(255,255,255,0.15);
        }
        .unlock-toggle.off {
            color: #999;
            border-color: rgba(255,255,255,0.1);
        }
    `;
    document.head.appendChild(style);

    const tip = document.createElement('div');
    tip.className = 'unlock-tip';
    tip.textContent = '🎵 播放限制已解除';
    document.body.appendChild(tip);

    const toggle = document.createElement('div');
    toggle.className = 'unlock-toggle';
    toggle.textContent = '🔔 提示';
    document.body.appendChild(toggle);

    toggle.addEventListener('click', () => {
        showTip = !showTip;
        tip.classList.toggle('hidden', !showTip);
        toggle.classList.toggle('off', !showTip);
        toggle.textContent = showTip ? '🔔 提示' : '🔕 提示';
        console.log(`[解除脚本] 提示已${showTip ? '开启' : '关闭'}`);
    });

    console.log('[解除脚本] 已成功启动，播放限制已解除！');
})();
