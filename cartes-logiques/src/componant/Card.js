import React   from 'react';



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

const Card = ({card,update}) => {

    const handleClick = () => {
        update(card);
        
    };
    var tab = [];
    var tabClasse = [];
    var className = "";
    if(card.CardClass1 === null && card.CardClass2 === null){
        className ="card_simple";
        tab.push(card);
        tabClasse.push("card_simple_h");
    }
    if(card.CardClass1 !== null && card.CardClass2 !== null&& card.CardClass1.CardClass1 === null && card.CardClass1.CardClass2 === null && card.CardClass2.CardClass1 === null && card.CardClass2.CardClass2 === null){
        className ="card_double";
        tab.push(card.CardClass1);
        tab.push(new CardClass(1,"grey",false,0,null,null))
        tab.push(card.CardClass2);
        tabClasse.push("card_simple_h");
        if(card.liaison === 1){
            tabClasse.push("affix1")
        }
        if(card.liaison === 2){
            tabClasse.push("affix2")
        }
        tabClasse.push("card_simple_h");
    }
    if(card.CardClass1 !== null  && card.CardClass2 !== null && card.CardClass1.CardClass1 === null && card.CardClass1.CardClass2 === null && card.CardClass2.CardClass1 !== null && card.CardClass2.CardClass2 !== null){
        className ="card_triple_a";
        tab.push(card.CardClass1);
        tab.push(card.CardClass2.CardClass1);
        tab.push(card.CardClass2.CardClass2);
        tabClasse.push("card_simple_h");
        tabClasse.push("card_simple_w");
        tabClasse.push("card_simple_w");
    }  
    if(card.CardClass1 !== null  && card.CardClass2 !== null && card.CardClass1.CardClass1 !== null && card.CardClass1.CardClass2 !== null && card.CardClass2.CardClass1 === null && card.CardClass2.CardClass2 === null){
        className ="card_triple_b";
        tab.push(card.CardClass1.CardClass1);
        tab.push(card.CardClass1.CardClass2);
        tab.push(card.CardClass2);
        tabClasse.push("card_simple_w");
        tabClasse.push("card_simple_w");
        tabClasse.push("card_simple_h");
    }
    if(card.CardClass1 !== null  && card.CardClass2 !== null && card.CardClass1.CardClass1 !== null && card.CardClass1.CardClass2 !== null && card.CardClass2.CardClass1 !== null && card.CardClass2.CardClass2 !== null){
        className ="card_quadruple";
        tab.push(card.CardClass1.CardClass1);
        tab.push(card.CardClass1.CardClass2);
        tab.push(card.CardClass2.CardClass1);
        tab.push(card.CardClass2.CardClass2);
        tabClasse.push("card_simple_w");
        tabClasse.push("card_simple_w");
        tabClasse.push("card_simple_w");
        tabClasse.push("card_simple_w");
    }   
    return (
        <div className="card">
            
            <div className={className}  onClick={() => handleClick()}>
            {tab.map((cardaffiche,index) =>(
            <div key={index} style={{backgroundColor: cardaffiche.color}} className={tabClasse[index]+" " +(cardaffiche.active ? "card_selec" : "" )}>{(tabClasse[index] === "affix1")? "et" : ""}{(tabClasse[index] === "affix2")? "=>" : ""}</div>))}
            </div>
        </div>

    );
};

export default Card;