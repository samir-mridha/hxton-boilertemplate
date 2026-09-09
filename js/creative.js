
//hoxton.timeline = Creative.tl;
gsap.defaults({overwrite: "auto", duration:0, ease:"none"});

// as we are using className to target elements in certain sizes in the TL, we want to suppress warnings:
gsap.config({nullTargetWarn:false});


// looping config vars
var _currentLoop    = 0;
var _totalLoops     = 0;
var _endFrameDelay  = 4;
var _useReplayBtn   = true;

// content
var container       = getById("container");
var loadingContent  = getById("loading_content");

// banner timings
var _arrFrameWaits  = [3,3,3,3]; // frame timings
var _fadeOutSpeed   = 0.3;
var _fadeInSpeed    = 1;
var _isStatic = false; // set automatically based on frameTimes and used in TL

// exit and replay
var btn_replay   = getById("btn_replay");
var exitBtn     = getById("exit_btn");

var _exitURL    = "https://www.hogarthww.com";


// frame
var _totalFrames    = 5;
var _currentFrame   = 0;
var _previousFrame  = 0;


// Create and provide timeline to Hoxton
var Creative = {

    tl: gsap.timeline( { defaults: { duration:0 , ease:"none" } } ),


    setExitURL: function( strURL )
    {
        _exitURL = strURL;
    },

    onExit: function( e ) 
    {
        hoxton.exit( "Exit" , _exitURL );
    },

    onReplay: function() 
    {
        _currentLoop++;
        Creative.tl.repeat(0);
        Creative.tl.seek("reset");
        Creative.tl.play();
    },

    onBannerStart: function() 
    {
        console.log("Creative.onBannerStart()");
    },

    onBannerRepeat: function() 
    {   
        _currentLoop++;
    },

    onBannerComplete: function() 
    {
        if( _currentLoop === _totalLoops && _useReplayBtn === true )
        {
            Creative.tl.to( btn_replay , {display:"block"} , "end" );
        }
    },

    jumpToEndFrame: function() 
    {
        Creative.tl.pause();
        Creative.tl.seek( "end", false);
        gsap.to(btn_replay,{display:"none"});
    },

    checkIsBackup: function() 
    {
        return ( window.location.href.indexOf( 'hoxtonBackup' ) >= 0 ) ? true : false;
    },

    startAd: function() 
    {  
        Creative.createButtons();

        let currTime = Creative.tl.time(); // GET PREVIOUS TIME IN TL BEFORE RECREATING TL

        Creative.tl.clear(); // clear timline        

        Creative.setUpTimeline();

        Creative.init();

        if ( currTime > Creative.tl.duration() ) currTime = Creative.tl.duration();

        Creative.checkIsBackup() ? Creative.jumpToEndFrame() : Creative.tl.seek( currTime , false ); 
    },

    createButtons: function()
    {
        exitBtn.addEventListener( "click" , Creative.onExit , false );
        btn_replay.addEventListener( "click" , Creative.onReplay , false );
    },

    setUpTimeline: function()
    {
        Creative.tl.repeat(_totalLoops);
        Creative.tl.repeatDelay(_endFrameDelay);
        Creative.tl.eventCallback("onStart", Creative.onBannerStart);
        Creative.tl.eventCallback("onRepeat", Creative.onBannerRepeat);
        Creative.tl.eventCallback("onComplete", Creative.onBannerComplete);
    },

    displayBanner: function()
    {
        gsap.to(container,{display:"block"});
    },

    init: function() {

        Creative.tl.addLabel("reset", 0)
            
            // reset frame content - rather than hiding individual elements, we hide all using one class:
            .to(".hidden", {alpha:0}, "reset")
            .to("#container", {alpha:1}, "reset")
            .to(btn_replay, {display:"none"}, "<")
            .to(".main-copy", {filter:"blur(10px)"}, "<")


        // examples of size specific JS on the TL without if statements:

            // we have set a size specific class on the container in setDynamicContent.js
            
            // set all main-copy startPoints to y:10% except on the 728x90 format:
            .to(".main-copy:not(.size728x90 .main-copy)", {x:0, y:"10%"}, "<")
            
            // set the main-copy startPoints on 728x90 only to x:-20%
            .to(".size728x90 .main-copy", {x:"-20%", y:0}, "<")


        .addLabel("frame01", ">")
            // show static elements:
            .to(["#logo_container","#cta_container"], {alpha:1}, "reset")

            // show frame content
            .to("#img_frame01", {alpha:1}, "frame01")

            // show frame content
            .to(".frame01-elements", {
                filter:"blur(0px)",
                alpha: _arrFrameWaits[0] == 0 ? 0 : 1 // (if this frame has a frameTime of non zero)
            }, "frame01")
            
            .to(".frame01-elements", {ease:"power1.out", x:0, y:0}, "<")

            // add currFrame1 to container - in case any frame specific css needs to be applied:
            .call(Creative.addFrameClass,["currFrame1"], "frame01")

            // fade out frame content, after specified frame time:
            .to(".frame01-elements", _fadeOutSpeed, {alpha:0}, "frame01+="+_arrFrameWaits[0])




        .addLabel("frame02", "frame01+="+_arrFrameWaits[0])
            .to("#img_frame02", _fadeInSpeed, {alpha:1}, "frame02")

            // add currFrame class to container - in case any frame specific css needs to be applied:
            .call(Creative.addFrameClass,["currFrame2"], "frame02")

            // show frame content 
            .to(".frame02-elements", _fadeInSpeed, {
                filter:"blur(0px)",
                alpha: _arrFrameWaits[1] == 0 ? 0 : 1 // (if this frame has a frameTime of non zero)
            }, "frame02+="+_fadeOutSpeed)

            .to(".frame02-elements", _fadeInSpeed, {ease:"power1.out", x:0, y:0}, "<")

            // fade out frame content, after specified frame time:
            .to(".frame02-elements", _fadeOutSpeed, {alpha:0}, "frame02+="+_arrFrameWaits[1])




        .addLabel("frame03", "frame02+="+_arrFrameWaits[1])
            .to("#img_frame03", _fadeInSpeed, {alpha:1}, "frame03")

            // add currFrame class to container - in case any frame specific css needs to be applied:
            .call(Creative.addFrameClass,["currFrame3"], "frame03")

            // show frame content
            .to(".frame03-elements", _fadeInSpeed, {
                filter:"blur(0px)",
                alpha: _arrFrameWaits[2] == 0 ? 0 : 1 // (if this frame has a frameTime of non zero)
            }, "frame03+="+_fadeOutSpeed)

            .to(".frame03-elements", _fadeInSpeed, {ease:"power1.out", x:0, y:0}, "<")

            // fade out frame content, after specified frame time:
            .to(".frame03-elements", _fadeOutSpeed, {alpha:0}, "frame03+="+_arrFrameWaits[2])




        .addLabel("frame04", "frame03+="+_arrFrameWaits[2])
            .to("#img_frame04", _fadeInSpeed, {alpha:1}, "frame04")

            // add currFrame class to container - in case any frame specific css needs to be applied:
            .call(Creative.addFrameClass,["currFrame4"], "frame04")

            // show frame content
            .to(".frame04-elements", _fadeInSpeed, {
                filter:"blur(0px)",
                alpha: _arrFrameWaits[3] == 0 ? 0 : 1 // (if this frame has a frameTime of non zero)
            }, "frame04+="+_fadeOutSpeed)
            
            .to(".frame04-elements", _fadeInSpeed, {ease:"power1.out", x:0, y:0}, "<")

            // fade out frame content, after specified frame time:
            .to(".frame04-elements", _fadeOutSpeed, {alpha:0}, "frame04+="+_arrFrameWaits[3])




        .addLabel("frame05", "frame04+="+_arrFrameWaits[0])
            .to("#img_frame05", _fadeInSpeed, {alpha:1}, "frame05")

            // add currFrame class to container - in case any frame specific css needs to be applied:
            .call(Creative.addFrameClass,["currFrame5"], "frame05")

            // show frame content
            .to(".frame05-elements", _isStatic ? 0 : _fadeInSpeed, {filter:"blur(0px)", alpha:1}, "frame05+="+(_isStatic ? 0 : _fadeOutSpeed))
            .to(".frame05-elements", _isStatic ? 0 : _fadeInSpeed, {ease:"power1.out", x:0, y:0}, "<")

            
        .addLabel("end", ">")
            .to(container, {alpha:1}, "end")

    },


    addFrameClass: function(currentFrameClass){
        var adWidth = container.offsetWidth;
        var adHeight = container.offsetHeight;
        container.className="size"+adWidth+"x"+adHeight;


        // remove instances where default class is being applied:
        container.classList.remove("default");


        // add currentFrameClass - used for css override styling if certain elements must react on certain frames
        if(currentFrameClass != undefined) {
            container.classList.add(currentFrameClass);
        }
    },

};


function getById( eleID ) 
{
    return document.getElementById(eleID);
}
