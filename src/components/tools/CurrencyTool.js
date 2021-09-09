import React, {useEffect, useState} from "react";
import { /*toPng,*/ toJpeg/*, toBlob, toPixelData, toSvg*/ } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown, faArrowAltCircleUp, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Tool from './Tool';


function CurrencyTool(props) {
    const [isResult,setIsResult] = useState(false);
    const [resultType,setResultType] = useState("");
    const [isResultError,setIsResultError] = useState(false);
    const [isFetchError,setIsFetchError] = useState(false);
    const [useEffectKey,setUseEffectKey] = useState(0);
    const [isCustom,setIsCustom] = useState(false);

    const [hkdDollars,setHkdDollars] = useState("");
    //const [hkdCents,setHkdCents] = useState("");
    const [exchangeRateFetched,setExchangeRateFetched] = useState("");
    const [exchangeRateDisplayed,setExchangeRateDisplayed] = useState("");
    const [gbpPounds,setGbpPounds] = useState("");
    // const validateHkdCents = (cents) =>{
    //     console.log("validateHkdCents("+cents);
    //     if(cents==""||(cents.length==1&&cents[0]>='0'&&cents[0]<='9')){
    //         setHkdCents(cents);
    //     }
    // }

    useEffect(()=>{
        fetch("https://api.exchangerate.host/latest").then((res)=>{
            return res.json();
        }).then((docs)=>{
            console.log(docs.rates.HKD/docs.rates.GBP);
            setExchangeRateFetched(docs.rates.HKD/docs.rates.GBP);
            setExchangeRateDisplayed(Math.round(docs.rates.HKD/docs.rates.GBP*100)/100);
            setIsCustom(false);
            setIsFetchError(false);
        }).catch((err)=>{
            console.log(err);
            setIsCustom(true);
            setIsFetchError(true);
        });
    },[useEffectKey]);

    const hkdToGbp = () => {
        if(!exchangeRateDisplayed){
            toast.error("Exchange rate is empty", {
                id: "exchangeRateEmpty",
            });
        }else if(isNaN(exchangeRateDisplayed)||exchangeRateDisplayed<0){ //isNaN: return true if not a number
            toast.error("Exchange rate is invalid", {
                id: "exchangeRateInvalid",
            });
        }else if(!hkdDollars){
            toast.error("HK$ is empty", {
                id: "hkdDollarsEmpty",
            });
        }else if(isNaN(hkdDollars)||hkdDollars<0){ //isNaN: return true if not a number
            toast.error("HK$ is invalid", {
                id: "hkdDollarsInvalid",
            });
        }else{
            let exchangeRate = isCustom ? exchangeRateDisplayed : exchangeRateFetched;
            setGbpPounds(Math.round(hkdDollars/exchangeRate*100)/100); //2 d.p.
            setIsResult(true);
            setResultType("hkdToGbp");
        }
        
    }

    const gbpToHkd = () => {
        if(!exchangeRateDisplayed){
            toast.error("Exchange rate is empty", {
                id: "exchangeRateEmpty",
            });
        }else if(isNaN(exchangeRateDisplayed)||exchangeRateDisplayed<0){ //isNaN: return true if not a number
            toast.error("Exchange rate is invalid", {
                id: "exchangeRateInvalid",
            });
        }else if(!gbpPounds){
            toast.error("£ is empty", {
                id: "gbpPoundsEmpty",
            });
        }else if(isNaN(gbpPounds)||gbpPounds<0){ //isNaN: return true if not a number
            toast.error("£ is invalid", {
                id: "gbpPoundsInvalid",
            });
        }else{
            let exchangeRate = isCustom ? exchangeRateDisplayed : exchangeRateFetched;
            setHkdDollars(Math.round(gbpPounds*exchangeRate*10)/10); //1 d.p.
            setIsResult(true);
            setResultType("gbpToHkd");
        }
    }

    const resetButton = () => {
        setUseEffectKey(useEffectKey+1);
        setHkdDollars("");
        setGbpPounds("");
    }

    const screenshotButton = () => {
        toJpeg(document.getElementById('currencyToolScreenshot'), { quality: 0.95 })
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = 'currency.jpeg';
            link.href = dataUrl;
            link.click();
            toast.success("Successfully took screenshot", {
                id: "successScreenshot",
            });
        })
        .catch((err)=>{
            toast.error("Error taking screenshot", {
                id: "errorScreenshot",
            });
        });
    }

    const clipboardButton =  () => {
        let text = "";
        if(resultType=="hkdToGbp"){
            text = "HK$"+hkdDollars+" -> £"+gbpPounds;
        }else if(resultType=="gbpToHkd"){
            text = "£"+gbpPounds+" -> HK$"+hkdDollars;
        }
        text += "\n(£1 = HK$"+exchangeRateDisplayed;
        if(isCustom) text += "(custom)";
        text+=")"
        navigator.clipboard.writeText(text);
        toast.success("Successfully copied to clipboard", {
            id: "successClipboard",
        });
    }

    const CurrencyToolInput = () => {return(
        <form>
            {/* First line */}
            <div className="text-center">
                <label htmlFor="gbpPounds">£</label>
                <input 
                    id="gbpPounds"
                    type="number"
                    value={gbpPounds}
                    onChange={(e)=>{setGbpPounds(e.target.value)}}
                />
            </div>
            <br />

            {/* Second line */}
            <div className="text-center icons">
            <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e) => {gbpToHkd()}} className="icon"/>
                <div>
                    <label htmlFor="exchangeRateDisplayed">£ 1 = HK$ </label>
                    <input 
                        id="exchangeRateDisplayed"
                        type="number"
                        value={exchangeRateDisplayed}
                        onChange={(e)=>{setExchangeRateDisplayed(e.target.value); setIsCustom(true);}}
                    />
                    {isCustom && <small className="minor">(custom)</small>}
                </div>
                <FontAwesomeIcon icon={faArrowAltCircleUp} onClick={(e) => {hkdToGbp()}} className="icon"/>
            </div>
            <br />

            {/* Third line */}
            <div className="text-center">
                <label htmlFor="hkdDollars">HK$</label>
                <input 
                    id="hkdDollars"
                    type="number"
                    value={hkdDollars}
                    onChange={(e)=>{setHkdDollars(e.target.value)}}
                />
            </div>
            <br />

            {/* Fourth line */}
            <div className="text-center bottomButtons">
                <Button variant="primary" className="bottomButton" onClick={(e) => {gbpToHkd()}}>GBP to HKD</Button>
                <Button variant="danger" className="bottomButton" onClick={(e)=>{resetButton()}}>Reset</Button>
                <Button variant="primary" className="bottomButton" onClick={(e) => {hkdToGbp()}}>HKD to GBP</Button>
            </div>
            
            

        </form>
    )}





    const CurrencyToolResult = () => {return(
        <>
            {/* First line */}
            <div className="text-center">
                <h4>£ {gbpPounds}</h4>
            </div>
            <br />

            {/* Second line */}
            <div className="text-center icons">
                <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e)=>{setIsResult(false)}} className={"icon"+(resultType=="gbpToHkd" ? " icon-selected" : "")}/>
                <div>
                    <p className="mb-0">£ 1 = HK$ {exchangeRateDisplayed} {isCustom && <small className="custom">(custom)</small>}</p>
                    
                </div>
                
                <FontAwesomeIcon icon={faArrowAltCircleUp} onClick={(e)=>{setIsResult(false)}} className={"icon"+(resultType=="hkdToGbp" ? " icon-selected": "")}/>
            </div>
            <br />

            {/* Third line */}
            <div className="text-center">
                <h4>HK$ {hkdDollars}</h4>
            </div>
            <br />

            {/* Fourth line */}
            <div className="text-center bottomButtons">
                <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{screenshotButton()}}>Screenshot</Button>
                <Button variant="warning" className="bottomButton" onClick={(e)=>{setIsResult(false)}}>Edit</Button>
                <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{clipboardButton()}}>Clipboard</Button>
            </div>
        </>
    )}

    return (
    <Tool>
        <div id="currencyToolScreenshot">
            <h2>Currency</h2>
            {isResult ? CurrencyToolResult() : CurrencyToolInput() }
            <p className="mt-3 text-center minor"><small>Thank you for using URL. Exchange rate provided by <a href="https://exchangerate.host">exchangerate.host</a></small></p>
        </div>
    </Tool>
    );
}

export default CurrencyTool;
