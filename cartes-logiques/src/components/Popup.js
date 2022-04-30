import React from "react";

const Popup = props => {
  return (
    <div className="popup-box">
      <div class="bigbox">
        <div className="box">
          {props.content}
        </div>
      </div>
    </div>
  );
};

export default Popup;