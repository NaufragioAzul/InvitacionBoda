function confirmarAsistencia() {
    // Recuerda cambiar este número por el tuyo incluyendo el código de país.
    // Ejemplo para Perú (+51): "51979797137" (Sin espacios ni el símbolo '+')
    const telefono = "51979797137"; 
    
    const mensaje = encodeURIComponent("¡Hola! Confirmo mi asistencia a sus Bodas de Oro. ¡Muchas felicidades Francisca y Felipe!");

    // Abre WhatsApp con las variables correctas
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}
