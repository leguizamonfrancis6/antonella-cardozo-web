/* ========================================
   MENÚ (celular y tablet)
======================================== */

const botonMenu = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");

function abrirCerrarMenu(abrir) {
    menu.classList.toggle("is-open", abrir);
    botonMenu.setAttribute("aria-expanded", abrir);
    botonMenu.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
}

botonMenu.addEventListener("click", () => {
    abrirCerrarMenu(!menu.classList.contains("is-open"));
});

menu.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => abrirCerrarMenu(false));
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") abrirCerrarMenu(false);
});


/* ========================================
   APARICIÓN DE LAS SECCIONES AL BAJAR
======================================== */

// Los elementos de un mismo grupo (tarjetas, áreas) aparecen uno tras otro
const selectoresAnimados = [
    ".study-details",
    ".press-intro",
    ".press-card",
    ".practice-heading",
    ".practice-closing",
    ".other-areas-heading",
    ".other-area",
    ".contact-heading",
    ".contact-item"
];

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observador.unobserve(entrada.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
});

selectoresAnimados.forEach((selector) => {
    document.querySelectorAll(selector).forEach((elemento, indice) => {
        elemento.classList.add("reveal");
        elemento.style.transitionDelay = `${Math.min(indice, 5) * 90}ms`;
        observador.observe(elemento);
    });
});


/* ========================================
   FORMULARIO DE CONSULTA
======================================== */

// FormSubmit recibe el formulario y lo reenvía por mail
const DESTINO = "https://formsubmit.co/ajax/antonellacardozoabogada@gmail.com";
const LIMITE = 500;

const botonMail = document.querySelector(".email-toggle");
const panelMail = document.getElementById("email-panel");
const formulario = document.getElementById("email-form");
const campoConsulta = document.getElementById("form-consulta");
const contador = document.getElementById("form-counter");
const estado = document.getElementById("form-status");
const botonEnviar = formulario.querySelector(".form-submit");

function actualizarContador() {
    contador.textContent = `${campoConsulta.value.length} / ${LIMITE}`;
}

botonMail.addEventListener("click", () => {
    const abierto = panelMail.classList.toggle("is-open");

    botonMail.setAttribute("aria-expanded", abierto);
    panelMail.inert = !abierto;

    if (abierto) {
        document.getElementById("form-nombre").focus({ preventScroll: true });
    }
});

campoConsulta.addEventListener("input", actualizarContador);

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = new FormData(formulario);

    // Campo trampa: si tiene algo, lo completó un robot
    if (datos.get("_honey")) return;

    botonEnviar.disabled = true;
    botonEnviar.textContent = "Enviando…";
    estado.textContent = "";

    try {
        const respuesta = await fetch(DESTINO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                nombre: datos.get("nombre"),
                email: datos.get("email"),
                consulta: datos.get("consulta"),
                _subject: `Nueva consulta web de ${datos.get("nombre")}`,
                _template: "table"
            })
        });

        // FormSubmit puede responder 200 sin haber enviado el mail
        // (por ejemplo, si el formulario no está activado): hay que leer "success"
        const resultado = await respuesta.json();
        if (!respuesta.ok || String(resultado.success) !== "true") throw new Error();

        formulario.reset();
        actualizarContador();
        estado.textContent = "¡Gracias! Tu consulta fue enviada. Te voy a responder a la brevedad.";
    } catch {
        estado.textContent = "No se pudo enviar la consulta. Probá de nuevo en unos minutos o escribime por WhatsApp.";
    } finally {
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar consulta";
    }
});
