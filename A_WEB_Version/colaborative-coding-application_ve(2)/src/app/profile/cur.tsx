import "./a.css"
import React, { useState ,useEffect} from 'react';
import { PiCursorFill } from "react-icons/pi";


const Cursor = (props:any) => {
   
  return (
    <div className="rm"><PiCursorFill /><div className="rl"  style={{
        backgroundColor: props.color
      }}>{props.text}</div></div>
  );
};

export default Cursor;
