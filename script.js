function confirmarAsistencia() {
    const mensaje = encodeURIComponent("¡Hola! Confirmo mi asistencia a su boda. ¡Muchas felicidades!");
    const telefono = "521234567890"; // Reemplaza con tu número (incluye código de país)
    
    // Abre WhatsApp Web o la App con el mensaje listo para enviar
    window.open(`https://wa.me{telefono}?text=${mensaje}`, '_blank');
}

