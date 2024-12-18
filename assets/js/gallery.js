const replace_listeners = new Map();
let image_data = [];
let avif_re = new RegExp('.avif$');
let webp_re = new RegExp('.webp$');

function zoom(id) {
    image = document.getElementById(id);

    div = document.createElement("div");
    div.id = "zoom-div";
    div.addEventListener('click', hide);
    div.classList.add("gallery-zoom");

    p = document.createElement("a");
    p.textContent = "x";
    p.setAttribute('href', '#');
    p.addEventListener('click', hide);

    document.onkeydown = function(evt) {
        evt = evt || window.event;
        if (evt.key === "Escape" || evt.key === "Esc") {
            document.body.removeChild(document.getElementById("zoom-div"));
            document.onkeydown = null;
        }
    };

    document.body.style.overflow = "hidden";
    br = document.createElement("br");

    newimage = document.createElement("img");
    newimage.src = image.currentSrc;

    newimage.addEventListener('mouseover', (event) => {
        newimage.style.cursor = 'zoom-out';
    });

    div.append(p);
    div.append(br);
    div.append(newimage);
    document.body.append(div);

    if ((image.naturalWidth > div.offsetWidth) || (image.naturalHeight > div.offsetHeight)) {
        p = document.createElement("p");
        fullres = document.createElement("a");
        fullres.textContent = "Click to open full size image";
        fullres.setAttribute('href', image.currentSrc);
        fullres.setAttribute('alignment', 'center');
        p2 = document.createElement("p");
        p2.textContent = "Click anywhere else to close.";
        div.append(p);
        div.append(p2);
        p.append(fullres);
    } else {
        p = document.createElement("p");
        p.textContent = "Click anywhere to close.";
        div.append(p);
    }

    offsetx = ((window.visualViewport.width - div.offsetWidth) / 2) + "px";
    offsety = ((Math.abs(div.getBoundingClientRect().y) + (window.visualViewport.height - div.offsetHeight) / 2)) + "px";
    div.style.top = offsety;
    div.style.left = offsetx;
}

function hide() {
    document.body.removeChild(document.getElementById("zoom-div"));
    document.body.style.overflow = null;
}

function hide_key(e) {
    if (e.key == 'Escape') {
        document.body.removeChild(document.getElementById("zoom-div"));
        document.removeAttribute('keyup.esc');
    }
}

function replace(galleryid, imageid) {
    new_primary = document.getElementById("gallery-picture-" + imageid);

    gallery = document.getElementById(`gallery-${galleryid}`);

    for (child of gallery.children) {
        if (child == new_primary) {
            child.classList.replace("gallery-picture-thumbnail", "gallery-picture-primary");
            child.querySelector('img').classList.replace('gallery-image-thumbnail', 'gallery-image-primary');

            let obj = child.querySelector('img');
            let closure = function() {
                return function() {
                    zoom(`gallery-image-${imageid}`);
                }
            }();

            obj.removeEventListener('click', replace_listeners.get(obj));
            replace_listeners.set(obj, closure);
            child.querySelector('img').addEventListener('click', replace_listeners.get(obj));
        } else if (child.classList.contains("gallery-picture-primary")) {
            childid = child.getAttribute('id').replace("gallery-picture-", "");
            child.classList.replace("gallery-picture-primary", "gallery-picture-thumbnail");
            child.querySelector('img').classList.replace('gallery-image-primary', 'gallery-image-thumbnail');

            let obj = child.querySelector('img');
            let closure = function() {
                return function() {
                    replace(galleryid, childid);
                }
            }();

            obj.removeEventListener('click', replace_listeners.get(obj));
            replace_listeners.set(obj, closure);
            child.querySelector('img').addEventListener('click', replace_listeners.get(obj));
        }
    }
}

function showcase_load(showcase_id, images) {
    image_data[showcase_id] = images;

    let div = document.getElementById(`gallery-${showcase_id}`);
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    let first_image = images[0];
    let files = first_image['image'];

    let picture = document.createElement("picture");
    for (let i = 0; i < files.length - 1; i++) {
        let srcset = document.createElement("source");
        srcset.srcset = files[i];

        if (avif_re.test(files[i])) {
            srcset.type = 'image/avif';
        } else if (webp_re.test(files[i])) {
            srcset.type = 'image/webp';
        }
        picture.append(srcset);
    }
    let img = document.createElement("img");
    img.loading = 'lazy';
    img.id = `gallery-showcase-${showcase_id}-current-image`;
    img.src = files[files.length - 1];

    let closure = function() {
        return function() {
            showcase_overlay(showcase_id, 0);
        }
    }();

    img.addEventListener('load', closure);

    picture.append(img);
    div.append(picture);

    let selectdiv = document.createElement("div");
    let bumper_left = document.createElement("i");
    bumper_left.classList.add('gallery-showcase-bumper-left');
    selectdiv.append(bumper_left);

    selectdiv.id = `gallery-showcase-select-${showcase_id}`;
    selectdiv.classList.add("gallery-showcase-select");
    for (let i = 0; i < images.length; i++) {
        let dot = document.createElement("img");
        dot.src = "/images/dot.png";
        if (i == 0) {
            dot.classList.add("gallery-showcase-dot-selected");
        } else {
            dot.classList.add("gallery-showcase-dot");
        }
        dot.addEventListener('click', (e) => {
            showcase_change(showcase_id, i);
        });
        selectdiv.append(dot);
    }

    let bumper_right = document.createElement('i');
    bumper_right.classList.add('gallery-showcase-bumper-right');
    selectdiv.append(bumper_right);

    div.append(selectdiv);
}

function showcase_change (showcase_id, image_id) {
    let image = image_data[showcase_id][image_id];
    let old_picture = document.getElementById(`gallery-${showcase_id}`).firstChild;

    let picture = document.createElement('picture');

    for (let i = 0; i < image['image'].length - 1; i++) {
        let source = document.createElement("source");
        source.srcset = image['image'][i];
        if (avif_re.test(image['image'][i])) {
            source.type = 'image/avif';
        } else if (webp_re.test(image['image'][i])) {
            source.type = 'image/webp';
        }
        picture.append(source);
    }

    let img = document.createElement('img');
    img.loading = 'lazy';
    img.src = image['image'][image['image'].length - 1];
    img.id = `gallery-showcase-${showcase_id}-current-image`;

    let closure = function() {
        return function() {
            showcase_overlay(showcase_id, image_id);
        }
    }();

    img.addEventListener('load', closure);
    picture.append(img);

    old_picture.replaceWith(picture);

    let selectdiv = document.getElementById(`gallery-showcase-select-${showcase_id}`);
    for (let i = 1; i < selectdiv.children.length - 1; i++) {
        if (i == (image_id + 1)) {
            selectdiv.children[i].classList.remove('gallery-showcase-dot');
            selectdiv.children[i].classList.add('gallery-showcase-dot-selected');
        } else {
            selectdiv.children[i].classList.remove('gallery-showcase-dot-selected');
            selectdiv.children[i].classList.remove('gallery-showcase-dot');
            selectdiv.children[i].classList.add('gallery-showcase-dot');
        }
    }
}

// image_id is the current image in the image set and is zero-indexed.
function showcase_overlay(showcase_id, image_id) {
    let div = document.getElementById(`gallery-showcase-${showcase_id}-current-image`);
    let rect = div.getBoundingClientRect();

    let first_run = true;
    let overlay = document.getElementById(`gallery-showcase-${showcase_id}-overlay-div`);

    if (!overlay) {
        overlay = document.createElement('div');
        document.body.append(overlay);
    } else {
        first_run = false;
    }

    let offsetx = div.getBoundingClientRect().left + window.pageXOffset;
    let offsety = div.getBoundingClientRect().top + window.pageYOffset;

    overlay.id = `gallery-showcase-${showcase_id}-overlay-div`;
    overlay.classList.add('gallery-showcase-overlay');
    overlay.style.height = `${rect.height}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.top = `${offsety}px`;
    overlay.style.left = `${offsetx}px`;

    let leftlink = null;
    let rightlink = null;
    let spacer = null;

    if (first_run == false) {
        // Remove the old elements to clear out the eventlisteners since once = true doesn't seem to work reliably...
        document.getElementById(`gallery-showcase-${showcase_id}-overlay-left-link`).remove();
        document.getElementById(`gallery-showcase-${showcase_id}-overlay-right-link`).remove();
        document.getElementById(`gallery-showcase-${showcase_id}-overlay-spacer`).remove();
    }
    leftlink = document.createElement('div');
    leftlink.id = `gallery-showcase-${showcase_id}-overlay-left-link`;
    leftlink.classList.add('gallery-showcase-overlay-link');

    leftp = document.createElement('p');
    leftlink.append(leftp);

    spacer = document.createElement('div');
    spacer.id = `gallery-showcase-${showcase_id}-overlay-spacer`;
    spacer.classList.add('gallery-showcase-overlay-spacer');

    rightlink = document.createElement('div');
    rightlink.id = `gallery-showcase-${showcase_id}-overlay-right-link`;
    rightlink.classList.add('gallery-showcase-overlay-link');

    rightp = document.createElement('p');
    rightlink.append(rightp);

    leftlink.addEventListener('mouseover', (event) => {
        leftlink.style.cursor = 'pointer';
        leftlink.style.opacity = '70%';
        leftlink.style.background = '#eaeaea';
        leftp.textContent = '<<';
    });

    leftlink.addEventListener('mouseout', (event) => {
        leftlink.style.cursor = null;
        leftlink.style.opacity = null;
        leftlink.style.background = null;
        leftp.textContent = null;
    });

    leftlink.addEventListener('mouseup', (event) => {
        if (image_id == 0) {
            showcase_change(showcase_id, image_data[showcase_id].length - 1);
        } else {
            showcase_change(showcase_id, image_id - 1);
        }
        return false;
    }, once = true);

    spacer.addEventListener('mouseover', (event) => {
        spacer.style.cursor = 'zoom-in';
    });
    spacer.addEventListener('mouseout', (event) => {
        spacer.style.cursor = null;
    });
    spacer.addEventListener('mouseup', (event) => {
        zoom(`gallery-showcase-${showcase_id}-current-image`);
    });

    rightlink.addEventListener('mouseover', (event) => {
        rightlink.style.cursor = 'pointer';
        rightlink.style.opacity = '70%';
        rightlink.style.background = '#eaeaea';
        rightp.textContent = '>>';
    });

    rightlink.addEventListener('mouseout', (event) => {
        rightlink.style.cursor = null;
        rightlink.style.opacity = null;
        rightlink.style.background = null;
        rightp.textContent = null;
    });

    rightlink.addEventListener('mouseup', (event) => {
        if (image_id == image_data[showcase_id].length - 1) {
            showcase_change(showcase_id, 0);
        } else {
            showcase_change(showcase_id, image_id + 1);
        }
        return false;
    }, once = true);

    overlay.append(leftlink);
    overlay.append(spacer);
    overlay.append(rightlink);
}

function init_galleries() {
    let i = 0;

    // Handle single images from the render-image hook first.
    let images = document.getElementsByClassName('gallery-image');
    for (image of images) {
        let img = image.querySelector('img');
        let id = img.id.split('-')[2];

        let closure = function() {
            return function() {
                zoom(`gallery-image-${id}`);
            }
        }();

        img.addEventListener('click', closure);
    }

    while (true) {
        i++;

        let obj = document.getElementById(`gallery-${i}`);

        if (obj == null) {
            break;
        }

        if (obj.classList.contains('gallery-grid-div')) {
            let images = obj.getElementsByClassName('gallery-grid-image');
            if (images == null) {
                console.log(`gallery error: grid gallery ${i} contains no images`);
                continue;
            }

            for (image of images) {
                let id = image.id.split('-')[2];

                let closure = function(id) {
                    return function() {
                        zoom(`gallery-image-${id}`);
                    }
                }(id);

                image.addEventListener('click', closure);
            }
        } else if (obj.classList.contains('gallery-showcase-div')) {
            let id = obj.getAttribute('data-galleryid');
            let images = obj.getAttribute('data-imagelist');

            let json = JSON.parse(images);
            showcase_load(id, json['images']);
        } else if (obj.classList.contains('gallery')) {
            let primary = obj.getElementsByClassName('gallery-image-primary')[0];
            if (primary == null) {
                console.log(`gallery error: no primary image found for gallery ${i}`);
                break;
            }

            let primary_id = primary.id.split('-')[2];

            let closure = function(id) {
                return function() {
                    zoom(`gallery-image-${id}`);
                }
            }(primary_id);

            replace_listeners.set(primary, closure);
            primary.addEventListener('click', replace_listeners.get(primary));

            let thumbnails = obj.getElementsByClassName('gallery-image-thumbnail');
            for (thumbnail of thumbnails) {
                let thumbnail_id = thumbnail.id.split('-')[2];

                let closure = function(i, thumbnail_id) {
                    return function() {
                        replace(i, thumbnail_id);
                    }
                }(i, thumbnail_id);

                replace_listeners.set(thumbnail, closure);
                thumbnail.addEventListener('click', replace_listeners.get(thumbnail));
            }
        } else {
            console.log(`gallery error: unknown gallery type for ${i}`);
            continue;
        }
    }
}

(function() {
    window.addEventListener('load', init_galleries);
}());
