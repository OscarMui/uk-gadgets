import toast, { Toaster } from 'react-hot-toast';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import CurrencyTool from './components/tools/CurrencyTool'
import TimeTool from './components/tools/TimeTool';

import './App.scss';

function App() {
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
        <h1>UK Gadgets</h1>
        <p>Some small tools for Hongkongers that might be useful when studying/working in the UK.</p>
      </div>
      <Row className="tools">
        <TimeTool />
        <CurrencyTool />
      </Row>
    </Container>
  );
}

export default App;
