/*
* For content in your creative that Hoxton can not update by targeting a DOM element
* use this function to manually refresh and have control over the display when working in Hoxton.
*/
Creative.updateContent = function (item) {
    
    console.log("Creative.updateContent");

    //hoxton.setState(item);
    _dynamicData = hoxton.getState();

    setDynamicNonDomData(); // update data


    var ifNeedsRebuilt = false; // if we need to rebuild the timeline

    switch(item.name)
    {
        case "fadeInSpeed":
        case "fadeOutSpeed":
        case "exit_url":
        case "frameTimes":
        case "loopingProps":
        case "copy_frame01a":
        case "copy_frame01b":
        case "copy_frame02a":
        case "copy_frame02b":
        case "copy_frame03a":
        case "copy_frame03b":
        case "copy_frame04a":
        case "copy_frame04b":
        case "copy_frame05a":
        case "copy_frame05b":
            ifNeedsRebuilt = true;
            break;


        default:
        ifNeedsRebuilt = false;
    }


   // If we need to renuild the timeline to refresh the updates in Hoxton
    if(ifNeedsRebuilt === true)
    {   
        setDynamicNonDomData(); // update data
        
        Creative.startAd(); // rebuild timeline
    }

}