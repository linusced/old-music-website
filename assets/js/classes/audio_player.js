class AudioPlayer {
    constructor(trackList = [{ title: '', filename: '', duration: 0 }], artist = 'Artist', header = 'Header', trackChange_callback = (audio_element, trackList_item) => null, playbackToggle_callback = play => null) {
        this.trackList = trackList.reverse()
        this.artist = artist
        this.header = header
        this.trackChange_callback = trackChange_callback
        this.playbackToggle_callback = playbackToggle_callback
        this.eventQueue = []
        this.eventActive = this.timeChange = false
        this.trackIndex = this.togglePLaybackClickCount = this.prevClickCount = 0
        document.querySelector('#audio-header').innerHTML = this.header
        this.trackListElement = document.querySelector('#audio-tracklist')
        this.audioControlsElement = document.querySelector('#audio-controls')
        this.volumeElement = new Slider(document.querySelector('#audio-volume'), 0, 1, .2, 100, true, document.querySelector('#audio-volume-container'))
        this.muteElement = document.querySelector('#audio-mute')
        this.togglePlaybackElement = document.querySelector('#audio-togglePLayback')
        this.prevElement = document.querySelector('#audio-prev')
        this.nextElement = document.querySelector('#audio-next')
        this.timeChangeElement = new Slider(document.querySelector('#audio-timeChange'), 0, 1, 0, 150)
        this.timeChangeForm = document.querySelector('#audio-timeChange-form')
        this.currentTimeElement = document.querySelector('#audio-currentTime')
        this.durationElement = document.querySelector('#audio-duration')
        var i = 0
        this.audio = new Audio(`../assets/audio/mp3/${this.trackList[this.trackIndex].filename}.mp3`)
        this.audio.volume = this.volume
        this.audioCtx = new AudioContext()
        this.gainNode = this.audioCtx.createGain()
        this.gainNode.gain.value = 1
        this.audioCtx.createMediaElementSource(this.audio).connect(this.gainNode)
        this.gainNode.connect(this.audioCtx.destination)
        for (i = 0; i < this.trackList.length; i++) {
            const btn = document.createElement('button')
            this.trackListElement.appendChild(btn)
            btn.outerHTML = `<button class="${i === this.trackIndex ? 'audio-track active' : 'audio-track'}" data-track-index="${i}" title="Play / Pause '${this.trackList[i].title}'"><i class="fas fa-play-circle"></i><h2 class="audio-track-title">${this.trackList[i].title}</h2><h2 class="audio-track-duration">${time2String(Math.ceil(this.trackList[i].duration))}</h2></button>`
        }
        this.trackListElement.addEventListener('click', e => {
            const btn = e.target.tagName === 'BUTTON' ? e.target : e.target.parentElement, index = parseInt(btn.getAttribute('data-track-index'))
            if (btn.tagName === 'BUTTON') {
                if (index !== this.trackIndex) {
                    document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).style = ''
                    this.addEvent('trackChange', index)
                    if (this.audio.paused) this.addEvent('play')
                } else this.addEvent('togglePlayback')
            }
        })
        this.audio.addEventListener('timeupdate', () => {
            if (!this.timeChange) {
                this.timeChangeElement.value = this.audio.currentTime
                this.timeChangeElement.update()
                this.currentTimeElement.innerHTML = time2String(this.audio.currentTime)
            }
        })
        this.audio.addEventListener('play', () => {
            this.togglePlaybackElement.title = 'Pause'
            this.togglePlaybackElement.className = 'fas fa-pause'
            document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).className = 'fas fa-pause-circle'
        })
        this.audio.addEventListener('pause', () => {
            this.togglePlaybackElement.title = 'Play'
            this.togglePlaybackElement.className = 'fas fa-play'
            document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).className = 'fas fa-play-circle'
        })
        this.audio.addEventListener('loadedmetadata', () => {
            this.timeChangeElement.max = this.audio.duration
            this.timeChangeElement.update()
            this.durationElement.innerHTML = time2String(Math.ceil(this.audio.duration))
        })
        this.audio.addEventListener('ended', () => this.next())
        this.volumeElement.addEventListener('input', () => this.volumeChange())
        this.muteElement.addEventListener('click', () => this.volumeChange(this.muted ? .2 : 0))
        this.togglePlaybackElement.addEventListener('click', () => {
            this.togglePLaybackClickCount++
            if (this.togglePLaybackClickCount === 1) setTimeout(() => {
                if (this.togglePLaybackClickCount === 1) this.addEvent('togglePlayback')
                else this.addEvent('pause')
                this.togglePLaybackClickCount = 0
            }, 250)
        })
        this.prevElement.addEventListener('click', () => this.prev())
        this.nextElement.addEventListener('click', () => this.next())
        this.timeChangeElement.addEventListener('input', e => {
            this.timeChange = true
            this.currentTimeElement.innerHTML = time2String(e)
        })
        this.timeChangeElement.addEventListener('change', e => {
            this.addEvent('timeChange', e)
            setTimeout(() => this.timeChange = false, 1000)
        })
        this.timeChangeForm.addEventListener('submit', e => {
            e.preventDefault()
            const time_sec = string2Time(this.timeChangeForm.timeChange.value)
            if (time_sec < this.audio.duration) {
                this.timeChange = true
                this.timeChangeElement.value = time_sec
                this.timeChangeElement.update()
                this.currentTimeElement.innerHTML = time2String(time_sec)
                this.addEvent('timeChange', time_sec)
                setTimeout(() => this.timeChange = false, 1000)
            }
        })
        setMetaData(this.trackList[this.trackIndex], this.artist)
        if (navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', () => this.addEvent('play'))
            navigator.mediaSession.setActionHandler('pause', () => this.addEvent('pause'))
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prev())
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next())
        }
        const urlData = location.href.split('track=')[1]
        if (urlData) {
            const text = urlReplace(urlData.split('&')[0])
            for (i = 0; i < this.trackList.length; i++) if (this.trackList[i].title.toLowerCase() === text) break
            if (i < this.trackList.length) {
                this.initialTrackChange = true
                this.addEvent('trackChange', i)
            } else this.trackChange_callback(this.audio, this.trackList[this.trackIndex])
        } else this.trackChange_callback(this.audio, this.trackList[this.trackIndex])
        addEventListener('keydown', e => {
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return
            if (e.target === document.body) {
                switch (e.code) {
                    case 'Space':
                        this.addEvent('togglePlayback')
                        break
                    case 'KeyK':
                        this.addEvent('togglePlayback')
                        break
                    case 'KeyJ':
                        this.prev()
                        break
                    case 'KeyL':
                        this.next()
                        break
                    case 'KeyM':
                        this.volumeChange(this.muted ? .2 : 0)
                        break
                    case 'ArrowUp':
                        this.volumeChange(this.volume + .1)
                        break
                    case 'ArrowDown':
                        this.volumeChange(this.volume - .1)
                        break
                }
            } else if (e.code === 'Space' && e.target.id === 'animation-disable') e.preventDefault()
            else if (e.target.id === 'audio-mute') switch (e.code) {
                case 'ArrowUp':
                    this.volumeChange(this.volume + .1)
                    break
                case 'ArrowDown':
                    this.volumeChange(this.volume - .1)
                    break
            }
        })
        if (parseFloat(localStorage.getItem('audio-volume')) >= 0) this.volumeChange(parseFloat(localStorage.getItem('audio-volume')))
        addEventListener('beforeunload', () => localStorage.setItem('audio-volume', this.volume))
        this.resizeTimeChangeElement()
        setTimeout(() => this.resizeTimeChangeElement(), 1000)
    }
    async eventAction() {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
        if (!this.eventActive && this.eventQueue.length > 0) {
            this.eventActive = true
            switch (this.eventQueue[0].type) {
                case 'togglePlayback':
                    this.playbackToggle_callback(this.audio.paused)
                    this.audio.paused ? await this.play() : await this.pause()
                    break
                case 'play':
                    this.playbackToggle_callback(true)
                    await this.play()
                    break
                case 'pause':
                    this.playbackToggle_callback(false)
                    await this.pause()
                    break
                case 'timeChange':
                    var isPlaying = !this.audio.paused
                    if (isPlaying) await this.pause()
                    this.audio.currentTime = this.eventQueue[0].value
                    if (isPlaying) await this.play()
                    break
                case 'trackChange':
                    var isPlaying = !this.audio.paused, ended = this.audio.ended
                    let newIndex = this.eventQueue[0].value
                    if (newIndex < 0) newIndex = this.trackList.length - 1
                    else if (newIndex >= this.trackList.length) newIndex = 0
                    if (isPlaying) await this.pause()
                    this.trackIndex = newIndex
                    this.audio.src = `../assets/audio/mp3/${this.trackList[this.trackIndex].filename}.mp3`
                    setMetaData(this.trackList[this.trackIndex], this.artist)
                    this.trackChange_callback(this.audio, this.trackList[this.trackIndex])
                    if (!this.initialTrackChange) {
                        await this.play()
                        if (!isPlaying && !ended) this.playbackToggle_callback(true)
                    } else this.initialTrackChange = false
                    this.trackListElement.querySelectorAll('button').forEach((b, bIndex) => {
                        if (bIndex === this.trackIndex) b.classList.add('active')
                        else {
                            b.classList.remove('active')
                            b.querySelector('i').className = 'fas fa-play-circle'
                            b.querySelector('i').style = ''
                        }
                    })
                    break
            }
            this.eventQueue.shift()
            this.eventActive = false
            this.eventAction()
        }
    }
    addEvent(type, value) {
        this.eventQueue.push({ type: type, value: value })
        this.eventAction()
    }
    play() {
        return new Promise(resolve => {
            this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime)
            this.audio.play()
            this.gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + .2)
            setTimeout(() => resolve(), 200)
        })
    }
    pause() {
        return new Promise(resolve => {
            this.gainNode.gain.setValueAtTime(1, this.audioCtx.currentTime)
            this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + .2)
            setTimeout(() => {
                this.audio.pause()
                resolve()
            }, 200)
        })
    }
    prev() {
        this.prevClickCount++
        if (this.prevClickCount === 1) setTimeout(() => {
            if (this.prevClickCount === 1 && this.audio.currentTime >= 3) this.addEvent('timeChange', 0)
            else this.addEvent('trackChange', this.trackIndex - 1)
            this.prevClickCount = 0
        }, 250)
    }
    next() {
        this.addEvent('trackChange', this.trackIndex + 1)
    }
    volumeChange(newVol) {
        if (newVol || newVol === 0) {
            if (newVol < 0) newVol = 0
            else if (newVol > 1) newVol = 1
            this.volumeElement.value = newVol
            this.volumeElement.update(true)
        }
        this.audio.volume = this.volume
        if (this.volume === 0) {
            this.muteElement.title = 'Unmute (change the volume using arrow-up and arrow-down keys)'
            this.muteElement.className = 'fas fa-volume-mute'
        } else {
            this.muteElement.title = 'Mute (change the volume using arrow-up and arrow-down keys)'
            this.muteElement.className = 'fas fa-volume-up'
        }
    }
    resizeTimeChangeElement() {
        this.timeChangeElement.container.style.display = 'none'
        const width = (innerWidth < 700 ? innerWidth : 700) - this.audioControlsElement.getBoundingClientRect().width
        this.timeChangeElement.container.style.display = ''
        this.timeChangeElement.setLength(width)
    }
    get volume() {
        return this.volumeElement.value
    }
    get muted() {
        return this.volume === 0
    }
}
class AlternateAudioPlayer {
    constructor(trackList = [{ title: '', filename: '', duration: 0 }], artist = 'Artist', header = 'Header') {
        this.trackList = trackList.reverse()
        this.artist = artist
        this.header = header
        this.isMobile = typeof window.orientation !== 'undefined' || screen.height > screen.width
        this.timeChange_bool = false
        this.trackIndex = this.togglePLaybackClickCount = this.prevClickCount = 0
        document.querySelector('#audio-header').innerHTML = this.header
        this.trackListElement = document.querySelector('#audio-tracklist')
        this.audioControlsElement = document.querySelector('#audio-controls')
        if (!this.isMobile) this.volumeElement = new Slider(document.querySelector('#audio-volume'), 0, 1, .2, 100, true, document.querySelector('#audio-volume-container'))
        else {
            document.querySelector('#audio-player').className = 'audio-mobile'
            document.querySelector('#audio-volume-controls').removeChild(document.querySelector('#audio-volume-container'))
            this.audioControlsElement.style.paddingRight = '10px'
        }
        this.muteElement = document.querySelector('#audio-mute')
        this.togglePlaybackElement = document.querySelector('#audio-togglePLayback')
        this.prevElement = document.querySelector('#audio-prev')
        this.nextElement = document.querySelector('#audio-next')
        this.timeChangeElement = new Slider(document.querySelector('#audio-timeChange'), 0, 1, 0, 150)
        this.timeChangeForm = document.querySelector('#audio-timeChange-form')
        this.currentTimeElement = document.querySelector('#audio-currentTime')
        this.durationElement = document.querySelector('#audio-duration')
        var i = 0
        this.audio = new Audio(`../assets/audio/mp3/${this.trackList[this.trackIndex].filename}.mp3`)
        if (!this.isMobile) this.audio.volume = this.volume
        for (i = 0; i < this.trackList.length; i++) {
            const btn = document.createElement('button')
            this.trackListElement.appendChild(btn)
            btn.outerHTML = `<button class="${i === this.trackIndex ? 'audio-track active' : 'audio-track'}" title="Play / Pause '${this.trackList[i].title}'" data-track-index="${i}"><i class="fas fa-play-circle"></i><h2 class="audio-track-title">${this.trackList[i].title}</h2><h2 class="audio-track-duration">${time2String(Math.ceil(this.trackList[i].duration))}</h2></button>`
        }
        this.trackListElement.addEventListener('click', e => {
            const btn = e.target.tagName === 'BUTTON' ? e.target : e.target.parentElement, index = parseInt(btn.getAttribute('data-track-index'))
            if (btn.tagName === 'BUTTON') {
                if (index !== this.trackIndex) {
                    document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).style = ''
                    this.trackChange(index, true)
                } else this.togglePlayback()
            }
        })
        this.audio.addEventListener('timeupdate', () => {
            if (!this.timeChange_bool) {
                this.timeChangeElement.value = this.audio.currentTime
                this.timeChangeElement.update()
                this.currentTimeElement.innerHTML = time2String(this.audio.currentTime)
            }
        })
        this.audio.addEventListener('play', () => {
            this.togglePlaybackElement.title = 'Pause'
            this.togglePlaybackElement.className = 'fas fa-pause'
            document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).className = 'fas fa-pause-circle'
            document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).style.visibility = 'visible'
        })
        this.audio.addEventListener('pause', () => {
            this.togglePlaybackElement.title = 'Play'
            this.togglePlaybackElement.className = 'fas fa-play'
            document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).className = 'fas fa-play-circle'
            document.querySelector(`[data-track-index="${this.trackIndex}"] > i`).style.visibility = ''
        })
        this.audio.addEventListener('loadedmetadata', () => {
            this.timeChangeElement.max = this.audio.duration
            this.timeChangeElement.update()
            this.durationElement.innerHTML = time2String(Math.ceil(this.audio.duration))
        })
        this.audio.addEventListener('ended', () => this.next())
        if (this.isMobile) this.muteElement.addEventListener('click', () => {
            this.audio.muted = !this.audio.muted
            if (this.audio.muted) {
                this.muteElement.title = 'Unmute (change the volume using arrow-up and arrow-down keys)'
                this.muteElement.className = 'fas fa-volume-mute'
            } else {
                this.muteElement.title = 'Mute (change the volume using arrow-up and arrow-down keys)'
                this.muteElement.className = 'fas fa-volume-up'
            }
        })
        else {
            this.volumeElement.addEventListener('input', () => this.volumeChange())
            this.muteElement.addEventListener('click', () => this.volumeChange(this.muted ? .2 : 0))
        }
        this.togglePlaybackElement.addEventListener('click', () => {
            this.togglePLaybackClickCount++
            if (this.togglePLaybackClickCount === 1) setTimeout(() => {
                if (this.togglePLaybackClickCount === 1) this.togglePlayback()
                else this.audio.pause()
                this.togglePLaybackClickCount = 0
            }, 250)
        })
        this.prevElement.addEventListener('click', () => this.prev())
        this.nextElement.addEventListener('click', () => this.next())
        this.timeChangeElement.addEventListener('input', e => {
            this.timeChange_bool = true
            this.currentTimeElement.innerHTML = time2String(e)
        })
        this.timeChangeElement.addEventListener('change', e => {
            this.timeChange(e)
            setTimeout(() => this.timeChange_bool = false, 1000)
        })
        this.timeChangeForm.addEventListener('submit', e => {
            e.preventDefault()
            const time_string = this.timeChangeForm.timeChange.value, time_sec = string2Time(time_string)
            if (time_sec < this.audio.duration) {
                this.timeChange_bool = true
                this.timeChangeElement.value = time_sec
                this.timeChangeElement.update()
                this.currentTimeElement.innerHTML = time_string
                this.timeChange(time_sec)
                setTimeout(() => this.timeChange_bool = false, 1000)
            }
        })
        setMetaData(this.trackList[this.trackIndex], this.artist)
        if (navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', () => this.audio.play())
            navigator.mediaSession.setActionHandler('pause', () => this.audio.pause())
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prev())
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next())
        }
        const urlData = location.href.split('track=')[1]
        if (urlData) {
            const text = urlReplace(urlData.split('&')[0])
            for (i = 0; i < this.trackList.length; i++) if (this.trackList[i].title.toLowerCase() === text) break
            if (i < this.trackList.length) {
                this.initialTrackChange = true
                this.trackChange(i)
            }
        }
        if (!this.isMobile) {
            addEventListener('keydown', e => {
                if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return
                if (e.target === document.body) {
                    switch (e.code) {
                        case 'Space':
                            e.preventDefault()
                            this.togglePlayback()
                            break
                        case 'KeyK':
                            this.togglePlayback()
                            break
                        case 'KeyJ':
                            this.prev()
                            break
                        case 'KeyL':
                            this.next()
                            break
                        case 'KeyM':
                            this.volumeChange(this.muted ? .2 : 0)
                            break
                        case 'ArrowUp':
                            this.volumeChange(this.volume + .1)
                            break
                        case 'ArrowDown':
                            this.volumeChange(this.volume - .1)
                            break
                    }
                } else if (e.code === 'Space' && e.target.id === 'animation-disable') e.preventDefault()
                else if (e.target.id === 'audio-mute') switch (e.code) {
                    case 'ArrowUp':
                        this.volumeChange(this.volume + .1)
                        break
                    case 'ArrowDown':
                        this.volumeChange(this.volume - .1)
                        break
                }
            })
            if (parseFloat(localStorage.getItem('audio-volume')) >= 0) this.volumeChange(parseFloat(localStorage.getItem('audio-volume')))
            addEventListener('beforeunload', () => localStorage.setItem('audio-volume', this.volume))
        }
        this.resizeTimeChangeElement()
        setTimeout(() => this.resizeTimeChangeElement(), 1000)
    }
    togglePlayback() {
        this.audio.paused ? this.audio.play() : this.audio.pause()
    }
    timeChange(newTime) {
        var isPlaying = !this.audio.paused
        if (isPlaying) this.audio.pause()
        this.audio.currentTime = newTime
        if (isPlaying) this.audio.play()
    }
    trackChange(newIndex) {
        this.timeChangeElement.value = 0
        this.timeChangeElement.update()
        var isPlaying = !this.audio.paused
        if (newIndex < 0) newIndex = this.trackList.length - 1
        else if (newIndex >= this.trackList.length) newIndex = 0
        if (isPlaying) this.audio.pause()
        this.trackIndex = newIndex
        this.audio.src = `../assets/audio/mp3/${this.trackList[this.trackIndex].filename}.mp3`
        setMetaData(this.trackList[this.trackIndex], this.artist)
        if (!this.initialTrackChange) this.audio.play()
        else this.initialTrackChange = false
        this.trackListElement.querySelectorAll('button').forEach((b, bIndex) => {
            if (bIndex === this.trackIndex) b.classList.add('active')
            else {
                b.classList.remove('active')
                b.querySelector('i').className = 'fas fa-play-circle'
                b.querySelector('i').style = ''
            }
        })
    }
    prev() {
        this.prevClickCount++
        if (this.prevClickCount === 1) setTimeout(() => {
            if (this.prevClickCount === 1 && this.audio.currentTime >= 3) this.timeChange(0)
            else this.trackChange(this.trackIndex - 1)
            this.prevClickCount = 0
        }, 250)
    }
    next() {
        this.trackChange(this.trackIndex + 1)
    }
    volumeChange(newVol) {
        if (newVol || newVol === 0) {
            if (newVol < 0) newVol = 0
            else if (newVol > 1) newVol = 1
            this.volumeElement.value = newVol
            this.volumeElement.update(true)
        }
        this.audio.volume = this.volume
        if (this.volume === 0) {
            this.muteElement.title = 'Unmute (change the volume using arrow-up and arrow-down keys)'
            this.muteElement.className = 'fas fa-volume-mute'
        } else {
            this.muteElement.title = 'Mute (change the volume using arrow-up and arrow-down keys)'
            this.muteElement.className = 'fas fa-volume-up'
        }
    }
    resizeTimeChangeElement() {
        this.durationElement.parentElement.style = this.prevElement.style = this.nextElement.style = this.audioControlsElement.style = ''
        this.timeChangeElement.container.style = 'display:none'
        const width = (innerWidth < 700 ? innerWidth : 700) - this.audioControlsElement.getBoundingClientRect().width
        if (width > 150) {
            this.timeChangeElement.container.style = ''
            this.timeChangeElement.setLength(width)
        } else {
            this.durationElement.parentElement.style = 'font-size:22px;margin-left:0;margin-right:0'
            this.prevElement.style = this.nextElement.style = 'margin:0;width:auto'
            this.audioControlsElement.style = 'width:100vw;justify-content:space-around;padding:10px 0 50px'
            this.timeChangeElement.container.style = 'position:absolute;bottom:15px;left:5px'
            this.timeChangeElement.setLength(innerWidth - 10)
        }
    }
    get volume() {
        return this.volumeElement.value
    }
    get muted() {
        return this.volume === 0
    }
}
function setMetaData(track, artist) {
    if (navigator.mediaSession) navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: artist,
        artwork: [
            { src: `../assets/images/${track.filename.replace(/ - Final Master( \d)?/, '.png')}`, sizes: '256x256', type: 'image/png' }
        ]
    })
    document.title = `${track.title} - Evolvetrack Audio`
}
function time2String(time_sec) {
    let min = Math.floor(time_sec / 60),
        sec = Math.floor(time_sec - (60 * min))
    if (min < 10) min = `0${min}`
    if (sec < 10) sec = `0${sec}`
    return `${min}:${sec}`
}
function string2Time(time_string) {
    if (time_string.includes(':')) {
        const time_object = time_string.match(/(\d+):(\d+)/), min = parseInt(time_object[1]), sec = parseInt(time_object[2])
        return min * 60 + sec
    } else {
        return parseFloat(time_string)
    }
}