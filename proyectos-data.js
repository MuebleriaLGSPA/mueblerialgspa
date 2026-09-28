/* ============================================================
   DATOS DE LA GALERÍA — MUEBLERIALG SPA
   ------------------------------------------------------------
   Toda la información de proyectos, destacados y renders está aquí.
   Las tarjetas, filtros y el visor de fotos se generan a partir de
   este archivo (ver app.js). Guía completa en GALERIA.md.

   CÓMO AGREGAR UN PROYECTO NUEVO
   1. Copia las fotos originales en assets/ (ej. assets/pirque1.jpg,
      assets/pirque2.jpg) y corre:  npm run imagenes
   2. Agrega una entrada en PROYECTOS, por ejemplo:

      {
          id: "cocina-pirque",              // único, sin espacios ni tildes
          categoria: "cocina",              // cocina | walk-in | closet | decorativo
          titulo: "Proyecto Pirque",
          etiqueta: "Cocina con Isla",
          descripcion: "Texto que se muestra en el visor…",
          materiales: "Melamina 18mm Roble / Cuarzo Blanco",   // opcional
          herrajes: "Bisagras cierre suave",                    // opcional
          dimensiones: "Largo: 4.0m",                           // opcional
          terminacion: "Melamina texturada mate",               // opcional
          fotos: [
              // archivo = nombre de la foto SIN extensión; la primera es la portada
              { archivo: "pirque1", alt: "Cocina en roble con isla de cuarzo blanco, Proyecto Pirque" },
              { archivo: "pirque2", alt: "Detalle de cajones con cierre suave, Proyecto Pirque" }
          ]
      },

   El texto "alt" describe la foto para buscadores y lectores de pantalla:
   di qué se ve (mueble, material, color) y el proyecto.
   ============================================================ */

window.PROYECTOS = [
    {
        id: "cocina-machali",
        categoria: "cocina",
        titulo: "Proyecto Machalí",
        etiqueta: "Cocina Moderna",
        descripcion: "Cocina moderna con isla central, diseñada en melamina Sierra y cubierta de cuarzo Snow, una combinación que transmite elegancia, calidez y sofisticación. Cada superficie, cada textura y cada línea se integran para crear un espacio único, pensado para disfrutar, compartir y vivir momentos memorables. Materiales de alta calidad, estética contemporánea y un diseño que eleva la experiencia diaria a un nivel superior.",
        materiales: "Melamina 18mm color Sierra / Cuarzo Blanco Snow",
        herrajes: "Bisagras y cajones telescópicos con cierre suave",
        fotos: [
            { archivo: "machali1", alt: "Cocina con cubierta de cuarzo blanco, lavaplatos y vitrina iluminada al fondo, Proyecto Machalí" },
            { archivo: "machali2", alt: "Torre de despensa en melamina gris y vitrina con copas iluminada, Proyecto Machalí" },
            { archivo: "machali3", alt: "Isla de cuarzo blanco con encimera y muebles en melamina gris, Proyecto Machalí" },
            { archivo: "machali4", alt: "Isla y muebles altos en melamina gris con luz LED en el cielo, Proyecto Machalí" }
        ]
    },
    {
        id: "cocina-rapel",
        categoria: "cocina",
        titulo: "Proyecto Rapel",
        etiqueta: "Cocina en el lago",
        descripcion: "Cocina frente al lago diseñada en tonos cálidos y mobiliario en melamina color natural, creada para envolver el espacio en una sensación de armonía, serenidad y elegancia contemporánea. La combinación de materiales de alta calidad y la vista al entorno natural elevan cada detalle, transformando la cocina en un ambiente acogedor, sofisticado y lleno de vida, donde cada momento se disfruta con una calidez única.",
        materiales: "Melamina 18mm color Carvalo y Blanco / Cubiertas de Cuarzo Blanco Snow",
        herrajes: "Bisagras y cajones telescópicos con cierre suave, Iluminación calida para Muebles aereos y Vitrina con puertas de aluminio negro",
        fotos: [
            { archivo: "rapel1", alt: "Cocina en melamina color madera con hornos empotrados en columna, Proyecto Rapel" },
            { archivo: "rapel2", alt: "Isla de cuarzo blanco con pisos altos negros y lámparas colgantes, Proyecto Rapel" },
            { archivo: "rapel3", alt: "Vitrina con marco de aluminio negro y repisas iluminadas, Proyecto Rapel" },
            { archivo: "rapel4", alt: "Comedor frente a mueble de vitrinas y repisas con luz cálida, Proyecto Rapel" }
        ]
    },
    {
        id: "cocina-malalcahuello",
        categoria: "cocina",
        titulo: "Proyecto Malalcahuello",
        etiqueta: "Cocina de Montaña",
        descripcion: "Cocina rústica moderna en la montaña, fabricada en melamina Vison UltraMate y cubierta de cuarzo blanco espejado. Una combinación que realza la esencia cálida del entorno natural con un toque contemporáneo de gran sofisticación. Cada textura y cada superficie han sido seleccionadas para ofrecer un ambiente acogedor, elegante y de alta calidad, donde la estética, la funcionalidad y la conexión con el paisaje se unen para crear un espacio único, lleno de carácter y diseñado para disfrutar momentos inolvidables.",
        materiales: "Melamina 18mm color Vison UltraMate / Cuarzo Blanco Espejado",
        herrajes: "Bisagras y cajones telescópicos con cierre suave",
        fotos: [
            { archivo: "malalcahuello1", alt: "Cocina de montaña en melamina Visón con cubierta blanca junto a un ventanal, Proyecto Malalcahuello" },
            { archivo: "malalcahuello2", alt: "Barra de cuarzo con pisos altos en cabaña de madera, Proyecto Malalcahuello" },
            { archivo: "malalcahuello3", alt: "Península de cuarzo blanco integrada al living de la cabaña, Proyecto Malalcahuello" },
            { archivo: "malalcahuello4", alt: "Muebles bajos en melamina Visón con encimera y horno empotrado, Proyecto Malalcahuello" }
        ]
    },
    {
        id: "cocina-lascondes",
        categoria: "cocina",
        titulo: "Proyecto Las Condes",
        etiqueta: "Cocina moderna y elegante",
        descripcion: "Cocina moderna y elegante, realzada por la combinación de melamina Azul Acero y una cubierta de cuarzo blanco. Un diseño que fusiona sofisticación, armonía y alta calidad, creando un espacio contemporáneo donde cada detalle aporta luminosidad, estilo y una experiencia única para disfrutar y compartir.",
        materiales: "Melamina 18mm color Azul Acero/ Cuarzo blanco Snow",
        herrajes: "Bisagras y cajones telescópicos con cierre suave, Iluminación calida para Muebles aereos y Vitrina",
        fotos: [
            { archivo: "lascondes1", alt: "Cocina lineal en melamina azul marino con respaldo tipo mármol, Proyecto Las Condes" },
            { archivo: "lascondes2", alt: "Vitrina iluminada con copas junto a muebles azul marino con tiradores dorados, Proyecto Las Condes" },
            { archivo: "lascondes3", alt: "Lavaplatos con grifería alta y respaldo tipo mármol sobre muebles azules, Proyecto Las Condes" },
            { archivo: "lascondes4", alt: "Muebles altos azul marino con luz LED bajo la cubierta, Proyecto Las Condes" }
        ]
    },
    {
        id: "cocina-temuco",
        categoria: "cocina",
        titulo: "Proyecto Temuco",
        etiqueta: "Cocina moderna en campo",
        descripcion: "Cocina moderna de diseño limpio, realzada por la elegancia de la melamina Azul Acero y una cubierta de cuarzo en tonos amaderados. Una combinación que aporta profundidad, calidez y alta calidad, creando un espacio contemporáneo donde cada línea y cada textura se integran con armonía. El resultado es una cocina sofisticada, equilibrada y diseñada para disfrutar momentos únicos en un ambiente lleno de estilo.",
        materiales: "Melamina 18mm color Azul Acero / Cubiertas de Cuarzo Taupe",
        herrajes: "Bisagras y cajones telescópicos con cierre suave",
        fotos: [
            { archivo: "temuco1", alt: "Lavaplatos bajo ventana con grifería dorada, muebles azules con tiradores dorados y cubierta de cuarzo taupe, Proyecto Temuco" },
            { archivo: "temuco2", alt: "Lavaplatos con grifería dorada y muebles azules sobre piso de baldosa, Proyecto Temuco" },
            { archivo: "temuco3", alt: "Cocina lineal azul con tiradores dorados y piso de baldosa decorativa, Proyecto Temuco" },
            { archivo: "temuco4", alt: "Península de cuarzo y campana de acero sobre muebles azules, Proyecto Temuco" }
        ]
    },
    {
        id: "cocina-olivar-1",
        categoria: "cocina",
        titulo: "Proyecto Olivar 1",
        etiqueta: "Cocina Contemporánea",
        descripcion: "“Cocina contemporánea en tono Gris Grafito, diseñada con un elegante contraste y acompañada de una cubierta de cuarzo que aporta luminosidad, sofisticación y alta calidad. La armonía entre sus materiales y su estética moderna crea un espacio imponente, equilibrado y lleno de carácter, pensado para disfrutar cada momento en un ambiente de diseño excepcional.",
        materiales: "Melamina 18mm Gris Grafito / Cuarzo Blanco Snow",
        herrajes: "Bisagras y rieles ocultos con cierre suave",
        fotos: [
            { archivo: "olivar1", alt: "Cocina en melamina gris grafito con hornos empotrados en columna y cubierta blanca, Proyecto Olivar 1" },
            { archivo: "olivar2", alt: "Península negra con repisa abierta y cubierta blanca, Proyecto Olivar 1" },
            { archivo: "olivar3", alt: "Columna de hornos empotrados en muebles negros, Proyecto Olivar 1" },
            { archivo: "olivar4", alt: "Cocina en L negra con cubierta blanca junto a una ventana, Proyecto Olivar 1" }
        ]
    },
    {
        id: "cocina-shaker",
        categoria: "cocina",
        titulo: "Proyecto Shaker",
        etiqueta: "Cocina Shaker Clásica",
        descripcion: "Cocina clásica de estilo vintage en tono verde, realzada con cubiertas de cuarzo blanco y tiradores de latón que aportan un brillo cálido y sofisticado. Cada detalle ha sido cuidadosamente seleccionado para transmitir elegancia, carácter y alta calidad, creando un ambiente encantador donde la estética tradicional se fusiona con la funcionalidad contemporánea. Un espacio lleno de personalidad, diseñado para disfrutar momentos únicos en un entorno que inspira nostalgia y distinción.",
        materiales: "Melamina 18mm blanco en interior con puertas laminadas estilo Shaker color Verde  / Cuarzo Blanco Snow",
        herrajes: "Tiradores de latón macizo, rieles y bisagras cierre suave, con iluminacion led calida",
        dimensiones: "Largo Base: 4.5m, Isla: 1.8m",
        terminacion: "Pintura satinada de tacto suave y alta durabilidad",
        fotos: [
            { archivo: "shaker1", alt: "Cocina Shaker azul con fregadero cerámico, repisas abiertas e isla, Proyecto Shaker" },
            { archivo: "shaker2", alt: "Encimera y horno en muebles Shaker grises con estantería de madera, Proyecto Shaker" },
            { archivo: "shaker3", alt: "Muebles Shaker grises con torre de microondas y barra con pisos, Proyecto Shaker" },
            { archivo: "shaker4", alt: "Barra con encimera y pisos altos junto a muebles Shaker verde grisáceo, Proyecto Shaker" }
        ]
    },
    {
        id: "cocina-colina",
        categoria: "cocina",
        titulo: "Proyecto Colina",
        etiqueta: "Cocina con Isla",
        descripcion: "Cocina de concepto abierto con frentes en melamina Carvalo y Lino, vitrinas de exhibición iluminadas y una isla central con cubierta de cuarzo blanco Calacatta. Un diseño que combina elegancia, calidez y alta calidad, creando un espacio contemporáneo donde la iluminación, las texturas y los materiales se integran con armonía. Cada detalle está pensado para ofrecer una experiencia sofisticada, funcional y llena de estilo, ideal para disfrutar y compartir en un ambiente moderno y acogedor.",
        materiales: "Melamina 18mm color Carvalo y Lino / Cuarzo Calacatta",
        herrajes: "Bisagras y cajones telescópicos con cierre suave, Iluminación calida para Muebles aereos y Vitrina",
        dimensiones: "Largo Base: 4.8m, Isla: 2.2m",
        terminacion: "Roble natural veteado mate y lacado suave",
        fotos: [
            { archivo: "colina1", alt: "Isla de cuarzo con revestimiento de listones de roble y lámparas colgantes, Proyecto Colina" },
            { archivo: "colina2", alt: "Cocina en roble con vitrinas iluminadas e isla central, Proyecto Colina" },
            { archivo: "colina3", alt: "Cocina en roble con isla y refrigerador de doble puerta, Proyecto Colina" },
            { archivo: "colina4", alt: "Isla con listones de roble y cubierta de cuarzo blanco, Proyecto Colina" }
        ]
    },
    {
        id: "cocina-santiago",
        categoria: "cocina",
        titulo: "Proyecto Santiago",
        etiqueta: "Cocina Integrada",
        descripcion: "Cocina de concepto abierto con una combinación de melamina Gris Grafito y detalles en aluminio, creando un contraste moderno y sofisticado. Las cubiertas de Cuarzo Blanco Sky aportan luminosidad y pureza al diseño, mientras que la repisa abierta con iluminación LED cálida genera una atmósfera acogedora y equilibrada. Cada material y cada línea se integran con precisión para lograr un espacio contemporáneo, funcional y visualmente armónico.",
        materiales: "Melamina 18mm color Gris Grafito y Aluminio/ Cubierta de Cuarzo Blanco Sky",
        herrajes: "Rieles ocultos y bisagras con sistema cierre suave, iluminación Led",
        fotos: [
            { archivo: "santiago_1", alt: "Cocina integrada en melamina gris grafito con muebles hasta el cielo, Proyecto Santiago" },
            { archivo: "santiago_2", alt: "Columna gris grafito con repisas iluminadas junto a una puerta, Proyecto Santiago" },
            { archivo: "santiago_3", alt: "Cocina lineal gris con cubierta blanca y luz LED bajo los muebles altos, Proyecto Santiago" },
            { archivo: "santiago_4", alt: "Encimera con horno empotrado en muebles gris grafito, Proyecto Santiago" }
        ]
    },
    {
        id: "cocina-olivar-2",
        categoria: "cocina",
        titulo: "Proyecto Olivar 2",
        etiqueta: "Cocina Contemporánea",
        descripcion: "Diseño moderno que combina revestimiento Carvalo con melamina en tono Carvalo y Verde Glaciar, creando una composición cálida y contemporánea. Las cubiertas de Cuarzo Blanco Perla aportan luminosidad y pureza al conjunto, mientras que las vitrinas iluminadas con puertas de aluminio negro generan un contraste elegante y sofisticado. Cada material y cada línea se integran con armonía para lograr un espacio funcional, equilibrado y visualmente imponente.",
        materiales: "Melamina 18mm color Verde Glaciar y Carvalo  / Cubierta de Cuarzo Blanco Perla",
        herrajes: "Rieles ocultos y bisagras con sistema cierre suave, iluminación Led, Puertas de aluminio negro",
        fotos: [
            { archivo: "olivar2_1", alt: "Isla de cuarzo con palillaje de madera y vitrinas negras iluminadas, Proyecto Olivar 2" },
            { archivo: "olivar2_2", alt: "Muebles verde salvia y panel de palillaje iluminado con hornos empotrados, Proyecto Olivar 2" },
            { archivo: "olivar2_3", alt: "Isla blanca con base de palillaje frente a muebles verde salvia, Proyecto Olivar 2" },
            { archivo: "olivar2_4", alt: "Isla con cubierta en cascada y vitrina negra al fondo, Proyecto Olivar 2" }
        ]
    },
    {
        id: "cocina-mostazal",
        categoria: "cocina",
        titulo: "Proyecto Mostazal",
        etiqueta: "Cocina Integrada",
        descripcion: "Diseño elegante de cocina a medida con una combinación de melamina Negro Matt y Colina, creando un contraste moderno y sofisticado. Las cubiertas de Cuarzo Blanco Cristal aportan luminosidad y pureza al espacio, mientras que la vitrina y los muebles aéreos con iluminación LED cálida generan una atmósfera acogedora y equilibrada. Cada material y cada línea se integran con precisión para lograr una cocina contemporánea, funcional y visualmente imponente.",
        materiales: "Melamina 18mm color Negro Matt y Colina  / Cubierta de Cuarzo Blanco Cristal",
        herrajes: "Rieles ocultos y bisagras con sistema cierre suave, iluminación led",
        fotos: [
            { archivo: "mostazal1", alt: "Cocina negra con muebles altos de madera y vitrina vertical iluminada, Proyecto Mostazal" },
            { archivo: "mostazal2", alt: "Muebles altos color madera con luz LED sobre cubierta blanca, Proyecto Mostazal" },
            { archivo: "mostazal3", alt: "Cocina en L con base negra, muebles de madera y vitrina iluminada, Proyecto Mostazal" },
            { archivo: "mostazal4", alt: "Cocina negra y madera bajo cielo de madera, Proyecto Mostazal" }
        ]
    },
    {
        id: "closet-luxury",
        categoria: "walk-in",
        titulo: "Walk-in Closet",
        etiqueta: "Walk-in Closet",
        descripcion: "Nuestros walk‑in closets están diseñados como espacios de organización integral, fabricados en melamina de 18 mm en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias, proporciones equilibradas y una distribución arquitectónica que optimiza el recorrido y la funcionalidad. La modulación, iluminación y selección de materiales se trabajan con precisión para crear un ambiente elegante, práctico y de alta calidad, donde el orden se vive como una experiencia y la estética se integra con total armonía, logrando un espacio sofisticado, amplio y perfectamente equilibrado.",
        materiales: "Melamina Blanca Seda / Tableros de Roble Veteado",
        herrajes: "Rieles ocultos Hettich soft-close, perfiles LED empotrados con sensor",
        dimensiones: "Ancho: 4.2m, Fondo: 3.5m",
        terminacion: "Interiores lacados y cantos de PVC termolaminados de alta resistencia",
        fotos: [
            { archivo: "walkin_closet1", alt: "Walk-in closet blanco con repisas para zapatos y ropa colgada a ambos lados" },
            { archivo: "walkin_closet3", alt: "Pasillo de walk-in closet blanco con repisas y cajoneras" },
            { archivo: "walkin_closet4", alt: "Walk-in closet con repisas blancas y cajones en madera oscura" }
        ]
    },
    {
        id: "tv-wall-luxury",
        categoria: "decorativo",
        titulo: "Mueble Bar y Cava",
        etiqueta: "Mobiliario Bar & Cava",
        descripcion: "Mueble bar y cava integrado a medida en melamina nogal amazónico. Vitrinas con marcos de aluminio negro, cristal templado y repisas con iluminación cálida LED sensorizada.",
        materiales: "Melamina 18mm Nogal Amazónico / Cristal Templado / Aluminio Negro",
        herrajes: "Rieles ocultos y bisagras cierre suave e iluminación LED empotrada",
        dimensiones: "Ancho: 2.8m, Alto: 2.4m",
        terminacion: "Barniz protector satinado anticuñas",
        fotos: [
            { archivo: "tv_condes1", alt: "Mueble bar con vitrina de licores, cava y repisas iluminadas junto a mesa de madera, Mueble Bar y Cava" },
            { archivo: "tv_condes2", alt: "Vitrina negra con botellas y cava de vinos en mueble de madera iluminado, Mueble Bar y Cava" },
            { archivo: "tv_condes3", alt: "Mueble bar y cava con puertas de vidrio y repisas iluminadas, Mueble Bar y Cava" }
        ]
    },
    {
        id: "quinchos",
        categoria: "decorativo",
        titulo: "Proyecto Rack TV",
        etiqueta: "Mobiliario Rack TV",
        descripcion: "Exclusivo centro de entretenimiento y mueble para TV a medida con revestimiento de palillaje acústico en roble natural, vitrinas de exhibición laterales iluminadas con tiras LED cálidas de encendido suave y cava de vinos integrada.",
        materiales: "Melamina 18mm Teca Italia / Revestimiento Wall Panel / Vidrio",
        herrajes: "Rieles ocultos y bisagras cierre suave e iluminación LED integrada sensorizada",
        dimensiones: "Ancho: 3.6m, Alto: 2.5m, Fondo: 0.45m",
        terminacion: "Barniz protector satinado de alta durabilidad",
        fotos: [
            { archivo: "chicureo1", alt: "Columna de repisas iluminadas con cava junto a panel de listones para TV, Proyecto Rack TV" },
            { archivo: "chicureo2", alt: "Rack de TV con panel de listones de madera oscura y vitrinas laterales iluminadas, Proyecto Rack TV" },
            { archivo: "chicureo3", alt: "Mueble de TV con listones oscuros, luz LED inferior y repisas de vidrio, Proyecto Rack TV" }
        ]
    },
    {
        id: "closet-noble-mostazal",
        categoria: "closet",
        titulo: "Proyecto Closet",
        etiqueta: "Closet Integrado",
        descripcion: "Todos nuestros closets son fabricados en melamina de 18 mm, disponibles en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias y un estilo único que resalta la organización y la funcionalidad. Cada módulo y cada detalle han sido cuidadosamente trabajados para ofrecer un espacio elegante, práctico y de alta calidad, donde el orden se convierte en protagonista y la estética se integra con total armonía, creando un ambiente sofisticado y perfectamente equilibrado.",
        materiales: "Melamina 18mm Color Blanco / Tiradores de Acero Color Negro",
        herrajes: "Tiradores de perfil de aluminio negro mate, bisagras cierre suave",
        dimensiones: "Ancho: 3.2m, Alto: 2.4m, Fondo: 0.6m",
        terminacion: "Frentes de puertas lisos antihuella soft-touch premium",
        fotos: [
            { archivo: "closet1", alt: "Closet de cuatro puertas lisas blancas con tiradores negros, Proyecto Closet" },
            { archivo: "closet2", alt: "Closet y escritorio en melamina gris bajo techo de madera, Proyecto Closet" },
            { archivo: "closet3", alt: "Cajonera en melamina gris con tiradores negros, Proyecto Closet" },
            { archivo: "closet4", alt: "Closet con cajonera bajo la ventana en dormitorio con techo de madera, Proyecto Closet" }
        ]
    },
    {
        id: "closets",
        categoria: "walk-in",
        titulo: "Walk-in Closets",
        etiqueta: "Walk-in Closet",
        descripcion: "Nuestros walk‑in closets están diseñados como espacios de organización integral, fabricados en melamina de 18 mm en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias, proporciones equilibradas y una distribución arquitectónica que optimiza el recorrido y la funcionalidad. La modulación, iluminación y selección de materiales se trabajan con precisión para crear un ambiente elegante, práctico y de alta calidad, donde el orden se vive como una experiencia y la estética se integra con total armonía, logrando un espacio sofisticado, amplio y perfectamente equilibrado.",
        materiales: "Melamina Roble Veteado / Cristal Templado / Aluminio",
        herrajes: "Rieles ocultos de extracción total soft-close and sensores de presencia",
        dimensiones: "Ancho: 4.0m, Fondo: 3.8m",
        terminacion: "Herrajes integrados y marcos de aluminio negro anodizado",
        fotos: [
            { archivo: "walkin_closet_main", alt: "Walk-in closet con repisas en melamina gris a ambos lados del pasillo, Walk-in Closets" }
        ]
    }
];

/* Carrusel "Proyectos Destacados": se muestran en este orden */
window.DESTACADOS = [
    { archivo: "featured_1", alt: "Cocina en L gris oscuro con refrigerador de acero y luz LED" },
    { archivo: "featured_2", alt: "Cocina en L en melamina color madera con repisas iluminadas" },
    { archivo: "featured_3", alt: "Cocina gris oscuro con isla y cubierta blanca" },
    { archivo: "featured_4", alt: "Cocina con isla gris bajo vigas de madera" },
    { archivo: "featured_5", alt: "Dormitorio con respaldo iluminado y muebles altos sobre la cama" },
    { archivo: "featured_6", alt: "Cocina color chocolate con península y lámparas colgantes" },
    { archivo: "featured_7", alt: "Cocina negra con vitrinas superiores iluminadas y cubierta blanca" },
    { archivo: "featured_8", alt: "Isla con cubierta oscura, panel de palillaje y vitrina iluminada" },
    { archivo: "featured_9", alt: "Cocina con isla negra y muebles altos blancos brillantes" },
    { archivo: "featured_10", alt: "Cocina con península y muebles verde salvia con cubierta blanca" },
    { archivo: "featured_11", alt: "Detalle de isla en roble con listones y placa de MuebleríaLG" },
    { archivo: "featured_12", alt: "Cocina negra con isla de cuarzo en casa con vigas de madera" },
    { archivo: "featured_13", alt: "Isla de cuarzo blanco con revestimiento de madera y grifería negra" },
    { archivo: "featured_14", alt: "Cocina en melamina nogal con cava integrada en la península" },
    { archivo: "featured_15", alt: "Vitrina con copas iluminada y cajones extraíbles para vinos" },
    { archivo: "featured_16", alt: "Cocina negra con isla central y luz LED en el zócalo" },
    { archivo: "featured_17", alt: "Closet negro de piso a cielo con puertas de vidrio y luz interior" },
    { archivo: "featured_18", alt: "Cocina negra con respaldo de baldosa decorativa" }
];

/* Sección "Proyectos Renderizados" (renders 3D) */
window.RENDERS = [
    {
        archivo: "render_1",
        alt: "Render 3D de cocina en melamina gris grafito con cubierta de cuarzo blanco",
        titulo: "Render Cocina Gris Grafito, Aluminio y Cuarzo Blanco",
        resumen: "Simulación de melamina gris mate y cubiertas de cuarzo blanco",
        etiqueta: "Render 3D",
        descripcion: "Simulación fotorrealista de melamina gris mate y cubiertas de cuarzo blanco con iluminación LED decorativa integrada.",
        materiales: "Melamina Gris Mate / Cuarzo Blanco",
        herrajes: "Perfiles LED empotrados / Bisagras cierre suave",
        dimensiones: "Ancho: 4.5m, Alto: 2.3m",
        terminacion: "Tacto antihuella soft-touch premium",
    },
    {
        archivo: "render_2",
        alt: "Render 3D de cocina en melamina roble y negro con vitrina iluminada",
        titulo: "Render Cocina Roble y Negro",
        resumen: "Visualización de iluminación LED cálida y repisas suspendidas",
        etiqueta: "Render 3D",
        descripcion: "Simulación de cocina moderna en melamina roble y negro, con vitrina iluminada de exhibición lateral y tiradores ocultos.",
        materiales: "Melamina Roble y Negro Mate / Cristal Templado",
        herrajes: "Iluminación LED cálida sensorizada y bisagras cierre suave",
        dimensiones: "Ancho: 3.8m, Alto: 2.4m",
        terminacion: "Vitrinas de aluminio con cristal templado",
    },
    {
        archivo: "render_3",
        alt: "Render 3D de cocina verde oliva con isla revestida en madera",
        titulo: "Render Cocina Verde Oliva",
        resumen: "Simulación de espacio integrado con isla central en palillaje",
        etiqueta: "Render 3D",
        descripcion: "Visualización de cocina de concepto abierto con frentes en melamina verde oliva, campana decorativa y una isla funcional con revestimiento de palillaje.",
        materiales: "Melamina Verde Oliva / Madera Natural / Cuarzo Blanco",
        herrajes: "Rieles ocultos de extracción total soft-close",
        dimensiones: "Largo Base: 4.2m, Isla: 2.0m",
        terminacion: "Combinación de melamina texturada y lacado satinado",
    },
    {
        archivo: "render_4",
        alt: "Render 3D de mueble divisor con TV, palillaje de madera y vitrinas iluminadas",
        titulo: "Render Divisor de Espacios con TV",
        resumen: "Panel divisorio funcional con palillaje de madera y vitrinas",
        etiqueta: "Render 3D",
        descripcion: "Estructura divisoria funcional a doble cara, revestida con palillaje de madera, soporte integrado para Smart TV y vitrinas laterales retroiluminadas.",
        materiales: "Estructura de MDF Lacado / Palillaje de Madera / Cristal Templado",
        herrajes: "Iluminación cálida LED empotrada, herrajes ocultos y pasacables",
        dimensiones: "Ancho: 3.0m, Alto: 2.4m, Fondo: 0.4m",
        terminacion: "Revestimiento en roble natural semibrillo de alta durabilidad",
    }
];
