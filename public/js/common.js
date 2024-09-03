$(document).ready(function(){
    // Cargar header y footer
    $('#header').load('/partials/header.html');
    $('#footer').load('/partials/footer.html', function() {
        // Inicializar componentes de Materialize después de cargar el footer
        $('.collapsible').collapsible();
        $('select').formSelect();
        $('.modal').modal();
    });
});
