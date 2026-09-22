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

/* Staged button entrance and confetti. */
(()=>{
const known=new WeakSet();
function init(root=document){
const targets=[...(root.matches?.('[data-component="sparkle-reveal"]')?[root]:[]),...root.querySelectorAll('[data-component="sparkle-reveal"]')];
for(const button of targets){if(known.has(button))continue;known.add(button);button.classList.add('sr-ready');
let entranceTimer;const reveal=()=>{button.classList.add('sr-visible');clearTimeout(entranceTimer);entranceTimer=setTimeout(()=>button.classList.add('sr-entered'),1100);};
button.addEventListener('pointerleave',()=>{clearTimeout(entranceTimer);button.classList.add('sr-entered');});
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){reveal();observer.disconnect();}},{threshold:.25});observer.observe(button);
const canvas=document.createElement('canvas');canvas.className='sr-confetti';canvas.setAttribute('aria-hidden','true');button.append(canvas);
const ctx=canvas.getContext('2d');let particles=[],frame=0,previous=0;
function tick(time){frame=0;const dt=Math.min(previous?(time-previous)/1000:1/60,.05);previous=time;
if(document.hidden||document.body.classList.contains('paused')||matchMedia('(prefers-reduced-motion:reduce)').matches){particles=[];}
ctx.clearRect(0,0,canvas.width,canvas.height);
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=900*dt;p.life-=1.2*dt;p.rotation+=p.spin*dt;p.size*=Math.pow(.96,dt*60);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(0,-p.size);ctx.lineTo(p.size*.7,0);ctx.lineTo(0,p.size);ctx.lineTo(-p.size*.7,0);ctx.closePath();ctx.fill();ctx.restore();}
particles=particles.filter(p=>p.life>0);if(particles.length)frame=requestAnimationFrame(tick);else previous=0;
}
function sparkle(){if(!ctx||matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('paused')||button.disabled)return;
const width=button.offsetWidth+140,height=button.offsetHeight+140,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
const colors=['#ff8c00','#ffdc43','#2ec4b6','#f966a0'];for(let i=0;i<16;i++)particles.push({x:width/2,y:height/2,vx:(Math.random()-.5)*480,vy:(Math.random()-.5)*480-180,size:Math.random()*6+3,life:1,rotation:Math.random()*6.28,spin:(Math.random()-.5)*12,color:colors[i%4]});particles=particles.slice(-80);if(!frame)frame=requestAnimationFrame(tick);}
button.addEventListener('pointerenter',()=>sparkle(16));button.addEventListener('focus',()=>{reveal();sparkle(5);});button.addEventListener('click',()=>sparkle(24));
}}
if(window.MotionKit){const previous=window.MotionKit.init;window.MotionKit.init=(root=document)=>{previous(root);init(root);};}
init();
document.querySelectorAll('[data-replay-sparkle]').forEach(control=>control.addEventListener('click',()=>{const button=control.closest('.button-effect-card').querySelector('[data-component="sparkle-reveal"]');button.classList.remove('sr-visible','sr-entered');void button.offsetWidth;button.classList.add('sr-visible');setTimeout(()=>button.classList.add('sr-entered'),1100);}));
})();
