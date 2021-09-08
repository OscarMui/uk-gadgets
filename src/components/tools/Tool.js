import Col from 'react-bootstrap/Col';
import './Tool.scss';

function Tool(props) {
    return (
        <Col xs={12} lg={6} className="my-4">
            <div className="tool">
                {props.children}
            </div>
        </Col>
    );
}

export default Tool;
