import React from 'react';
import Game from '../components/Game';

import Navigation from '../components/Navigation';

const CreateExercice = () => {
    return (
        <div className="create">
            <Navigation/>    
            <Game mode="create"/>      
        </div>
    );
};

export default CreateExercice;