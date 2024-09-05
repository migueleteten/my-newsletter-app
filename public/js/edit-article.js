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

    // Inicializar el selector de tipo de contenido con Materialize
    $('select').formSelect();

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
                    ['link', 'image'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                ]
            }
        });
        quill.root.innerHTML = content;  // Establecer el contenido enriquecido existente
        quillEditors[blockCount] = quill;  // Guardar la instancia de Quill
    } else if (type === 'image') {
        // Añadir el bloque de imagen con la vista previa de la imagen existente
        const imageHtml = `
            <input type="file" class="image-input" accept="image/*" onchange="handleImageUpload(${blockCount})" />
            <div class="image-preview">
                <img src="${content}" alt="Imagen seleccionada" style="max-width: 100%; max-height: 300px;" />
            </div>
        `;
        $(`#block-content-${blockCount}`).append(imageHtml);
    }
}

// Rellenar la información de sección y subsección
function populateSectionAndSubsection(sectionId, subsectionId) {
    // Obtener el nombre de la sección
    $.ajax({
        url: `/api/sections/${sectionId}`,
        method: 'GET',
        success: function(section) {
            $('#section-name').text(`Sección: ${section.title}`);
        },
        error: function(err) {
            console.error('Error al obtener la sección:', err);
        }
    });

    // Obtener el nombre de la subsección, si existe
    if (subsectionId) {
        $.ajax({
            url: `/api/sections/${sectionId}/subsections/${subsectionId}`,
            method: 'GET',
            success: function(subsection) {
                $('#subsection-name').text(`Subsección: ${subsection.title}`);
            },
            error: function(err) {
                console.error('Error al obtener la subsección:', err);
            }
        });
    } else {
        $('#subsection-name').hide(); // Si no hay subsección, ocultar el campo
    }
}

// Rellenar el campo de etiquetas
function populateTags(tags) {
    $('#article-tags').val(tags.join(', '));  // Convertir array a cadena separada por comas
}

$(document).ready(function() {
    // Variable para mantener los editores Quill
    const quillEditors = {};

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
                    // Si hay una nueva imagen, leerla y agregarla
                    const imagePromise = readFileAsBase64(imageFile).then(base64Image => {
                        contentBlocks.push({
                            type: 'image',
                            content: base64Image // Imagen en base64
                        });
                    });
                    promises.push(imagePromise); // Añadir la promesa para esperar
                } else {
                    // Si no hay nueva imagen, mantener la imagen existente
                    const existingImageSrc = $(this).find('img').attr('src');
                    contentBlocks.push({
                        type: 'image',
                        content: existingImageSrc // Mantener la imagen original
                    });
                }
            }
        });

        return { contentBlocks, promises };
    }

    // Manejar el formulario de edición de artículo
    $('#article-form').on('submit', function(event) {
        event.preventDefault();

        const title = $('#article-title').val();
        const tags = $('#article-tags').val().split(',').map(tag => tag.trim());
        const { contentBlocks, promises } = getContentBlocks();

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
                    M.toast({ html: 'Artículo actualizado correctamente' });
                    window.location.href = '/admin/sections';  // Redirigir de nuevo a la página de secciones
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