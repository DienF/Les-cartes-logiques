import React from 'react'
import Deck from '../componant/Deck';
import Game from '../componant/Game';
import Navigation from '../componant/Navigation';


const home = () => {
  return (
    <div className="home">
      
        <Navigation/>
        
        <Game/>
        
    </div>
  )
}

export default home;