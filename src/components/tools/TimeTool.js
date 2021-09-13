//TODO: DATA VALIDATION!!!, automatically increase day, automatically determine DST
import React, {useEffect, useState} from "react";
import moment from 'moment-with-locales-es6'
import { useTranslation } from "react-i18next";
import { /*toPng,*/ toJpeg/*, toBlob, toPixelData, toSvg*/ } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown, faArrowAltCircleUp, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Tool from './Tool';

function TimeTool(props) {
    const {t, i18n} = useTranslation();
    const [screenWidth,setScreenWidth] = useState(window.innerWidth);

    const [isResult,setIsResult] = useState(false);
    const [resultType,setResultType] = useState("");
    // const [isResultError,setIsResultError] = useState(false);
    const [isFetchError,setIsFetchError] = useState(false);
    const [useEffectKey,setUseEffectKey] = useState(0);

    const [isFullDate,setIsFullDate] = useState(true);
    const [is12Hours,setIs12Hours] = useState(false);
    const [isDst,setIsDst] = useState(false);

    const [utcTimeNum,setUtcTimeNum] = useState("");
    const [ukTimeNum,setUkTimeNum] = useState("");
    const [hkTimeNum,setHkTimeNum] = useState("");

    const [ukYear,setUkYear] = useState("");
    const [ukMonth,setUkMonth] = useState("");
    const [ukDay,setUkDay] = useState("");
    const [ukHour,setUkHour] = useState("");
    const [ukMinute,setUkMinute] = useState("");

    const [hkYear,setHkYear] = useState("");
    const [hkMonth,setHkMonth] = useState("");
    const [hkDay,setHkDay] = useState("");
    const [hkHour,sethkHour] = useState("");
    const [hkMinute,sethkMinute] = useState("");

    const [exchangeRateFetched,setExchangeRateFetched] = useState("");
    const [exchangeRateDisplayed,setExchangeRateDisplayed] = useState("");
    const [gbpPounds,setGbpPounds] = useState("");

    //create leading zeros
    const numberToString = (number, digits) => {
        var numberRemaining = number;
        var returnString = "";
        for(let i=(digits-1);i>=0;i--){
            returnString+=Math.floor(numberRemaining/Math.pow(10,i));
            numberRemaining=numberRemaining%Math.pow(10,i);
        }
        return returnString;
    }

    const momentToString = (timeNum,isFullDate,is12Hours) => {
        let momentFormat = (isFullDate ? "ll " : "") + (is12Hours ? "hh:mm a" : "HH:mm");
        return moment(timeNum+new Date().getTimezoneOffset()*60*1000).format(momentFormat);
    }

    const numberToDate = (isFullDate,year,month,day,hour,minute) =>{
        //"2021-10-31T00:00:00.000+00:00"
        let utcTime = new Date(utcTimeNum);
        return new Date(
            (isFullDate ? year : utcTime.getUTCFullYear())+"-"+numberToString((isFullDate ? month : utcTime.getUTCMonth()),2)+"-"+numberToString((isFullDate ? day : utcTime.getUTCDate()),2)+"T"+
            numberToString(hour,2)+":"+numberToString(minute,2)+":00.000+00:00"
        );
    }

    const checkScreenWidth = () =>{
        setScreenWidth(window.innerWidth);
    }

    useEffect(()=>{
        window.addEventListener("resize",checkScreenWidth);

        fetch("https://currentmillis.com/time/minutes-since-unix-epoch.php").then((res)=>{ //returns minutes since 1/1/1970
            return res.text();
        }).then((docs)=>{
            console.log(docs*60*1000);
            let utcTimeNum = docs*60*1000;
            setUtcTimeNum(utcTimeNum);

            let isDst = checkIsDst(utcTimeNum);
            setIsDst(isDst);

            let ukTimeNum = utcTimeNum + (isDst ? 1*3600*1000: 0);
            let hkTimeNum = utcTimeNum + 8*3600*1000;
            let ukTime = new Date(ukTimeNum); 
            let hkTime = new Date(hkTimeNum);

            setUkYear(ukTime.getUTCFullYear());
            setUkMonth(ukTime.getUTCMonth()+1);
            setUkDay(ukTime.getUTCDate());
            setUkHour(numberToString(ukTime.getUTCHours(),2));
            setUkMinute(numberToString(ukTime.getUTCMinutes(),2));

            setHkYear(hkTime.getUTCFullYear());
            setHkMonth(hkTime.getUTCMonth()+1);
            setHkDay(hkTime.getUTCDate());
            sethkHour(numberToString(hkTime.getUTCHours(),2));
            sethkMinute(numberToString(hkTime.getUTCMinutes(),2));

            setIsFetchError(false);
        }).catch((err)=>{
            console.log(err);
            setIsFetchError(true);
        });

        return () => { //cleanup function
            window.removeEventListener("resize",checkScreenWidth);
        };
    },[useEffectKey]);

    const checkIsDst = (utcTimeNum) =>{
        let utcTime = new Date(utcTimeNum);
        let utcMonth = utcTime.getUTCMonth()+1;
        if(utcMonth>=11||utcMonth<=2){
            return false;
        }else if(utcMonth>=4&&utcMonth<=9){
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
            let march31 = new Date(utcTime.getUTCFullYear()+"-03-31T00:00:00.000+00:00");
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
        let utcTime = new Date(utcTimeNum);
        let inputTime = numberToDate(isFullDate,ukYear,ukMonth,ukDay,ukHour,ukMinute);
        let inputTimeNum = inputTime.getTime();

        setUkTimeNum(inputTimeNum);
        let isDst = checkIsDst(inputTimeNum);
        setIsDst(isDst);
        if(isDst) inputTimeNum-=3600*1000; //+1 to +0
        inputTimeNum += 8*3600*1000; //+0 to +8

        setHkTimeNum(inputTimeNum);
        let hkTime = new Date(inputTimeNum);
        setHkYear(hkTime.getUTCFullYear());
        setHkMonth(hkTime.getUTCMonth()+1);
        setHkDay(hkTime.getUTCDate());
        sethkHour(numberToString(hkTime.getUTCHours(),2));
        sethkMinute(numberToString(hkTime.getUTCMinutes(),2));

        setIsResult(true);
        setResultType("uktToHkt");
    }

    const hktToUkt = () => {
        let utcTime = new Date(utcTimeNum);
        let inputTime = numberToDate(isFullDate,hkYear,hkMonth,hkDay,hkHour,hkMinute);
        let inputTimeNum = inputTime.getTime();

        setHkTimeNum(inputTimeNum);
        inputTimeNum -= 8*3600*1000; //+8 to +0
        let isDst = checkIsDst(inputTimeNum);
        setIsDst(isDst);
        if(isDst) inputTimeNum+=3600*1000; //+1 to +0
        
        setUkTimeNum(inputTimeNum);
        let ukTime = new Date(inputTimeNum);
        setUkYear(ukTime.getUTCFullYear());
        setUkMonth(ukTime.getUTCMonth()+1);
        setUkDay(ukTime.getUTCDate());
        setUkHour(numberToString(ukTime.getUTCHours(),2));
        setUkMinute(numberToString(ukTime.getUTCMinutes(),2));

        setIsResult(true);
        setResultType("hktToUkt");
    }

    const nowButton = () => {
        setUseEffectKey(useEffectKey+1);
    }

    const clearButton = () => {
        setUkYear("");
        setUkMonth("");
        setUkDay("");
        setUkHour("");
        setUkMinute("");

        setHkYear("");
        setHkMonth("");
        setHkDay("");
        sethkHour("");
        sethkMinute("");

        setIsFullDate(true);
        setIs12Hours(false);
        setIsDst(false);
    }

    const screenshotButton = () => {
        toJpeg(document.getElementById('timeToolScreenshot'), { quality: 0.95 })
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = t("time")+'.jpeg';
            link.href = dataUrl;
            link.click();
            toast.success(t("successScreenshot"), {
                id: "successScreenshot",
            });
        })
        .catch((err)=>{
            toast.error(t("errorScreenshot"), {
                id: "errorScreenshot",
            });
        });
    }

    const clipboardButton =  () => {
        let text = "";
        if(resultType=="hktToUkt"){
            text = momentToString(ukTimeNum,isFullDate,is12Hours)+" ("+(isDst?t("bst"):t("utc"))+") -> "+momentToString(hkTimeNum,isFullDate,is12Hours)+" ("+t("hkt")+")";
        }else if(resultType=="uktToHkt"){
            text = momentToString(hkTimeNum,isFullDate,is12Hours)+" ("+t("hkt")+") -> "+momentToString(ukTimeNum,isFullDate,is12Hours)+" ("+(isDst?t("bst"):t("utc"))+")";
        }
        navigator.clipboard.writeText(text);
        toast.success(t("successClipboard"), {
            id: "successClipboard",
        });
    }

    const TimeToolInput = () => {return(
        <form>
            {/* First line */}
            <div className="text-center">
                <div className="d-inline-block mb-2">
                    <label><span className="flag">🇬🇧</span> {t("uk")} </label>
                </div>
                {isFullDate &&
                <div className="d-inline-block mb-2 fullDate">
                    <input 
                        id="ukYear"
                        className="timeInput"
                        type="number"
                        placeholder={t("YYYY")}
                        min={1970}
                        value={ukYear}
                        onChange={(e)=>{setUkYear(e.target.value)}}
                    />
                    <label htmlFor="ukMonth">/</label>
                    <input 
                        id="ukMonth"
                        className="timeInput"
                        type="number"
                        placeholder={t("MM")}
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
                        placeholder={t("DD")}
                        min={1}
                        max={31}
                        value={ukDay}
                        onChange={(e)=>{setUkDay(e.target.value)}}
                    />
                </div>
                }
                <div className="d-inline-block mb-2">
                    <input 
                        id="ukHour"
                        className="timeInput"
                        type="number"
                        placeholder={is12Hours ?  t("hh") : t("HH")}
                        min={0}
                        max={23}
                        value={ukHour}
                        onChange={(e)=>{setUkHour(e.target.value)}}
                    />
                    <label htmlFor="ukMinute">:</label>
                    <input
                        id="ukMinute"
                        className="timeInput"
                        type="number"
                        placeholder={t("mm")}
                        min={0}
                        max={59}
                        value={ukMinute}
                        onChange={(e)=>{setUkMinute(e.target.value)}}
                    />
                </div>
            </div>
            <div className="text-center">
                <small className="minor">{isFullDate && t("YYYY")+"/"+t("MM")+"/"+t("DD")} {is12Hours ?  t("hh") : t("HH")}:{t("mm")} {is12Hours && "("+t("am")+"/"+t("pm")+")"}</small>
            </div>
            <br />

            {/* Second line */}
            <div className="text-center icons">
                <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e) => {uktToHkt()}} className="icon"/>
                <div className="checkboxes">
                    <Form.Check
                        id="isFullDate"
                        type="checkbox"
                        label={t("includeDate")}
                        checked={isFullDate}
                        onChange={(e)=>{setIsFullDate(e.target.checked)}}
                    />
                    <Form.Check
                        id="is12Hours"
                        type="checkbox"
                        label={t("twelveHourSystem")}
                        checked={is12Hours}
                        disabled={true} //todo
                        onChange={(e)=>{setIs12Hours(e.target.checked)}}
                    />
                    <Form.Check
                        id="isDst"
                        type="checkbox"
                        label={t("dst")}
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
                <div className="d-inline-block mb-2">
                    <label><span className="flag">🇭🇰</span> {t("hk")} </label>
                </div>
                {isFullDate &&
                <div className="d-inline-block mb-2 fullDate">
                    <input 
                        id="hkYear"
                        className="timeInput"
                        type="number"
                        placeholder={t("YYYY")}
                        min={1970}
                        value={hkYear}
                        onChange={(e)=>{setHkYear(e.target.value)}}
                    />
                    <label htmlFor="hkMonth">/</label>
                    <input 
                        id="hkMonth"
                        className="timeInput"
                        type="number"
                        placeholder={t("MM")}
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
                        placeholder={t("DD")}
                        min={1}
                        max={31}
                        value={hkDay}
                        onChange={(e)=>{setHkDay(e.target.value)}}
                    />
                    <label htmlFor="hkHour">&nbsp;&nbsp;&nbsp;</label>
                </div>
                }
                <div className="d-inline-block mb-2">
                    <input
                        id="hkHour"
                        className="timeInput"
                        type="number"
                        placeholder={is12Hours ?  t("hh") : t("HH")}
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
                        placeholder={t("mm")}
                        min={0}
                        max={59}
                        value={hkMinute}
                        onChange={(e)=>{sethkMinute(e.target.value)}}
                    />
                </div>
            </div>
            <div className="text-center">
            <small className="minor">{isFullDate && t("YYYY")+"/"+t("MM")+"/"+t("DD")} {is12Hours ?  t("hh") : t("HH")}:{t("mm")} {is12Hours && "("+t("am")+"/"+t("pm")+")"}</small>
            </div>
            <br />

            {/* Fourth line */}
            {screenWidth >= 500 ? //PC version
            <div className="text-center bottomButtons">
                <Button variant="primary" className="bottomButton" onClick={(e) => {uktToHkt()}}>{t("uktToHkt")}</Button>
                <Button variant="danger" className="bottomButton" onClick={(e)=>{nowButton()}}>{t("now")}</Button>
                <Button variant="danger" className="bottomButton" onClick={(e)=>{clearButton()}}>{t("clear")}</Button>
                <Button variant="primary" className="bottomButton" onClick={(e) => {hktToUkt()}}>{t("hktToUkt")}</Button>
            </div>
            : //Mobile version
                <>
                <div className="text-center bottomButtons mb-2">
                    <Button variant="danger" className="bottomButton" onClick={(e)=>{nowButton()}}>{t("now")}</Button>
                    <Button variant="danger" className="bottomButton" onClick={(e)=>{clearButton()}}>{t("clear")}</Button>
                </div>
                <div className="text-center bottomButtons mb-2">
                    <Button variant="primary" className="bottomButton" onClick={(e) => {uktToHkt()}}>{t("uktToHkt")}</Button>
                    <Button variant="primary" className="bottomButton" onClick={(e) => {hktToUkt()}}>{t("hktToUkt")}</Button>
                </div>
                </>
            }
        </form>
    )}





    const TimeToolResult = () => { return(
        <>
            {/* First line */}
            <div className="text-center">
                <h4 className="d-inline-block">🇬🇧 {momentToString(ukTimeNum,isFullDate,is12Hours)}</h4>
                <small className="minor d-inline-block">&nbsp;({isDst?t("bst"):t("utc")})</small>
            </div>
            <br />

            {/* Second line */}
            <div className="text-center icons">
                <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e) => {setIsResult(false)}} className={"icon"+(resultType=="uktToHkt" ? " icon-selected" : "")}/>
                <div className="checkboxes">
                    <Form.Check
                        id="isFullDate"
                        type="checkbox"
                        label={t("includeDate")}
                        checked={isFullDate}
                        disabled={true}
                        onChange={(e)=>{setIsFullDate(e.target.checked)}}
                    />
                    <Form.Check
                        id="is12Hours"
                        type="checkbox"
                        label={t("twelveHourSystem")}
                        checked={is12Hours}
                        disabled={true} //todo
                        onChange={(e)=>{setIs12Hours(e.target.checked)}}
                    />
                    <Form.Check
                        id="isDst"
                        type="checkbox"
                        label={t("dst")}
                        checked={isDst}
                        disabled={true} //disable if date is entered by user, i.e. automatically decide
                        onChange={(e)=>{setIsDst(e.target.checked)}}
                    />
                </div>
                <FontAwesomeIcon icon={faArrowAltCircleUp} onClick={(e) => {setIsResult(false)}} className={"icon"+(resultType=="hktToUkt" ? " icon-selected" : "")}/>
            </div>
            <br />

            {/* Third line */}
            <div className="text-center">
                <h4 className="d-inline-block">🇭🇰 {momentToString(hkTimeNum,isFullDate,is12Hours)}</h4>
                <small className="minor d-inline-block">&nbsp;({t("hkt")})</small>
            </div>
            <br />

            {/* Fourth line */}
            <div className="text-center bottomButtons">
                <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{screenshotButton()}}>{t("screenshot")}</Button>
                <Button variant="warning" className="bottomButton" onClick={(e)=>{setIsResult(false)}}>{t("edit")}</Button>
                <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{clipboardButton()}}>{t("clipboard")}</Button>
            </div>
        </>
    )}

    return (
    <Tool>
        <div id="timeToolScreenshot">
            <h2>{t("time")}</h2>
            {isResult ? TimeToolResult() : TimeToolInput() }
            <p className="mt-3 text-center"><small className="minor">{t("thankYou1")}<a href="https://ukgadgets.netlify.app">{t("ukGadgets")}</a>{t("thankYou2")+t("currentTime")+t("thankYou3")}<a href="https://currentmillis.com/">currentmills</a>{t("thankYou4")}</small></p>
        </div>
    </Tool>
    );
}

export default TimeTool;
