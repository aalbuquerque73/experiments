import $ from 'jquery';

export function setupImage(url, loader) {
    const image = new Image();

    image.onload = () => loader(image);
    image.src = url;
    $('#image').empty().append(image);

    return image;
}
