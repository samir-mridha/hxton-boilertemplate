/* 23 Feb 2024 */
var Creative = {};


var setCSS = function (hox) {
    // Create CSS block if it doesn't exist
    var head = document.head;
    var cssBlock = document.getElementById("hox-css");
    if (!cssBlock)
    {
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
    };

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

        // Loading sequence is:a
        // hoxton.init
        // hoxton.setupSV if dynamic doubleclick
        // hoxton.preload
        // hoxton.bind (which fires 'hoxton-ready' event)

        hoxton.data = hoxton._getManifest('hoxton');
        hoxton.font = hoxton._getManifest('hoxton-font');
        hoxton.animation = hoxton._getManifest('hoxton-animation');

        if (hoxton.data.metadata) {
            hoxton.metadata = hoxton.data.metadata
        }

        switch (hoxton.data.platform) {
            case 'sizmek': {
                EB.isInitialized() ? hoxton.preload() : EB.addEventListener(EBG.EventName.EB_INITIALIZED, hoxton.preload());
                break;
            };

            case 'sizmek_sv': {
                //console.log("sizmek_sv case fired");

                //function checkIfAdKitReady(event) {
                function checkIfAdKitReady() {
                    //console.log("checkIfAdKitReady function fired");
                    adkit.onReady(startAd);
                }
                function startAd() {
                    //console.log("startAd function fired");
                    // This function is executed once the adkit library is available.

                    hoxton.setupSV();
                }
                checkIfAdKitReady();
                //window.addEventListener("load", checkIfAdKitReady);

                break;
            };


            case 'doubleclick_sv':
            case 'doubleclick': {
                Enabler.isInitialized() ? hoxton.setupSV() : Enabler.addEventListener(studio.events.StudioEvent.INIT, function () {
                    Enabler.isPageLoaded() ? hoxton.setupSV() : Enabler.addEventListener(studio.events.StudioEvent.PAGE_LOADED, hoxton.setupSV);
                });
                break;
            };
            default: {
                hoxton.preload()
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
                var devDynamicContent = {}
                devDynamicContent['hoxton'] = [{}];
                for (var key in hoxton.data) {
                    switch (hoxton.data[key].type) {
                        case 'image' || 'backgroundImage': {
                            devDynamicContent['hoxton'][0][key] = {};
                            devDynamicContent['hoxton'][0][key].Type = 'file';
                            devDynamicContent['hoxton'][0][key].Url = hoxton.data[key].value;
                            break;
                        };
                        case 'text': {
                            if (key.toLowerCase() === 'exiturl') {
                                devDynamicContent['hoxton'][0][key] = {};
                                devDynamicContent['hoxton'][0][key].Url = hoxton.data[key].value;
                            }
                            else {
                                devDynamicContent['hoxton'][0][key] = hoxton.data[key].value;
                            }
                            break;
                        }
                    }
                }

                Enabler.setDevDynamicContent(devDynamicContent);
                dynamicData = dynamicContent['hoxton'][0];

                // PRODUCTION: Set Hoxton manifest to read from DC dynamicContent variable
                for (var key in dynamicData) {
                    if (hoxton.data[key] && hoxton.data[key].value || hoxton.data[key] && hoxton.data[key].value === "") {
                        hoxton.data[key].value = dynamicData[key].Url ? dynamicData[key].Url : dynamicData[key];
                    }
                    else {
                        hoxton.metadata[key] = dynamicData[key].Url ? dynamicData[key].Url : dynamicData[key];
                    }
                }

                // PRODUCTION: Assign content from "hoxtonSettings" column in feed
                if (dynamicData.hoxtonSettings) {
                    hoxton.styles = dynamicData.hoxtonSettings
                }

                // Now populate DOM as normal using Hoxton object
                hoxton.preload();
                break;

            }

            case 'sizmek_sv': {
                for (var key in hoxton.data) {
                    
                    hoxton.data[key].value = adkit.getSVData(key);
                }

                // Now populate DOM as normal using Hoxton object
                hoxton.preload();

                break;
            }

        }
    },
    preload: function () {
        var preloadImages = [];
        for (var key in hoxton.data) {
            if (hoxton.data[key].type === 'image' || hoxton.data[key].type === 'backgroundImage') {
                preloadImages.push(hoxton.data[key].value)
            }
        }
        var newImages = [], l = preloadImages.length;
        for (var i = 0; i < preloadImages.length; i++) {
            newImages[i] = new Image();
            newImages[i].src = preloadImages[i];
            newImages[i].onerror = function () { l-- }
            newImages[i].onload = function () {
                if (!--l) {
                    hoxton.bind(); // <- callback
                }
            }
        } if (!l) hoxton.bind(); // <- callback if array empty
    },
    bind: function () {
        for (var key in hoxton.data) {
            switch (hoxton.data[key].type) {
                case 'image': {
                    hoxton.setImage(key, hoxton.data[key])
                    hoxton.applyStyle(key, hoxton.data[key])
                    break;
                };
                case 'backgroundImage': {
                    hoxton.setBackgroundImage(key, hoxton.data[key])
                    hoxton.applyStyle(key, hoxton.data[key])
                    break;
                };
                case 'video': {
                    hoxton.setVideo(key, hoxton.data[key])
                    hoxton.applyStyle(key, hoxton.data[key])
                    break;
                };
                case 'text': {
                    hoxton.setText(key, hoxton.data[key])
                    hoxton.applyStyle(key, hoxton.data[key])
                    break;
                };
                case 'array': {
                    if (Array.isArray(hoxton.data[key].value)) {
                        hoxton.data[key].value.map(function (item) {
                            if (item.selected) {
                                hoxton.data[key].selected = item.label
                            }
                        })
                    }
                    else {
                        // XML feed resolves selected array into String
                        hoxton.data[key].selected = hoxton.data[key].value
                    }
                    break;
                };
                default: {
                    //console.log('Hoxton.js: No match found', hoxton.data[key].type, key)
                    break;
                }
            }
        }
        // Create CSS block
        setCSS(hoxton);
        //Initialise
        document.body.style = 'display: block'
        hoxton.isInitialized();
        //document.body.dispatchEvent(hoxton.ready)
    },
    setState: function (editable) {
        // If the editable type is metadata then we need to set it differently
        if (editable.type === "metadata") {
            // Update Hoxton metadata
            hoxton.metadata[editable.name] = editable.value;
            hoxton.data.metadata[editable.name] = editable.value;
            return;
        }

        // Update Hoxton object
        hoxton.data[editable.name] = editable;

        // Set .selected for Array type
        if (Array.isArray(editable.value)) {
            editable.value.forEach(function(item){
                if (item.selected) {
                    hoxton.data[editable.name].selected = item.label;
                }
            });
        }


        // Update CSS
        setCSS(hoxton);
    },
    getState: function (obj) {
        if (Object.keys(hoxton.data).length === 0) {
            console.warn("hoxton.js: getState called before DOM ready");
            return {};
        }
        // Add to object if it is passed through, otherwise return a new object
        var state = obj || {};

        Object.keys(hoxton.data).forEach(function(key){
            if (obj && obj[key]) {
                console.warn(
                    'hoxton.js: "${key}" already exists on supplied getState object, and has been overwritten'
                );
            }



            state[key] =
                hoxton.data[key].selected ||
                hoxton.data[key].value ||
                hoxton.data[key];

            // Empty strings are not being added by the above
            if (hoxton.data[key].value === "") {
                state[key] = "";
            }
        });
        return state;
    },
    exit: function (eventName, exitURL) {

        if (!eventName) {
            eventName = 'Exit';
            console.warn('No event name provided to hoxton.exit. Setting to "Exit".')
        }

        switch (hoxton.data.platform) {
            case 'sizmek': {
                EB.clickthrough();
                break;
            };
            case 'sizmek_sv': {
                adkit.clickThrough();
                break;
            };
            case 'doubleclick_sv':
            case 'doubleclick': {
                if (!exitURL) {
                    Enabler.exit(eventName)
                } else {
                    Enabler.exitOverride(eventName, exitURL);
                }
                break;
            };
            case 'generic': {
                window.open(exitURL || window.clickTag);
            }
        }
    },
    setImage: function (name, item) {
        var node = document.querySelector('#' + name);
        if (node) {
            hoxton.dom[name] = node;

            switch (node.tagName) {
                case 'DIV': {
                    node.style.background = 'url(' + item.value + ')';
                };
                case 'IMG': {
                    node.src = item.value;
                };
            }
        }
    },
    setBackgroundImage: function (name, item) {
        var node = document.querySelector('#' + name);
        if (node) {
            hoxton.dom[name] = node;
            node.style.background = 'url(' + item.value + ')'
        }
    },
    setVideo: function (name, item) {
        var node = document.querySelector('#' + name);
        if (node) {
            hoxton.dom[name] = node;
            // console.log('Video not complete', node.nodeType)
        }
    },
    setText: function (name, item) {
        var node = document.querySelector('#' + name);
        if (node) {
            hoxton.dom[name] = node;
            node.innerHTML = item.value;
        }

        // Adjust font size
        if (hoxton.font) {
            var parent = node.parentElement
            var element = parent.firstChild
            var hoxName = parent.getAttribute("hox-name")
            var rule = this.selectFontRule(hoxName, item)

            parent.style.width = rule.width + 'px'
            parent.style.height = rule.height + 'px'
            parent.style.display = 'flex'
            element.style.flex = '1'
            parent.style.top = rule.top + 'px'
            parent.style.left = rule.left + 'px'
            element.style.textAlign = rule.alignment
            element.style.alignSelf = rule.verticalAlignment
            element.style.fontFamily =
                rule.text.font.name + ', Arial, Verdana, san-serif'
            element.style.fontSize = rule.fontSize * rule.text.transform.xx + 'px'
            element.style.letterSpacing =
                rule.letterSpacing === 0 ? 'inherit' : rule.letterSpacing + 'px',
                element.style.lineHeight = rule.lineHeight === 0 ? 1 : rule.lineHeight + 'px'
        }
    },
    applyStyle: function (name, item) {
        if (!hoxton.dom[name] && !hoxton.styles[name]) {
            return
        }

        hoxton.dom[name].style = hoxton.styles[name]
    },
    selectFontRule: function (text, item) {
        // console.log(text, item, 'setrule')
        var charLength = item.value.length
        var selectedRule = hoxton.font[text].filter(function (rule, index) {
            return rule.maxChar >= charLength && rule.minChar <= charLength
        })
        var response =
            (selectedRule && selectedRule[0]) || hoxton.font[text][0]

        return response
    },
    _getManifest: function (type) {
        if (!document.getElementsByTagName(type)[0]) { return; }

        var stringData = document.getElementsByTagName(type)[0].getAttribute("data");
        try {
            stringData = decodeURIComponent(unescape(stringData));
        } catch (err) { }

        return JSON.parse(stringData);
    },
    _generateTimeline: function () {
        for (var name in hoxton.animation) {
            var layers = []
            for (var layer in hoxton.animation[name].layers) {
                layers.push("[hox-name='" + layer + "']")
            }

            var item = hoxton.animation[name]
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
                )
            }
        }
    }
};

window.onload = hoxton.init;