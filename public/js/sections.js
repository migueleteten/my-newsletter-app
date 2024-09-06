// Función para cargar secciones, subsecciones y artículos
function loadSections(callback) {
    $.ajax({
        url: '/api/sections',
        method: 'GET',
        success: function(data) {
            $('.collapsible').empty();
            data.forEach(section => {
                const sectionHtml = `
                    <li>
                        <div class="collapsible-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <i class="material-icons" style="color:${section.color};vertical-align: middle;">folder</i>
                                <span>${section.title}</span>
                            </div>
                            <div class="collapsible-header-icons-right">
                                <a href="#!" class="secondary-content" onclick="deleteSection('${section._id}')">
                                    <i class="material-icons">delete</i>
                                </a>
                                <a href="#!" class="secondary-content" onclick="editSection('${section._id}')">
                                    <i class="material-icons">edit</i>
                                </a>
                                <a href="#!" class="secondary-content" onclick="redirectToCreateArticle('${section._id}', null, '${section.title}')">
                                    <i class="material-icons">note_add</i>
                                </a>
                            </div>
                        </div>
                        <div class="collapsible-body">
                            <ul>
                                <!-- Iterar sobre subsecciones -->
                                ${section.subsections.map(subsection => `
                                    <hr>
                                    <li class="subsection" style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <i class="material-icons" style="vertical-align: middle;margin-right: 1rem;">subdirectory_arrow_right</i>
                                            <span>${subsection.title}</span>
                                        </div>
                                        <div class="collapsible-body-icons-right" style="display: flex; align-items: center;">
                                            <a href="#!" class="secondary-content" onclick="redirectToCreateArticle('${section._id}', '${subsection._id}', '${section.title}', '${subsection.title}')" style="vertical-align: middle;">
                                                <i class="material-icons" style="margin-right: 1rem">note_add</i>
                                            </a>
                                            <a href="#!" class="secondary-content" onclick="editSubsection('${section._id}', '${subsection._id}')" style="vertical-align: middle;">
                                                <i class="material-icons" style="margin-right: 1rem;">edit</i>
                                            </a>
                                            <a href="#!" class="secondary-content" onclick="deleteSubsection('${section._id}', '${subsection._id}')" style="vertical-align: middle;">
                                                <i class="material-icons" style="margin-right: 1rem;">delete</i>
                                            </a>
                                        </div>
                                    </li>

                                    <!-- Artículos de la subsección -->
                                    <ul style="margin-top: 10px;">
                                        ${subsection.articles ? subsection.articles.map(article => `
                                            <li class="subsection-article" style="display: flex; justify-content: space-between; align-items: center; padding-left: 2rem; padding-right: 5rem;" data-id="${article._id}"> <!-- Ajustamos la sangría con padding-left -->
                                                <div>
                                                    <i class="material-icons" style="vertical-align: middle;margin-right: 1rem;">description</i>
                                                    <span>${article.title}</span>
                                                </div>
                                                <div class="subsection-article-icons-right" style="display: flex; align-items: center">
                                                    <a href="#!" class="secondary-content" onclick="toggleStarArticle('${article._id}')" style="vertical-align: middle;">
                                                        <i class="material-icons" style="color: gray;">${article.starred ? 'star' : 'star_border'}</i>
                                                    </a>
                                                    <a href="#!" class="secondary-content" onclick="editArticle('${article._id}')" style="vertical-align: middle;">
                                                        <i class="material-icons" style="color: gray;">edit</i>
                                                    </a>
                                                    <a href="#!" class="secondary-content" onclick="deleteArticle('${article._id}')" style="vertical-align: middle;">
                                                        <i class="material-icons" style="color: gray;">delete</i>
                                                    </a>
                                                </div>
                                            </li>
                                        `).join('') : '<li>No hay artículos en esta subsección.</li>'}
                                    </ul>                                 
                                `).join('')}
                                
                                <!-- Artículos de la sección (que no están en subsecciones) -->
                                <hr>
                                ${section.articles ? section.articles.map(article => `
                                    <li class="section-article" style="display: flex; justify-content: space-between; align-items: center;" data-id="${article._id}">
                                        <div>
                                            <i class="material-icons" style="vertical-align: middle;margin-right: 1rem;">description</i>
                                            <span>${article.title}</span>
                                        </div>
                                        <div class="section-article-icons-right" style="display: flex; align-items: center;">
                                            <a href="#!" class="secondary-content" onclick="toggleStarArticle('${article._id}')" style="vertical-align: middle;">
                                                <i class="material-icons">${article.starred ? 'star' : 'star_border'}</i>
                                            </a>
                                            <a href="#!" class="secondary-content" onclick="editArticle('${article._id}')" style="vertical-align: middle;">
                                                <i class="material-icons">edit</i>
                                            </a>
                                            <a href="#!" class="secondary-content" onclick="deleteArticle('${article._id}')" style="vertical-align: middle;">
                                                <i class="material-icons">delete</i>
                                            </a>
                                        </div>
                                    </li>
                                `).join('') : '<li>No hay artículos en esta sección.</li>'}
                                
                                <!-- Botón para añadir subsección -->
                                <li style="border-top: solid 1px darkgray;margin-top: 5px;padding:10px;">
                                    <a href="#!" class="secondary-content" onclick="openAddSubsectionModal('${section._id}')" style="border-top: darkgray;display: flex;align-items: center;float: left;">
                                        <i class="material-icons" style="margin-right: 5px">add_circle</i> Añadir Subsección
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>
                `;
                $('.collapsible').append(sectionHtml);
            });
            $('.collapsible').collapsible();

            // Llamar al callback después de actualizar el DOM
            if (callback && typeof callback === 'function') {
                callback(); // El callback que maneja abrir la sección activa
            }
        },
        error: function() {
            M.toast({html: 'Error al cargar las secciones.'});
        }
    });
}

// Función para editar una sección
function editSection(sectionId) {
    // Realizar una petición GET para obtener los detalles de la sección
    $.ajax({
        url: `/api/sections/${sectionId}`,
        method: 'GET',
        success: function(section) {
            // Llenar el modal de edición con los detalles de la sección
            // Cambiar el título del modal
            $('#modal-add-section h5').text('Editar Sección');
            $('#section-title').val(section.title);
            M.updateTextFields(); // Esto asegura que el label se posicione correctamente
            // Eliminar la clase 'selected' de todos los círculos antes de añadirla al correcto
            $('.color-circle').removeClass('selected');
            
            // Buscar y seleccionar el círculo correspondiente al color de la sección
            $('.color-circle').each(function() {
                if ($(this).data('color') === section.color) {
                    $(this).addClass('selected'); // Añadir clase 'selected'
                    $('#section-color').val(section.color); // Establecer el valor en el input oculto
                }
            });

            // Cambiar el evento del formulario para que al guardar se actualice en lugar de crear una nueva sección
            $('#add-section-form').off('submit').on('submit', function(event) {
                event.preventDefault();

                const title = $('#section-title').val();
                const color = $('#section-color').val();

                $.ajax({
                    url: `/api/sections/${sectionId}`,
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({ title, color }),
                    success: function() {
                        M.toast({html: 'Sección actualizada correctamente.'});
                        loadSections(); // Volver a cargar las secciones
                        $('#modal-add-section').modal('close');
                    },
                    error: function() {
                        M.toast({html: 'Error al actualizar la sección.'});
                    }
                });
            });

            // Abrir el modal de edición
            $('#modal-add-section').modal('open');
        },
        error: function() {
            M.toast({html: 'Error al obtener los detalles de la sección.'});
        }
    });
}

// Función para eliminar una sección
function deleteSection(sectionId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta sección?')) {
        $.ajax({
            url: `/api/sections/${sectionId}`,
            method: 'DELETE',
            success: function() {
                M.toast({html: 'Sección eliminada correctamente.'});
                loadSections(); // Volver a cargar las secciones
            },
            error: function() {
                M.toast({html: 'Error al eliminar la sección.'});
            }
        });
    }
}

let currentSectionId; // Variable para almacenar el ID de la sección actual
let currentSubsectionId; // Variable para almacenar el ID de la subsección actual

// Función para abrir el modal de añadir subsección
function openAddSubsectionModal(sectionId) {
    currentSectionId = sectionId; // Almacenar el ID de la sección
    currentSubsectionId = null; // No hay subsección en este caso, es un nuevo registro

    // Cambiar el título del modal a "Nueva Subsección"
    $('#modal-add-subsection .modal-content h5').text('Nueva Subsección');
    // Limpiar el campo de título
    $('#subsection-title').val('');
    M.updateTextFields(); // Asegurarse de que el label no se superponga

    // Desvincular cualquier evento previo de submit y vincular uno nuevo
    $('#add-subsection-form').off('submit').on('submit', function(event) {
        event.preventDefault(); // Evitar que el formulario se envíe de manera tradicional

        const title = $('#subsection-title').val();
        if (!title) {
            M.toast({html: 'El título de la subsección es obligatorio.'});
            return;
        }

        // Realizar la solicitud POST para añadir la subsección
        $.ajax({
            url: `/api/sections/${currentSectionId}/subsections`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ title }), // Enviar el título como JSON
            success: function() {
                M.toast({html: 'Subsección creada correctamente.'});
                loadSections(); // Volver a cargar las secciones para mostrar la nueva subsección
                $('#modal-add-subsection').modal('close'); // Cerrar el modal
            },
            error: function() {
                M.toast({html: 'Error al crear la subsección.'});
            }
        });
    });

    // Abrir el modal
    $('#modal-add-subsection').modal('open');
}


// Función para abrir el modal de editar subsección
function editSubsection(sectionId, subsectionId) {
    currentSectionId = sectionId; // Almacenar el ID de la sección
    currentSubsectionId = subsectionId; // Almacenar el ID de la subsección

    // Realizar una petición GET para obtener los detalles de la subsección
    $.ajax({
        url: `/api/sections/${sectionId}/subsections/${subsectionId}`,
        method: 'GET',
        success: function(subsection) {
            // Cambiar el título del modal a "Editar Subsección"
            $('#modal-add-subsection .modal-content h5').text('Editar Subsección');
            // Poner el título de la subsección en el input
            $('#subsection-title').val(subsection.title);
            M.updateTextFields(); // Asegurarse de que el label no se superponga
            // Abrir el modal de edición
            $('#modal-add-subsection').modal('open');
        },
        error: function() {
            M.toast({html: 'Error al obtener los detalles de la subsección.'});
        }
    });

    // Manejar el envío del formulario de subsección como edición
    $('#add-subsection-form').off('submit').on('submit', function(event) {
        event.preventDefault();

        const title = $('#subsection-title').val();
        if (!title) {
            M.toast({html: 'El título de la subsección es obligatorio.'});
            return;
        }

        $.ajax({
            url: `/api/sections/${currentSectionId}/subsections/${currentSubsectionId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ title }),
            success: function() {
                M.toast({html: 'Subsección editada correctamente.'});
                loadSections(); // Volver a cargar las secciones
                $('#modal-add-subsection').modal('close'); // Cerrar el modal
            },
            error: function() {
                M.toast({html: 'Error al editar la subsección.'});
            }
        });
    });
}

// Función para eliminar una subsección
function deleteSubsection(sectionId, subsectionId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta subsección?')) {
        $.ajax({
            url: `/api/sections/${sectionId}/subsections/${subsectionId}`,
            method: 'DELETE',
            success: function() {
                M.toast({html: 'Subsección eliminada correctamente.'});
                loadSections(); // Volver a cargar las secciones
            },
            error: function() {
                M.toast({html: 'Error al eliminar la subsección.'});
            }
        });
    }
}

// Función para redirigir a la página de creación de artículo
function redirectToCreateArticle(sectionId, subsectionId, sectionName, subsectionName = '') {
    localStorage.removeItem('subsectionId');
    localStorage.removeItem('subsectionName');
    localStorage.removeItem('sectionName');
    localStorage.removeItem('articleId');
    // Almacenar los IDs y nombres en localStorage
    localStorage.setItem('sectionId', sectionId);
    localStorage.setItem('sectionName', sectionName);

    if (subsectionId) {
        localStorage.setItem('subsectionId', subsectionId);
        localStorage.setItem('subsectionName', subsectionName);
    } else {
        localStorage.removeItem('subsectionId');
        localStorage.removeItem('subsectionName');
    }

    // Redirigir al usuario a la página de creación de artículos
    window.location.href = '/admin/create-article';
}

// Función para redirigir a la página de edición de un artículo
function editArticle(articleId) {
    // Almacenar el ID del artículo en localStorage para usarlo en la página de edición
    localStorage.removeItem('subsectionId');
    localStorage.removeItem('subsectionName');
    localStorage.removeItem('sectionId');
    localStorage.removeItem('articleId');

    localStorage.setItem('articleId', articleId);

    // Redirigir al usuario a la página de edición de artículo
    window.location.href = `/admin/edit-article?articleId=${articleId}`;
}

// Función para eliminar un artículo
function deleteArticle(articleId) {
    // Mostrar una ventana de confirmación
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.');
    
    if (confirmDelete) {
        // Si el usuario confirma, hacer una solicitud DELETE a la API
        $.ajax({
            url: `/api/articles/${articleId}`, // API para eliminar el artículo
            method: 'DELETE',
            success: function() {
                M.toast({ html: 'Artículo eliminado correctamente' });
                // Recargar las secciones para actualizar la lista de artículos
                loadSections();
            },
            error: function(err) {
                console.error('Error al eliminar el artículo:', err);
                M.toast({ html: 'Error al eliminar el artículo' });
            }
        });
    }
}

function toggleStarArticle(articleId) {
    $.ajax({
        url: `/api/articles/${articleId}/highlight`,
        method: 'PUT',
        success: function(data) {
            M.toast({ html: `Artículo ${data.starred ? 'destacado' : 'eliminado de destacados'}.` });
            
            // Recarga las secciones y subsecciones
            loadSections(function() {
                console.log('Secciones recargadas, buscando el artículo destacado...');

                let sectionIndex = null;

                // Buscar el artículo destacado en subsecciones o secciones
                $('.collapsible > li').each(function(index) {
                    console.log(`Revisando sección con índice: ${index}`);

                    const foundInSubsection = $(this).find(`.subsection-article[data-id="${articleId}"]`).length > 0;
                    const foundInSection = $(this).find(`.section-article[data-id="${articleId}"]`).length > 0;

                    console.log(`Artículo encontrado en subsección: ${foundInSubsection}, sección: ${foundInSection}`);

                    if (foundInSubsection || foundInSection) {
                        sectionIndex = index;
                        console.log('Artículo encontrado en la sección con índice:', sectionIndex);
                        return false; // Rompe el bucle
                    }
                });

                if (sectionIndex !== null) {
                    console.log('Abriendo la sección con índice:', sectionIndex);
                    $('.collapsible').collapsible('open', sectionIndex);
                } else {
                    console.log('No se encontró el artículo destacado en ninguna sección.');
                }
            });
        },
        error: function(err) {
            console.error('Error al destacar el artículo:', err);
            M.toast({ html: 'Error al destacar el artículo.' });
        }
    });
}

$(document).ready(function(){
    // Manejar la selección del color
    $('.color-circle').on('click', function() {
        // Desmarcar cualquier círculo previamente seleccionado
        $('.color-circle').removeClass('selected');
        
        // Marcar el círculo seleccionado
        $(this).addClass('selected');
        
        // Actualizar el valor del input oculto con el color seleccionado
        const selectedColor = $(this).data('color');
        $('#section-color').val(selectedColor);
    });

    $('.modal').modal(); // Inicializar los modales
    // Cargar secciones y subsecciones
    loadSections();

    // Abrir el modal al hacer clic en el botón "Añadir Nueva Sección"
    $('#add-new-section-btn').on('click', function() {
        // Limpiar el formulario antes de abrir el modal (si es necesario)
        $('#section-title').val('');
        $('.color-circle').removeClass('selected');
        $('#section-color').val('');
        M.updateTextFields(); // Asegurarse de que los labels se actualicen

        // Cambiar el título del modal para añadir una nueva sección
        $('#modal-add-section h5').text('Nueva Sección');
        
        // Abrir el modal
        $('#modal-add-section').modal('open');
    });

    // Función para añadir una nueva sección
    $('#add-section-form').submit(function(event) {
        event.preventDefault();

        const title = $('#section-title').val();
        const color = $('#section-color').val();

        $.ajax({
            url: '/api/sections',
            method: 'POST',
            data: { title, color },
            success: function() {
                M.toast({html: 'Sección creada correctamente.'});
                loadSections();
                $('#modal-add-section').modal('close');
            },
            error: function() {
                M.toast({html: 'Error al crear la sección.'});
            }
        });
    });
});
