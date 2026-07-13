document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MOTOR DE PARTÍCULAS DORADAS (CANVAS HTML5)
    // ==========================================
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');

    let particlesArray = [];
    const numberOfParticles = 60;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.5 + 0.1; // Dirección hacia abajo sutil
            this.alpha = Math.random() * 0.5 + 0.3;
            this.glowDirection = Math.random() > 0.5 ? 0.01 : -0.01;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha += this.glowDirection;

            if (this.alpha <= 0.2 || this.alpha >= 0.8) {
                this.glowDirection *= -1;
            }
            if (this.y > canvas.height) {
                this.y = 0;
                this.x = Math.random() * canvas.width;
            }
            if (this.x > canvas.width || this.x < 0) {
                this.speedX *= -1;
            }
        }
        draw() {
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#D4AF37';
            ctx.fillStyle = `rgba(243, 229, 171, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // Reset para rendimiento
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();


    // ==========================================
    // 2. APERTURA DE SOBRE INTERACTIVO
    // ==========================================
    const envelopeContainer = document.getElementById('envelopeContainer');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');

    envelopeContainer.addEventListener('click', () => {
        // Ejecuta secuencia tridimensional
        envelopeContainer.classList.add('open');
        
        // Espera la animación física del sobre antes de revelar la invitación
        setTimeout(() => {
            welcomeScreen.classList.add('slide-up');
            mainContent.classList.remove('hidden');
            
            // Iniciar reproducción musical controlada de forma nativa tras interacción
            initAudioEngine();
            // Disparar lectura de intersección para animaciones scroll
            triggerScrollAnimations();
        }, 1200);
    });


    // ==========================================
    // 3. REPRODUCTOR AVANZADO DE MÚSICA
    // ==========================================
    const playlist = [
        { title: "1. Perfect Symphony", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { title: "2. Endless Love", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
    ];

    let currentTrackIndex = 0;
    let audio = new Audio();
    audio.src = playlist[currentTrackIndex].url;
    audio.volume = 0.4;

    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextBtn');
    const trackTitle = document.getElementById('trackTitle');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const iconPlay = playPauseBtn.querySelector('.icon-play');
    const iconPause = playPauseBtn.querySelector('.icon-pause');

    function initAudioEngine() {
        trackTitle.textContent = playlist[currentTrackIndex].title;
        audio.play().catch(e => console.log("Interacción requerida previa para auto-play superada de forma interactiva."));
        togglePlayUI(true);
    }

    function togglePlayUI(isPlaying) {
        if (isPlaying) {
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        } else {
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        }
    }

    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            togglePlayUI(true);
        } else {
            audio.pause();
            togglePlayUI(false);
        }
    });

    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        audio.src = playlist[currentTrackIndex].url;
        trackTitle.textContent = playlist[currentTrackIndex].title;
        audio.play();
        togglePlayUI(true);
    });

    audio.addEventListener('timeupdate', () => {
        const percentage = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    });

    audio.addEventListener('ended', () => {
        nextBtn.click(); // Salta de forma cíclica automáticamente
    });

    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if(duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    });


    // ==========================================
    // 4. CARRUSEL DINÁMICO DE IMÁGENES (CON SWIPE)
    // ==========================================
    const track = document.getElementById('carouselTrack');
    const slides = Array.from(track.children);
    const prevSliderBtn = document.getElementById('prevBtnSlider');
    const nextSliderBtn = document.getElementById('nextBtnSlider');
    const dotsContainer = document.getElementById('carouselDots');
    
    let currentIndex = 0;
    let carouselTimer;

    // Inicializar puntos indicadores (Dots)
    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => updateSlider(idx));
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function updateSlider(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
        
        resetCarouselTimer();
    }

    function resetCarouselTimer() {
        clearInterval(carouselTimer);
        carouselTimer = setInterval(() => {
            updateSlider(currentIndex + 1);
        }, 4000);
    }

    nextSliderBtn.addEventListener('click', () => updateSlider(currentIndex + 1));
    prevSliderBtn.addEventListener('click', () => updateSlider(currentIndex - 1));

    // Soporte Gestual para Dispositivos Móviles (Touch/Swipe)
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, {passive: true});

    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const threshold = 50; // Pixeles mínimos para activar el swipe
        if (startX - endX > threshold) {
            updateSlider(currentIndex + 1); // Izquierda a Derecha
        } else if (endX - startX > threshold) {
            updateSlider(currentIndex - 1); // Derecha a Izquierda
        }
    }

    resetCarouselTimer();


    // ==========================================
    // 5. ANIMACIÓN CON INTERSECTION OBSERVER
    // ==========================================
    function triggerScrollAnimations() {
        const targets = document.querySelectorAll('.content-reveal');
        
        const observerOptions = {
            root: null,
            threshold: 0.12, // Activa el efecto cuando el 12% del módulo es visible
            rootMargin: "0px"
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Solo se ejecuta una vez por sesión de scroll
                }
            });
        }, observerOptions);

        targets.forEach(target => observer.observe(target));
    }
});
