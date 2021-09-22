import { useTranslation } from "react-i18next";
import toast, { Toaster } from 'react-hot-toast';
import Container from 'react-bootstrap/Container';
import moment from 'moment-with-locales-es6'
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import CurrencyTool from './components/tools/CurrencyTool'
import TimeTool from './components/tools/TimeTool';

import './App.scss';
import { useEffect } from "react";

function App() {
  const {t,i18n} = useTranslation();

  const changeLanguage = () =>{
    if(i18n.language=="en"){
      i18n.changeLanguage("zh_hk");
      localStorage.setItem("ukGadgetsLanguage","zh_hk");
      moment.locale("zh-hk")
    }else{
      i18n.changeLanguage("en");
      localStorage.setItem("ukGadgetsLanguage","en");
      moment.locale("en-gb")
    }
  }
  useEffect(()=>{
    if(localStorage.getItem("ukGadgetsLanguage")){
      i18n.changeLanguage(localStorage.getItem("ukGadgetsLanguage"));
    }
    if(i18n.language=="en"&&moment.locale()!="en-gb"){
      moment.locale("en-gb")
    }
  },[]);

  return (
    <Container>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            margin: '50px',
            borderRadius: '10px',
            background: '#555',
            color: '#fff',
          },
      }}/>

      <div className="changeLanguageButton">
        <Button variant="link" onClick={(e) => changeLanguage()}><h4>{t("currentLanguage")}</h4></Button>
      </div>
      <div className="intro">
        <h1>{t("ukGadgets")}</h1>
        <p>{t("introDesc")}</p>
      </div>
      <Row className="tools">
        <TimeTool />
        <CurrencyTool />
      </Row>
    </Container>
  );
}

export default App;
