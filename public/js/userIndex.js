$(document).ready(function() {
  
    // Función para cargar las secciones y subsecciones con sus artículos
    function loadSections() {
      $.ajax({
        url: '/api/sections',  // Llamamos a la ruta que lista las secciones
        method: 'GET',
        success: function(sections) {
          const sectionContainer = $('#sections');
          sections.forEach(section => {
            const sectionDiv = $('<div class="section card-panel">').css('background-color', section.color).append(`<h5>${section.title}</h5>`);
            
            section.subsections.forEach(subsection => {
              const subsectionDiv = $('<div class="subsection">').append(`<h6>${subsection.title}</h6>`);
              
              subsection.articles.forEach(article => {
                const articleDiv = $('<div class="col s12 m6 l4">');
                const imageHTML = article.contentBlocks.find(block => block.type === 'image') 
                                  ? `<img src="${article.contentBlocks.find(block => block.type === 'image').content}" class="card-image">`
                                  : '';
                
                const firstTextBlock = article.contentBlocks.find(block => block.type === 'text');
                const content = firstTextBlock ? firstTextBlock.content : 'Sin contenido disponible';
  
                articleDiv.html(`
                  <div class="card">
                    <div class="card-image">${imageHTML}</div>
                    <div class="card-content">
                      <span class="card-title">${article.title}</span>
                      <p>${content.substring(0, 100)}...</p> <!-- Mostrar un resumen del contenido -->
                    </div>
                  </div>
                `);
                subsectionDiv.append(articleDiv);
              });
              
              sectionDiv.append(subsectionDiv);
            });
  
            // Artículos directamente en la sección (si los hay)
            section.articles.forEach(article => {
              const articleDiv = $('<div class="col s12 m6 l4">');
              const imageHTML = article.contentBlocks.find(block => block.type === 'image') 
                                ? `<img src="${article.contentBlocks.find(block => block.type === 'image').content}" class="card-image">`
                                : '';
  
              const firstTextBlock = article.contentBlocks.find(block => block.type === 'text');
              const content = firstTextBlock ? firstTextBlock.content : 'Sin contenido disponible';
  
              articleDiv.html(`
                <div class="card">
                  <div class="card-image">${imageHTML}</div>
                  <div class="card-content">
                    <span class="card-title">${article.title}</span>
                    <p>${content.substring(0, 100)}...</p>
                  </div>
                </div>
              `);
              sectionDiv.append(articleDiv);
            });
  
            sectionContainer.append(sectionDiv);
          });
        },
        error: function(error) {
          console.error('Error al cargar las secciones:', error);
        }
      });
    }
  
    // Función para cargar los artículos destacados (modificación opcional si necesita listar aparte)
    function loadStarredArticles() {
      // Implementar si se necesita una llamada separada para artículos destacados
    }
  
    // Llamar las funciones para cargar el contenido
    loadSections();
    loadStarredArticles();
  });
  