// JS to set banners content to dynamic content loaded from DoubleClick

// create var to provide easy access to dynamic data
var _dynamicData = {};

//console.log("Hoxton ready!");
hoxton.timeline = Creative.tl;

// Define the function that should fire when the Ad Server is ready and assets are preloaded
hoxton.isInitialized = setDynamicContent;


/*
* Function sets any dynamic content
*/
function setDynamicContent()
{
    //console.log("setDynamicContent()");

    // for shorthand references to state object
    _dynamicData = hoxton.getState();


    // set any dynamic data that Hoxton can not update by targeting a DOM element                   
    setDynamicNonDomData();



        // we set banner containers to display:block here so we can take size measurements,
        // ensure opacity:0 is set, then opacity:1 at start of main TL
        Creative.displayBanner();

        var _adWidth = container.offsetWidth;
        var _adHeight = container.offsetHeight;

        // add size class to container so we can do size specific animations on the TL:
        container.className = "size"+_adWidth+"x"+_adHeight;
    

    Creative.startAd();
}



/*
* Set any dynamic data that Hoxton can not update by targeting a DOM element
*/                               
function setDynamicNonDomData()
{
    // set frame timimgs
    setFrameTimes();

    // set general banner fade in and out speeds
    _fadeInSpeed = Number(_dynamicData.fadeInSpeed);
    _fadeOutSpeed = Number(_dynamicData.fadeOutSpeed);


    // show/hide elements dependent on whether content is set:
        const elements = [
            { id: "#copy_frame01a", value: _dynamicData.copy_frame01a },
            { id: "#copy_frame01b", value: _dynamicData.copy_frame01b },
            { id: "#copy_frame02a", value: _dynamicData.copy_frame02a },
            { id: "#copy_frame02b", value: _dynamicData.copy_frame02b },
            { id: "#copy_frame03a", value: _dynamicData.copy_frame03a },
            { id: "#copy_frame03b", value: _dynamicData.copy_frame03b },
            { id: "#copy_frame04a", value: _dynamicData.copy_frame04a },
            { id: "#copy_frame04b", value: _dynamicData.copy_frame04b },
            { id: "#copy_frame05a", value: _dynamicData.copy_frame05a },
            { id: "#copy_frame05b", value: _dynamicData.copy_frame05b },
            { id: "#copy_cta", value: _dynamicData.copy_cta }
        ];

        elements.forEach(({ id, value }) => {
            gsap.set(id, { display: value.trim() ? "block" : "none" });
        });




    // set exit url
    Creative.setExitURL( _dynamicData.exit_url );

    // set looping props
    var arrLooping = _dynamicData.loopingProps.split(",");
    if(arrLooping.length === 3)
    {
        _totalLoops = Number(arrLooping[0].trim());
        _endFrameDelay = Number(arrLooping[1].trim());
        if(arrLooping[2].trim() === "true")
        {
            _useReplayBtn = true;
        }
        else
        {
            _useReplayBtn = false;
        }
    }

}



/*
* Function sets the frame times for the banner. Frames with a time of 0 will be skipped.
* Any frame with no content will have its time set to 0 despite the value for the frame in the frameTime array
*/
function setFrameTimes() {
    const numberOfFrameWaits = 4; // 5 frame banner, last frame has no value as it stays on screen:
    const defaultFrameTime = _arrFrameWaits[0];

    _arrFrameWaits = _dynamicData.frameTimes
        .split(",")
        .map(Number)
        .slice(0, numberOfFrameWaits)
        .concat(Array(numberOfFrameWaits).fill(defaultFrameTime))
        .slice(0, numberOfFrameWaits);

    // define the _isStatic var- if all frameTimes are zero: 
    _isStatic = (_arrFrameWaits[0] == 0 && _arrFrameWaits[1] == 0 && _arrFrameWaits[2] == 0 && _arrFrameWaits[3] == 0) ? true : false; 
}




/*
* function gets the contents of an numeric array
*/
function getNumArrayData(arrTarget, strSource)
{
    var arr = strSource.split(",");

    if(arr.length === arrTarget.length)
    {
        for(var i = 0 ; i < arr.length; i++)
        {
            arr[i] = Number(arr[i].trim());
        }

        arrTarget = arr;
    }

    return arrTarget;
}


/*
* function gets the contents of an boolean array
*/
function getBoolArrayData(arrTarget, strSource)
{
    var arr = strSource.split(",");

    if(arr.length === arrTarget.length)
    {
        for(var i = 0 ; i < arr.length; i++)
        {
            if(arr[i].trim() == "true")
            {
                arr[i] = true;
            }
            else
            {
                arr[i] = false;
            }
        }
        arrTarget = arr;
    }

    return arrTarget;
}

/*
* function checks if number
*/
function isNumeric(n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}


