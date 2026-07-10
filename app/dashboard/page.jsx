import styles from "./page.module.css";

// TODO: reemplazar por lib/noticias.js cuando exista (obtenerNoticiasRecientes())
const noticiasEjemplo = [
    {
        id: 1,
        titulo: "Inicia el semestre B-2026 en la UNET",
        descripcion:
            "Cronograma de inscripciones y fechas clave para estudiantes de todas las carreras.",
        autor: "Dirección Académica",
        imagen: null,
        hashtags: ["semestre", "inscripciones"],
    },
    {
        id: 2,
        titulo: "Feria de pasantías 2026",
        descripcion:
            "La cobra quiere queque.",
        autor: "Bienestar Estudiantil",
        imagen: null,
        hashtags: ["pasantias"],
    },
    {
        id: 3,
        titulo: "Resultados del foro de Cálculo III",
        descripcion:
            "Resumen de las dudas más frecuentes resueltas esta semana por los preparadores.",
        autor: "Preparaduría",
        imagen: null,
        hashtags: ["calculo3", "foro"],
    },
];

// TODO: reemplazar por lib/notificaciones.js cuando exista (obtenerNotificacionesRecientes())
const notificacionesEjemplo = [
    { id: 1, tipo: "Mensaje", texto: "Nuevo mensaje de Ana Pérez", tiempo: "hace 5 min" },
    { id: 2, tipo: "Foro", texto: "Respuesta nueva en el foro de Física II", tiempo: "hace 22 min" },
    { id: 3, tipo: "Noticia", texto: "Nueva noticia publicada", tiempo: "hace 1 h" },
    { id: 4, tipo: "Sistema", texto: "Tu cuenta subió de nivel", tiempo: "hace 3 h" },
];

export default function Dashboard() {
    return (
        <div className={styles.grid}>
            <section>
                <h2 className={styles.tituloSeccion}>Noticias más recientes</h2>
                <div className={styles.listaNoticias}>
                    {noticiasEjemplo.map((n) => (
                        <article key={n.id} className={styles.tarjetaNoticia}>
                            {n.imagen ? (
                                <img src={n.imagen} alt="" className={styles.imagenNoticia} />
                            ) : (
                                <div className={styles.imagenNoticiaMarcador}>Sin imagen</div>
                            )}
                            <div>
                                <p className={styles.tituloNoticia}>{n.titulo}</p>
                                <p className={styles.descripcionNoticia}>{n.descripcion}</p>
                                <div className={styles.metaNoticia}>
                                    <span className={styles.autorNoticia}>Por {n.autor}</span>
                                    {n.hashtags.map((tag) => (
                                        <span key={tag} className={styles.hashtag}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section>
                <h2 className={styles.tituloSeccion}>Notificaciones recientes</h2>
                <div className={styles.listaNotificaciones}>
                    {notificacionesEjemplo.map((n) => (
                        <div key={n.id} className={styles.itemNotificacion}>
                            <span className={styles.etiquetaTipo}>{n.tipo}</span>
                            <div>
                                <p className={styles.textoNotificacion}>{n.texto}</p>
                                <p className={styles.tiempoNotificacion}>{n.tiempo}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
