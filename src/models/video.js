import $ from 'jquery';
import { Observable } from '../observable';

export function setupVideo(url) {
    const video = document.createElement('video');

    const playing = new Observable(false)
        .map(value => !!value);
    const timeupdate = new Observable(false)
        .map(value => !!value);
    const canUpdate = Observable.compose(playing, timeupdate)
        .map(value => value.every(v => v));

    video.autoplay = true;
    video.muted = true;
    video.loop = true;

    video.addEventListener('playing', playing);
    video.addEventListener('timeupdate', timeupdate);

    video.src = url;
    video.play();
    $('#image').empty().append(video);

    return { 
        dispose() {
            video.removeEventListener('playing', playing);
            video.removeEventListener('timeupdate', timeupdate);
        },
        canUpdate,
        video,
    };
}
