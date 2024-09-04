$(document).ready(function() {
    // Recuperar el ID del artículo desde el localStorage
    const articleId = localStorage.getItem('articleId');

    // Verificar que el articleId exista
    if (!articleId) {
        M.toast({ html: 'Error: No se ha seleccionado un artículo para editar.' });
        window.location.href = '/admin/sections'; // Redirigir si no hay articleId
        return;
    }

    // Hacer una solicitud para obtener los datos del artículo
    $.ajax({
        url: `/api/articles/${articleId}`, // API para obtener el artículo por su ID
        method: 'GET',
        success: function(article) {
            // Rellenar el formulario con los datos del artículo
            $('#article-title').val(article.title);
            $('#article-content').val(article.contentBlocks[0].content); // Asumimos que el primer bloque es el contenido principal
            $('#article-tags').val(article.tags.join(', '));

            // Actualizar los labels de los campos con Materialize para que no se solapen
            M.updateTextFields();
        },
        error: function(err) {
            console.error('Error al cargar el artículo:', err);
            M.toast({ html: 'Error al cargar los datos del artículo.' });
        }
    });

    // Manejar el formulario de edición de artículo
    $('#article-form').on('submit', function(event) {
        event.preventDefault();

        const title = $('#article-title').val();
        const content = $('#article-content').val();
        const tags = $('#article-tags').val().split(',').map(tag => tag.trim());

        // Hacer la solicitud para actualizar el artículo
        $.ajax({
            url: `/api/articles/${articleId}`, // API para actualizar el artículo
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ title, contentBlocks: [{ type: 'text', content }], tags }),
            success: function() {
                M.toast({ html: 'Artículo actualizado correctamente' });
                window.location.href = '/admin/sections'; // Redirigir de nuevo a la página de secciones
            },
            error: function(err) {
                console.error('Error al actualizar el artículo:', err);
                M.toast({ html: 'Error al actualizar el artículo.' });
            }
        });
    });
});
