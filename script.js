document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DE APERTURA DEL SOBRE ---
    const envelopeWrapper = document.getElementById("envelopeWrapper");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const mainContent = document.getElementById("mainContent");

    envelopeWrapper.addEventListener("click", () => {
        welcomeScreen.classList.add("open");
        
        // Retraso controlado para coordinar salida de portada y entrada de contenido
        setTimeout(() => {
            welcomeScreen.classList.add("exit");
            mainContent.classList.remove("hidden");
            
            // Forzar el redibujado para que se procese la animación de opacidad suave
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                initScrollReveal();
            }, 50);
            
            // Inicializar autoplay de la música al dar click/interacción (políticas del navegador)
            playTrack();
        }, 1200);
    });

    // --- CANVAS DE PARTÍCULAS (POLVO DE ESTRELLAS DORADO) ---
    const canvas = document.getElementById("particlesCanvas");
    const ctx = canvas.getContext("2d");

    let particlesArray = [];
    const numberOfParticles = 60;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * -0.5 - 0.2; // Movimiento ascendente sutil
            this.opacity = Math.random() * 0.6 + 0.2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Reposicionamiento cíclico si salen de pantalla
            if (this.y < 0) {
                this.y = canvas.height;
                this.x = Math.random() * canvas.width;
            }
            if (this.x < 0 || this.x > canvas.width) {
                this.speedX = -this.speedX;
            }
        }
        draw() {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    
    initParticles();
    animateParticles();

// --- REPRODUCTOR DE AUDIO AVANZADO CON VOZ DE BIENVENIDA ---
    const tracks = [
        { 
            name: "Invitación de los Hijos", 
            src: "musica-invitacion.mp3", // <-- Coloca aquí la ruta de tu archivo de voz
            isVoice: true 
        },
        { 
            name: "Vals de Aniversario", 
            src: "musica-bodas-de-oro-1.mp3",
            isVoice: false
        }, 
        { 
            name: "Amor Eterno Sinfónico", 
            src: "musica-bodas-de-oro.mp3",
            isVoice: false
        }
    ];

    let currentTrackIndex = 0;
    const audio = new Audio(tracks[currentTrackIndex].src);
    audio.loop = false;

    const playPauseBtn = document.getElementById("playPauseBtn");
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");
    const trackNameDisplay = document.getElementById("trackName");
    const waveContainer = document.getElementById("waveContainer");
    const progressBar = document.getElementById("progressBar");
    const nextTrackBtn = document.getElementById("nextTrackBtn");

    // Sincronizar el nombre inicial en el display flotante
    trackNameDisplay.textContent = tracks[currentTrackIndex].name;

    function playTrack() {
        audio.play().then(() => {
            playIcon.classList.add("hidden");
            pauseIcon.classList.remove("hidden");
            
            // Si es la voz, no activamos la animación del ecualizador para mantener la sobriedad
            if (tracks[currentTrackIndex].isVoice) {
                waveContainer.classList.remove("playing");
            } else {
                waveContainer.classList.add("playing");
            }
        }).catch(err => console.log("Interacción requerida por políticas del browser."));
    }

    function pauseTrack() {
        audio.pause();
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
        waveContainer.classList.remove("playing");
    }

    playPauseBtn.addEventListener("click", () => {
        if (audio.paused) playTrack(); else pauseTrack();
    });

    nextTrackBtn.addEventListener("click", () => {
        changeTrack();
    });

    function changeTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        audio.src = tracks[currentTrackIndex].src;
        trackNameDisplay.textContent = tracks[currentTrackIndex].name;
        progressBar.style.width = "0%";
        playTrack();
    }

    // Encadenamiento automático: Al terminar la voz, pasa directo a la música
    audio.addEventListener("ended", () => {
        changeTrack();
    });

    // Actualización de la barra de progreso
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
    });


    // --- CARRUSEL FOTOGRÁFICO INTERACTIVO ---
    const slider = document.getElementById("carouselSlider");
    const slides = document.querySelectorAll(".carousel-slide");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const dotsContainer = document.getElementById("carouselDots");

    let carouselIndex = 0;
    let carouselTimer;

    // Generar dots dinámicamente
    slides.forEach((_, idx) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (idx === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".dot");

    function updateCarousel() {
        slider.style.transform = `translateX(-${carouselIndex * 100}%)`;
        dots.forEach(dot => dot.classList.remove("active"));
        dots[carouselIndex].classList.add("active");
    }

    function nextSlide() {
        carouselIndex = (carouselIndex + 1) % slides.length;
        updateCarousel();
    }

    function prevSlide() {
        carouselIndex = (carouselIndex - 1 + slides.length) % slides.length;
        updateCarousel();
    }

    function goToSlide(idx) {
        carouselIndex = idx;
        updateCarousel();
        resetCarouselTimer();
    }

    function resetCarouselTimer() {
        clearInterval(carouselTimer);
        carouselTimer = setInterval(nextSlide, 4000); // 4 Segundos estipulados
    }

    nextBtn.addEventListener("click", () => { nextSlide(); resetCarouselTimer(); });
    prevBtn.addEventListener("click", () => { prevSlide(); resetCarouselTimer(); });

    // Soporte completo de gestos Swipe para Móviles
    let startX = 0;
    slider.addEventListener("touchstart", (e) => startX = e.touches[0].clientX);
    slider.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) { nextSlide(); resetCarouselTimer(); } // Swipe izquierda
        if (endX - startX > 50) { prevSlide(); resetCarouselTimer(); } // Swipe derecha
    });

    resetCarouselTimer();

    // --- EFECTO SCROLL REVEAL (INTERSECTION OBSERVER) ---
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(".scroll-reveal");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => observer.observe(el));
    }
});
