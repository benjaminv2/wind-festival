/* Marquee extracted from outputs/motion-examples.html. No dependencies. */
(() => {
    'use strict';
    const selector = '[data-component="marquee"]';
    const observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
            target.classList.toggle('mk-offscreen', !isIntersecting);
        });
    }, { rootMargin: '60px' });

    function hideClone(node) {
        node.setAttribute('aria-hidden', 'true');
        node.setAttribute('inert', '');
        node.removeAttribute('id');
        node.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
    }

    function init(root = document) {
        const elements = [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
        elements.forEach(el => {
            if (el.dataset.motionReady) return;
            el.dataset.motionReady = 'true';
            const track = document.createElement('div');
            track.className = 'mk-track';
            const group = document.createElement('div');
            group.className = 'mk-group';
            while (el.firstChild) group.append(el.firstChild);
            track.append(group);
            el.append(track);
            const originals = [...group.children];

            function measure() {
                [...group.children].filter(node => node.dataset.mkFiller).forEach(node => node.remove());
                let width = group.getBoundingClientRect().width;
                let count = 0;
                while (width > 0 && width < el.clientWidth && originals.length && count++ < 30) {
                    originals.forEach(node => {
                        const clone = node.cloneNode(true);
                        clone.dataset.mkFiller = 'true';
                        hideClone(clone);
                        group.append(clone);
                    });
                    width = group.getBoundingClientRect().width;
                }
                while (track.children.length > 1) track.lastElementChild.remove();
                const copy = group.cloneNode(true);
                hideClone(copy);
                track.append(copy);
            }

            measure();
            new ResizeObserver(measure).observe(el);
            group.querySelectorAll('img').forEach(img => img.addEventListener('load', measure, { once: true }));
            observer.observe(el);
        });
    }

    window.MotionKit = {
        init,
        pause(value = true) {
            document.body.classList.toggle('paused', value);
            document.body.classList.toggle('motion-enabled', !value);
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init(), { once: true });
    } else {
        init();
    }
})();
