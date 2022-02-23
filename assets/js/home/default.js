window.addEventListener('load', () => fetchJSON('meta.json').then(async metadata => {

    const meta = metadata.lists;
    meta.reverse();
    const musicFilter = document.querySelector('#music-filter'), musicElement = document.querySelector('#music-content');
    for (let i = 0; i < meta.length; i++) {
        const list = await fetchJSON(`${meta[i]}.json`), listName = meta[i].split('tracks-')[1];
        list.reverse();
        if (meta.length > 1) musicFilter.innerHTML += `<button class="radio-btn" data-value="${urlReplace(listName)}" data-checked="false" title="Filter music tracks by tracklist '${listName}'">${listName[0].toUpperCase() + listName.substr(1)}</button>`;
        else musicFilter.classList.add('hidden');
        for (let t = 0; t < list.length; t++) {
            const track = list[t], a = document.createElement('a');
            a.setAttribute('data-music-list', urlReplace(listName));
            a.href = `./music/index.html?list=${listName}&track=${urlReplace(track.title)}`;
            a.title = `Listen to '${track.title}'`;
            a.innerHTML = `<img src="./assets/images/${track.filename.replace(/ - Final Master( \d)?/, '.png')}" alt="Track Artwork" width="200" height="200"><h2><span class="homepage-track-title">${track.title}</span></h2>`;
            musicElement.appendChild(a);
        }
    }

    const about = metadata.info.about
    for (let i = 0; i < about.length; i++) document.querySelector('#about').innerHTML += '<p>' + about[i].split('\n').join('<br>') + '</p>';

    const contact = metadata.info.contact, contact_a = document.querySelector('#contact');
    contact_a.href = 'mailto:' + contact;
    contact_a.innerHTML = 'Contact: ' + contact;
    replaceUppercase_o();

    if (meta.length > 1) {
        const filterRadios = musicFilter.querySelectorAll('.radio-btn');
        filterRadios.forEach(btn => btn.addEventListener('click', e => {
            filterRadios.forEach(radio => radio.setAttribute('data-checked', radio === e.target ? 'true' : 'false'));
            const list = e.target.getAttribute('data-value');
            if (list === 'all') document.querySelectorAll('[data-music-list]').forEach(element => element.classList.remove('hidden'));
            else {
                document.querySelectorAll('[data-music-list]').forEach(element => element.classList.add('hidden'));
                document.querySelectorAll(`[data-music-list="${list}"]`).forEach(element => element.classList.remove('hidden'));
            }
        }));
    }

    const selectMainRadios = document.querySelectorAll('#select-main-content .radio-btn');
    let mainContentInitialized = false;
    selectMainRadios.forEach(btn => btn.addEventListener('click', e => {
        mainContentInitialized = true;
        selectMainRadios.forEach(radio => radio.setAttribute('data-checked', radio === e.target ? 'true' : 'false'));
        document.querySelectorAll('.main-content').forEach(main => main.classList.add('hidden'));
        document.querySelector(`#${e.target.getAttribute('data-value')}`).classList.remove('hidden');
        scrollTo({ top: innerHeight, behavior: 'smooth' });
    }));

    addEventListener('scroll', () => {
        if (!mainContentInitialized && musicFilter.parentElement.getBoundingClientRect().bottom <= innerHeight) {
            mainContentInitialized = true;
            selectMainRadios[0].setAttribute('data-checked', 'true');
        }
    });
    scrollTo({ top: 0 });

    let waveform = null, resize = null;
    if (screen.width > 700) waveform = new WaveformAnimation(document.querySelector('#waveform-animation'), '--blue-color');
    else document.querySelector('#homepage').classList.add('no-animation');
    addEventListener('resize', resizeEvent);
    function resizeEvent() {
        clearTimeout(resize);
        resize = setTimeout(() => {
            checkContentOverlap();
            if (waveform) waveform.checkVisibility();
        }, 500);
    }

    checkContentOverlap();
    setTimeout(checkContentOverlap, 1000);
    if (!window.AudioContext || screen.width < 1000) {
        let prev_innerWidth = innerWidth, prev_innerHeight = innerHeight;
        setInterval(() => {
            if (innerWidth !== prev_innerWidth || innerHeight !== prev_innerHeight) {
                prev_innerWidth = innerWidth;
                prev_innerHeight = innerHeight;
                resizeEvent();
            }
        }, 1000);
    }

}));