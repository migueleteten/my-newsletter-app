$(document).ready(function () {
  // Obtener el articleId desde la URL
  const articleId = window.location.pathname.split('/').pop();  // Extrae el último segmento de la URL

  let imageUrls = [];
  
  // Cargar el contenido del artículo
  $.get(`/api/articles/${articleId}`, function (article) {
    const articleContent = $("#article-content");

    const title = article.title;

    articleContent.append(`<h1 id="article-title" style="color: rgba(0,0,0,0.87) !important; margin-bottom: 50px !important;">${title}</h1>`);

    const blocks = article.contentBlocks;
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      if (block.type === "text") {
        articleContent.append(`<p>${block.content}</p>`);
      } else if (block.type === "image") {
        // Guardar la url de la imagen en el array
        imageUrls.push(block.content);

        // Verificar si el siguiente bloque es una imagen para hacer la distribución 50%-50%
        if (i + 1 < blocks.length && blocks[i + 1].type === "image") {
          const nextImageBlock = blocks[i + 1];
          imageUrls.push(nextImageBlock.content);

          articleContent.append(`
            <div class="row">
              <div class="col s6">
                <img src="${block.content}" class="responsive-img" style="object-fit:contain; max-height:300px;">
              </div>
              <div class="col s6">
                <img src="${nextImageBlock.content}" class="responsive-img" style="object-fit:contain; max-height:300px;">
              </div>
            </div>
          `);
          // Saltar el siguiente bloque ya que lo hemos usado
          i++;
        } else {
          articleContent.append(`<div class="center-align"><img src="${block.content}" class="responsive-img"></div>`);
        }
      }
    }
  });

  // Inicializar el modal
  const modal = M.Modal.init(document.getElementById('image-modal'));

  let currentImageIndex = 0;

  // Función para actualizar la imagen en el modal
  function updateModalImage(index) {
    $('#modal-image').attr('src', imageUrls[index]);
  }

  // Abrir el modal con la imagen seleccionada
  $(document).on('click', '.responsive-img', function() {
    const clickedImageSrc = $(this).attr('src');
    currentImageIndex = imageUrls.indexOf(clickedImageSrc);

    updateModalImage(currentImageIndex);
    modal.open();
  });

  // Navegar a la imagen anterior
  $('#prev-image').click(function() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      updateModalImage(currentImageIndex);
    }
  });

  // Navegar a la siguiente imagen
  $('#next-image').click(function() {
    if (currentImageIndex < imageUrls.length - 1) {
      currentImageIndex++;
      updateModalImage(currentImageIndex);
    }
  });

  // Enviar un comentario
  $("#comment-form").submit(function (e) {
    e.preventDefault();
    const commentContent = $("#comment-content").val();

    $.ajax({
      url: '/api/articles/66e185ed1b6250183dafbe7b/comments',
      method: 'POST',
      data: { content: commentContent },
      xhrFields: {
        withCredentials: true  // Asegúrate de enviar las cookies de sesión
      },
      success: function(response) {
        console.log('Comentario añadido:', response);
        // Actualizar la lista de comentarios
        $("#comments-list").prepend(createCommentHtml(response));
        $("#comment-content").val("");  // Limpiar el formulario
      },
      error: function(error) {
        console.error('Error al añadir comentario:', error);
      }
    });
  });

  // Cargar comentarios
  console.log(`Intentando obtener los comentarios para el artículo: ${articleId}`);
  $.get(`/api/articles/${articleId}/comments`, function (comments) {
    if (comments && comments.length > 0) {
      comments.forEach(comment => {
        $("#comments-list").append(createCommentHtml(comment));
      });

      // Verificar la carga de las imágenes de los comentarios
      $('img').on('load', function() {
          console.log('Imagen cargada correctamente.');
      }).on('error', function() {
          console.log('Error al cargar la imagen.');
          $(this).attr('src', '/path/to/default-image.png');  // Opcional: Cambiar por una imagen por defecto
      });
    } else {
      console.log('No se encontraron comentarios.');
    }
  }).fail(function(error) {
    console.error('Error al cargar los comentarios:', error);
  });

  // Crear el HTML de un comentario
  function createCommentHtml(comment) {
    return `
      <li class="collection-item avatar">
        <img src="${comment.userAvatar}" alt="" class="circle">
        <span class="title">${comment.username}</span>
        <p>${comment.content}</p>
        <small>${new Date(comment.createdAt).toLocaleString()}</small>
      </li>
    `;
  }
});
  