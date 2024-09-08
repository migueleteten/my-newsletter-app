$(document).ready(function() {
  // Función para cargar las secciones y subsecciones con sus artículos
  function loadArticles() {
  
    $.ajax({
      url: '/api/sections',  // Obtener los artículos (ahora tratamos todos juntos)
      method: 'GET',
      success: function(sections) {
  
        const articlesList = $('#articles-list');  // Un contenedor para todos los artículos
        const starredArticles = [];  // Almacena los artículos destacados
  
        sections.forEach(section => {
          // Añadir artículos de la sección principal
          section.articles.forEach(article => {
            if (article.starred) {
              starredArticles.push(article);  // Almacenar artículos destacados
            } else {
              createArticleCard(article, section.color).then(articleCard => {
                articlesList.append(articleCard);  // Añadir los normales
              });
            }
          });
  
          // Añadir artículos de las subsecciones
          section.subsections.forEach(subsection => {
            subsection.articles.forEach(article => {
              if (article.starred) {
                starredArticles.push(article);  // Almacenar artículos destacados
              } else {
                createArticleCard(article, section.color).then(articleCard => {
                  articlesList.append(articleCard);  // Añadir los normales
                });
              }
            });
          });
        });
  
        // Mostrar primero los artículos destacados
        starredArticles.forEach(article => {
          searchSectionColor(article).then(color => {
            createArticleCard(article, color, true).then(articleCard => {
              articlesList.prepend(articleCard);  // Mostrar destacados al principio
            });
          }).catch(error => {
            console.error('Error al obtener el color:', error);
          });          
        });
      },
      error: function(error) {
        console.error('Error al cargar los artículos:', error);
      }
    });
  }
  
  // Crear la tarjeta del artículo (ahora usa Promesa para obtener la categoría)
  function createArticleCard(article, color, isStarred = false) {
    console.log(`color encontrado:${color}`);
    return new Promise((resolve) => {
      Promise.all([getCategory(article), getSubcategory(article)]).then(([category, subcategory]) => {
        
        const starIcon = isStarred ? '<i class="material-icons star-icon">star</i>' : '';  // Añadir la estrellita si es destacado
        const sectionCircle = `<div class="circle" style="background-color: ${color};"></div>`;  // Círculo del color de la sección

        const articleCard = $(`
          <li class="banner">
            <div class="mixin-pillar-guide-other--banner">
              <div class="after-load-animate">
                <div class="cover-image">
                  <img src="${getFirstImage(article)}" alt="${article.title}">
                </div>
                <div class="content">
                  <div class="row">
                    <div class="title">
                      <a class="go-to-detail" href="/articles/${article._id}">
                        <h2>${article.title}</h2>
                      </a>
                    </div>
                  </div>
                  <div class="row">
                    <div class="excerpt">${getExcerpt(article)}</div>
                  </div>
                  <div class="align-bottom">
                    <div class="corporate--category-and-date">
                      <div class="category">
                        <span>${category}</span>
                        <span>${subcategory}</span>
                      </div>
                      <div class="date">${formatDate(article.updatedAt)}</div>
                    </div>
                  </div>
                </div>
                ${starIcon}
                ${sectionCircle}
              </div>
            </div>
          </li>
        `);

        resolve(articleCard);
      });
    });
  }
  
  // Obtener la primera imagen del artículo
  function getFirstImage(article) {
    const imageBlock = article.contentBlocks.find(block => block.type === 'image');
    return imageBlock ? imageBlock.content : 'default-image.png';  // Si no hay imagen, usar una por defecto
  }
  
  function getExcerpt(article) {
    const textBlock = article.contentBlocks.find(block => block.type === 'text');
    
    if (textBlock) {
      // Crear un div temporal en el DOM y asignar el contenido enriquecido
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = textBlock.content;
  
      // Extraer el texto plano del div y limitarlo a 350 caracteres
      return tempDiv.textContent.slice(0, 200) + '...';
    }
  
    return '';  // En caso de no haber texto
  }
  
  // Obtener el nombre de la categoría
  function getCategory(article) {
    return new Promise((resolve, reject) => {
      if (!article.sectionId) {
        resolve('Sin categoría');  // Si no hay sectionId, devolvemos "Sin categoría"
      } else {
        // Realizamos la llamada AJAX a la API para obtener los datos de la sección
        $.ajax({
          url: `/api/sections/${article.sectionId}`,  // Ruta a la API
          method: 'GET',
          success: function(sectionData) {
            // Devolvemos el título de la sección si la llamada fue exitosa
            resolve(sectionData.title);
          },
          error: function(error) {
            console.error('Error al obtener la categoría:', error);
            resolve('Sin categoría');  // En caso de error, devolvemos "Sin categoría"
          }
        });
      }
    });
  }

  function getSubcategory(article) {
    return new Promise((resolve, reject) => {
      if (!article.subsectionId) {
        resolve('');  // Si no hay subsectionId, devolvemos "Sin subcategoría"
      } else {
        // Realizamos la llamada AJAX a la API para obtener los datos de la sección
        $.ajax({
          url: `/api/sections/${article.sectionId}`,  // Ruta a la API para obtener la sección
          method: 'GET',
          success: function(sectionData) {
            // Verificar que sectionData.subsections exista y sea un arreglo
            if (sectionData && Array.isArray(sectionData.subsections)) {
              // Buscar la subcategoría específica por ID
              const subsection = sectionData.subsections.find(sub => sub.id === article.subsectionId || sub._id === article.subsectionId);
              
              if (subsection) {
                resolve(' | ' + subsection.title);  // Asegúrate de que el campo correcto sea 'title' o ajusta según tu estructura
              } else {
                console.warn(`Subcategoría con ID ${article.subsectionId} no encontrada en la sección ${article.sectionId}`);
                resolve('');  // Si no se encuentra la subcategoría
              }
            } else {
              console.error('La respuesta de la sección no contiene subsecciones válidas.');
              resolve('');  // Si no hay subsecciones
            }
          },
          error: function(error) {
            console.error('Error al obtener la subcategoría:', error);
            resolve('');  // En caso de error, devolvemos "Sin subcategoría"
          }
        });
      }
    });
  }
  
  function searchSectionColor(article) {
    return new Promise((resolve, reject) => {
      if (!article.sectionId) {
        resolve('Sin categoría');  // Si no hay sectionId, devolvemos "Sin categoría"
      } else {
        // Realizamos la llamada AJAX a la API para obtener los datos de la sección
        $.ajax({
          url: `/api/sections/${article.sectionId}`,  // Ruta a la API
          method: 'GET',
          success: function(sectionData) {
            // Devolvemos el título de la sección si la llamada fue exitosa
            resolve(sectionData.color);
            console.log(sectionData.color);
          },
          error: function(error) {
            console.error('Error al obtener la categoría:', error);
            resolve('Sin categoría');  // En caso de error, devolvemos "Sin categoría"
          }
        });
      }
    });
  }

  // Formatear la fecha
  function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  }

  // Inicializar la carga de secciones y artículos destacados
  loadArticles();
});