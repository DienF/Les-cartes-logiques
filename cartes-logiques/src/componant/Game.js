import React, {useState , useEffect} from 'react';
import Deck from './Deck';
class CardClass {
    constructor(id,color,active,liaison,CardClass1,CardClass2) {
      this.id=id;
      this.color=color;
      this.active=active;
      this.liaison=liaison;
      this.CardClass1=CardClass1;
      this.CardClass2=CardClass2;
    }
  }
const Game = () => {
    var [game ,setGame] = useState([]); 
    const [playOnce,setPlayOnce] = useState(true);

    useEffect(() =>{
        if(playOnce){
            setGame(    oldarray =>
                [
                    [
                        new CardClass(1,null,false,1,new CardClass(1,"blue",false,0,null,null),new CardClass(2,"green",false,0,null,null)),
                        new CardClass(2,null,false,1,new CardClass(1,"yellow",false,0,null,null),new CardClass(2,null,false,1,new CardClass(1,"red",false,0,null,null),new CardClass(2,"orange",false,0,null,null))),
                        new CardClass(3,null,false,1,new CardClass(1,null,false,1,new CardClass(1,"blue",false,0,null,null),new CardClass(2,"pink",false,0,null,null)),new CardClass(2,"lime",false,0,null,null)),
                        new CardClass(4,false,false,1,new CardClass(1,null,false,1,new CardClass(1,"aqua",false,0,null,null),new CardClass(2,"brown",false,0,null,null)),new CardClass(2,null,false,1,new CardClass(1,"purple",false,0,null,null),new CardClass(2,"gold",false,0,null,null))),
                        
                    ],
                    [
                        new CardClass(1,null,false,2,new CardClass(1,"blue",false,0,null,null),new CardClass(2,"green",false,0,null,null)),,
                        new CardClass(2,"blue",false,0,null,null),
                        new CardClass(3,"green",false,0,null,null),
                        new CardClass(4,"blue",false,0,null,null),
                        
                    ]
                ]
            );
            setPlayOnce(false);
        }


    } , [game , playOnce]);

    const update = (newtab,i) => {
        var tempo = game.copyWithin(game.length,0);
        console.log(newtab);
        tempo[i] = newtab.copyWithin(newtab.length,0);
        console.log(tempo);
        setGame(tempo);

    }
/*            {game.map((deck,index) =>(
                <div key={index}> card1 : {deck[0].active.toString()} card2 : {deck[1].active.toString()} card3 : {deck[2].active.toString()} card4 : {deck[3].active.toString()}</div>
            ))}*/

    return (
        <div className="game">

            {game.map((deck,index) =>(
                <Deck array={deck} updateGame={update} indice={index} key={index} ></Deck>
            ))} 

        </div>
    );
};

export default Game;