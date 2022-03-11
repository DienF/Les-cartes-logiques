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
    /**
     * fonction recursive elle change l'atribut 'active' et regarde si CardClass1 et CardClass2 sont null si il ne le sont pas on appelle la meme fonction sur eux
     * @param card - la carte qui doit etre selectioner ou pas
     * @param state - boolean qui definie si une carte est selectioner ou pas
     */
    const select = (card , state) =>{
        card.active = state;
        if(card.CardClass1 != null){
            select(card.CardClass1,state);
        }
        if(card.CardClass2 != null){
            select(card.CardClass2,state);
        }
    }
    /**
     *  (pour l'instant) met toute les cartes d'un deck en non selectioner sauf pour la carte qui est passer en parametre 
     * et lui inverse son etat(ex : une carte selectioner tu reclique dessus ca la deselectionne)
     * @param  i - index deck
     * @param  j - index carte
     */
    const update = (i,j) => {
        var tempo = [...game];
        tempo[i].map(function(card){
            if(card.id !== j ){
                select(card,false);
            }
            else{
                select(card,!card.active);
            }
            return 0;
        });
        setGame(arr => tempo);
        console.log(game);
    }

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