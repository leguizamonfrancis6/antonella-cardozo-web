/* ========================================
   ¿La persona pidió "reducir movimiento"?
   Si es así, no activamos ninguna animación.
======================================== */

const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ========================================
   MENÚ PARA CELULAR Y TABLET
======================================== */

const botonMenu = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");

if (botonMenu && menu) {

    function abrirCerrarMenu(abrir) {
        menu.classList.toggle("is-open", abrir);
        botonMenu.setAttribute("aria-expanded", abrir);
        botonMenu.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    }

    botonMenu.addEventListener("click", () => {
        abrirCerrarMenu(!menu.classList.contains("is-open"));
    });

    // Al tocar una opción, el menú se cierra y la página baja a esa sección
    menu.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", () => abrirCerrarMenu(false));
    });

    // La tecla Escape también lo cierra
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") abrirCerrarMenu(false);
    });
}


/* ========================================
   APARICIÓN SUAVE DE LAS SECCIONES AL BAJAR
======================================== */

// Elementos que aparecen al entrar en pantalla.
// Los que están en grupo (tarjetas, áreas) aparecen uno tras otro.
const gruposReveal = [
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

if (!reducirMovimiento && "IntersectionObserver" in window) {

    // IntersectionObserver "vigila" elementos y avisa cuando entran en pantalla
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("is-visible");
                observador.unobserve(entrada.target); // solo se anima una vez
            }
        });
    }, {
        threshold: 0.15,               // cuando se ve un 15% del elemento
        rootMargin: "0px 0px -40px 0px"
    });

    gruposReveal.forEach((selector) => {
        document.querySelectorAll(selector).forEach((elemento, indice) => {
            elemento.classList.add("reveal");

            // Pequeño retraso escalonado entre hermanos (máx. 5 pasos)
            elemento.style.transitionDelay = `${Math.min(indice, 5) * 90}ms`;

            observador.observe(elemento);
        });
    });
}


/* ========================================
   FORMULARIO "ENVIAR MAIL"
======================================== */

const botonMail = document.querySelector(".email-toggle");
const panelMail = document.getElementById("email-panel");
const formulario = document.getElementById("email-form");
const campoConsulta = document.getElementById("form-consulta");
const contador = document.getElementById("form-counter");
const estado = document.getElementById("form-status");

// Adónde se envía: FormSubmit recibe el formulario y lo reenvía por mail
const DESTINO = "https://formsubmit.co/ajax/antonellacardozoabogada@gmail.com";

if (botonMail && panelMail && formulario) {

    // Abrir / cerrar el panel
    botonMail.addEventListener("click", () => {
        const abierto = panelMail.classList.toggle("is-open");

        botonMail.setAttribute("aria-expanded", abierto);

        // "inert" hace que los campos no se puedan tocar mientras está cerrado
        panelMail.inert = !abierto;

        if (abierto) {
            document.getElementById("form-nombre").focus({ preventScroll: true });
        }
    });

    // Contador de caracteres de la consulta
    campoConsulta.addEventListener("input", () => {
        contador.textContent = `${campoConsulta.value.length} / 500`;
    });

    // Envío
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault(); // evitamos que la página se recargue

        const botonEnviar = formulario.querySelector(".form-submit");
        const datos = new FormData(formulario);

        // Si el campo trampa tiene algo, es un robot: no enviamos nada
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
                    email: datos.get("email"),        // FormSubmit lo usa como "responder a"
                    consulta: datos.get("consulta"),
                    _subject: `Nueva consulta web de ${datos.get("nombre")}`,
                    _template: "table"
                })
            });

            if (!respuesta.ok) throw new Error("Respuesta no válida");

            formulario.reset();
            contador.textContent = "0 / 500";
            estado.textContent = "¡Gracias! Tu consulta fue enviada. Te voy a responder a la brevedad.";

        } catch (error) {
            estado.textContent = "No se pudo enviar la consulta. Probá de nuevo en unos minutos o escribime por WhatsApp.";

        } finally {
            botonEnviar.disabled = false;
            botonEnviar.textContent = "Enviar consulta";
        }
    });
}
