$(document).ready(function() {
    loadPendingArticles();

    // Manejar el evento de clic en el botón de publicación
    $('#publish-btn').on('click', function() {
        publishSelectedArticles();
    });
});

// Función para cargar los artículos pendientes de publicación
function loadPendingArticles() {
    $.ajax({
        url: '/api/articles/pending',
        method: 'GET',
        success: function(data) {
            $('#articles-list').empty(); // Limpiar la lista

            if (data.length === 0) {
                $('#articles-list').html('<p>No hay artículos pendientes de publicación.</p>');
            } else {
                data.forEach(article => {
                    const articleHtml = `
                        <div class="col s12 m6">
                            <div class="card">
                                <div class="card-content">
                                    <span class="card-title">${article.title}</span>
                                    <p>${article.summary}</p> <!-- Añadir un resumen si es necesario -->
                                </div>
                                <div class="card-action">
                                    <label>
                                        <input type="checkbox" class="filled-in article-checkbox" data-id="${article._id}" />
                                        <span>Seleccionar para publicar</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#articles-list').append(articleHtml);
                });
            }
        },
        error: function(err) {
            console.error('Error al cargar los artículos pendientes:', err);
            M.toast({ html: 'Error al cargar los artículos pendientes.' });
        }
    });
}

// Función para publicar los artículos seleccionados
function publishSelectedArticles() {
    const selectedArticles = [];
    
    // Recoger los artículos seleccionados
    $('.article-checkbox:checked').each(function() {
        selectedArticles.push($(this).data('id'));
    });

    if (selectedArticles.length === 0) {
        M.toast({ html: 'No has seleccionado ningún artículo.' });
        return;
    }

    // Enviar la solicitud para publicar los artículos seleccionados
    $.ajax({
        url: '/api/articles/publish',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ articleIds: selectedArticles }),
        success: function() {
            M.toast({ html: 'Artículos publicados correctamente.' });
            loadPendingArticles(); // Volver a cargar los artículos pendientes
        },
        error: function(err) {
            console.error('Error al publicar los artículos:', err);
            M.toast({ html: 'Error al publicar los artículos.' });
        }
    });
}
