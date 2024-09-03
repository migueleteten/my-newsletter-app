// Función para cargar secciones y subsecciones
function loadSections() {
    $.ajax({
        url: '/api/sections',
        method: 'GET',
        success: function(data) {
            $('.collapsible').empty();
            data.forEach(section => {
                const sectionHtml = `
                    <li>
                        <div class="collapsible-header">
                            <i class="material-icons" style="color:${section.color}">folder</i>
                            <span>${section.title}</span>
                            <a href="#!" class="secondary-content" onclick="editSection('${section._id}')">
                                <i class="material-icons">edit</i>
                            </a>
                            <a href="#!" class="secondary-content" onclick="deleteSection('${section._id}')">
                                <i class="material-icons">delete</i>
                            </a>
                        </div>
                        <div class="collapsible-body">
                            <ul>
                                ${section.subsections.map(subsection => `
                                    <li>
                                        <i class="material-icons">subdirectory_arrow_right</i>
                                        <span>${subsection.title}</span>
                                        <a href="#!" class="secondary-content" onclick="editSubsection('${section._id}', '${subsection._id}')">
                                            <i class="material-icons">edit</i>
                                        </a>
                                        <a href="#!" class="secondary-content" onclick="deleteSubsection('${section._id}', '${subsection._id}')">
                                            <i class="material-icons">delete</i>
                                        </a>
                                    </li>                                    
                                `).join('')}
                                <li>
                                    <a href="#!" class="secondary-content" onclick="openAddSubsectionModal('${section._id}')">
                                        <i class="material-icons">add_circle</i> Añadir Subsección
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>
                `;
                $('.collapsible').append(sectionHtml);
            });
            $('.collapsible').collapsible();
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
            $('#section-title').val(section.title);
            $('#section-color').val(section.color);
            $('#section-color').next().find('.color-circle').each(function() {
                if ($(this).data('color') === section.color) {
                    $(this).addClass('selected');
                } else {
                    $(this).removeClass('selected');
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

// Función para abrir el modal de añadir subsección
function openAddSubsectionModal(sectionId) {
    currentSectionId = sectionId; // Almacenar el ID de la sección en una variable global
    $('#subsection-title').val(''); // Limpiar el campo de título
    M.updateTextFields(); // Actualizar los campos de texto (Materialize)
    $('#modal-add-subsection').modal('open'); // Abrir el modal
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

    // Cargar secciones y subsecciones
    loadSections();

    // Mostrar el modal al hacer clic en el botón "Añadir Nueva Sección"
    $('#modal-add-section').modal();

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

    // Manejar el envío del formulario de subsección
    $('#add-subsection-form').submit(function(event) {
        event.preventDefault();

        const title = $('#subsection-title').val();
        if (!title) {
            M.toast({html: 'El título de la subsección es obligatorio.'});
            return;
        }

        $.ajax({
            url: `/api/sections/${currentSectionId}/subsections`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ title }),
            success: function() {
                M.toast({html: 'Subsección creada correctamente.'});
                loadSections(); // Recargar las secciones para mostrar la nueva subsección
                $('#modal-add-subsection').modal('close'); // Cerrar el modal
            },
            error: function() {
                M.toast({html: 'Error al crear la subsección.'});
            }
        });
    });
});
