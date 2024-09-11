$(document).ready(function () {
    // Obtener el articleId desde la URL
    const articleId = window.location.pathname.split('/').pop();  // Extrae el último segmento de la URL
    
    // Cargar el contenido del artículo
    $.get(`/api/articles/${articleId}`, function (article) {
      const articleContent = $("#article-content");

      const title = article.title;

      articleContent.append(`<h1 id="article-title" style="color: rgba(0,0,0,0.87) !important; margin-bottom: 50px !important;">${title}</h1>`);

      const blocks = article.contentBlocks;
      
      blocks.forEach((block, index) => {
        if (block.type === "text") {
          articleContent.append(`<p>${block.content}</p>`);
        } else if (block.type === "image") {
          // Verificar si el siguiente bloque es una imagen para hacer la distribución 50%-50%
          if (index + 1 < blocks.length && blocks[index + 1].type === "image") {
            const nextImageBlock = blocks[index + 1];
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
            index++;
          } else {
            articleContent.append(`<div class="center-align"><img src="${block.content}" class="responsive-img"></div>`);
          }
        }
      });
    });
  
    // Enviar un comentario
    $("#comment-form").submit(function (e) {
      e.preventDefault();
      const commentContent = $("#comment-content").val();
  
      $.post(`/api/articles/${articleId}/comments`, { content: commentContent }, function (newComment) {
        // Actualizar la lista de comentarios
        $("#comments-list").append(createCommentHtml(newComment));
        $("#comment-content").val("");  // Limpiar el formulario
      });
    });
  
    // Cargar comentarios
    $.get(`/api/articles/${articleId}/comments`, function (comments) {
      comments.forEach(comment => {
        $("#comments-list").append(createCommentHtml(comment));
      });
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
  