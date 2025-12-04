// Carta de Graduación - Scripts mejorados
document.addEventListener('DOMContentLoaded', () => {
    let currentPageIndex = 0;
    const pages = Array.from(document.querySelectorAll('.card-page'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pager = document.getElementById('pager');
    const panel = document.getElementById('panel');
    const introOverlay = document.getElementById('introOverlay');
    const giftBtn = document.getElementById('giftBtn');
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    // Configurar canvas
    if (canvas && ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Sistema de partículas
    let particles = [];
    let animationFrameId = null;

    function createParticles(x, y, count = 70) {
        if (!ctx) return;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 5;
            const size = 3 + Math.random() * 6;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.025
            });
        }
    }

    function updateParticles() {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles = particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            // gravedad
            particle.vy += 0.12;
            particle.life -= particle.decay;
            
            if (particle.life > 0) {
                ctx.save();
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = '#9B59B6';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#9B59B6';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                return true;
            }
            return false;
        });
        
        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(updateParticles);
        } else {
            animationFrameId = null;
        }
    }

    // Efecto máquina de escribir continuo por página
    let typewriterTimer = null;
    
    function typeWriterForPage(pageIndex) {
        const page = pages[pageIndex];
        if (!page) return;
        
        // Limpiar cualquier timer anterior
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
        }
        
        // Obtener todos los textos de la página
        const typewriterElements = page.querySelectorAll('.typewriter-text');
        const allTexts = Array.from(typewriterElements).map(el => el.getAttribute('data-text') || '');
        
        // Combinar todos los textos en uno solo
        const fullText = allTexts.join(' ');
        
        // Limpiar todos los elementos
        typewriterElements.forEach(el => {
            el.textContent = '';
            el.style.opacity = '0';
        });
        
        // Crear un contenedor temporal para el texto completo
        let currentCharIndex = 0;
        let currentElementIndex = 0;
        let currentElement = typewriterElements[0];
        let currentText = allTexts[0] || '';
        let currentTextIndex = 0;
        
        if (!currentElement) return;
        
        currentElement.style.opacity = '1';
        
        function typeNextChar() {
            if (currentTextIndex >= allTexts.length) {
                return; // Terminamos
            }
            
            if (currentCharIndex < currentText.length) {
                currentElement.textContent += currentText.charAt(currentCharIndex);
                currentCharIndex++;
                // Velocidad de escritura
                typewriterTimer = setTimeout(typeNextChar, 20); 
            } else {
                // Terminamos este elemento, pasamos al siguiente
                currentElementIndex++;
                if (currentElementIndex < typewriterElements.length) {
                    currentElement = typewriterElements[currentElementIndex];
                    currentText = allTexts[currentElementIndex] || '';
                    currentTextIndex++;
                    currentCharIndex = 0;
                    if (currentElement) {
                        currentElement.style.opacity = '1';
                        // Pequeña pausa entre párrafos
                        typewriterTimer = setTimeout(typeNextChar, 100); 
                    }
                }
            }
        }
        
        // Iniciar la escritura
        typeNextChar();
    }

    // Controles de navegación
    function hideControls() {
        if (prevBtn) prevBtn.style.visibility = 'hidden';
        if (nextBtn) nextBtn.style.visibility = 'hidden';
        if (pager) {
            pager.style.opacity = '0';
            pager.style.pointerEvents = 'none';
        }
    }

    function showControls() {
        if (prevBtn) prevBtn.style.visibility = 'visible';
        if (nextBtn) nextBtn.style.visibility = 'visible';
        if (pager) {
            pager.style.opacity = '1';
            pager.style.pointerEvents = 'auto';
        }
    }

    function createPager() {
        if (!pager) return;
        pager.innerHTML = '';
        pages.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Ir a página ' + (i + 1));
            dot.addEventListener('click', () => goTo(i));
            pager.appendChild(dot);
        });
        pager.style.transition = 'opacity 500ms ease';
        pager.style.opacity = '0';
    }

    function updatePager() {
        if (!pager) return;
        const dots = pager.querySelectorAll('.dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentPageIndex));
    }

    function updateNavigationButtons() {
        if (!prevBtn || !nextBtn) return;
        prevBtn.style.visibility = (currentPageIndex > 0) ? 'visible' : 'hidden';
        nextBtn.style.visibility = (currentPageIndex < pages.length - 1) ? 'visible' : 'hidden';
    }

    function goTo(index) {
        if (index === currentPageIndex || index < 0 || index >= pages.length) return;
        
        // Limpiar timer de máquina de escribir anterior
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
        }
        
        const direction = index > currentPageIndex ? 1 : -1;
        pages[currentPageIndex].classList.remove('active');
        pages[currentPageIndex].classList.add(direction === 1 ? 'left' : 'right');
        pages[index].classList.remove('left', 'right');
        pages[index].classList.add('active');
        currentPageIndex = index;
        
        updateNavigationButtons();
        updatePager();
        
        // Iniciar efecto máquina de escribir para la nueva página
        setTimeout(() => {
            typeWriterForPage(index);
        }, 300); // Pequeño delay para que la transición se vea bien
    }

    function changePage(direction) {
        const newIndex = currentPageIndex + direction;
        if (newIndex < 0 || newIndex >= pages.length) return;
        goTo(newIndex);
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => changePage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changePage(1));

    document.addEventListener('keydown', (e) => {
        if (introOverlay && !introOverlay.classList.contains('intro-hidden')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (giftBtn) giftBtn.click();
            }
            return;
        }
        if (e.key === 'ArrowRight') changePage(1);
        if (e.key === 'ArrowLeft') changePage(-1);
    });

    // Función para iniciar el show
    function startShow() {
        if (!introOverlay) return;
        
        // Agregar clase para animación más grande y lenta
        if (giftBtn) {
            giftBtn.classList.add('clicking');
        }
        
        // Obtener posición del botón para las partículas
        const rect = giftBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Crear burst de partículas después de un pequeño delay
        setTimeout(() => {
            createParticles(x, y, 80);
            if (!animationFrameId) {
                updateParticles();
            }
        }, 200);
        
        // Ocultar overlay
        introOverlay.classList.add('intro-hidden');
        
        setTimeout(() => {
            introOverlay.style.display = 'none';
            if (panel) {
                panel.classList.add('entered');
            }
            showControls();
            if (pager) pager.style.opacity = '1';
            
            // Iniciar efecto máquina de escribir en la primera página después de un delay
            setTimeout(() => {
                typeWriterForPage(0);
            }, 500);
        }, 1200); // Más tiempo para la animación más lenta
    }

    if (giftBtn) {
        giftBtn.addEventListener('click', startShow);
    }

    // Inicialización
    pages.forEach((p, i) => {
        p.classList.remove('active', 'left', 'right');
        if (i === 0) {
            p.classList.add('active');
        } else {
            p.classList.add('right');
        }
    });
    
    currentPageIndex = 0;
    createPager();
    updateNavigationButtons();
    hideControls();
});
