function toggleMenu() {
    const menuToggle = document.querySelector('.menu-links');
    const icon = document.querySelector('.hamburger-icon');
    menuToggle.classList.toggle('open');
    icon.classList.toggle('open');
}