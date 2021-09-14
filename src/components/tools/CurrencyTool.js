import React, {useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import { /*toPng,*/ toJpeg/*, toBlob, toPixelData, toSvg*/ } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown, faArrowAltCircleUp, faTrashAlt, faPen, faClock, faImage, faCopy } from '@fortawesome/free-solid-svg-icons';
import Tool from './Tool';


function CurrencyTool(props) {
    const {t,i18n} = useTranslation();

    const [isResult,setIsResult] = useState(false);
    const [resultType,setResultType] = useState("");
    // const [isResultError,setIsResultError] = useState(false);
    const [isFetchError,setIsFetchError] = useState(false);
    const [useEffectKey,setUseEffectKey] = useState(0);
    const [isCustom,setIsCustom] = useState(false);

    const [hkdDollars,setHkdDollars] = useState("");
    //const [hkdCents,setHkdCents] = useState("");
    const [exchangeRateFetched,setExchangeRateFetched] = useState("");
    const [exchangeRateDisplayed,setExchangeRateDisplayed] = useState("");
    const [gbpPounds,setGbpPounds] = useState("");

    const [takingScreenshot,setTakingScreenshot] = useState(false);

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
            toast.error(t("exchangeRate")+t("isRequired"), {
                id: "exchangeRateEmpty",
            });
        }else if(isNaN(exchangeRateDisplayed)||exchangeRateDisplayed<0){ //isNaN: return true if not a number
            toast.error(t("exchangeRate")+t("isInvalid"), {
                id: "exchangeRateInvalid",
            });
        }else if(!hkdDollars){
            toast.error(t("hkd")+t("isRequired"), {
                id: "hkdDollarsEmpty",
            });
        }else if(isNaN(hkdDollars)||hkdDollars<0){ //isNaN: return true if not a number
            toast.error(t("hkd")+t("isInvalid"), {
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
            toast.error(t("exchangeRate")+t("isRequired"), {
                id: "exchangeRateEmpty",
            });
        }else if(isNaN(exchangeRateDisplayed)||exchangeRateDisplayed<0){ //isNaN: return true if not a number
            toast.error(t("exchangeRate")+t("isInvalid"), {
                id: "exchangeRateInvalid",
            });
        }else if(!gbpPounds){
            toast.error(t("gbp")+t("isRequired"), {
                id: "gbpPoundsEmpty",
            });
        }else if(isNaN(gbpPounds)||gbpPounds<0){ //isNaN: return true if not a number
            toast.error(t("gbp")+" "+t("isInvalid"), {
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
        if(!takingScreenshot){
            setTakingScreenshot(true);
            toast.promise(
                toJpeg(document.getElementById('currencyToolScreenshot'), { quality: 0.95 })
                .then(function (dataUrl) {
                    var link = document.createElement('a');
                    link.download = t("currency")+'.jpeg';
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
        let text = "";
        if(resultType=="hkdToGbp"){
            text = "HK$"+hkdDollars+" -> £"+gbpPounds;
        }else if(resultType=="gbpToHkd"){
            text = "£"+gbpPounds+" -> HK$"+hkdDollars;
        }
        text += "\n(£1 = HK$"+exchangeRateDisplayed;
        if(isCustom) text += "("+t("custom")+")";
        text+=")"
        navigator.clipboard.writeText(text);
        toast.success(t("successClipboard"), {
            id: "successClipboard",
        });
    }

    const CurrencyToolInput = () => {return(
        <form>
            {/* First line */}
            <div className="text-center">
                <label htmlFor="gbpPounds"><span className="flag">🇬🇧</span> £</label>
                <input 
                    id="gbpPounds"
                    type="number"
                    min={0}
                    value={gbpPounds}
                    onChange={(e)=>{setGbpPounds(e.target.value)}}
                />
            </div>
            <br />

            {/* Second line */}
            <div className="text-center icons">
            <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e) => {gbpToHkd()}} className="icon"/>
                <div>
                    <label htmlFor="exchangeRateDisplayed">£1 = HK$ </label>
                    <input 
                        id="exchangeRateDisplayed"
                        type="number"
                        min={0}
                        value={exchangeRateDisplayed}
                        onChange={(e)=>{setExchangeRateDisplayed(e.target.value); setIsCustom(true);}}
                    />
                    {isCustom && <small className="minor">({t("custom")})</small>}
                </div>
                <FontAwesomeIcon icon={faArrowAltCircleUp} onClick={(e) => {hkdToGbp()}} className="icon"/>
            </div>
            <br />

            {/* Third line */}
            <div className="text-center">
                <label htmlFor="hkdDollars"><span className="flag">🇭🇰</span> $</label>
                <input 
                    id="hkdDollars"
                    type="number"
                    min={0}
                    value={hkdDollars}
                    onChange={(e)=>{setHkdDollars(e.target.value)}}
                />
            </div>
            <br />

            {/* Fourth line */}
            <div className="text-center bottomButtons mb-2">
                <Button variant="primary" className="bottomButton" onClick={(e) => {gbpToHkd()}}><FontAwesomeIcon icon={faArrowAltCircleDown} /> {t("gbpToHkd")}</Button>
                <Button variant="primary" className="bottomButton" onClick={(e) => {hkdToGbp()}}>{t("hkdToGbp")} <FontAwesomeIcon icon={faArrowAltCircleUp} /></Button>
            </div>
            <div className="text-center bottomButtons mb-2">
                <Button variant="danger" className="bottomButton" onClick={(e)=>{resetButton()}}><FontAwesomeIcon icon={faTrashAlt} /> {t("reset")}</Button>
            </div>
        </form>
    )}





    const CurrencyToolResult = () => {return(
        <>
            {/* First line */}
            <div className="text-center">
                <h4>🇬🇧 £ {gbpPounds}</h4>
            </div>
            <br />

            {/* Second line */}
            <div className="text-center icons">
                <FontAwesomeIcon icon={faArrowAltCircleDown} onClick={(e)=>{setIsResult(false)}} className={"icon"+(resultType=="gbpToHkd" ? " icon-selected" : "")}/>
                <div>
                    <p className="mb-0">£1 = HK$ {exchangeRateDisplayed} {isCustom && <small className="custom">({t("custom")})</small>}</p>
                    
                </div>
                
                <FontAwesomeIcon icon={faArrowAltCircleUp} onClick={(e)=>{setIsResult(false)}} className={"icon"+(resultType=="hkdToGbp" ? " icon-selected": "")}/>
            </div>
            <br />

            {/* Third line */}
            <div className="text-center">
                <h4>🇭🇰 $ {hkdDollars}</h4>
            </div>
            <br />

            {/* Fourth line */}
            <div className="text-center bottomButtons">
                <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{screenshotButton()}}><FontAwesomeIcon icon={faImage} /> {t("screenshot")}</Button>
                <Button variant="warning" className="bottomButton" onClick={(e)=>{setIsResult(false)}}><FontAwesomeIcon icon={faPen} /> {t("edit")}</Button>
                <Button variant="success" className="bottomButton saveButton" onClick={(e)=>{clipboardButton()}}><FontAwesomeIcon icon={faCopy} /> {t("clipboard")}</Button>
            </div>
        </>
    )}

    return (
    <Tool>
        <div id="currencyToolScreenshot">
            <h2>{t("currency")}</h2>
            {isResult ? CurrencyToolResult() : CurrencyToolInput() }
            <p className="mt-3 text-center"><small>
                <span className="minor">{t("thankYou1")}</span>
                <a href="https://ukgadgets.netlify.app">{t("ukGadgets")}</a>
                <span className="minor">{t("thankYou2")+t("currentExchangeRate")+t("thankYou3")}</span>
                <a href="https://exchangerate.host">exchangerate.host</a>
                <span className="minor">{t("thankYou4")}</span>
            </small></p>
        </div>
    </Tool>
    );
}

export default CurrencyTool;
