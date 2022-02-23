window.addEventListener('load', () => fetchJSON('meta.json').then(async metadata => {
    meta = metadata.lists;
    meta.reverse();
    const urlData = location.href.split('list=')[1] ? urlReplace(location.href.split('list=')[1].split('&')[0]) : null, list = meta.includes(`tracks-${urlData}`) ? urlData : meta[0].split('tracks-')[1],
        bg = new StarField(document.querySelector('#audio-bg'), 400, 8000), animationDisable = localStorage.getItem('animation-disable') === 'true';
    if (innerWidth < 1000 || animationDisable) {
        document.body.classList.remove('animations');
        bg.canvas.getContext('2d').clearRect(0, 0, bg.canvas.width, bg.canvas.height);
    }
    let events, resize;
    const player = new AudioPlayer(await fetchJSON(`tracks-${list}.json`), 'Evolvetrack Audio', list, trackChange, playbackToggle);
    replaceUppercase_o();
    function playbackToggle(play) {
        if (innerWidth >= 1000 && !animationDisable) {
            if (play) bg.start();
            else bg.stop();
        } else if (bg.isActive) bg.stop();
        if (play) document.body.classList.add('play');
        else document.body.classList.remove('play');
    }
    async function trackChange(audio, item) {
        if (!animationDisable) {
            const data = await fetchJSON(`/audio-events/${item.filename.replace(/ - Final Master( \d)?/, '.json')}`);
            if (events) events.newEvents(data);
            else events = new AudioEvents(audio, document.querySelector('#audio-events'), data, '--border-color', '--blue-color');
        }
    }
    addEventListener('resize', () => {
        clearTimeout(resize);
        resize = setTimeout(() => {
            if (events) events.resize();
            bg.resize();
            player.resizeTimeChangeElement();
            if (!player.audio.paused && !bg.isActive && innerWidth >= 1000 && !animationDisable) bg.start();
            else if (bg.isActive && (innerWidth < 1000 || animationDisable)) bg.stop();
            else if (innerWidth < 1000 || animationDisable) bg.canvas.getContext('2d').clearRect(0, 0, bg.canvas.width, bg.canvas.height);
            if (innerWidth < 1000 && !animationDisable) document.body.classList.remove('animations');
            else if (!animationDisable) document.body.classList.add('animations');
            checkContentOverlap();
        }, 500);
    });
    const animationDisable_btn = document.querySelector('#animation-disable');
    if (animationDisable) {
        animationDisable_btn.className = 'enable';
        animationDisable_btn.title = 'Enable canvas animations';
        document.body.classList.remove('animations');
    }
    animationDisable_btn.addEventListener('click', () => {
        if (animationDisable) localStorage.setItem('animation-disable', 'false');
        else localStorage.setItem('animation-disable', 'true');
        location.reload();
    });
    checkContentOverlap();
    setTimeout(checkContentOverlap, 1000);
}));