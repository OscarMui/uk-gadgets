import React, {useEffect, useState} from "react";
import { /*toPng,*/ toJpeg/*, toBlob, toPixelData, toSvg*/ } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown, faArrowAltCircleUp, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Tool from './Tool';


function TimeTool(props) {
    const [isResult,setIsResult] = useState(false);
    const [resultType,setResultType] = useState("");
    // const [isResultError,setIsResultError] = useState(false);
    const [isFetchError,setIsFetchError] = useState(false);
    const [useEffectKey,setUseEffectKey] = useState(0);

    const [isFullDate,setIsFullDate] = useState(false);
    const [is12Hours,setIs12Hours] = useState(false);
    const [isDst,setIsDst] = useState(false);

    const [ukYear,setUkYear] = useState("");
    const [ukMonth,setUkMonth] = useState("");
    const [ukDay,setUkDay] = useState("");
    const [ukHour,setukHour] = useState("");
    const [ukMinute,setukMinute] = useState("");

    const [hkYear,setHkYear] = useState("");
    const [hkMonth,setHkMonth] = useState("");
    const [hkDay,setHkDay] = useState("");
    const [hkHour,sethkHour] = useState("");
    const [hkMinute,sethkMinute] = useState("");

    const [exchangeRateFetched,setExchangeRateFetched] = useState("");
    const [exchangeRateDisplayed,setExchangeRateDisplayed] = useState("");
    const [gbpPounds,setGbpPounds] = useState("");

    useEffect(()=>{
        fetch("https://currentmillis.com/time/minutes-since-unix-epoch.php").then((res)=>{ //returns minutes since 1/1/1970
            return res.text();
        }).then((docs)=>{
            console.log(docs*60*1000);
            let utcTimeNum = docs*60*1000;

            let isDst = checkIsDst(utcTimeNum);
            setIsDst(checkIsDst(utcTimeNum));

            let ukTimeNum = utcTimeNum + (isDst ? 1*3600*1000: 0);
            let hkTimeNum = utcTimeNum + 8*3600*1000;
            let ukTime = new Date(ukTimeNum); 
            let hkTime = new Date(hkTimeNum);

            setUkYear(ukTime.getUTCFullYear());
            setUkMonth(ukTime.getUTCMonth()+1);
            setUkDay(ukTime.getUTCDate());
            setukHour(ukTime.getUTCHours());
            setukMinute(ukTime.getUTCMinutes());

            setHkYear(hkTime.getUTCFullYear());
            setHkMonth(hkTime.getUTCMonth()+1);
            setHkDay(hkTime.getUTCDate());
            sethkHour(hkTime.getUTCHours());
            sethkMinute(hkTime.getUTCMinutes());

            setIsFetchError(false);
        }).catch((err)=>{
            console.log(err);
            setIsFetchError(true);
        });
    },[useEffectKey]);

    const checkIsDst = (utcTimeNum) =>{
        let utcTime = new Date(utcTimeNum);
        let utcMonth = utcTime.getUTCMonth()+1;
        if(utcMonth>=11||utcMonth<=2){
            return false;
        }else if(utcMonth>=3&&utcMonth<=9){
            return true;
        }else if(utcMonth==10){ //clock switches back on last Sunday of October, at 2am 
            let utcDay = utcTime.getUTCDate();
            let oct31 = new Date(utcTime.getUTCFullYear()+"-10-31T00:00:00.000+00:00");
            let determinant = (31-utcDay)-oct31.getUTCDay(); //getDay => weekday, 0 Sun, 6 Sat
            if(determinant>0){ //if days until last day > last sunday from last day
                return true;
            }else if(determinant<0){
                return false;
            }else{ //the exact date
                let utcHour = utcTime.getUTCHours();
                return utcHour < 1 ? true : false;
            }
            //worst case 31 is Sat, so 25 is the earliest last Sunday
        }else if(utcMonth==3){ //clock goes forward on last Sunday of March, at 1am 
            let utcDay = utcTime.getUTCDate();
            let march31 = new Date(utcTime.getUTCFullYear()+"-10-31T00:00:00.000+00:00");
            let determinant = (31-utcDay)-march31.getUTCDay(); //getDay => weekday, 0 Sun, 6 Sat
            if(determinant>0){ //if days until last day > last sunday from last day
                return false;
            }else if(determinant<0){
                return true;
            }else{ //the exact date
                let utcHour = utcTime.getUTCHours();
                return utcHour < 1 ? false : true;
            }
            //worst case 31 is Sat, so 25 is the earliest last Sunday
        }else{ //error
            return false;
        }

    }
    const uktToHkt = () => {
        
    }

    const hktToUkt = () => {

    }

    const resetButton = () => {
        // setHkdDollars("");
        // setGbpPounds("");
    }

    const screenshotButton = () => {
        // toJpeg(document.getElementById('currencyToolScreenshot'), { quality: 0.95 })
        // .then(function (dataUrl) {
        //     var link = document.createElement('a');
        //     link.download = 'currency.jpeg';
        //     link.href = dataUrl;
        //     link.click();
        //     toast.success("Successfully took screenshot", {
        //         id: "successScreenshot",
        //     });
        // })
        // .catch((err)=>{
        //     toast.error("Error taking screenshot", {
        //         id: "errorScreenshot",
        //     });
        // });
    }

    const clipboardButton =  () => {
        // let text = "";
        // if(resultType=="hkdToGbp"){
        //     text = "HK$"+hkdDollars+" -> £"+gbpPounds;
        // }else if(resultType=="gbpToHkd"){
        //     text = "£"+gbpPounds+" -> HK$"+hkdDollars;
        // }
        // text += "\n(£1 = HK$"+exchangeRateDisplayed;
        // if(isCustom) text += "(custom)";
        // text+=")"
        // navigator.clipboard.writeText(text);
        // toast.success("Successfully copied to clipboard", {
        //     id: "successClipboard",
        // });
    }

    const TimeToolInput = () => {return(
        <form>
            {/* First line */}
            <div className="text-center">
                {isFullDate &&
                <>
                    <input 
                        id="ukYear"
                        className="timeInput"
                        type="number"
                        placeholder="YYYY"
                        min={1970}
                        value={ukYear}
                        onChange={(e)=>{setUkYear(e.target.value)}}
                    />
                    <label htmlFor="ukMonth">/</label>
                    <input 
                        id="ukMonth"
                        className="timeInput"
                        type="number"
                        placeholder="MM"
                        min={1}
                        max={12}
                        value={ukMonth}
                        onChange={(e)=>{setUkMonth(e.target.value)}}
                    />
                    <label htmlFor="ukDay">/</label>
                    <input 
                        id="ukDay"
                        className="timeInput"
                        type="number"
                        placeholder="DD"
                        min={1}
                        max={31}
                        value={ukDay}
                        onChange={(e)=>{setUkDay(e.target.value)}}
                    />
                    <label htmlFor="ukHour">&nbsp;&nbsp;&nbsp;</label>
                </>
                }
                <input 
                    id="ukHour"
                    className="timeInput"
                    type="number"
                    min={0}
                    max={23}
                    value={ukHour}
                    onChange={(e)=>{setukHour(e.target.value)}}
                />
                <label htmlFor="ukMinute">:</label>
                <input 
                    id="ukMinute"
                    className="timeInput"
                    type="number"
                    min={0}
                    max={59}
                    value={ukMinute}
                    onChange={(e)=>{setukMinute(e.target.value)}}
                />
            </div>
            <div className="text-center">
                <small className="minor">{isFullDate && "YYYY/MM/DD"} {is12Hours ?  "hh" : "HH"}:mm {is12Hours && "(a.m./p.m.)"}</small>
            </div>
            <br />

            {/* Second line */}
            <div className="text-center icons">
                <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e) => {uktToHkt()}} className="icon"/>
                <div className="checkboxes">
                    <Form.Check
                        id="isFullDate"
                        type="checkbox"
                        label="Include Date"
                        checked={isFullDate}
                        onChange={(e)=>{setIsFullDate(e.target.checked)}}
                    />
                    <Form.Check
                        id="is12Hours"
                        type="checkbox"
                        label="12-hour System"
                        checked={is12Hours}
                        onChange={(e)=>{setIs12Hours(e.target.checked)}}
                    />
                    <Form.Check
                        id="isDst"
                        type="checkbox"
                        label="DST"
                        checked={isDst}
                        disabled={isFullDate} //disable if date is entered by user, i.e. automatically decide
                        onChange={(e)=>{setIsDst(e.target.checked)}}
                    />
                </div>
                <FontAwesomeIcon icon={faArrowAltCircleUp} onClick={(e) => {hktToUkt()}} className="icon"/>
            </div>
            <br />

            {/* Third line */}
            <div className="text-center">
            {isFullDate &&
                <>
                    <input 
                        id="hkYear"
                        className="timeInput"
                        type="number"
                        placeholder="YYYY"
                        min={1970}
                        value={hkYear}
                        onChange={(e)=>{setHkYear(e.target.value)}}
                    />
                    <label htmlFor="hkMonth">/</label>
                    <input 
                        id="hkMonth"
                        className="timeInput"
                        type="number"
                        placeholder="MM"
                        min={1}
                        max={12}
                        value={hkMonth}
                        onChange={(e)=>{setHkMonth(e.target.value)}}
                    />
                    <label htmlFor="hkDay">/</label>
                    <input 
                        id="hkDay"
                        className="timeInput"
                        type="number"
                        placeholder="DD"
                        min={1}
                        max={31}
                        value={hkDay}
                        onChange={(e)=>{setHkDay(e.target.value)}}
                    />
                    <label htmlFor="hkHour">&nbsp;&nbsp;&nbsp;</label>
                </>
                }
                <input 
                    id="hkHour"
                    className="timeInput"
                    type="number"
                    min={0}
                    max={23}
                    value={hkHour}
                    onChange={(e)=>{sethkHour(e.target.value)}}
                />
                <label htmlFor="hkMinute">:</label>
                <input 
                    id="hkMinute"
                    className="timeInput"
                    type="number"
                    min={0}
                    max={59}
                    value={hkMinute}
                    onChange={(e)=>{sethkMinute(e.target.value)}}
                />
            </div>
            <div className="text-center">
                <small className="minor">{isFullDate && "YYYY/MM/DD"} {is12Hours ?  "hh" : "HH"}:mm {is12Hours && "(a.m./p.m.)"}</small>
            </div>
            <br />

            {/* Fourth line */}
            <div className="text-center bottomButtons">
                <Button variant="primary" className="bottomButton" onClick={(e) => {uktToHkt()}}>GBP to HKD</Button>
                <Button variant="danger" className="bottomButton" onClick={(e)=>{resetButton()}}>Reset</Button>
                <Button variant="primary" className="bottomButton" onClick={(e) => {hktToUkt()}}>HKD to GBP</Button>
            </div>
        </form>
    )}





    const TimeToolResult = () => {return(<></>)}
    //     <>
    //         First line
    //         <div className="text-center">
    //             <h4>£ {gbpPounds}</h4>
    //         </div>
    //         <br />

    //         {/* Second line */}
    //         <div className="text-center icons">
    //             <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e)=>{setIsResult(false)}} className={"icon"+(resultType=="gbpToHkd" ? " icon-selected" : "")}/>
    //             <div>
    //                 <p className="mb-0">£ 1 = HK$ {exchangeRateDisplayed} {isCustom && <small className="custom">(custom)</small>}</p>
                    
    //             </div>
                
    //             <FontAwesomeIcon icon={faArrowAltCircleUp} onClick={(e)=>{setIsResult(false)}} className={"icon"+(resultType=="hkdToGbp" ? " icon-selected": "")}/>
    //         </div>
    //         <br />

    //         {/* Third line */}
    //         <div className="text-center">
    //             <h4>HK$ {hkdDollars}</h4>
    //         </div>
    //         <br />

    //         {/* Fourth line */}
    //         <div className="text-center bottomButtons">
    //             <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{screenshotButton()}}>Screenshot</Button>
    //             <Button variant="warning" className="bottomButton" onClick={(e)=>{setIsResult(false)}}>Edit</Button>
    //             <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{clipboardButton()}}>Clipboard</Button>
    //         </div>
    //     </>
    // )}

    return (
    <Tool>
        <div id="timeToolScreenshot">
            <h2>Time (not finished)</h2>
            {isResult ? TimeToolResult() : TimeToolInput() }
            <p className="mt-3 text-center minor"><small>Thank you for using URL. Exchange rate provided by <a href="http://worldclockapi.com/">World Clock API</a></small></p>
        </div>
    </Tool>
    );
}

export default TimeTool;
