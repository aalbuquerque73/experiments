export function setupImage(url, loader) {
    const image = new Image();

    image.onload = () => loader(image);
    image.src = url;
    document.body.appendChild(image);

    return image;
}
