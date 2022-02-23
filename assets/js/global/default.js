function fetchJSON(file) {
    return new Promise(resolve => fetch(`${location.pathname.includes("music") ? ".." : "."}/assets/json/${file}`).then(response => response.json().then(json => resolve(json))));
}
function urlReplace(url, fromUrl) {
    return (fromUrl ? decodeURIComponent(url) : encodeURIComponent(url)).toLowerCase();
}
function replaceUppercase_o() {
    document.querySelectorAll('h4, h2, button, a, p').forEach(element => {
        if (element.innerHTML.includes('O') || (element.innerHTML[0] === 'o' && getComputedStyle(element).textTransform === 'capitalize')) {
            element.innerHTML = element.innerHTML.replace('O', '<span class="uppercase-o">o</span>');
            if (element.classList.contains('radio-btn')) element.classList.add('padding-left');
            else element.classList.add('text-translateY');
        }
    });
}

const headerData = {
    fontSizes: null,
    minFontSize: null,
    fontSizeMultipliers: null
};
let btnEvents = false;
function checkContentOverlap() {
    if (!btnEvents) {
        btnEvents = true;
        document.querySelectorAll('button').forEach(btn => btn.addEventListener('mouseup', e => e.target.blur()));
    }

    document.querySelectorAll('.audio-track').forEach(track => {
        const title = track.querySelector('.audio-track-title'), duration = track.querySelector('.audio-track-duration');
        title.style.fontSize = '';
        for (var fontSize = getFontSize(title); title.getBoundingClientRect().right >= duration.getBoundingClientRect().left && fontSize >= 10; fontSize--) title.style.fontSize = `${fontSize}px`;
    });
    document.querySelectorAll('.homepage-track-title').forEach(span => {
        const h2 = span.parentElement;
        h2.style.fontSize = '';
        for (var fontSize = getFontSize(h2); span.getBoundingClientRect().width > h2.getBoundingClientRect().width && fontSize >= 10; fontSize--) h2.style.fontSize = `${fontSize}px`;
    });

    const header = document.querySelector('header'), h1 = header.querySelector('.h1'), nav1 = header.querySelector('nav:nth-child(2)'), nav2 = header.querySelector('nav:nth-child(3)'), music_btn_i = header.querySelector('#nav-music-btn > i');
    header.style.paddingRight = header.style.paddingLeft = h1.style.fontSize = nav1.style.fontSize = nav2.style.fontSize = music_btn_i.style.fontSize = '';

    if (innerWidth > 700) {
        if (headerOverlap()) header.style.paddingRight = header.style.paddingLeft = '5px';
        if (!headerData.fontSizes) {
            headerData.fontSizes = { h1: getFontSize(h1), nav1: getFontSize(nav1), nav2: getFontSize(nav2), music_btn_i: getFontSize(music_btn_i) };
            headerData.minFontSize = Math.min(headerData.fontSizes.h1, headerData.fontSizes.nav1, headerData.fontSizes.nav2);
            headerData.fontSizeMultipliers = { h1: headerData.fontSizes.h1 / headerData.minFontSize, nav1: headerData.fontSizes.nav1 / headerData.minFontSize, nav2: headerData.fontSizes.nav2 / headerData.minFontSize, music_btn_i: headerData.fontSizes.music_btn_i / headerData.minFontSize };
        }

        for (var fontSize = headerData.minFontSize; headerOverlap() && fontSize >= 10; fontSize--) {
            h1.style.fontSize = `${Math.round(fontSize * headerData.fontSizeMultipliers.h1)}px`;
            nav1.style.fontSize = `${Math.round(fontSize * headerData.fontSizeMultipliers.nav1)}px`;
            nav2.style.fontSize = `${Math.round(fontSize * headerData.fontSizeMultipliers.nav2)}px`;
            music_btn_i.style.fontSize = `${Math.round(fontSize * headerData.fontSizeMultipliers.music_btn_i)}px`;
        }
        function headerOverlap() {
            const h1_overlap = h1.getBoundingClientRect().right >= nav1.getBoundingClientRect().left,
                nav1_overlap = nav1.getBoundingClientRect().right >= nav2.getBoundingClientRect().left,
                nav2_overlap = nav2.getBoundingClientRect().right >= document.body.getBoundingClientRect().right;
            return h1_overlap || nav1_overlap || nav2_overlap;
        }
    }
    function getFontSize(element) {
        return parseInt(getComputedStyle(element).fontSize.match(/\d+/)[0]);
    }
}