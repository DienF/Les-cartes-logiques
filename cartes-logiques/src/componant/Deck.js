import React, {useEffect , useState } from 'react';
import Card from './Card';

const Deck = ({array,updateGame,indice}) => {
    var [deck ,setDeck] = useState([]);
    const [playOnce,setPlayOnce] = useState(true);
    useEffect(() =>{
        if(playOnce){
            setDeck(array);
            setPlayOnce(false);
        }


    } , [deck , playOnce , array ]);
    const select = (card , state) =>{
        card.active = state;
        if(card.CardClass1 != null){
            select(card.CardClass1,state);
        }
        if(card.CardClass2 != null){
            select(card.CardClass2,state);
        }
    }
    const update = (carda) => {
        select(carda, !carda.active);
        var tmp = deck.copyWithin(deck.length,0);
        tmp.map(function(card){
            if(card.id !== carda.id ){
                select(card,false)
            }
            return 0;
        });
        tmp =  deck.map((card) =>
        card.id === carda.id ? carda : card
      );
        setDeck(arr => tmp);
        updateGame(deck,indice);
    };
    return (
        <div className="deck" >
            {deck.map((card) =>(
                <Card card={card}  update={update} key={card.id}  />
                
            ))}
  
            
   
        </div>

    );
};

export default Deck;