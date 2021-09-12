import { useTranslation } from "react-i18next";
import toast, { Toaster } from 'react-hot-toast';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import CurrencyTool from './components/tools/CurrencyTool'
import TimeTool from './components/tools/TimeTool';

import './App.scss';

function App() {
  const {t,i18n} = useTranslation();
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
