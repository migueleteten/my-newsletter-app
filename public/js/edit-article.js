// Variable para mantener los editores Quill
const quillEditors = {};

// Variable para mantener un contador de bloques
let blockCount = 0;

// Función para añadir un bloque de contenido existente
function addExistingContentBlock(type, content) {
    // Incrementar el contador de bloques para asignar IDs únicos
    blockCount++;

    // Crear el bloque de contenido HTML con el tipo y contenido ya seleccionados
    const blockHtml = `
        <div class="content-block card-panel" id="content-block-${blockCount}">
            <div class="input-field">
                <select class="block-type" onchange="handleBlockTypeChange(${blockCount})">
                    <option value="" disabled>Selecciona tipo de contenido</option>
                    <option value="text" ${type === 'text' ? 'selected' : ''}>Texto</option>
                    <option value="image" ${type === 'image' ? 'selected' : ''}>Imagen</option>
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

    // Manejar el tipo de bloque (texto o imagen)
    if (type === 'text') {
        // Añadir el editor Quill para texto
        const quillHtml = `<div id="quill-editor-${blockCount}" class="quill-editor" style="height: 200px;"></div>`;
        $(`#block-content-${blockCount}`).append(quillHtml);

        // Inicializar Quill con el contenido existente
        const quill = new Quill(`#quill-editor-${blockCount}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    ['link'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                ]
            }
        });
        quill.root.innerHTML = content;  // Establecer el contenido enriquecido existente
        quillEditors[blockCount] = quill;  // Guardar la instancia de Quill
    } else if (type === 'image') {
        console.log('bloque de imagen detectado');
        // Añadir el bloque de imagen con la vista previa de la imagen existente
        const imageHtml = `
            <input type="file" class="image-input" id="block-image-${blockCount}" accept="image/*" onchange="previewImage(event, ${blockCount})" />
            <div class="image-preview" id="image-preview-${blockCount}">
                <img src="${content}" alt="Imagen seleccionada" style="max-width: 100%; max-height: 300px;" />
            </div>
        `;
        $(`#block-content-${blockCount}`).append(imageHtml);
    
        // Guardar la imagen existente en el bloque de contenido
        $(`#content-block-${blockCount}`).data('webpBase64', content); // Almacenar el contenido base64 en el bloque
    }
}

// Rellenar el campo de etiquetas
function populateTags(tags) {
    $('#article-tags').val(tags.join(', '));  // Convertir array a cadena separada por comas
}

// Función para obtener el nombre de la sección
function fetchSectionName(sectionId) {
    $.ajax({
        url: `/api/sections/${sectionId}`,  // Asegúrate de que esta ruta existe y devuelve el nombre de la sección
        method: 'GET',
        success: function(data) {
            if (data && data.title) {
                $('#section-name').text(`Sección: ${data.title}`);
            } else {
                console.error('Error: No se encontró la sección.');
                M.toast({ html: 'Error al obtener el nombre de la sección.' });
            }
        },
        error: function(err) {
            console.error('Error al obtener la sección:', err);
            M.toast({ html: 'Error al obtener la sección.' });
        }
    });
}

// Función para obtener el nombre de la subsección
function fetchSubsectionName(sectionId, subsectionId) {
    $.ajax({
        url: `/api/sections/${sectionId}/subsections/${subsectionId}`,  // Asegúrate de que esta ruta existe y devuelve el nombre de la subsección
        method: 'GET',
        success: function(data) {
            if (data && data.title) {
                $('#subsection-name').text(`Subsección: ${data.title}`);
                $('#subsection-name').show();
            } else {
                console.error('Error: No se encontró la subsección.');
                M.toast({ html: 'Error al obtener el nombre de la subsección.' });
            }
        },
        error: function(err) {
            console.error('Error al obtener la subsección:', err);
            M.toast({ html: 'Error al obtener la subsección.' });
        }
    });
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
            const webpImageData = canvas.toDataURL('image/webp', 0.4); // Convertir a .webp con calidad 80%

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

// Función para eliminar un bloque de contenido
function removeContentBlock(blockId) {
    $(`#content-block-${blockId}`).remove();
}

$(document).ready(function() {
    // Recuperar el ID del artículo del localStorage
    const articleId = localStorage.getItem('articleId');

    if (!articleId) {
        console.error('Error: No se encontró el articleId en localStorage.');
        M.toast({ html: 'Error: No se encontró el artículo.' });
        return;
    }

    // Hacer una solicitud GET para obtener los detalles del artículo
    $.ajax({
        url: `/api/articles/${articleId}`,
        method: 'GET',
        success: function(data) {
            const sectionId = data.sectionId;  // Obtener sectionId del artículo
            const subsectionId = data.subsectionId;  // Obtener subsectionId del artículo (si existe)

            // Llamar a las funciones para rellenar los datos del artículo
            fetchSectionName(sectionId);  // Rellenar el nombre de la sección
            if (subsectionId) {
                fetchSubsectionName(sectionId, subsectionId);  // Rellenar el nombre de la subsección, si existe
            } else {
                $('#subsection-name').hide();  // Si no hay subsección, ocultar el campo
            }

            populateTags(data.tags);  // Rellenar el campo de etiquetas
            $('#article-title').val(data.title);  // Rellenar el título del artículo
            M.updateTextFields();  // Asegurarse de que los labels no se superpongan

            // Rellenar los bloques de contenido existentes
            data.contentBlocks.forEach(block => {
                addExistingContentBlock(block.type, block.content);
            });
        },
        error: function(err) {
            console.error('Error al cargar el artículo:', err);
            M.toast({ html: 'Error al cargar el artículo.' });
        }
    });

    // Manejar el formulario de edición de artículo
    $('#article-form').on('submit', function(event) {
        event.preventDefault();

        const title = $('#article-title').val();
        const tags = $('#article-tags').val().split(',').map(tag => tag.trim());
        const { contentBlocks, promises } = getEditedContentBlocks();

        // Verificar que el título está presente
        if (!title) {
            M.toast({ html: 'Error: El título es obligatorio.' });
            return;
        }

        // Esperar a que todas las promesas de lectura de imágenes se resuelvan
        Promise.all(promises).then(() => {
            // Verificar que al menos hay un bloque de contenido
            if (contentBlocks.length === 0) {
                M.toast({ html: 'Error: Debes añadir al menos un bloque de contenido.' });
                return;
            }

            // Hacer la solicitud PUT para actualizar el artículo
            $.ajax({
                url: `/api/articles/${articleId}`, // Aquí usamos el articleId para editar
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ title, contentBlocks, tags }),
                success: function() {
                    window.location.href = '/admin/sections';  // Redirigir de nuevo a la página de secciones
                    M.toast({ html: 'Artículo actualizado correctamente' });
                },
                error: function(err) {
                    console.error('Error al actualizar el artículo:', err);
                    M.toast({ html: 'Error al actualizar el artículo' });
                }
            });
        }).catch(err => {
            console.error('Error al procesar los archivos:', err);
            M.toast({ html: 'Error al procesar las imágenes.' });
        });
    });

    // Aquí debería haber una función para inicializar Quill, por ejemplo, al cargar bloques existentes.
});

// Función para manejar las imágenes con FileReader (promesas para control asincrónico)
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file); // Leer como base64
    });
}

// Función para obtener los bloques de contenido (con Quill)
function getEditedContentBlocks() {
    const contentBlocks = [];
    const promises = [];

    $('.content-block').each(function() {
        const blockId = $(this).attr('id').split('-')[2];  // Obtener el ID del bloque
        const blockType = $(this).find('.block-type').val();  // Cambié a data-type para simplificar el uso

        if (blockType === 'text') {
            const quill = quillEditors[blockId];  // Recuperar la instancia de Quill
            const richTextContent = quill.root.innerHTML;  // Obtener el contenido HTML generado por Quill
            contentBlocks.push({
                type: 'text',
                content: richTextContent  // Guardar el contenido HTML enriquecido
            });
        } else if (blockType === 'image') {
            const imageFileInput = $(this).find('input[type="file"]')[0];  // Obtener el input de la imagen

            if (imageFileInput && imageFileInput.files.length > 0) {
                // Convertir la imagen a base64
                const imagePromise = readFileAsBase64(imageFileInput.files[0]).then(base64Image => {
                    contentBlocks.push({
                        type: 'image',
                        content: base64Image // Imagen en base64
                    });
                });
                promises.push(imagePromise);
            } else {
                // Mantener la imagen original si no se ha cambiado
                const existingImageBase64 = $(this).data('webpBase64');  // Recuperar imagen existente
                if (existingImageBase64) {
                    contentBlocks.push({
                        type: 'image',
                        content: existingImageBase64 // Imagen en base64 existente
                    });
                }
            }
        }
    });

    // Retornar un objeto con los bloques de contenido y las promesas
    return { contentBlocks, promises };
}