$(document).ready(function() {
  // Función para cargar las secciones y subsecciones con sus artículos
  function loadSections() {
    console.log('Iniciando la carga de secciones...');
  
    $.ajax({
      url: '/api/sections',  // Obtener las secciones y subsecciones
      method: 'GET',
      success: function(sections) {
        console.log('Secciones recibidas:', sections);
        
        const sectionContainer = $('#sections');
        const starredArticles = [];
  
        sections.forEach(section => {
          // Verificar si la sección o alguna de sus subsecciones contiene artículos
          const hasSectionArticles = section.articles.length > 0;
          const hasSubsectionsWithArticles = section.subsections.some(subsection => subsection.articles.length > 0);
  
          // Mostrar la sección solo si tiene artículos o alguna subsección con artículos
          if (hasSectionArticles || hasSubsectionsWithArticles) {
            // Crear el contenedor de la sección
            const sectionDiv = $(`
              <div class="section">
                <div class="divider"></div>
                <div class="row">
                  <div class="col s12 section-header">
                    <div class="section-title">
                      <div class="circle" style="background-color: ${section.color};"></div>
                      <h4 class="grey-text text-darken-3 italic">${section.title}</h4>
                    </div>
                  </div>
                </div>
              </div>
            `);
  
            // Mostrar los artículos de la sección principal
            if (hasSectionArticles) {
              const articlesRow = $('<div class="row"></div>');
              section.articles.forEach(article => {
                const articleDiv = createArticleCard(article, section.color);
                articlesRow.append(articleDiv);
  
                // Verificar si el artículo está destacado (starred: true)
                if (article.starred) {
                  starredArticles.push(article);
                }
              });
              sectionDiv.append(articlesRow);
            }
  
            // Mostrar las subsecciones con artículos
            section.subsections.forEach(subsection => {
              if (subsection.articles && subsection.articles.length > 0) {
                // Crear subsección con su contenedor
                const subsectionDiv = $(`
                  <div class="row">
                    <div class="col s12 subsection-header">
                      <div class="divider"></div>
                      <h5 class="grey-text text-darken-3 italic">
                        <i class="material-icons">subdirectory_arrow_right</i> ${subsection.title}
                      </h5>
                    </div>
                    <div class="col s12 subsection-articles" style="padding-left: 30px;"></div>  <!-- Mover este div aquí -->
                  </div>
                `);
            
                const subsectionArticlesRow = subsectionDiv.find('.subsection-articles');
            
                subsection.articles.forEach(article => {
                  console.log('Artículo en subsección:', article.title);  // Depuración para verificar que los artículos están presentes
                  const articleDiv = createArticleCard(article, section.color);
            
                  // Añadir cada artículo al contenedor de la subsección
                  subsectionArticlesRow.append(articleDiv);

                   // Verificar si el artículo está destacado (starred: true)
                  if (article.starred) {
                    starredArticles.push(article);
                  }
                });
            
                // Asegúrate de que añadimos la subsección completa a la sección
                sectionDiv.append(subsectionDiv);
              }
            });
  
            // Añadir la sección al contenedor de secciones
            sectionContainer.append(sectionDiv);
          }
        });
  
        // Mostrar los artículos destacados en el div #starred-articles
        displayStarredArticles(starredArticles);
      },
      error: function(error) {
        console.error('Error al cargar las secciones:', error);
      }
    });
  }
  
  // Función para limpiar el texto y eliminar cualquier formato o estilos
  function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Función para crear una tarjeta de artículo
  function createArticleCard(article, sectionColor) {
    const imageHTML = article.contentBlocks.find(block => block.type === 'image') 
                      ? `<img src="${article.contentBlocks.find(block => block.type === 'image').content}" class="card-image">`
                      : '<img src="/path/to/placeholder.jpg" class="card-image">'; // Placeholder si no hay imagen

    const firstTextBlock = article.contentBlocks.find(block => block.type === 'text');

    // Si hay un bloque de texto, lo procesamos como texto plano
    const content = firstTextBlock ? stripHTML(firstTextBlock.content).substring(0, 80) : 'Sin contenido disponible';
    const formattedDate = new Date(article.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const tags = article.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ');

    // Verificar si es un artículo "nuevo"
    const isNew = (new Date() - new Date(article.updatedAt)) / (1000 * 3600 * 24) <= 7;

    const articleDiv = $(`
      <div class="col s12 m6 l3">
        <div class="card hoverable article-card">
          <div class="card-image-container">
            ${imageHTML}
            ${article.starred ? '<i class="material-icons star-icon">star</i>' : ''}
            <div class="circle section-color" style="background-color: ${sectionColor};"></div>
          </div>
          <div class="card-content">
            <a href="/article/${article._id}" class="article-title">${article.title}</a>
            <p class="article-extract">${content}</p>
            <div class="article-meta">
              <div class="meta-row">
                <span class="article-date grey-text italic">${formattedDate}</span>
                ${isNew ? '<span class="new-badge">NUEVO</span>' : ''}
              </div>
              <div class="article-tags">
                ${tags}
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    return articleDiv;
  }

  function displayStarredArticles(articles) {
    const starredContainer = $('#starred-articles');
    starredContainer.empty();
  
    if (articles.length > 0) {
      articles.forEach(article => {
        const articleDiv = createArticleCard(article, article.sectionId.color); // Usa el color de la sección
        starredContainer.append(articleDiv);
      });
    } else {
      starredContainer.append('<p>No hay artículos destacados en este momento.</p>');
    }
  }

  // Inicializar la carga de secciones y artículos destacados
  loadSections();
});
