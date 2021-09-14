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
    const [ukAm,setUkAm] = useState("am");

    const [hkYear,setHkYear] = useState("");
    const [hkMonth,setHkMonth] = useState("");
    const [hkDay,setHkDay] = useState("");
    const [hkHour,setHkHour] = useState("");
    const [hkMinute,setHkMinute] = useState("");
    const [hkAm,setHkAm] = useState("am");


    const [takingScreenshot,setTakingScreenshot] = useState(false);

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
        let momentFormat = (isFullDate ? "ll " : "") + (is12Hours ? (i18n.language=="zh_hk" ? "a h:mm" : "h:mm a") : "HH:mm");
        return moment(timeNum+new Date().getTimezoneOffset()*60*1000).format(momentFormat);
    }

    const numberToDate = (isFullDate,year,month,day,hour,minute) =>{
        //"2021-10-31T00:00:00.000+00:00"
        let utcTime = new Date(utcTimeNum);
        return new Date(
            numberToString((isFullDate ? year : utcTime.getUTCFullYear()),4)+"-"+numberToString((isFullDate ? month : utcTime.getUTCMonth()),2)+"-"+numberToString((isFullDate ? day : utcTime.getUTCDate()),2)+"T"+
            numberToString(hour,2)+":"+numberToString(minute,2)+":00.000+00:00"
        );
    }
    
    const convert24To12 = (hour) => {
        hour = parseInt(hour,10);
        if(hour==0){
            return {hour: 12, am: "am"}
        }else if(hour<12){
            return {hour: hour, am: "am"}
        }else if(hour==12){
            return {hour: 12, am: "pm"}
        }else{
            return {hour: hour-12, am: "pm"}
        }
    }

    const convert12To24 = (hour,am) => {
        hour = parseInt(hour,10);
        if(hour==12) hour=0;
        return hour+(am=="pm"?12:0);
    }

    const validateInput = (year,month,day,hour,minute) => {
        if(year==""){
            toast.error(t("year")+t("isRequired"), {
                id: "yearEmpty",
            });
            return false;
        }
        if(month==""){
            toast.error(t("month")+t("isRequired"), {
                id: "monthEmpty",
            });
            return false;
        }
        if(day==""){
            toast.error(t("day")+t("isRequired"), {
                id: "dayEmpty",
            });
            return false;
        }
        if(hour==""){
            toast.error(t("hour")+t("isRequired"), {
                id: "hourEmpty",
            });
            return false;
        }
        if(minute==""){
            toast.error(t("minute")+t("isRequired"), {
                id: "minuteEmpty",
            });
            return false;
        }
        if(year<1000){
            toast.error(t("errorYear1000"), {
                id: "errorYear1000",
            });
            return false;
        }
        let isLeapYear = year%400==0 || (year%4==0 && year%100!=0);
        let numberOfDays = [31,isLeapYear? 29: 28,31,30,31,30,31,31,30,31,30,31];
        if(day>numberOfDays[month-1]){
            toast.error(t("day")+t("isInvalid"),{
                id: "dayInvalid"
            });
            return false;
        }

        return true;
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
            if(is12Hours){
                let {hour,am} = convert24To12(ukTime.getUTCHours());
                setUkHour(hour);
                setUkAm(am);
            }else{
                setUkHour(numberToString(ukTime.getUTCHours(),2));
            }
            setUkMinute(numberToString(ukTime.getUTCMinutes(),2));

            setHkYear(hkTime.getUTCFullYear());
            setHkMonth(hkTime.getUTCMonth()+1);
            setHkDay(hkTime.getUTCDate());
            if(is12Hours){
                let {hour,am} = convert24To12(hkTime.getUTCHours());
                setHkHour(hour);
                setHkAm(am);
            }else{
                setHkHour(numberToString(hkTime.getUTCHours(),2));
            }
            setHkMinute(numberToString(hkTime.getUTCMinutes(),2));

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
        if(isFullDate){
            if(!validateInput(ukYear,ukMonth,ukDay,ukHour,ukMinute)) return;
        }
        let inputTime = numberToDate(isFullDate,ukYear,ukMonth,ukDay,is12Hours ? convert12To24(ukHour,ukAm) : ukHour,ukMinute);
        let inputTimeNum = inputTime.getTime();

        setUkTimeNum(inputTimeNum);
        let isDstLocal;
        if(isFullDate){
            //auto determine dst
            isDstLocal = checkIsDst(inputTimeNum);
            setIsDst(isDstLocal);
        }else{
            isDstLocal = isDst;
        }
        if(isDst) inputTimeNum-=3600*1000; //+1 to +0
        inputTimeNum += 8*3600*1000; //+0 to +8

        setHkTimeNum(inputTimeNum);
        let hkTime = new Date(inputTimeNum);
        setHkYear(hkTime.getUTCFullYear());
        setHkMonth(hkTime.getUTCMonth()+1);
        setHkDay(hkTime.getUTCDate());
        if(is12Hours){
            let {hour,am} = convert24To12(hkTime.getUTCHours());
            setHkHour(hour);
            setHkAm(am);
        }else{
            setHkHour(numberToString(hkTime.getUTCHours(),2));
        }
        setHkMinute(numberToString(hkTime.getUTCMinutes(),2));

        setIsResult(true);
        setResultType("uktToHkt");
    }

    const hktToUkt = () => {
        if(isFullDate){
            if(!validateInput(hkYear,hkMonth,hkDay,hkHour,hkMinute)) return;
        }
        let inputTime = numberToDate(isFullDate,hkYear,hkMonth,hkDay,is12Hours ? convert12To24(hkHour,ukAm) : hkHour,hkMinute);
        let inputTimeNum = inputTime.getTime();

        setHkTimeNum(inputTimeNum);
        inputTimeNum -= 8*3600*1000; //+8 to +0
        let isDstLocal;
        if(isFullDate){
            //auto determine dst
            isDstLocal = checkIsDst(inputTimeNum);
            setIsDst(isDstLocal);
        }else{
            isDstLocal = isDst;
        }
        if(isDstLocal) inputTimeNum+=3600*1000; //+1 to +0
        
        setUkTimeNum(inputTimeNum);
        let ukTime = new Date(inputTimeNum);
        setUkYear(ukTime.getUTCFullYear());
        setUkMonth(ukTime.getUTCMonth()+1);
        setUkDay(ukTime.getUTCDate());
        if(is12Hours){
            let {hour,am} = convert24To12(ukTime.getUTCHours());
            setUkHour(hour);
            setUkAm(am);
        }else{
            setUkHour(numberToString(ukTime.getUTCHours(),2));
        }
        setUkMinute(numberToString(ukTime.getUTCMinutes(),2));

        setIsResult(true);
        setResultType("hktToUkt");
    }

    const nowButton = () => {
        setUseEffectKey(useEffectKey+1);
    }

    const clearButton = () => {
        clearTime();

        setIsFullDate(true);
        setIs12Hours(false);
        setIsDst(false);
    }

    const clearTime = () => {
        setUkYear("");
        setUkMonth("");
        setUkDay("");
        setUkHour("");
        setUkMinute("");
        setUkAm("am");

        setHkYear("");
        setHkMonth("");
        setHkDay("");
        setHkHour("");
        setHkMinute("");
        setHkAm("am");
    }

    const screenshotButton = () => {
        if(!takingScreenshot){
            setTakingScreenshot(true);
            toast.promise(
                toJpeg(document.getElementById('timeToolScreenshot'), { quality: 0.95 })
                .then(function (dataUrl) {
                    var link = document.createElement('a');
                    link.download = t("time")+'.jpeg';
                    link.href = dataUrl;
                    link.click();
                    setTakingScreenshot(false);
                    // toast.success(t("successScreenshot"), {
                    //     id: "successScreenshot",
                    // });
                })
                .catch((err)=>{
                    setTakingScreenshot(false);
                    // toast.error(t("errorScreenshot"), {
                    //     id: "errorScreenshot",
                    // });
                }),
                {
                    loading: t("takingScreenshot"),
                    success: t("successScreenshot"),
                    error: t("errorScreenshot"),
                },
            )
        }
    }

    const clipboardButton =  () => {
        let text = momentToString(ukTimeNum,isFullDate,is12Hours)+" ("+(isDst?t("bst"):t("utc"))+")\n"+momentToString(hkTimeNum,isFullDate,is12Hours)+" ("+t("hkt")+")";
        
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
                        onChange={(e)=>{if(e.target.value<=9999) setUkYear(e.target.value)}}
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
                        onChange={(e)=>{if(e.target.value==""||e.target.value<=12&&e.target.value>=1) setUkMonth(e.target.value)}}
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
                        onChange={(e)=>{if(e.target.value==""||e.target.value<=31&&e.target.value>=1) setUkDay(e.target.value)}}
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
                        max={is12Hours ? 12 : 23}
                        value={ukHour}
                        onChange={(e)=>{if(e.target.value<=(is12Hours ? 12 : 23)&&e.target.value>=0) setUkHour(e.target.value)}}
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
                        onChange={(e)=>{if(e.target.value<=59&&e.target.value>=0) setUkMinute(e.target.value)}}
                    />
                    {is12Hours &&
                        <Form.Select
                            id="ukAm"
                            className="timeSelect d-inline-block"
                            value={ukAm}
                            onChange={(e)=>{setUkAm(e.target.value)}}
                        >
                            <option value="am">{t("am")}</option>
                            <option value="pm">{t("pm")}</option>
                        </Form.Select>
                    }
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
                        onChange={(e)=>{
                            setIs12Hours(e.target.checked);
                            if(e.target.checked){
                                let {hour,am} = convert24To12(ukHour);
                                setUkHour(hour);
                                setUkAm(am);
                                ({hour,am} = convert24To12(hkHour));
                                setHkHour(hour);
                                setHkAm(am);
                            }else{
                                setUkHour(numberToString(convert12To24(ukHour,ukAm),2));
                                setHkHour(numberToString(convert12To24(hkHour,hkAm),2));
                            }
                        }}
                    />
                    {isFullDate ? 
                        <p className="minor">{t("autoDst")}</p>
                    :
                        <Form.Check
                            id="isDst"
                            type="checkbox"
                            label={t("dst")}
                            checked={isDst}
                            onChange={(e)=>{clearTime(); setIsDst(e.target.checked);}}
                        />
                    }
                    
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
                        min={1000}
                        max={9999}
                        value={hkYear}
                        onChange={(e)=>{if(e.target.value<=9999) setHkYear(e.target.value)}}
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
                        onChange={(e)=>{if(e.target.value==""||e.target.value<=12&&e.target.value>=1) setHkMonth(e.target.value)}}
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
                        onChange={(e)=>{if(e.target.value==""||e.target.value<=31&&e.target.value>=1) setHkDay(e.target.value)}}
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
                        max={is12Hours ? 12 : 23}
                        value={hkHour}
                        onChange={(e)=>{if(e.target.value<=(is12Hours ? 12 : 23)&&e.target.value>=0) setHkHour(e.target.value)}}
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
                        onChange={(e)=>{if(e.target.value<=59&&e.target.value>=0) setHkMinute(e.target.value)}}
                    />
                    {is12Hours &&
                        <Form.Select
                            id="hkAm"
                            className="timeSelect d-inline-block"
                            value={hkAm}
                            onChange={(e)=>{setHkAm(e.target.value)}}
                        >
                            <option value="am">{t("am")}</option>
                            <option value="pm">{t("pm")}</option>
                        </Form.Select>
                    }
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
            <p className="mt-3 text-center"><small>
                <span className="minor">{t("thankYou1")}</span>
                <a href="https://ukgadgets.netlify.app">{t("ukGadgets")}</a>
                <span className="minor">{t("thankYou2")+t("currentTime")+t("thankYou3")}</span>
                <a href="https://currentmillis.com/">currentmills</a>
                <span className="minor">{t("thankYou4")}</span>
            </small></p>
        </div>
    </Tool>
    );
}

export default TimeTool;
