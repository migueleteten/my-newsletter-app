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
    return new Promise((resolve) => {
      Promise.all([getCategory(article), getSubcategory(article), createTagsBadges(article.tags)]).then(([category, subcategory, tagsBadges]) => {
        
        const starIcon = isStarred ? '<i class="material-icons star-icon">star</i>' : '';  // Añadir la estrellita si es destacado
        const sectionCircle = `<div class="circle" style="background-color: ${color};"></div>
                              <div class="circle" style="background-color: ${color};box-shadow: inset -1px 1px 3px -2px white;"></div>`;  // Círculo del color de la sección

        // Crear enlaces para la categoría y subcategoría
        const categoryLink = `<a href="#" class="category-link" data-section-id="${article.sectionId}">${category}</a>`;
        const subcategoryLink = subcategory !== 'Sin subcategoría' ? 
            `<a href="#" class="category-link" data-section-id="${article.sectionId}" data-subsection-id="${article.subsectionId}">${subcategory}</a>` 
            : '';
        
        const articleCard = $(`
          <li class="banner">
            <div class="mixin-pillar-guide-other--banner">
              <div class="after-load-animate">
                <div class="cover-image"></div>  <!-- Contenedor de imagen -->
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
                        <span>${categoryLink}</span>
                        <span>${subcategoryLink}</span>
                      </div>
                      <div class="date">${formatDate(article.updatedAt)}</div>
                      ${tagsBadges ? `<div class="tags">${tagsBadges}</div>` : ''}
                    </div>
                  </div>
                </div>
                ${starIcon}
                ${sectionCircle}
              </div>
            </div>
          </li>
        `);

        // Insertar la imagen en el contenedor de la tarjeta
        articleCard.find('.cover-image').append(createImageElement(article));

        resolve(articleCard);
      });
    });
  }

  // Crear enlaces para las etiquetas, filtrando etiquetas vacías
  function createTagsBadges(tags) {
    // Verificar si 'tags' es un array y tiene al menos una etiqueta no vacía
    if (Array.isArray(tags) && tags.length > 0) {
      // Filtrar etiquetas vacías y generar los enlaces solo para etiquetas válidas
      const validTags = tags.filter(tag => tag.trim() !== '');
      
      // Verificar si hay etiquetas válidas después del filtrado
      if (validTags.length > 0) {
          return validTags.map(tag => {
              return `<a href="#" class="tag-link" data-tag="${tag}">#${tag}</a>`;
          }).join(' ');
      }
    }
    console.log('Sin etiquetas válidas en este artículo');
    return null;  // No retornar nada si no hay etiquetas válidas
  }
  
  // Obtener la primera imagen del artículo
  function getFirstImage(article) {
    const imageBlock = article.contentBlocks.find(block => block.type === 'image');
    return imageBlock ? imageBlock.content : '/images/default-image.png';  // Si no hay imagen, usar una por defecto
  }

  // Crear la imagen con estilo dinámico
  function createImageElement(article) {
    const imageUrl = getFirstImage(article);

    // Crear un elemento de imagen
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = article.title;

    // Asignar estilo dependiendo de la imagen (si es la default-image.png usar "contain", de lo contrario "cover")
    if (imageUrl.includes('default-image.png')) {
      imgElement.style.objectFit = 'contain';
      imgElement.style.opacity = '25%';
    } else {
      imgElement.style.objectFit = 'cover';
    }

    return imgElement;
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
                resolve(' > ' + subsection.title);  // Asegúrate de que el campo correcto sea 'title' o ajusta según tu estructura
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

  // Capturar el evento de envío del formulario de búsqueda
  $('#search').closest('form').on('submit', function(e) {
    e.preventDefault();  // Evitar que se recargue la página

    // Obtener el valor del campo de búsqueda
    const query = $('#search').val().trim();

    // Verificar si el campo de búsqueda no está vacío
    if (query) {
      searchArticles({ query });  // Llamar a la función para redirigir a la búsqueda
    }
  });

  // Inicializar la carga de secciones y artículos destacados
  loadArticles();
});

// Función para redirigir a la búsqueda
function searchArticles(params) {
  const queryString = $.param(params);  // Convertir los parámetros a query string
  console.log('Query string generado:', queryString);  // Verificar el string generado
  window.location.href = `/user/search?${queryString}`;  // Redirigir a la página de búsqueda
}

// Asignar eventos a los enlaces de categoría y subcategoría
$(document).on('click', '.category-link, .tag-link', function(e) {
  e.preventDefault();
  
  const sectionId = $(this).data('sectionId');
  const subsectionId = $(this).data('subsectionId');
  const tag = $(this).data('tag');
  
  const params = {};
  if (sectionId) {
      params.sectionId = sectionId;
  }
  if (subsectionId) {
      params.subsectionId = subsectionId;
  }

  // Verificar si es un enlace de etiqueta
  if (tag) {
    params.tag = tag;
  }

  // Verificar qué parámetros se envían antes de redirigir
  console.log('Parámetros enviados:', params);
  
  searchArticles(params);  // Redirigir a la búsqueda
});