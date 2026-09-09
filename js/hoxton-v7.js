/* 16 March 2026 */
var Creative = {};

var setCSS = function (hox) {
    // Create CSS block if it doesn't exist
    var head = document.head;
    var cssBlock = document.getElementById("hox-css");
    if (!cssBlock) {
        cssBlock = document.createElement("style");
        cssBlock.type = 'text/css';
        cssBlock.id = 'hox-css';
        head.appendChild(cssBlock);
    }

    // Generate entire CSS string
    var css = "";
    for (var key in hox.data) {
        if (hox.data[key].type === "css") {
            css += hox.data[key].value;
        }
    }

    // Overwrite innerHTML of CSS block
    cssBlock.innerHTML = css;
};

var hoxton = {
    data: {},
    metadata: {},
    dom: {},
    animation: {},
    styles: {},
    timeline: Creative.tl,
    ready: null,
    init: function () {

        if (typeof (Event) === 'function') {
            hoxton.ready = new Event('hoxton-ready');
        } else {
            hoxton.ready = document.createEvent('Event');
            hoxton.ready.initEvent('hoxton-ready', true, true);
        }

        // Loading sequence:
        // hoxton.init
        // hoxton.setupSV if dynamic doubleclick
        // hoxton.preload
        // hoxton.bind (which fires 'hoxton-ready' event)

        hoxton.data = hoxton._getManifest('hoxton');
        hoxton.font = hoxton._getManifest('hoxton-font');
        hoxton.animation = hoxton._getManifest('hoxton-animation');

        if (hoxton.data.metadata) {
            hoxton.metadata = hoxton.data.metadata;
        }

        switch (hoxton.data.platform) {
            case 'doubleclick_sv':
            case 'doubleclick': {
                Enabler.isInitialized()
                    ? hoxton.setupSV()
                    : Enabler.addEventListener(studio.events.StudioEvent.INIT, function () {
                        Enabler.isPageLoaded()
                            ? hoxton.setupSV()
                            : Enabler.addEventListener(studio.events.StudioEvent.PAGE_LOADED, hoxton.setupSV);
                    });
                break;
            }
            default: {
                hoxton.preload();
            }
        }

        if (hoxton.animation) {
            hoxton._generateTimeline();
        }
    },

    setupSV: function () {
        switch (hoxton.data.platform) {
            case 'doubleclick_sv':
            case 'doubleclick': {
                // DEVELOPMENT: Set devDynamicContent to read from Hoxton manifest
                var devDynamicContent = {};
                devDynamicContent['hoxton'] = [{}];

                for (var key in hoxton.data) {
                    switch (hoxton.data[key].type) {
                        case 'image': {
                            devDynamicContent['hoxton'][0][key] = {};
                            devDynamicContent['hoxton'][0][key].Type = 'file';
                            devDynamicContent['hoxton'][0][key].Url = hoxton.data[key].value;
                            break;
                        }
                        case 'text': {
                            if (key.toLowerCase() === 'exiturl') {
                                devDynamicContent['hoxton'][0][key] = {};
                                devDynamicContent['hoxton'][0][key].Url = hoxton.data[key].value;
                            } else {
                                devDynamicContent['hoxton'][0][key] = hoxton.data[key].value;
                            }
                            break;
                        }
                    }
                }

                Enabler.setDevDynamicContent(devDynamicContent);
                var dynamicData = dynamicContent['hoxton'][0];

                // PRODUCTION: Set Hoxton manifest to read from DC dynamicContent variable
                for (var key in dynamicData) {
                    if (hoxton.data[key] && (hoxton.data[key].value || hoxton.data[key].value === "")) {
                        hoxton.data[key].value = dynamicData[key].Url ? dynamicData[key].Url : dynamicData[key];
                    } else {
                        hoxton.metadata[key] = dynamicData[key].Url ? dynamicData[key].Url : dynamicData[key];
                    }
                }

                // PRODUCTION: Assign content from "hoxtonSettings" column in feed
                if (dynamicData.hoxtonSettings) {
                    hoxton.styles = dynamicData.hoxtonSettings;
                }

                hoxton.preload();
                break;
            }
        }
    },

    preload: function () {
        var preloadImages = [];
        for (var key in hoxton.data) {
            if (hoxton.data[key].type === 'image') {
                preloadImages.push(hoxton.data[key].value);
            }
        }

        var newImages = [], l = preloadImages.length;

        for (var i = 0; i < preloadImages.length; i++) {
            newImages[i] = new Image();
            newImages[i].src = preloadImages[i];
            newImages[i].onerror = function () { l--; };
            newImages[i].onload = function () {
                if (!--l) {
                    hoxton.bind();
                }
            };
        }

        if (!l) hoxton.bind();
    },

    bind: function () {
        for (var key in hoxton.data) {
            switch (hoxton.data[key].type) {
                case 'image': {
                    hoxton.setImage(key, hoxton.data[key]);
                    hoxton.applyStyle(key, hoxton.data[key]);
                    break;
                }
                case 'video': {
                    hoxton.setVideo(key, hoxton.data[key]);
                    hoxton.applyStyle(key, hoxton.data[key]);
                    break;
                }
                case 'text': {
                    hoxton.setText(key, hoxton.data[key]);
                    hoxton.applyStyle(key, hoxton.data[key]);
                    break;
                }
                case 'textarea': {
                    hoxton.setText(key, hoxton.data[key]);
                    hoxton.applyStyle(key, hoxton.data[key]);
                    break;
                }
                case 'array': {
                    if (Array.isArray(hoxton.data[key].value)) {
                        hoxton.data[key].value.forEach(item => {
                            if (item.selected) hoxton.data[key].selected = item.label;
                        });
                    } else {
                        hoxton.data[key].selected = hoxton.data[key].value;
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }

        setCSS(hoxton);
        document.body.style = 'display: block';
        hoxton.isInitialized();
    },

    setState: function (editable) {
        if (editable.type === "metadata") {
            hoxton.metadata[editable.name] = editable.value;
            hoxton.data.metadata[editable.name] = editable.value;
            return;
        }

        hoxton.data[editable.name] = editable;

        if (Array.isArray(editable.value)) {
            editable.value.forEach(function (item) {
                if (item.selected) {
                    hoxton.data[editable.name].selected = item.label;
                }
            });
        }

        setCSS(hoxton);
    },

    getState: function (obj) {
        if (Object.keys(hoxton.data).length === 0) {
            console.warn("hoxton.js: getState called before DOM ready");
            return {};
        }
        var state = obj || {};

        Object.keys(hoxton.data).forEach(function (key) {
            if (obj && obj[key]) {
                console.warn(
                    'hoxton.js: "${key}" already exists on supplied getState object, and has been overwritten'
                );
            }

            state[key] =
                hoxton.data[key].selected ||
                hoxton.data[key].value ||
                hoxton.data[key];

            if (hoxton.data[key].value === "") {
                state[key] = "";
            }
        });

        return state;
    },

    exit: function (eventName, exitURL) {
        if (!eventName) {
            eventName = 'Exit';
            console.warn('No event name provided to hoxton.exit. Setting to "Exit".');
        }

        switch (hoxton.data.platform) {
            case 'doubleclick_sv':
            case 'doubleclick': {
                if (!exitURL) {
                    Enabler.exit(eventName);
                } else {
                    Enabler.exitOverride(eventName, exitURL);
                }
                break;
            }
            case 'opendc':
                window.open(window.clickThrough);
                break;

            case 'generic': {
                window.open(exitURL || window.clickTag);
            }
        }
    },

    /* -------------------------
       DOM-CACHING VERSIONS
       ------------------------- */

    setImage: function (name, item) {
        var node = hoxton.dom[name] || document.getElementById(name);
        if (node) {
            hoxton.dom[name] = node;

            switch (node.tagName) {
                case 'DIV':
                    node.style.background = 'url(' + item.value + ')';
                    break;

                case 'IMG':
                    node.src = item.value;
                    break;
            }
        }
    },

    setVideo: function (name, item) {
        var node = hoxton.dom[name] || document.getElementById(name);
        if (node) {
            hoxton.dom[name] = node;
        }
    },

    setText: function (name, item) {
        var node = hoxton.dom[name] || document.getElementById(name);
        if (node) {
            hoxton.dom[name] = node;
            node.innerHTML = item.value;
        }

        if (hoxton.font && node) {
            var parent = node.parentElement;
            var element = parent.firstChild;
            var hoxName = parent.getAttribute("hox-name");
            var rule = this.selectFontRule(hoxName, item);

            parent.style.width = rule.width + 'px';
            parent.style.height = rule.height + 'px';
            parent.style.display = 'flex';
            element.style.flex = '1';
            parent.style.top = rule.top + 'px';
            parent.style.left = rule.left + 'px';
            element.style.textAlign = rule.alignment;
            element.style.alignSelf = rule.verticalAlignment;
            element.style.fontFamily =
                rule.text.font.name + ', Arial, Verdana, san-serif';
            element.style.fontSize = rule.fontSize * rule.text.transform.xx + 'px';
            element.style.letterSpacing =
                rule.letterSpacing === 0 ? 'inherit' : rule.letterSpacing + 'px';
            element.style.lineHeight =
                rule.lineHeight === 0 ? 1 : rule.lineHeight + 'px';
        }
    },

    applyStyle: function (name, item) {
        //if (!hoxton.dom[name] || !hoxton.styles[name]) {
        if (!hoxton.dom[name]) {
            return;
        }

        // Copy styles so we can mutate safely
        const styles = { ...hoxton.styles[name] };

        /* -----------------------------------------
        SCALE HANDLING (GSAP SAFE)
        ----------------------------------------- */

        if (styles.scale !== undefined) {
            const scaleFactor = Number(styles.scale) / 100; // Convert integer percent scale → CSS scale factor
            
            // Read transform from style or computed (GSAP commonly sets matrix())
            let existingTransform =
            node.style.transform ||
            window.getComputedStyle(node).transform ||
            "";

            // If transform is 'none', treat it as empty
            if (existingTransform === "none") {
                existingTransform = "";
            }

            // Remove any existing scale(...) before injecting new one
            existingTransform = existingTransform.replace(/scale\([^)]+\)/, "").trim();

            // Inject updated scale
            styles.transform = `${existingTransform} scale(${scaleFactor})`.trim();

            delete styles.scale; // remove invalid CSS property
        }

        Object.assign(hoxton.dom[name].style, styles);
    },

    selectFontRule: function (text, item) {
        var charLength = item.value.length;
        var selectedRule = hoxton.font[text].filter(function (rule) {
            return rule.maxChar >= charLength && rule.minChar <= charLength;
        });
        return (selectedRule && selectedRule[0]) || hoxton.font[text][0];
    },

    _getManifest: function (type) {
        if (!document.getElementsByTagName(type)[0]) {
            return;
        }

        var stringData = document.getElementsByTagName(type)[0].getAttribute("data");
        try {
            stringData = decodeURIComponent(unescape(stringData));
        } catch (err) { }

        return JSON.parse(stringData);
    },

    _generateTimeline: function () {
        for (var name in hoxton.animation) {
            var layers = [];
            for (var layer in hoxton.animation[name].layers) {
                layers.push("[hox-name='" + layer + "']");
            }

            var item = hoxton.animation[name];
            if (item) {
                hoxton.timeline.add(
                    TweenMax.fromTo(
                        layers,
                        item.settings.range[1] - item.settings.range[0],
                        {
                            x: item.animation.from.settings.x,
                            y: item.animation.from.settings.y,
                            alpha: item.animation.from.settings.alpha,
                            scale: item.animation.from.settings.scale
                        },
                        {
                            x: item.animation.to.settings.x,
                            y: item.animation.to.settings.y,
                            alpha: item.animation.to.settings.alpha,
                            scale: item.animation.to.settings.scale
                        }
                    ),
                    item.settings.range[0]
                );
            }
        }
    }
};

window.addEventListener("load", hoxton.init);
