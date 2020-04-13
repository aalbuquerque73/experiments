import { Observable } from '../observable';

export function setupVideo(url) {
    const video = document.createElement('video');

    const playing = new Observable(false)
        .map(value => !!value);
    const timeupdate = new Observable(false)
        .map(value => !!value);
    const canUpdate = Observable.compose(playing, timeupdate)
        .map(value => value.every(v => v));

    video.autoplay = false;
    video.muted = true;
    video.loop = false;

    video.addEventListener('playing', playing);
    video.addEventListener('timeupdate', timeupdate);

    video.src = url;
    video.play();
    document.body.appendChild(video);

    return { 
        canUpdate,
        video,
    };
}
