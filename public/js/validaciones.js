function validarCorreo(correo) {
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresion.test(correo);
}

function validarPassword(password) {
    // Solo verificar que no este en blanco
    return password.trim() !== ''; 
}