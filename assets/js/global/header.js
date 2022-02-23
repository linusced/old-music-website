window.addEventListener('load', () => fetchJSON('meta.json').then(async metadata => {
    meta = metadata.lists;
    meta.reverse();

    const header = document.querySelector('header'), headerToggle = document.querySelector('#header-toggle'), nav_music_container = document.querySelector('#nav-music-container'), nav_music = document.querySelector('#nav-music');
    let urlData = null, list = null, filePath = './music/index.html';

    if (location.pathname.includes('/music/')) {
        urlData = location.href.split('list=')[1] ? urlReplace(location.href.split('list=')[1].split('&')[0]) : null, list = meta.includes(`tracks-${urlData}`) ? urlData : meta[0].split('tracks-')[1];
        filePath = location.pathname.includes('alternate.html') ? './alternate.html' : './index.html';
    } else if (location.pathname.includes('/presets/')) filePath = '../music/index.html';

    meta.forEach(item => {
        const a = document.createElement('a'), title = item.split('tracks-')[1];
        a.innerHTML = title;
        a.href = `${filePath}?list=${urlReplace(title)}`;
        a.title = `Music tracklist '${title}'`;
        if (list === title) a.className = 'active';
        nav_music.appendChild(a);
    });

    const music_platforms = metadata.platforms, music_platforms_nav = document.querySelector('#music-platforms'), animations_disable = document.querySelector('#animation-disable');
    music_platforms.forEach(item => {
        const a = document.createElement('a');
        a.title = item.title;
        a.href = item.url;
        a.target = '_blank';

        if (item.logo.includes('fa-')) {
            a.className = item.logo;
            a.style.color = item.color;
        } else if (item.logo.includes('http')) a.innerHTML = `<img src="${item.logo}" height="30">`;
        else a.innerHTML = `<img src="${isHomePage ? "." : ".."}/assets/images/${item.logo}" height="30">`;

        if (animations_disable) music_platforms_nav.insertBefore(a, animations_disable);
        else music_platforms_nav.appendChild(a);
    });

    if (location.pathname === '/' || location.pathname === '/index.html') {
        const platformLinks = document.querySelector('#platform-links');
        platformLinks.innerHTML = music_platforms_nav.innerHTML;
        platformLinks.removeChild(platformLinks.querySelector('.color-theme-toggle'));
    }

    document.body.addEventListener('click', e => {
        if ((e.target.id === 'nav-music-btn' || e.target.parentElement.id === 'nav-music-btn') && !nav_music_container.classList.contains('active')) {
            nav_music_container.classList.add('active');
            document.querySelector('#nav-music-btn').title = 'Hide music dropdown menu';
        } else if (nav_music_container.classList.contains('active')) {
            nav_music_container.classList.remove('active');
            document.querySelector('#nav-music-btn').title = 'Show music dropdown menu';
        }
    });

    headerToggle.addEventListener('click', () => header.classList.contains('toggled') ? closeHeader() : openHeader());

    function closeHeader() {
        header.classList.remove('toggled');
        headerToggle.className = 'fas fa-bars';
    }
    function openHeader() {
        header.classList.add('toggled');
        headerToggle.className = 'fas fa-times';
    }

    if ('ontouchstart' in window) {
        const swipeStart = {
            positionX: 0,
            time: 0,
            headerX: 0,
            openSwipe: false,
            active: () => {
                return header.classList.contains('toggled');
            }
        };
        swipeStart.reset = () => {
            swipeStart.positionX = swipeStart.time = swipeStart.headerX = 0;
            swipeStart.openSwipe = false;
        };
        document.body.addEventListener('touchstart', e => {
            const positionX = e.touches[0].pageX;
            if (swipeStart.active()) {
                swipeStart.positionX = positionX;
                swipeStart.time = Date.now();
                swipeStart.headerX = header.getBoundingClientRect().right;
            } else if (positionX <= 50) {
                swipeStart.openSwipe = true;
                swipeStart.positionX = positionX;
            }
        });
        document.body.addEventListener('touchmove', e => {
            const positionX = e.touches[0].pageX;
            if (swipeStart.active() && swipeStart.time > 0) {
                if ((positionX - swipeStart.positionX) / (Date.now() - swipeStart.time) <= -1) {
                    swipeStart.reset();
                    closeHeader();
                } else if (swipeStart.positionX > swipeStart.headerX - 50 && swipeStart.positionX < swipeStart.headerX + 50) {
                    const xDiff = positionX - swipeStart.headerX;
                    header.style.transition = 'none';
                    if (xDiff < 0) header.style.transform = `translateX(${xDiff}px)`;
                    else header.style.transform = '';
                }
            } else if (swipeStart.openSwipe) {
                const xDiff = positionX - header.getBoundingClientRect().width;
                header.style.transition = 'none';
                if (xDiff < 0) header.style.transform = `translateX(${xDiff}px)`;
                else header.style.transform = 'translateX(0)';
            }
        });
        document.body.addEventListener('touchend', () => {
            if (swipeStart.time > 0) {
                swipeStart.reset();
                if (header.style.transform && parseInt(header.style.transform.match(/\d+/)[0]) >= header.getBoundingClientRect().width / 2) closeHeader();
            } else if (swipeStart.openSwipe) {
                swipeStart.reset();
                if (header.style.transform && parseInt(header.style.transform.match(/\d+/)[0]) < header.getBoundingClientRect().width / 2) openHeader();
            }
            header.style.transition = header.style.transform = '';
        });
    }
}));