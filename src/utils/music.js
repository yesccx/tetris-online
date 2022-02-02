import { Howl, Howler } from 'howler';

export const music = {};

(() => {
    music.start = new Howl({
        src: ['/static/music/start.mp3'],
        loop: false
    })

    music.rotate = new Howl({
        src: ['/static/music/rotate.mp3'],
        loop: false
    })

    music.clear = new Howl({
        src: ['/static/music/clear.mp3'],
        loop: false
    })

    music.clear1 = new Howl({
        src: ['/static/music/clear1.mp3'],
        loop: false
    })

    music.clear2 = new Howl({
        src: ['/static/music/clear2.mp3'],
        loop: false
    })

    music.clear3 = new Howl({
        src: ['/static/music/clear3.mp3'],
        loop: false
    })

    music.clear4 = new Howl({
        src: ['/static/music/clear4.mp3'],
        loop: false
    })

    music.fall = new Howl({
        src: ['/static/music/fall.mp3'],
        loop: false
    })

    music.buffer = new Howl({
        src: ['/static/music/buffer.mp3'],
        loop: false
    })

    music.win = new Howl({
        src: ['/static/music/win.mp3'],
        loop: false
    })

    music.pause = new Howl({
        src: ['/static/music/pause.mp3'],
        loop: false
    })

    music.bgmusic = new Howl({
        src: ['/static/music/bg1.mp3'],
        loop: true
    })
})()
