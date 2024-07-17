import React, { useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

type FormModeDefault = "Default";
type FormModeBypass = "Bypass";
type FormModeUnverified = "Unverified";
type FormModeVerified = "Verified";
type FormModeCleared = "Cleared";
type FormMode =
    | FormModeDefault
    | FormModeBypass
    | FormModeUnverified
    | FormModeVerified
    | FormModeCleared;

export type LoginProps = {
    mode: FormMode;
    orderNumber: string;
    driverName: string;
    trailerNumber: string;
    licenseNumber: string;
    order: Order | null;
    unverifiedFields: Array<string>;
};

export type Order = {
    orderNumber: string;
    driverName: string;
    equipmentNumber: string;
    driverLicenseNumber: string;
};

const initialState: LoginProps = { mode: "Default", orderNumber: "", driverName: "", trailerNumber: "", licenseNumber: "", order: null, unverifiedFields: [] };

export default function LoginForm() {
    const [state, setState] = useState<LoginProps>(initialState);
    const setLogin = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const id = target.id;
        const value = target.value;
        setState((x) => ({ ...x, [id]: value }));
    };
    const bypass = () => setState((x) => ({ ...x, mode: "Bypass" }));
    const cancel = () => setState((x) => (initialState));
    const verify = async () => {
        if (state.orderNumber.length) {
            let response = await axios.get(`/api/drivers/${state.orderNumber}`);
            if (response) {
                const { driverName, equipmentNumber, driverLicenseNumber } = response.data;
                if (driverName && equipmentNumber && driverLicenseNumber) {
                    setState((x) => ({ ...x, mode: "Verified", order: { orderNumber: state.orderNumber, driverName: driverName, equipmentNumber: equipmentNumber, driverLicenseNumber: driverLicenseNumber }}));
                } else {
                    setState((x) => ({ ...x, mode: "Unverified" })); 
                }
            }
        }
    };
    const checkIn = () => {
        const unverified:Array<string> = [];
        if (state.driverName.length &&
            state.licenseNumber.length &&
            state.trailerNumber.length) {
                if (state.driverName.toLowerCase() !== state.order?.driverName.toLowerCase()) unverified.push("Driver Name");
                if (state.licenseNumber.toLowerCase() !== state.order?.driverLicenseNumber.toLowerCase()) unverified.push("Driver License Number");
                if (state.trailerNumber.toLowerCase() !== state.order?.equipmentNumber.toLowerCase()) unverified.push("Trailer Number");
                if (unverified.length){
                    setState((x) => ({ ...x, mode: "Unverified", unverifiedFields: unverified }));
                } else {
                    setState((x) => ({ ...x, mode: "Cleared" }));
                }
            }
    };

    const unverifiedFields = state.unverifiedFields.map((f, i) => (
        <span key={i}>{f}</span>
    ));
    return (
        <div className="login-form">
            <Form>
                {state.mode === "Default" && (
                    <Form.Group as={Row} controlId="orderNumber" className="mb-3">
                        <Form.Label column="lg" sm={4}>Order Number</Form.Label>
                        <Col sm={8}>
                            <Form.Control placeholder="Order Number" size="lg" value={state.orderNumber} onChange={setLogin} />
                        </Col>
                    </Form.Group>
                )}
                {state.mode === "Unverified" && (
                    <div className="unverified-container">
                        <h2 className="unverified-title">Unverified</h2>
                        <p>One or more fields entered do not match our records. Please see dispatch.</p>
                        {unverifiedFields.length > 0 && (
                            <div className="unverified-fields">
                                {unverifiedFields}
                            </div>
                        )}
                        <div className="d-grid g-0">
                            <Button type="button" variant="secondary" size="lg" onClick={cancel}>Okay</Button>
                        </div>
                    </div>
                )}
                {state.mode === "Verified" && (
                    <>
                        <Form.Group as={Row} controlId="driverName" className="mb-3">
                            <Form.Label column="lg" sm={4}>Driver Name</Form.Label>
                            <Col sm={8}>
                                <Form.Control placeholder="First Name Last Name" size="lg" required value={state.driverName} onChange={setLogin} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="trailerNumber" className="mb-3">
                            <Form.Label column="lg" sm={4}>Trailer Number</Form.Label>
                            <Col sm={8}>
                                <Form.Control placeholder="Trailer Number" size="lg" required value={state.trailerNumber} onChange={setLogin} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="licenseNumber" className="mb-3">
                            <Form.Label column="lg" sm={4}>License Number</Form.Label>
                            <Col sm={8}>
                                <Form.Control placeholder="License Number" size="lg" required value={state.licenseNumber} onChange={setLogin} />
                            </Col>
                        </Form.Group>
                    </>
                )}
                {state.mode === "Bypass" && (
                    <div className="bypass-container">
                        <h2 className="bypass-title">Are you picking up for WFS?</h2>
                        <p>Please go inside and see the Dock Manager for your assigned load.</p>
                        <div className="d-grid g-0">
                            <Button type="button" variant="secondary" size="lg" onClick={cancel}>Okay</Button>
                        </div>
                    </div>
                )}
                {state.mode === "Cleared" && (
                    <div className="cleared-container">
                        <h2 className="cleared-title">Cleared Successfully</h2>
                        <p>Your information has been verified. Please go inside and see the Dock Manager for your door assignment.</p>
                        <div className="d-grid g-0">
                            <Button type="button" variant="success" size="lg" onClick={cancel}>Okay</Button>
                        </div>
                    </div>
                )}
                <div className="d-grid g-0">
                    {state.mode === "Default" && (
                        <>
                            <Button type="button" className="mb-2" variant="danger" size="lg" onClick={verify}>Verify</Button>
                            <Button type="button" variant="secondary" size="lg" onClick={bypass}>WFS Bypass</Button>
                        </>
                    )}
                    {state.mode === "Verified" && (
                        <>
                            <Button type="button" className="mb-2" variant="danger" size="lg" onClick={checkIn}>Check in</Button>
                            <Button type="button" variant="warning" size="lg" onClick={cancel}>Cancel</Button>
                        </>
                    )}
                </div>
            </Form>
        </div>
    );
}