import React, {useState , useEffect} from 'react';
import Deck from './Deck';
export const GameTab = React.createContext();

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
    const [game ,setGame] = useState([]); 
    const [playOnce,setPlayOnce] = useState(true);
    useEffect(() =>{
        if(playOnce){
            setGame(    oldarray =>
                [
                    [
                        new CardClass(0,null,false,1,new CardClass(0,"blue",false,0,null,null),new CardClass(1,"green",false,0,null,null)),
                        new CardClass(1,null,false,1,new CardClass(0,"yellow",false,0,null,null),new CardClass(1,null,false,1,new CardClass(0,"red",false,0,null,null),new CardClass(1,"orange",false,0,null,null))),
                        new CardClass(2,null,false,1,new CardClass(0,null,false,1,new CardClass(0,"blue",false,0,null,null),new CardClass(1,"pink",false,0,null,null)),new CardClass(1,"lime",false,0,null,null)),
                        new CardClass(3,null,false,1,new CardClass(0,null,false,1,new CardClass(0,"aqua",false,0,null,null),new CardClass(1,"brown",false,0,null,null)),new CardClass(1,null,false,1,new CardClass(0,"purple",false,0,null,null),new CardClass(1,"gold",false,0,null,null))),
                        
                    ],
                    [
                        new CardClass(0,null,false,2,new CardClass(0,"blue",false,0,null,null),new CardClass(1,"green",false,0,null,null)),
                        new CardClass(1,"blue",false,0,null,null),
                        new CardClass(2,"green",false,0,null,null),
                        new CardClass(3,"blue",false,0,null,null),
                        
                    ]
                ]
            );
            setPlayOnce(false);
        }


    } , [game , playOnce]);
    const select = (card , state) =>{
        card.active = state;
        if(card.CardClass1 != null){
            select(card.CardClass1,state);
        }
        if(card.CardClass2 != null){
            select(card.CardClass2,state);
        }
    }
    const update = (i,j) => {
        var tempo = game.copyWithin(game.length,0);
        tempo[i].map(function(card){
            if(card.id !== j ){
                select(card,false);
            }
            else{
                select(card,true);
            }
            return 0;
        });
        setGame(arr => tempo);
        console.log(game);
    }
    /*{game.map((deck,index) =>(
        <div key={index}> card1 : {deck[0].active.toString()} card2 : {deck[1].active.toString()} card3 : {deck[2].active.toString()} card4 : {deck[3].active.toString()}</div>
    ))}*/

    return (
        <div className="game">
            <GameTab.Provider value={game}>
            {game.map((deck,index) =>(
                <Deck updateGame={update} indice={index} key={index} ></Deck>
            ))} 
            </GameTab.Provider>

        </div>
    );
};

export default Game;