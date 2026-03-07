class NeuroFocusMode {
    constructor(c = {}) {
        this.c = { debounceDelay: 300, ...c };
        this.o = null;
        this.t = null;
        this.s = {
            ads: ['.ad', '.ads', '.advertisement', '.adsbygoogle', 'ins.adsbygoogle', '[class*="ad-"]', '[class*="ads-"]', '[id*="ad"]', '[id*="ads"]', 'iframe[src*="googleads"]', 'iframe[src*="doubleclick"]', 'iframe[src*="adserver"]', '.banner-ad', '.video-ad', '.preroll', '.midroll', '.popup-ad'],
            sponsored: ['.sponsored', '[class*="sponsored"]', '[data-ad]', 'div[data-ad]'],
            sidebars: ['.sidebar', '.side-bar', '[class*="sidebar"]', '[id*="sidebar"]', 'aside', '.left-col', '.right-col', '#left-col', '#right-col', '.column-left', '.column-right', '.main-sidebar', '.side-nav', '.widget-area', '.off-canvas', '.slide-panel'],
            navigation: ['nav', 'header', '.navbar', '.menu', '.top-bar', '[class*="menu"]', '.hamburger', '.mobile-menu', '.navigation', '[role="navigation"]', '.primary-nav', '.main-nav'],
            modals: ['.modal', '.popup', '.overlay', '[aria-modal="true"]', '.cookie-banner', '.consent-banner', '.gdpr', '.cc-banner', '.notification-bar'],
            social: ['.social', '.share', '.twitter-tweet', '.fb-like', '.social-share', '[class*="twitter"]', '[class*="facebook"]'],
            comments: ['.comments', '#comments', '.disqus', '[class*="comment"]', '.reply-form'],
            footers: ['footer', '.footer', '.newsletter', '.subscribe', '.mailchimp']
        };
    }

    removeClutter() {
        let k = 0;
        Object.values(this.s).flat().forEach(sel => {
            try {
                document.querySelectorAll(sel).forEach(el => {
                    el.style.display = 'none';
                    el.setAttribute('data-focus-hidden', '1');
                    k++;
                });
            } catch (e) {}
        });
        console.log(`✨ ${k} hidden`);
    }

    applyCleanLayout() {
        ['htmlElement', 'body'].forEach((t, i) => {
            let el = i ? document.body : document.documentElement;
            let st = {
                fontFamily: "'Georgia',serif",
                lineHeight: '1.8',
                fontSize: '16px',
                maxWidth: i ? '850px' : '',
                margin: i ? '0 auto' : '',
                padding: i ? '50px 30px' : '',
                backgroundColor: i ? '#fafafa' : '',
                color: i ? '#111' : '',
                boxShadow: i ? '0 0 100px rgba(0,0,0,.1)' : ''
            };
            Object.entries(st).forEach(([p, v]) =>
                v && el.style.setProperty(p.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), v, 'important')
            );
        });
        document.body.classList.add('neuro-focus-mode');
    }

    onMutationDebounced = () => {
        clearTimeout(this.t);
        this.t = setTimeout(() => this.removeClutter(), this.c.debounceDelay);
    }

    startObserver() {
        if (this.o) return;
        this.o = new MutationObserver(this.onMutationDebounced);
        this.o.observe(document.body, { childList: true, subtree: true });
    }

    destroy() {
        this.o?.disconnect();
        clearTimeout(this.t);
        document.body.classList.remove('neuro-focus-mode');
        document.querySelectorAll('[data-focus-hidden]').forEach(el => {
            el.style.display = '';
            el.removeAttribute('data-focus-hidden');
        });
    }

    init() {
        this.removeClutter();
        this.applyCleanLayout();
        this.startObserver();
    }
}

const focusMode = new NeuroFocusMode();
focusMode.init();
window.__neuroFocusMode = focusMode;