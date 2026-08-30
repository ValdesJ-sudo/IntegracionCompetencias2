const formularioLogin = document.querySelector('.formulario-login');

if (formularioLogin) {
    formularioLogin.addEventListener('submit', function(evento) {
        const correoIngresado = document.getElementById('correo').value;
        const passIngresada = document.getElementById('password').value;

        if (!validarCorreo(correoIngresado)) {
            evento.preventDefault();
            alert('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        if (!validarPassword(passIngresada)) {
            evento.preventDefault();
            alert('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
    });
}