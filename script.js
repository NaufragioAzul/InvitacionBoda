function abrirInvitacion() {
    const sobre = document.getElementById('envelope-container');
    const carta = document.getElementById('main-card');
    const musica = document.getElementById('bg-music');

    // 1. Añade la animación para desvanecer el sobre
    sobre.classList.add('fade-out');

    // 2. Al terminar la animación, oculta el sobre por completo y muestra la invitación
    setTimeout(() => {
        sobre.style.display = 'none';
        carta.classList.remove('hidden');
        
        // 3. Intenta reproducir la música de fondo (al haber interacción previa del usuario, el navegador lo permite)
        if (musica) {
            musica.volume = 0.5; // Volumen al 50% para que sea agradable
            musica.play().catch(error => {
                console.log("El autoreproductor fue bloqueado temporalmente por el dispositivo:", error);
            });
        }
    }, 700); // 700 milisegundos coincide con el tiempo de animación de salida en CSS
}

function confirmarAsistencia() {
    const telefono = "51979797137"; // Tu número de WhatsApp sin el '+'
    const mensaje = encodeURIComponent("¡Hola! Confirmo mi asistencia a sus Bodas de Oro. ¡Muchas felicidades Francisca y Felipe!");

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}
