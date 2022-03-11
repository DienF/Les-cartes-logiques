import React    from 'react';

import {GameTab} from './Game';


const Card = ({deckIndice,cardIndice,update}) => {
    /**
     * fonction qui detecte le click sur une carte et appelle la fonction update passer par le componant deck.
     */
    const handleClick = () => {
        update(cardIndice);
        
    };
    /**
     * Determine le type de carte
     * @param game - le tableau qui contient toute les cartes.
     * @param i - le numero de deck.
     * @param j - la position de la carte dans le deck.
     * @returns  - renvoie le nom de la classe corespondant a la carte.
     */
    const getClassType =(game,i,j) =>{
        if(game[i][j].CardClass1 === null && game[i][j].CardClass2 === null){
            return "card_simple";
        }
        if(game[i][j].CardClass1 !== null && game[i][j].CardClass2 !== null&& game[i][j].CardClass1.CardClass1 === null && game[i][j].CardClass1.CardClass2 === null && game[i][j].CardClass2.CardClass1 === null && game[i][j].CardClass2.CardClass2 === null){
            return "card_double";
        }
        if(game[i][j].CardClass1 !== null  && game[i][j].CardClass2 !== null && game[i][j].CardClass1.CardClass1 === null && game[i][j].CardClass1.CardClass2 === null && game[i][j].CardClass2.CardClass1 !== null && game[i][j].CardClass2.CardClass2 !== null){
            return "card_triple_a";
        }
        if(game[i][j].CardClass1 !== null  && game[i][j].CardClass2 !== null && game[i][j].CardClass1.CardClass1 !== null && game[i][j].CardClass1.CardClass2 !== null && game[i][j].CardClass2.CardClass1 === null && game[i][j].CardClass2.CardClass2 === null){
            return "card_triple_b";
        }
        if(game[i][j].CardClass1 !== null  && game[i][j].CardClass2 !== null && game[i][j].CardClass1.CardClass1 !== null && game[i][j].CardClass1.CardClass2 !== null && game[i][j].CardClass2.CardClass1 !== null && game[i][j].CardClass2.CardClass2 !== null){
            return "card_quadruple";
        }
    }
    /**
     * renvoie sois "card_simple_h"(carte verticale) sois "card_simple_w"(carte  horizontale)
     * @param game - le tableau qui contient toute les cartes.
     * @param i - le numero de deck.
     * @param j - la position de la carte dans le deck.
     * @param k - la position de la carte dans les cartes complexe (ex: dans une carte double la fonction est appeler 2 fois une fois avec k=0 et l'autre fois avec k=1).
     * @returns  - renvoie le nom de la classe corespondant a la carte.
     */
    const getTabClass  = (game,i,j,k) =>{
        
        const className = getClassType(game,i,j);


        if(className === "card_simple"){
            return "card_simple_h";
        }
        if(className === "card_double"){
            return "card_simple_h";
        }
        if(className === "card_triple_a"){
            if(k===0){
                return "card_simple_h";
            }else{
                return "card_simple_w";
            }
        }  
        if(className === "card_triple_b"){
            if(k===2){
                return "card_simple_h";
            }
            else{
                return "card_simple_w";
            }
        }
        if(className === "card_quadruple"){
            return "card_simple_w";
        }
        
    }
    /**
     * renvoie un tableau qui va etre utiliser par la fonction map pour afficher toute les cartes.
     * @param game - le tableau qui contient toute les cartes.
     * @param i - le numero de deck.
     * @param j - la position de la carte dans le deck.
     * @returns - renvoie un tableau de cartes.
     */
    const getTab= (game,i,j) =>{
        const className = getClassType(game,i,j);
        var tab = [];


        if(className === "card_simple"){
            tab.push(game[i][j]);
        }
        if(className === "card_double"){
            tab.push(game[i][j].CardClass1);
            tab.push(game[i][j].CardClass2);
        }
        if(className === "card_triple_a"){
            tab.push(game[i][j].CardClass1);
            tab.push(game[i][j].CardClass2.CardClass1);
            tab.push(game[i][j].CardClass2.CardClass2);

        }  
        if(className === "card_triple_b"){
            tab.push(game[i][j].CardClass1.CardClass1);
            tab.push(game[i][j].CardClass1.CardClass2);
            tab.push(game[i][j].CardClass2);

        }
        if(className === "card_quadruple"){
            tab.push(game[i][j].CardClass1.CardClass1);
            tab.push(game[i][j].CardClass1.CardClass2);
            tab.push(game[i][j].CardClass2.CardClass1);
            tab.push(game[i][j].CardClass2.CardClass2);
     
        }
        return tab;
    }

    
    return (
        <div className="card">
            <GameTab.Consumer>{game =>{
                return (<div className={getClassType(game,deckIndice,cardIndice)}  onClick={handleClick}>
                    {getTab(game,deckIndice,cardIndice).map((cardaffiche,index) =>(
                        <div key={index} style={{backgroundColor: cardaffiche.color}} className={getTabClass(game,deckIndice,cardIndice,index)+(cardaffiche.active ? " card_selec" : "" )}></div>))}
                </div>)
            }}
            </GameTab.Consumer>
        </div>

    );
};

export default Card;