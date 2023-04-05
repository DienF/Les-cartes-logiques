import React from "react";

const Popup = props => {
    return (
        <div className="popup-box">
            <div className="bigbox" style={{width : props.size + "%"}}>
                <div className="box">
                    {props.content}
                </div>
            </div>
        </div>
    );
};

export default Popup;