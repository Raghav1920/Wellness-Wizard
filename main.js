// Main JS for common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle
    document.querySelector('.navbar-toggler').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show');
    });
});