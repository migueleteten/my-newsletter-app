$(document).ready(function() {
    // Recuperar los IDs de la sección y subsección desde localStorage
    const sectionId = localStorage.getItem('sectionId');
    const sectionName = localStorage.getItem('sectionName');
    const subsectionId = localStorage.getItem('subsectionId');
    const subsectionName = localStorage.getItem('subsectionName');

    // Mostrar la información de la sección y subsección en la página
    if (sectionId) {
        $('#section-name').text(`Sección: ${sectionName}`);
    }

    if (subsectionId) {
        $('#subsection-name').text(`Subsección: ${subsectionName}`);
    } else {
        $('#subsection-name').hide(); // Si no hay subsección, ocultar el campo
    }

    // Manejar el formulario de creación de artículo
    $('#article-form').on('submit', function(event) {
        event.preventDefault();

        const title = $('#article-title').val();
        const tags = $('#article-tags').val().split(',').map(tag => tag.trim());
        const sectionId = localStorage.getItem('sectionId');
        const subsectionId = localStorage.getItem('subsectionId');
        
        // Verificar que se ha seleccionado una sección y hay un título
        if (!title || !sectionId) {
            M.toast({ html: 'Error: El título y la sección son obligatorios.' });
            return;
        }

        // Obtener bloques de contenido
        const { contentBlocks, promises } = getContentBlocks();

        // Esperar a que todas las promesas de lectura de imágenes se resuelvan
        Promise.all(promises).then(() => {
            // Verificar que al menos hay un bloque de contenido
            if (contentBlocks.length === 0) {
                M.toast({ html: 'Error: Debes añadir al menos un bloque de contenido.' });
                return;
            }

            // Hacer la solicitud para crear el artículo
            $.ajax({
                url: `/api/sections/${sectionId}/articles`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ title, contentBlocks, tags, sectionId, subsectionId }),
                success: function() {
                    M.toast({ html: 'Artículo creado correctamente' });
                    window.location.href = '/admin/sections';  // Redirigir de nuevo a la página de secciones
                },
                error: function(err) {
                    console.error('Error al crear el artículo:', err);
                    M.toast({ html: 'Error al crear el artículo' });
                }
            });
        }).catch(err => {
            console.error('Error al procesar las imágenes:', err);
            M.toast({ html: 'Error al procesar las imágenes.' });
        });
    });
});

// Variable para mantener un contador de bloques
let blockCount = 0;

// Array para almacenar las instancias de Quill (editor enriquecido)
let quillEditors = {};

// Función para añadir un bloque de contenido
function addContentBlock() {
    // Incrementar el contador de bloques para asignar IDs únicos
    blockCount++;

    // Crear el bloque de contenido HTML
    const blockHtml = `
        <div class="content-block card-panel" id="content-block-${blockCount}">
            <div class="input-field">
                <select class="block-type" onchange="handleBlockTypeChange(${blockCount})">
                    <option value="" disabled selected>Selecciona tipo de contenido</option>
                    <option value="text">Texto</option>
                    <option value="image">Imagen</option>
                </select>
                <label>Tipo de Contenido</label>
            </div>
            <div class="block-content" id="block-content-${blockCount}">
                <!-- Aquí se añadirá el contenido específico dependiendo del tipo -->
            </div>
            <a href="#!" class="remove-block btn-flat red-text" onclick="removeContentBlock(${blockCount})">
                <i class="material-icons">delete</i> Eliminar Bloque
            </a>
        </div>
    `;

    // Añadir el bloque al contenedor de bloques de contenido
    $('#content-blocks').append(blockHtml);

    // Inicializar el selector de tipo de contenido con Materialize, evitando que lo de Quill se cambie
    $('select').not('.ql-header').formSelect();
}

// Función para manejar el cambio de tipo de bloque (texto o imagen)
function handleBlockTypeChange(blockId) {
    const selectedType = $(`#content-block-${blockId} .block-type`).val();
    const contentContainer = $(`#block-content-${blockId}`);

    // Limpiar el contenido actual
    contentContainer.empty();

    // Añadir el contenido dependiendo del tipo seleccionado
    if (selectedType === 'text') {
        contentContainer.append(`
            <div class="input-field">
                <div id="quill-editor-${blockId}" class="quill-editor" style="height: 200px;"></div>
            </div>
        `);

        // Inicializar el editor Quill
        const quill = new Quill(`#quill-editor-${blockId}`, {
            theme: 'snow',
            placeholder: 'Escribe tu texto aquí...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'], // Negrita, cursiva, subrayado
                    ['link'], // Enlaces
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ]
            }
        });

        // Guardar la instancia de Quill en el array para referencia futura
        quillEditors[blockId] = quill;

    } else if (selectedType === 'image') {
        contentContainer.append(`
            <div class="file-field input-field" id="image-input">
                <div class="btn">
                    <span>Subir Imagen</span>
                    <input type="file" id="block-image-${blockId}" accept="image/*" capture="camera" onchange="previewImage(event, ${blockId})">
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text" placeholder="Selecciona una imagen">
                </div>
            </div>
            <div class="image-preview" id="image-preview-${blockId}">
                <!-- Aquí se mostrará la vista previa de la imagen -->
            </div>
        `);
    }
}

// Función para generar la vista previa de la imagen cargada y convertirla a .webp
function previewImage(event, blockId) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const imagePreview = $(`#image-preview-${blockId}`);
        const img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            // Crear un canvas para convertir la imagen a .webp
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Establecer el tamaño del canvas
            canvas.width = img.width;
            canvas.height = img.height;

            // Dibujar la imagen en el canvas
            ctx.drawImage(img, 0, 0);

            // Convertir la imagen del canvas a .webp y base64
            const webpImageData = canvas.toDataURL('image/webp', 0.8); // Convertir a .webp con calidad 80%

            // Mostrar la imagen convertida como vista previa
            imagePreview.html(`<img src="${webpImageData}" alt="Vista previa" class="responsive-img">`);

            // Guardar la imagen convertida en base64 en el bloque de contenido
            $(`#content-block-${blockId}`).data('webpBase64', webpImageData);
        };
    };

    if (file) {
        reader.readAsDataURL(file); // Leer la imagen como base64
    }
}

// Función para eliminar un bloque de contenido
function removeContentBlock(blockId) {
    $(`#content-block-${blockId}`).remove();
}

// Función para convertir un archivo a base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file); // Leer el archivo como base64
    });
}

// Función para obtener los bloques de contenido (texto enriquecido y/o imágenes)
function getContentBlocks() {
    const contentBlocks = [];
    const promises = [];

    $('.content-block').each(function() {
        const blockId = $(this).attr('id').split('-')[2];  // Obtener el ID del bloque
        const blockType = $(this).find('.block-type').val();

        if (blockType === 'text') {
            const quill = quillEditors[blockId];  // Recuperar la instancia de Quill
            const richTextContent = quill.root.innerHTML;  // Obtener el contenido HTML generado por Quill
            contentBlocks.push({
                type: 'text',
                content: richTextContent  // Guardar el contenido HTML enriquecido
            });
        } else if (blockType === 'image') {
            const imageFile = $(this).find('input[type="file"]')[0].files[0];

            if (imageFile) {
                // Convertir la imagen a base64
                const imagePromise = readFileAsBase64(imageFile).then(base64Image => {
                    contentBlocks.push({
                        type: 'image',
                        content: base64Image // Imagen en base64
                    });
                });
                promises.push(imagePromise);
            }
        }
    });

    // Retornar un objeto con los bloques de contenido y las promesas
    return { contentBlocks, promises };
}
