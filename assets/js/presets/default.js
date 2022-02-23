window.addEventListener('load', () => {

    if (!window.AudioContext || screen.width < 1000) {
        document.querySelector('#loading-screen').style.background = 'var(--red-color)';
        document.querySelector('#loading-screen > *').innerHTML = screen.width >= 1000 ? 'This website is not supported in this browser!' : 'This website is only supported on desktop browsers';

    } else fetchJSON('presets.json').then(async presets => {
        const meta = await fetchJSON('meta.json'), trackNames = [];
        for (let i = 0; i < meta.lists.length; i++) {
            const list = await fetchJSON(`${meta.lists[i]}.json`);
            for (let j = 0; j < list.length; j++) trackNames.push(list[j].title.toLowerCase());
        }

        const audioFX = [], serumPresets = [], filmFX = [];
        for (const key in presets) for (let i = 0; i < presets[key].length; i++) {
            const items = await fetchJSON(`${key}/${presets[key][i]}.json`);
            if (key === 'audio-fx') audioFX.push(...items);
            else if (key === 'serum-presets') serumPresets.push(...items);
            else if (key === 'film-fx') filmFX.push(...items);
        }

        audioFX.reverse();
        serumPresets.reverse();
        filmFX.reverse();

        const soundContent = document.querySelector('#sound-content'), filter = document.querySelector('#sound-filter'),
            audio = new Audio();

        audio.volume = localStorage.getItem('audio-volume') ? parseFloat(localStorage.getItem('audio-volume')) : .2;
        addEventListener('beforeunload', () => localStorage.setItem('audio-volume', audio.volume));

        const volSlider = new Slider(document.querySelector('#audio-volume'), 0, 1, audio.volume, 150);
        volSlider.addEventListener('input', v => audio.volume = v);

        let audio_files = [];

        const selectMainRadios = document.querySelectorAll('#select-main-content .radio-btn');
        selectMainRadios.forEach(btn => btn.addEventListener('click', () => {
            if (btn.getAttribute('data-checked') == 'true') return;
            selectMainRadios.forEach(radio => radio.setAttribute('data-checked', radio === btn ? 'true' : 'false'));

            if (document.querySelector('.main-content').classList.contains('hidden')) document.querySelector('.main-content').classList.remove('hidden');

            if (btn.getAttribute('data-value') === 'audio-fx') audioFX_setup();
            else if (btn.getAttribute('data-value') === 'serum-presets') serumPresets_setup();
            else if (btn.getAttribute('data-value') === 'film-fx') audioFX_setup(true);

            scrollTo({ top: document.querySelector('#select-main-content').getBoundingClientRect().bottom, behavior: 'smooth' });
        }));

        function audioFX_setup(film) {
            audio_files = [];
            soundContent.innerHTML = '';
            soundContent.classList.remove('presets');
            const tags = [];
            for (let i = 0; i < (film ? filmFX : audioFX).length; i++) {
                const FX = (film ? filmFX : audioFX)[i], div = document.createElement('div'), audioURL = `../assets/audio/${film ? 'film' : 'audio'}-fx/${urlReplace(FX.file + '.wav')}`;
                div.setAttribute('data-tags', JSON.stringify(FX.tags));
                div.setAttribute('data-index', i);
                div.innerHTML = `<div class="text-content"><h2>${FX.title}</h2><p>${FX.tags.join(', ')}</p></div><div class="preview"><button class="fas fa-play"></button><canvas class="waveform" width="600" height="100" data-is-drawn="false" data-file="${audioURL}"></canvas></div><button class="download">Download</button>`;
                soundContent.appendChild(div);

                for (let t = 0; t < FX.tags.length; t++) if (!tags.includes(FX.tags[t])) tags.push(FX.tags[t]);
                audio_files.push(audioURL);
            }
            complete_setup(tags, 'fx');
        }

        function serumPresets_setup() {
            audio_files = [];
            soundContent.innerHTML = '';
            soundContent.classList.add('presets');
            const tags = [];
            for (let i = 0; i < serumPresets.length; i++) {
                const SP = serumPresets[i], div = document.createElement('div');
                div.setAttribute('data-tags', JSON.stringify(SP.tags));
                div.setAttribute('data-index', i);
                div.innerHTML = `<div class="text-content"><h2>${SP.title}</h2><p>${SP.tags.join(', ')}</p></div><div class="preview"><img src="../assets/images/serum.png" height="100"><button class="fas fa-play"></button><select class="serum-preview${SP.special_type === 'one-note-only' ? ' hidden' : ''}">${SP.special_type === 'arp' ? '' : '<option value="0">Melody</option><option value="1">Melody +1 Octave</option>'}${SP.special_type === 'mono' ? '' : '<option value="2">Chord</option><option value="3">Low + High Note</option>'}</select></div><button class="download">Download</button>`;
                soundContent.appendChild(div);

                for (let t = 0; t < SP.tags.length; t++) if (!tags.includes(SP.tags[t])) tags.push(SP.tags[t]);
                audio_files.push(`../assets/audio/serum-presets/${urlReplace(SP.file + '.mp3')}`);
            }
            complete_setup(tags, 'serum');
        }

        function complete_setup(tags, type) {
            if (!audio.paused) audio.pause();
            filter.innerHTML = '<div class="top"><h2>Tags:</h2></div><div class="bottom"><button class="radio-btn" data-value="all" data-checked="true" title="Show all">All</button></div>';
            const filterTop = filter.querySelector('.top'), filterBottom = filter.querySelector('.bottom'),
                tagGroups = {};

            for (let i = 0; i < tags.length; i++) {
                const t = tags[i], btn = document.createElement('button');

                if (/^20\d{2}$/.test(t)) {
                    if (!tagGroups['year']) {
                        const container = document.createElement('div');
                        container.className = 'tag-group';
                        container.innerHTML = '<button class="tag-group-toggle"><span>Year</span><i class="fas fa-arrow-down"></i><span class="tag-group-current-value"></span></button><div class="tags-container"><div class="tags"></div></div>';
                        filterTop.appendChild(container);
                        tagGroups['year'] = container.querySelector('.tags');
                    }
                    tagGroups['year'].appendChild(btn);

                } else if (/^[a-gA-G]#?$/.test(t)) {
                    if (!tagGroups['key']) {
                        const container = document.createElement('div');
                        container.className = 'tag-group';
                        container.innerHTML = '<button class="tag-group-toggle"><span>Key</span><i class="fas fa-arrow-down"></i><span class="tag-group-current-value"></span></button><div class="tags-container"><div class="tags"></div></div>';
                        filterTop.appendChild(container);
                        tagGroups['key'] = container.querySelector('.tags');
                    }
                    tagGroups['key'].appendChild(btn);

                } else if (trackNames.includes(t.toLowerCase())) {
                    if (!tagGroups['track']) {
                        const container = document.createElement('div');
                        container.className = 'tag-group';
                        container.innerHTML = '<button class="tag-group-toggle"><span>Track</span><i class="fas fa-arrow-down"></i><span class="tag-group-current-value"></span></button><div class="tags-container"><div class="tags"></div></div>';
                        filterTop.appendChild(container);
                        tagGroups['track'] = container.querySelector('.tags');
                    }
                    tagGroups['track'].appendChild(btn);
                } else filterBottom.appendChild(btn);

                btn.outerHTML = `<button class="radio-btn" data-value="${t}" data-checked="false">${t[0].toUpperCase() + t.substr(1)}</button>`;
            }

            document.querySelectorAll('.tag-group').forEach(div => {
                const toggleBtn = div.querySelector('.tag-group-toggle');
                document.body.addEventListener('click', e => {
                    if (e.target === toggleBtn || e.target.parentElement === toggleBtn) toggleBtn.classList.toggle('active');
                    else if (!div.contains(e.target) || e.target.className === 'tags-container') toggleBtn.classList.remove('active');
                })
            });

            var selectedTags = [], dontShowTags = [];
            const filterRadios = filter.querySelectorAll('.radio-btn'), count = document.querySelector('#presets-count');
            count.innerHTML = document.querySelectorAll('[data-tags]').length;

            filterRadios.forEach(btn => btn.addEventListener('click', () => {
                const tag = btn.getAttribute('data-value');
                if (tag === 'all') {
                    document.querySelectorAll('[data-tags]').forEach(element => element.classList.remove('hidden'));
                    filterRadios.forEach(radio => radio.setAttribute('data-checked', radio === btn ? 'true' : 'false'));
                    document.querySelectorAll('.tag-group-current-value').forEach(elem => elem.innerHTML = '');
                    selectedTags = [];
                    dontShowTags = [];
                } else {
                    if (btn.getAttribute('data-checked') == 'true' && !btn.classList.contains('dont-show')) {
                        btn.classList.add('dont-show');
                        selectedTags.splice(selectedTags.indexOf(tag), 1);
                        dontShowTags.push(tag);

                    } else if (btn.getAttribute('data-checked') == 'true' && btn.classList.contains('dont-show')) {
                        btn.setAttribute('data-checked', 'false');
                        btn.classList.remove('dont-show');
                        dontShowTags.splice(dontShowTags.indexOf(tag), 1);
                        btn.blur();

                        Object.keys(tagGroups).forEach(key => {
                            const group = tagGroups[key];
                            if (group.contains(btn)) group.parentElement.parentElement.querySelector('.tag-group-current-value').innerHTML = '';
                        });
                    } else {
                        btn.setAttribute('data-checked', 'true');
                        selectedTags.push(tag);

                        Object.keys(tagGroups).forEach(key => {
                            const group = tagGroups[key];
                            if (group.contains(btn)) {
                                group.parentElement.parentElement.querySelector('.tag-group-current-value').innerHTML = btn.getAttribute('data-value')[0].toUpperCase() + btn.getAttribute('data-value').substr(1);
                                group.querySelectorAll('.radio-btn').forEach(groupBtn => {
                                    if (groupBtn !== btn && groupBtn.getAttribute('data-checked') == 'true') {
                                        groupBtn.setAttribute('data-checked', 'false');
                                        selectedTags.splice(selectedTags.indexOf(groupBtn.getAttribute('data-value')), 1);
                                    }
                                });
                            }
                        });
                    }
                    if (selectedTags.length > 0 || dontShowTags.length > 0) {
                        document.querySelector('.radio-btn[data-value="all"]').setAttribute('data-checked', 'false');
                        document.querySelectorAll('[data-tags]').forEach(element => {
                            const elemTags = JSON.parse(element.getAttribute('data-tags'));
                            for (var t = 0; t < selectedTags.length; t++) if (!elemTags.includes(selectedTags[t])) return element.classList.add('hidden');
                            for (var t = 0; t < dontShowTags.length; t++) if (elemTags.includes(dontShowTags[t])) return element.classList.add('hidden');
                            element.classList.remove('hidden');
                        });
                    }
                    else {
                        document.querySelector('.radio-btn[data-value="all"]').setAttribute('data-checked', 'true');
                        document.querySelectorAll('[data-tags]').forEach(element => element.classList.remove('hidden'));
                    }
                }
                count.innerHTML = document.querySelectorAll('[data-tags]:not(.hidden)').length;
                updateWaveforms();
            }));

            soundContent.querySelectorAll('[data-index]').forEach(div => {
                const index = parseInt(div.getAttribute('data-index'));
                div.querySelector('.fa-play').addEventListener('click', () => {
                    if (!audio.paused) audio.pause();
                    if (audio.currentSrc !== audio_files[index]) audio.src = audio_files[index];
                    if (type === 'fx') audio.play();
                    else playSection(parseInt(div.querySelector('.serum-preview').value));
                });
            });

            let audioEnd = 0;
            function playSection(section) {
                try {
                    switch (section) {
                        case 0:
                            audio.currentTime = 0;
                            audioEnd = 7.5;
                            audio.play();
                            break;
                        case 1:
                            audio.currentTime = 8;
                            audioEnd = 15.5;
                            audio.play();
                            break;
                        case 2:
                            audio.currentTime = 16;
                            audioEnd = 25.5;
                            audio.play();
                            break;
                        case 3:
                            audio.currentTime = 26;
                            audioEnd = 0;
                            audio.play();
                            break;
                    }
                } catch {
                    return playSection(section);
                }
            }
            audio.addEventListener('timeupdate', () => {
                if (audioEnd > 0 && audio.currentTime >= audioEnd) audio.pause();
            });

            document.querySelectorAll('.fa-play').forEach(btn => btn.addEventListener('mouseup', () => btn.blur()));

            document.querySelectorAll('.download').forEach(btn => btn.addEventListener('click', () => {
                const index = parseInt(btn.parentElement.getAttribute('data-index')),
                    a = document.createElement('a');
                if (type === 'serum') {
                    a.href = '../assets/serum-presets/' + urlReplace(serumPresets[index].file) + '.fxp';
                    a.download = btn.parentElement.querySelector('h2:first-child').innerHTML + ' - Evolvetrack Audio.fxp';
                } else {
                    a.href = audio_files[index];
                    a.download = btn.parentElement.querySelector('h2:first-child').innerHTML + ' - Evolvetrack Audio.wav';
                }
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }));

            checkContentOverlap();
            replaceUppercase_o();
            updateWaveforms();
        }

        let resize;
        addEventListener('resize', resizeEvent);
        function resizeEvent() {
            clearTimeout(resize);
            resize = setTimeout(checkContentOverlap, 500);
        }
        checkContentOverlap();

        const loadedWaveforms = {}, decoder = new AudioContext();
        let waveformsTimeout;
        addEventListener('scroll', updateWaveforms);

        function updateWaveforms() {
            if (waveformsTimeout) clearTimeout(waveformsTimeout);
            waveformsTimeout = setTimeout(() => {
                const canvas_arr = document.querySelectorAll('div:not(.hidden) .waveform');
                for (let i = 0; i < canvas_arr.length; i++) {
                    const canvas = canvas_arr[i];
                    if (canvas.getBoundingClientRect().bottom <= 0 || canvas.getAttribute('data-is-drawn') == 'true') continue;
                    if (canvas.getBoundingClientRect().top >= window.innerHeight) break;

                    const file = canvas.getAttribute('data-file');
                    if (loadedWaveforms[file]) {
                        if (loadedWaveforms[file].getAttribute('data-is-drawn') == 'true') {
                            canvas.getContext('2d').drawImage(loadedWaveforms[file], 0, 0);
                            canvas.setAttribute('data-is-drawn', 'true');
                        }
                    } else loadWaveform(file, canvas);
                }
            }, 200);
        }
        function loadWaveform(file, realCanvas) {
            const canvas = document.createElement('canvas')
            canvas.width = realCanvas.width;
            canvas.height = realCanvas.height;
            canvas.setAttribute('data-is-drawn', 'false');
            loadedWaveforms[file] = canvas;

            fetch(file).then(f => f.arrayBuffer().then(a => decoder.decodeAudioData(a, d => {
                const data = d.getChannelData(file.includes('Left') ? 1 : 0),
                    ctx = canvas.getContext('2d'),
                    step = Math.ceil(data.length / canvas.width), amp = canvas.height / 2;

                ctx.fillStyle = '#fff';
                for (let x = 0; x < canvas.width; x++) {
                    let min = 1, max = -1;
                    for (let y = 0; y < step; y++) {
                        let value = data[(x * step) + y];
                        if (value < min) min = value;
                        else if (value > max) max = value;
                    }
                    ctx.fillRect(x, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
                }

                const textWidth = 100;

                ctx.fillStyle = '#0008';
                ctx.fillRect(canvas.width - textWidth - 5, 0, textWidth + 5, 30);
                ctx.font = '25px Arial';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#fff';
                ctx.fillText(d.duration.toFixed(2) + ' s', canvas.width - 5, 5, textWidth);

                canvas.setAttribute('data-is-drawn', 'true')
                realCanvas.getContext('2d').drawImage(canvas, 0, 0);
                realCanvas.setAttribute('data-is-drawn', 'true');
            })));
        }

        document.querySelector('#loading-screen').classList.add('hidden');
        document.querySelector('#select-main-content').classList.remove('hidden');
        document.querySelector('main').classList.add('active');

        const urlTag = location.href.split('?tag=')[1];
        if (urlTag) {
            document.querySelector('[data-value="film-fx"]').click();
            document.querySelector(`[data-value="${urlTag}"]`).click();
        }
    });
});