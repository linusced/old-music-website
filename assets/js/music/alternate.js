window.addEventListener('load', () => fetchJSON('meta.json').then(async metadata => {
    meta = metadata.lists;
    meta.reverse();
    const urlData = location.href.split('list=')[1] ? urlReplace(location.href.split('list=')[1].split('&')[0]) : null, list = meta.includes(`tracks-${urlData}`) ? urlData : meta[0].split('tracks-')[1],
        player = new AlternateAudioPlayer(await fetchJSON(`tracks-${list}.json`), 'Evolvetrack Audio', list);
    replaceUppercase_o();
    let resize;
    addEventListener('resize', resizeEvent);
    function resizeEvent() {
        clearTimeout(resize);
        resize = setTimeout(() => {
            player.resizeTimeChangeElement();
            checkContentOverlap();
        }, 500);
    }
    player.audio.addEventListener('play', () => document.body.classList.add('play'));
    player.audio.addEventListener('pause', () => document.body.classList.remove('play'));
    if (!player.isMobile && localStorage.getItem('browser-msg-displayed') !== 'true') {
        const browser_msg = document.querySelector('#browser-msg');
        browser_msg.style = 'display:flex';
        document.querySelector('#browser-msg-close').addEventListener('click', () => {
            browser_msg.style = '';
            localStorage.setItem('browser-msg-displayed', 'true');
        });
    }
    checkContentOverlap();
    setTimeout(checkContentOverlap, 1000);
    let prev_innerWidth = innerWidth, prev_innerHeight = innerHeight;
    setInterval(() => {
        if (innerWidth !== prev_innerWidth || innerHeight !== prev_innerHeight) {
            prev_innerWidth = innerWidth;
            prev_innerHeight = innerHeight;
            resizeEvent();
        }
    }, 1000);
}));