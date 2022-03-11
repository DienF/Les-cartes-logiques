import React    from 'react';

import {GameTab} from './Game';


const Card = ({deckIndice,cardIndice,update}) => {

    const handleClick = () => {
        update(cardIndice);
        
    };
    
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
    const getTabClass  = (game,i,j,k) =>{
        
        const className = getClassType(game,i,j);
        var tabClasse = [];


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
                        <div key={index} style={{backgroundColor: cardaffiche.color}} className={getTabClass(game,deckIndice,cardIndice,index)+" " +(cardaffiche.active ? "card_selec" : "" )}></div>))}
                </div>)
            }}
            </GameTab.Consumer>
        </div>

    );
};

export default Card;