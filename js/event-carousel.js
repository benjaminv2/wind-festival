/* Three copies keep both neighbours visible across the loop boundary. */
(() => {
    'use strict';
    document.querySelectorAll('[data-event-carousel]').forEach(root => {
        const cards = [...root.children].filter(el => el.classList.contains('event-box'));
        const count = cards.length;
        if (!count || root.dataset.carouselReady) return;
        root.dataset.carouselReady = 'true';
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const viewport = document.createElement('div');
        viewport.className = 'event-carousel-viewport';
        viewport.tabIndex = 0;
        viewport.setAttribute('role', 'region');
        viewport.setAttribute('aria-label', '特色活動輪播，使用左右方向鍵切換');
        viewport.setAttribute('aria-roledescription', '輪播');
        const track = document.createElement('div');
        track.className = 'event-carousel-track';
        function copy(card) {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            // Visible loop copies stay clickable without duplicate tab stops.
            clone.querySelectorAll('a, button, [tabindex]').forEach(el => el.tabIndex = -1);
            clone.querySelectorAll('.sr-confetti').forEach(el => el.remove());
            clone.querySelectorAll('[data-component="sparkle-reveal"]').forEach(el => {
                el.classList.remove('sr-ready', 'sr-visible', 'sr-entered');
            });
            clone.removeAttribute('id');
            clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
            return clone;
        }
        track.append(...cards.map(copy), ...cards, ...cards.map(copy));
        viewport.append(track);
        const controls = document.createElement('div');
        controls.className = 'event-carousel-controls';
        const dots = document.createElement('div');
        dots.className = 'event-carousel-dots';
        dots.setAttribute('role', 'group');
        dots.setAttribute('aria-label', '選擇活動卡片');
        function arrow(direction, label) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `event-carousel-arrow event-carousel-arrow--${direction}`;
            button.setAttribute('aria-label', label);
            button.disabled = count < 2;
            button.addEventListener('click', () => {
                go((index + (direction === 'next' ? 1 : count - 1)) % count);
            });
            return button;
        }
        controls.append(arrow('prev', '上一張活動'), dots, arrow('next', '下一張活動'));
        root.replaceChildren(viewport, controls);
        window.MotionKit?.init(root);
        let index = Math.min(1, count - 1), physical = count + index;
        let busy = false, timer, finishTimer, visible = true, paused = false;
        const pauseButton = document.createElement('button');
        pauseButton.type = 'button';
        pauseButton.className = 'event-carousel-pause';
        pauseButton.textContent = '暫停';
        pauseButton.setAttribute('aria-label', '暫停自動輪播');
        pauseButton.disabled = count < 2;
        pauseButton.addEventListener('click', () => {
            paused = !paused;
            pauseButton.textContent = paused ? '繼續播放' : '暫停';
            pauseButton.setAttribute('aria-label', paused ? '繼續自動輪播' : '暫停自動輪播');
            schedule();
        });
        controls.append(pauseButton);
        const buttons = cards.map((card, i) => {
            card.setAttribute('role', 'group');
            card.setAttribute('aria-label', `第 ${i + 1} 張，共 ${count} 張`);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'event-carousel-dot';
            button.setAttribute('aria-label', `顯示第 ${i + 1} 張活動`);
            button.addEventListener('click', () => go(i));
            dots.append(button);
            return button;
        });
        function paint(animate) {
            track.style.transitionProperty = animate && !reduced.matches ? 'transform' : 'none';
            const card = track.children[physical];
            const x = viewport.clientWidth / 2 - card.offsetLeft - card.getBoundingClientRect().width / 2;
            track.style.transform = `translate3d(${x}px,0,0)`;
            buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
        }
        function schedule() {
            clearTimeout(timer);
            if (!paused && !reduced.matches && visible && !document.hidden && count > 1) {
                timer = setTimeout(() => go((index + 1) % count), 4000);
            }
        }
        function finish() {
            if (!busy) return;
            clearTimeout(finishTimer);
            busy = false;
            physical = count + index;
            paint(false);
            schedule();
        }
        function go(next) {
            if (busy || next === index) return;
            clearTimeout(timer);
            let delta = (next - index + count) % count;
            if (delta > count / 2) delta -= count;
            physical += delta;
            index = next;
            busy = true;
            void track.offsetWidth;
            paint(true);
            finishTimer = setTimeout(finish, reduced.matches ? 0 : 900);
        }
        track.addEventListener('transitionend', event => {
            if (event.target === track && event.propertyName === 'transform') finish();
        });
        function measure() {
            clearTimeout(finishTimer);
            busy = false;
            physical = count + index;
            const gap = parseFloat(getComputedStyle(track).gap) || 0;
            // Mobile: 20% neighbour + full card + 20% neighbour, plus two gaps.
            const visibleCards = parseFloat(getComputedStyle(root).getPropertyValue('--carousel-visible-cards')) || 3.05;
            root.style.setProperty('--card-width', `${Math.max(1, (viewport.clientWidth - 2 * gap) / visibleCards)}px`);
            paint(false);
            schedule();
        }
        viewport.addEventListener('keydown', event => {
            if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
            event.preventDefault();
            go((index + (event.key === 'ArrowRight' ? 1 : count - 1)) % count);
        });
        document.addEventListener('visibilitychange', schedule);
        reduced.addEventListener('change', measure);
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            schedule();
        }).observe(root);
        new ResizeObserver(measure).observe(viewport);
        measure();

    });
})();
