window.addEventListener('load', () => {

    var colorTheme = localStorage.getItem('color-theme') === 'light' ? 'light' : 'dark';

    const colorThemeBtns = document.querySelectorAll('.color-theme-toggle');
    colorThemeBtns.forEach(btn => btn.addEventListener('click', () => {
        colorTheme = colorTheme === 'light' ? 'dark' : 'light';
        updateColorTheme();
    }))

    updateColorTheme();
    function updateColorTheme() {
        localStorage.setItem('color-theme', colorTheme);
        if (colorTheme === 'light') {
            document.documentElement.className = 'light-mode';
            colorThemeBtns.forEach(btn => btn.classList.replace('fa-moon', 'fa-sun'));
        } else {
            document.documentElement.className = '';
            colorThemeBtns.forEach(btn => btn.classList.replace('fa-sun', 'fa-moon'));
        }
    }

});